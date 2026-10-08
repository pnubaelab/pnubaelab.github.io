import argparse
import base64
import hashlib
import json
import math
import traceback
from pathlib import Path
from typing import Dict, List, Tuple


def _load_keywords_from_collabo_graph(path: Path) -> List[Tuple[str, str]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    keywords: List[Tuple[str, str]] = []
    for node in data.get("nodes", []):
        if node.get("type") == "keyword":
            kw_id = node.get("id")
            if not kw_id:
                continue
            name = node.get("name") or str(kw_id).removeprefix("kw:")
            keywords.append((kw_id, name))
        elif node.get("type") == "author":
            # Rare topics are hidden as graph nodes but still participate in the
            # PCA feature space, so their semantic neighbors must be generated too.
            for name in (node.get("topic_profile") or {}):
                keywords.append((f"kw:{name}", name))

    # De-duplicate while preserving order
    seen = set()
    uniq: List[Tuple[str, str]] = []
    for kw_id, name in keywords:
        if kw_id in seen:
            continue
        seen.add(kw_id)
        uniq.append((kw_id, name))
    return uniq


def _cosine_sim_matrix_sentence_transformers(texts: List[str], model_name: str):
    try:
        from sentence_transformers import SentenceTransformer  # type: ignore
        import numpy as np  # type: ignore
    except Exception as e:  # pragma: no cover
        if not (
            isinstance(e, ModuleNotFoundError)
            and e.name in {"sentence_transformers", "numpy"}
        ):
            raise RuntimeError(
                "Embedding dependencies are installed but failed to import. "
                "Check the underlying error below for incompatible packages.\n"
                f"{traceback.format_exc()}"
            ) from e
        raise RuntimeError(
            "Missing optional dependency for embedding similarity. "
            "Install with: pip install sentence-transformers numpy\n"
            f"Original import error: {e}"
        ) from e

    model = SentenceTransformer(model_name)
    embeddings = model.encode(
        texts,
        normalize_embeddings=True,
        show_progress_bar=True,
    )
    embeddings = np.asarray(embeddings, dtype=np.float32)
    # Since normalized, cosine similarity is dot product. Return the embeddings
    # too so the browser can use a compact semantic latent space, rather than
    # relying only on a sparse nearest-neighbor graph.
    return embeddings @ embeddings.T, embeddings


def _lexical_sim(a: str, b: str) -> float:
    # Lightweight fallback (not semantic). Kept for robustness.
    import difflib

    a = " ".join(a.lower().split())
    b = " ".join(b.lower().split())
    return difflib.SequenceMatcher(None, a, b).ratio()


def _cosine_sim_matrix_fallback(texts: List[str]):
    # Pure-python fallback: pairwise lexical similarity.
    n = len(texts)
    sims = [[0.0] * n for _ in range(n)]
    for i in range(n):
        sims[i][i] = 1.0
        for j in range(i + 1, n):
            s = _lexical_sim(texts[i], texts[j])
            sims[i][j] = s
            sims[j][i] = s
    return sims


def build_similarity_map(
    keyword_ids: List[str],
    sim_matrix,
    threshold: float,
    topk: int,
) -> Dict[str, List[List[object]]]:
    n = len(keyword_ids)
    out: Dict[str, List[List[object]]] = {}

    for i in range(n):
        pairs: List[Tuple[int, float]] = []
        for j in range(n):
            if i == j:
                continue
            s = float(sim_matrix[i][j])
            if s >= threshold and math.isfinite(s):
                pairs.append((j, s))

        pairs.sort(key=lambda x: x[1], reverse=True)
        pairs = pairs[:topk]

        out[keyword_ids[i]] = [[keyword_ids[j], round(s, 4)] for (j, s) in pairs]

    return out


def build_latent_topic_vectors(
    keyword_ids: List[str],
    embeddings,
    dimensions: int,
):
    """Compress keyword embeddings and quantize them for compact browser use."""
    import numpy as np  # type: ignore

    matrix = np.asarray(embeddings, dtype=np.float64)
    if (
        matrix.ndim != 2
        or not matrix.size
        or matrix.shape[0] != len(keyword_ids)
    ):
        return None

    centered = matrix - matrix.mean(axis=0, keepdims=True)
    _, singular_values, components = np.linalg.svd(centered, full_matrices=False)
    numerical_tolerance = (
        singular_values[0] * max(centered.shape) * np.finfo(np.float64).eps
        if singular_values.size
        else 0
    )
    numerical_rank = int(np.sum(singular_values > numerical_tolerance))
    if numerical_rank == 0:
        return None
    dimension_count = min(int(dimensions), numerical_rank, components.shape[0], 1024)
    latent = centered @ components[:dimension_count].T

    # SVD signs are arbitrary. Give each latent axis a deterministic direction
    # by making its largest absolute keyword score positive.
    for axis in range(dimension_count):
        anchor = int(np.argmax(np.abs(latent[:, axis])))
        if latent[anchor, axis] < 0:
            latent[:, axis] *= -1

    maxima = np.max(np.abs(latent), axis=0)
    scales = np.where(maxima > 0, maxima / 127, 1.0)
    quantized = np.clip(np.rint(latent / scales), -127, 127).astype(np.int8)
    total_energy = float(np.sum(singular_values * singular_values))
    retained_energy = float(
        np.sum(singular_values[:dimension_count] ** 2) / total_energy
    ) if total_energy > 0 else 0.0

    return {
        "encoding": "int8-base64",
        "quantization": "symmetric-per-axis",
        "dimensions": dimension_count,
        "ids": keyword_ids,
        "scales": [float(scale) for scale in scales],
        "data": base64.b64encode(quantized.tobytes()).decode("ascii"),
        "retained_variance": round(retained_energy, 6),
        "embedding_hash": hashlib.sha256(
            matrix.astype(np.float32).tobytes()
        ).hexdigest()[:16],
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Generate compact semantic topic vectors and fallback similarities. "
            "Reads assets/json/collabo_graph.json and writes assets/json/keyword_similarity.json"
        )
    )
    parser.add_argument(
        "--graph",
        default="assets/json/collabo_graph.json",
        help="Path to collabo_graph.json",
    )
    parser.add_argument(
        "--out",
        default="assets/json/keyword_similarity.json",
        help="Output path for similarity JSON",
    )
    parser.add_argument(
        "--model",
        default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        help="Sentence-Transformers model name",
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=0.72,
        help="Cosine similarity threshold (higher = stricter)",
    )
    parser.add_argument(
        "--topk",
        type=int,
        default=8,
        help="Max similar keywords to keep per keyword",
    )
    parser.add_argument(
        "--alpha",
        type=float,
        default=0.35,
        help=(
            "Semantic latent-channel weight consumed by collabo.liquid "
            "(clamped there for safety)"
        ),
    )
    parser.add_argument(
        "--neighbor-alpha",
        type=float,
        default=0.25,
        help=(
            "Fallback sparse-neighbor channel weight when latent vectors "
            "are unavailable"
        ),
    )
    parser.add_argument(
        "--latent-dimensions",
        type=int,
        default=64,
        help="Number of semantic keyword dimensions stored for browser-side PCA",
    )
    parser.add_argument(
        "--bm25-k1",
        type=float,
        default=1.35,
        help="BM25 term-frequency saturation parameter for author topic profiles",
    )
    parser.add_argument(
        "--bm25-b",
        type=float,
        default=0.35,
        help="BM25 author-profile length normalization strength",
    )
    parser.add_argument(
        "--repeat-evidence-scale",
        type=float,
        default=1.5,
        help="Scale used to soften one-off topics in the semantic centroid",
    )
    parser.add_argument(
        "--lead-alpha",
        type=float,
        default=0.3,
        help="Weight reserved for topics from first-author papers",
    )
    parser.add_argument(
        "--recency-alpha",
        type=float,
        default=0.1,
        help="Weight reserved for the time-decayed recent-topic profile",
    )
    parser.add_argument(
        "--pca-min-papers",
        type=int,
        default=1,
        help="Minimum author paper count used to fit the shared PCA axes",
    )
    parser.add_argument(
        "--fallback",
        action="store_true",
        help="Use pure-python lexical similarity (no embeddings).",
    )

    args = parser.parse_args()

    if not 0 <= args.threshold <= 1:
        parser.error("--threshold must be between 0 and 1")
    if args.topk < 1:
        parser.error("--topk must be at least 1")
    if not 0 <= args.alpha <= 0.75:
        parser.error("--alpha must be between 0 and 0.75")
    if not 0 <= args.neighbor_alpha <= 0.5:
        parser.error("--neighbor-alpha must be between 0 and 0.5")
    if not 1 <= args.latent_dimensions <= 1024:
        parser.error("--latent-dimensions must be between 1 and 1024")
    if not 0.1 <= args.bm25_k1 <= 3:
        parser.error("--bm25-k1 must be between 0.1 and 3")
    if not 0 <= args.bm25_b <= 1:
        parser.error("--bm25-b must be between 0 and 1")
    if not 0.25 <= args.repeat_evidence_scale <= 10:
        parser.error("--repeat-evidence-scale must be between 0.25 and 10")
    if not 0 <= args.lead_alpha <= 0.3:
        parser.error("--lead-alpha must be between 0 and 0.3")
    if not 0 <= args.recency_alpha <= 0.25:
        parser.error("--recency-alpha must be between 0 and 0.25")
    if args.lead_alpha + args.recency_alpha > 0.4:
        parser.error("--lead-alpha + --recency-alpha must not exceed 0.4")
    if not 1 <= args.pca_min_papers <= 20:
        parser.error("--pca-min-papers must be between 1 and 20")

    graph_path = Path(args.graph)
    out_path = Path(args.out)

    keywords = _load_keywords_from_collabo_graph(graph_path)
    keyword_ids = [kid for (kid, _) in keywords]
    texts = [name for (_, name) in keywords]

    if not keywords:
        raise SystemExit(f"No keyword nodes found in {graph_path}")

    sim_matrix = None
    embeddings = None
    used_backend = ""
    if args.fallback:
        sim_matrix = _cosine_sim_matrix_fallback(texts)
        used_backend = "lexical-fallback"
    else:
        try:
            sim_matrix, embeddings = _cosine_sim_matrix_sentence_transformers(
                texts,
                args.model,
            )
            used_backend = "sentence-transformers"
        except RuntimeError as e:
            raise SystemExit(
                f"{e}\nRefusing to overwrite semantic similarities with a lexical fallback. "
                "Pass --fallback explicitly if that downgrade is intended."
            ) from e

    sim_map = build_similarity_map(keyword_ids, sim_matrix, args.threshold, args.topk)
    topic_vectors = (
        build_latent_topic_vectors(keyword_ids, embeddings, args.latent_dimensions)
        if embeddings is not None
        else None
    )
    ordered_vocabulary = sorted(
        (name for _, name in keywords),
        key=lambda value: value.encode("utf-8"),
    )
    vocabulary_hash = hashlib.sha256(
        "\n".join(ordered_vocabulary).encode("utf-8")
    ).hexdigest()[:16]

    payload = {
        "version": 4,
        "backend": used_backend,
        "model": None if used_backend != "sentence-transformers" else args.model,
        "threshold": args.threshold,
        "topk": args.topk,
        "alpha": args.alpha,
        "neighbor_alpha": args.neighbor_alpha,
        "vectorizer": {
            "scheme": "bm25-multiview-v1",
            "bm25_k1": args.bm25_k1,
            "bm25_b": args.bm25_b,
            "repeat_evidence_scale": args.repeat_evidence_scale,
            "lead_alpha": args.lead_alpha,
            "recency_alpha": args.recency_alpha,
            "pca_min_papers": args.pca_min_papers,
        },
        "vocabulary_size": len(keyword_ids),
        "vocabulary_hash": vocabulary_hash,
        "vocabulary_order": "utf8-bytewise-v1",
        "similarities": sim_map,
    }
    if topic_vectors is not None:
        payload["topic_vectors"] = topic_vectors

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Wrote {out_path} (keywords={len(keyword_ids)})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
