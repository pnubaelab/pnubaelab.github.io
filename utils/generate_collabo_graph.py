import hashlib
import itertools
import json
import math
import re
from collections import Counter, defaultdict

import bibtexparser

with open('_bibliography/papers.bib', encoding='utf-8') as bibfile:
    parser = bibtexparser.bparser.BibTexParser(common_strings=False)
    bib_database = bibtexparser.load(bibfile, parser=parser)

print("Generating collaboration graph (by paper counts)...")

author_counter = Counter()
author_paper_counter = Counter()
author_first_counter = Counter()
author_collaborative_counter = Counter()
author_coauthors = defaultdict(set)
author_years = defaultdict(list)
author_keywords = defaultdict(Counter)
coauthor_counter = defaultdict(int)
keyword_counter = Counter()
keyword_authors = defaultdict(set)
author_keyword_links = defaultdict(int)  # (author, keyword) -> count
author_keyword_papers = defaultdict(int)

FIRST_AUTHOR_WEIGHT = 3
OTHER_AUTHOR_WEIGHT = 1
KEYWORD_DISPLAY_BY_KEY = {}
AUTHOR_ALIASES = {
    # Explicit aliases are safer than fuzzy merging people with similar names.
    "Changdong Lee": "Lee, Changdong",
    "Kang, Eungjun": "Kang, Eung-Jun",
    "Park, Yeon-kyung": "Park, Yeonkyung",
    "Sutrisnowati, Riska A": "Sutrisnowati, Riska Asriana",
}


def normalize_author(author):
    author = re.sub(r'\s+', ' ', author.strip())
    return AUTHOR_ALIASES.get(author, author)


def normalize_keyword(kw):
    """Normalize whitespace and merge case-only spelling variants."""
    display = re.sub(r'\s+', ' ', kw.strip())
    canonical_key = display.casefold()
    if canonical_key not in KEYWORD_DISPLAY_BY_KEY:
        KEYWORD_DISPLAY_BY_KEY[canonical_key] = display
    return KEYWORD_DISPLAY_BY_KEY[canonical_key]


def extract_keywords(entry):
    """Extract keywords from a BibTeX entry"""
    if 'keywords' not in entry:
        return []
    raw_keywords = entry['keywords']
    # Split by comma or semicolon
    keywords = re.split(r'[,;]', raw_keywords)
    # A malformed record occasionally repeats a keyword. Count it only once per paper.
    normalized = [normalize_keyword(keyword) for keyword in keywords]
    return list(dict.fromkeys(keyword for keyword in normalized if keyword))


def extract_year(entry):
    """Return a four-digit publication year when BibTeX contains one."""
    match = re.search(r'(?:19|20)\d{2}', str(entry.get('year', '')))
    return int(match.group(0)) if match else None


def normalized_topic_diversity(topic_counts):
    """Normalized Shannon entropy: 0 means focused, 1 means evenly broad."""
    total = sum(topic_counts.values())
    topic_total = len(topic_counts)
    if total <= 0 or topic_total <= 1:
        return 0.0
    entropy = -sum(
        (count / total) * math.log(count / total) for count in topic_counts.values()
    )
    return round(entropy / math.log(topic_total), 3)


def get_author_weights(authors):
    """Assign a higher weight to the first author and a base weight to others."""
    weights = {}
    for index, author in enumerate(authors):
        weights[author] = FIRST_AUTHOR_WEIGHT if index == 0 else OTHER_AUTHOR_WEIGHT
    return weights


for entry in bib_database.entries:
    if 'author' in entry:
        authors = list(
            dict.fromkeys(
                normalize_author(a)
                for a in entry['author'].replace('\n', ' ').split(' and ')
                if a.strip()
            )
        )
        if not authors:
            continue
        author_weights = get_author_weights(authors)
        publication_year = extract_year(entry)

        # Coauthor links: count per shared paper (unchanged)
        for a1, a2 in itertools.combinations(sorted(authors), 2):
            coauthor_counter[(a1, a2)] += 1
            author_coauthors[a1].add(a2)
            author_coauthors[a2].add(a1)

        # Keep the weighted contribution score for backwards compatibility, while
        # exporting literal paper counts so the UI never labels the score as papers.
        for author, weight in author_weights.items():
            author_counter[author] += weight
            author_paper_counter[author] += 1
            if author == authors[0]:
                author_first_counter[author] += 1
            if len(authors) > 1:
                author_collaborative_counter[author] += 1
            if publication_year:
                author_years[author].append(publication_year)

        # Extract and count keywords
        keywords = extract_keywords(entry)
        for kw in keywords:
            keyword_counter[kw] += 1
            # Link authors to keywords
            for author, weight in author_weights.items():
                author_keyword_links[(author, kw)] += weight
                author_keyword_papers[(author, kw)] += 1
                author_keywords[author][kw] += 1
                keyword_authors[kw].add(author)

