import bibtexparser
import json
from collections import defaultdict, Counter
import itertools
import yaml
import re

with open('_bibliography/papers.bib', encoding='utf-8') as bibfile:
    parser = bibtexparser.bparser.BibTexParser(common_strings=False)
    bib_database = bibtexparser.load(bibfile, parser=parser)

print("Generating collaboration graph (by paper counts)...")

author_counter = Counter()
coauthor_counter = defaultdict(int)
keyword_counter = Counter()
author_keyword_links = defaultdict(int)  # (author, keyword) -> count

def normalize_keyword(kw):
    """Normalize keyword for consistent grouping"""
    kw = kw.strip()
    # Remove extra whitespace
    kw = re.sub(r'\s+', ' ', kw)
    return kw

def extract_keywords(entry):
    """Extract keywords from a BibTeX entry"""
    if 'keywords' not in entry:
        return []
    raw_keywords = entry['keywords']
    # Split by comma or semicolon
    keywords = re.split(r'[,;]', raw_keywords)
    return [normalize_keyword(k) for k in keywords if normalize_keyword(k)]

for entry in bib_database.entries:
    if 'author' in entry:
        authors = [a.strip() for a in entry['author'].replace('\n', ' ').split(' and ')]

        # Coauthor links: count per shared paper (unchanged)
        for a1, a2 in itertools.combinations(sorted(authors), 2):
            coauthor_counter[(a1, a2)] += 1

        # Node value: count of papers per author (1 per paper per author)
        for a in set(authors):
            author_counter[a] += 1
        
        # Extract and count keywords
        keywords = extract_keywords(entry)
        for kw in keywords:
            keyword_counter[kw] += 1
            # Link authors to keywords
            for a in set(authors):
                author_keyword_links[(a, kw)] += 1

# Filter keywords: only include those that appear in at least 2 papers
MIN_KEYWORD_COUNT = 2
filtered_keywords = {kw: count for kw, count in keyword_counter.items() if count >= MIN_KEYWORD_COUNT}

# Build nodes for authors
author_nodes = [{"id": a, "group": 1, "value": author_counter[a], "type": "author"} for a in author_counter]

# Build nodes for keywords
keyword_nodes = [{"id": f"kw:{kw}", "name": kw, "group": 2, "value": count, "type": "keyword"} for kw, count in filtered_keywords.items()]

# Build links between coauthors
coauthor_links = [{"source": a1, "target": a2, "value": v, "type": "coauthor"} for (a1, a2), v in coauthor_counter.items()]

# Build links between authors and keywords (only for filtered keywords)
author_kw_links = [
    {"source": a, "target": f"kw:{kw}", "value": v, "type": "author_keyword"} 
    for (a, kw), v in author_keyword_links.items() 
    if kw in filtered_keywords
]

# Combine all nodes and links
nodes = author_nodes + keyword_nodes
links = coauthor_links + author_kw_links

print(f"  - Authors: {len(author_nodes)}")
print(f"  - Keywords (appearing >= {MIN_KEYWORD_COUNT} times): {len(keyword_nodes)}")
print(f"  - Coauthor links: {len(coauthor_links)}")
print(f"  - Author-Keyword links: {len(author_kw_links)}")

with open('assets/json/collabo_graph.json', 'w', encoding='utf-8') as f:
    json.dump({"nodes": nodes, "links": links}, f, ensure_ascii=False, indent=2)