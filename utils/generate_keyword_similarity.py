import argparse
import base64
import hashlib
import json
import math
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
        raise RuntimeError(
            "Missing optional dependency for embedding similarity. "
            "Install with: pip install sentence-transformers numpy\n"
            f"Original import error: {e}"
        )

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
        default=0.6,
        help=(
            "Semantic latent-channel weight consumed by collabo.liquid "
            "(clamped there for safety)"
        ),
    )
    parser.add_argument(
        "--neighbor-alpha",
        type=float,
        default=0.3,
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
    vocabulary_hash = hashlib.sha256(
        "\n".join(sorted((name for _, name in keywords), key=str.casefold)).encode("utf-8")
    ).hexdigest()[:16]

    payload = {
        "version": 3,
        "backend": used_backend,
        "model": None if used_backend != "sentence-transformers" else args.model,
        "threshold": args.threshold,
        "topk": args.topk,
        "alpha": args.alpha,
        "neighbor_alpha": args.neighbor_alpha,
        "vocabulary_size": len(keyword_ids),
        "vocabulary_hash": vocabulary_hash,
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
