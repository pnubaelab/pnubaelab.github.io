import argparse
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
            # Rare topics are hidden as graph nodes but still participate in
            # clustering, so their semantic neighbors must be generated too.
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
    # Since normalized, cosine similarity is dot product.
    return embeddings @ embeddings.T


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


def main() -> int:
    parser = argparse.ArgumentParser(
        description=(
            "Generate keyword-keyword similarity (for collabo k-means smoothing). "
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
        default=0.3,
        help=(
            "Semantic-channel weight consumed by collabo.liquid "
            "(clamped there for safety)"
        ),
    )
    parser.add_argument(
        "--fallback",
        action="store_true",
        help="Use pure-python lexical similarity (no embeddings).",
    )

    args = parser.parse_args()

    graph_path = Path(args.graph)
    out_path = Path(args.out)

    keywords = _load_keywords_from_collabo_graph(graph_path)
    keyword_ids = [kid for (kid, _) in keywords]
    texts = [name for (_, name) in keywords]

    if not keywords:
        raise SystemExit(f"No keyword nodes found in {graph_path}")

    sim_matrix = None
    used_backend = ""
    if args.fallback:
        sim_matrix = _cosine_sim_matrix_fallback(texts)
        used_backend = "lexical-fallback"
    else:
        try:
            sim_matrix = _cosine_sim_matrix_sentence_transformers(texts, args.model)
            used_backend = "sentence-transformers"
        except RuntimeError as e:
            raise SystemExit(
                f"{e}\nRefusing to overwrite semantic similarities with a lexical fallback. "
                "Pass --fallback explicitly if that downgrade is intended."
            ) from e

    sim_map = build_similarity_map(keyword_ids, sim_matrix, args.threshold, args.topk)
    vocabulary_hash = hashlib.sha256(
        "\n".join(sorted((name for _, name in keywords), key=str.casefold)).encode("utf-8")
    ).hexdigest()[:16]

    payload = {
        "version": 2,
        "backend": used_backend,
        "model": None if used_backend != "sentence-transformers" else args.model,
        "threshold": args.threshold,
        "topk": args.topk,
        "alpha": args.alpha,
        "vocabulary_size": len(keyword_ids),
        "vocabulary_hash": vocabulary_hash,
        "similarities": sim_map,
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Wrote {out_path} (keywords={len(keyword_ids)})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