# Filter keywords: only include those that appear in at least 2 papers
MIN_KEYWORD_COUNT = 2
filtered_keywords = {
    kw: count
    for kw, count in keyword_counter.items()
    if count >= MIN_KEYWORD_COUNT
}

# Build author nodes with interpretable research characteristics. `value` remains the
# weighted authorship score for backwards compatibility with older consumers.
author_nodes = []
author_total = len(author_counter)
for author in author_counter:
    topic_counts = author_keywords[author]
    topic_profile = {
        # Topic clustering should describe subject frequency, not authorship order.
        # First-author weighting remains available separately through `value`.
        keyword: author_keyword_papers[(author, keyword)] for keyword in topic_counts
    }
    top_keywords = [
        {"name": keyword, "count": count}
        for keyword, count in sorted(
            topic_counts.items(),
            key=lambda item: (
                -item[1]
                * (
                    math.log(
                        (author_total + 1)
                        / (len(keyword_authors[item[0]]) + 1)
                    )
                    + 1
                ),
                -item[1],
                item[0].casefold(),
            ),
        )[:5]
    ]
    years = author_years[author]
    paper_count = author_paper_counter[author]
    author_nodes.append(
        {
            "id": author,
            "group": 1,
            "value": author_counter[author],
            "type": "author",
            "paper_count": paper_count,
            "first_author_count": author_first_counter[author],
            "first_author_share": (
                round(author_first_counter[author] / paper_count, 3)
                if paper_count
                else 0
            ),
            "collaborative_paper_count": author_collaborative_counter[author],
            "coauthor_count": len(author_coauthors[author]),
            "topic_count": len(topic_counts),
            "topic_diversity": normalized_topic_diversity(topic_counts),
            "topic_profile": topic_profile,
            "top_keywords": top_keywords,
            "active_from": min(years) if years else None,
            "active_to": max(years) if years else None,
        }
    )

# Build nodes for keywords
keyword_nodes = [
    {
        "id": f"kw:{kw}",
        "name": kw,
        "group": 2,
        "value": count,
        "paper_count": count,
        "author_count": len(keyword_authors[kw]),
        "type": "keyword",
    }
    for kw, count in filtered_keywords.items()
]

# Build links between coauthors
coauthor_links = [
    {"source": a1, "target": a2, "value": v, "type": "coauthor"}
    for (a1, a2), v in coauthor_counter.items()
]

# Build links between authors and keywords (only for filtered keywords)
author_kw_links = [
    {
        "source": a,
        "target": f"kw:{kw}",
        "value": v,
        "paper_count": author_keyword_papers[(a, kw)],
        "type": "author_keyword",
    }
    for (a, kw), v in author_keyword_links.items()
    if kw in filtered_keywords
]

# Combine all nodes and links
nodes = author_nodes + keyword_nodes
links = coauthor_links + author_kw_links
topic_vocabulary = sorted(keyword_counter, key=str.casefold)
topic_vocabulary_hash = hashlib.sha256(
    "\n".join(topic_vocabulary).encode("utf-8")
).hexdigest()[:16]

print(f"  - Authors: {len(author_nodes)}")
print(f"  - Keywords (appearing >= {MIN_KEYWORD_COUNT} times): {len(keyword_nodes)}")
print(f"  - Coauthor links: {len(coauthor_links)}")
print(f"  - Author-Keyword links: {len(author_kw_links)}")

with open('assets/json/collabo_graph.json', 'w', encoding='utf-8') as f:
    json.dump(
        {
            "meta": {
                "schema_version": 2,
                "author_value": "weighted_authorship",
                "first_author_weight": FIRST_AUTHOR_WEIGHT,
                "other_author_weight": OTHER_AUTHOR_WEIGHT,
                "minimum_keyword_papers": MIN_KEYWORD_COUNT,
                "topic_vocabulary_size": len(topic_vocabulary),
                "topic_vocabulary_hash": topic_vocabulary_hash,
            },
            "nodes": nodes,
            "links": links,
        },
        f,
        ensure_ascii=False,
        indent=2,
    )
