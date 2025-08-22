import bibtexparser
import json
from collections import defaultdict, Counter
import itertools
import yaml
import time
import random
import re
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

with open('_bibliography/papers.bib', encoding='utf-8') as bibfile:
    parser = bibtexparser.bparser.BibTexParser(common_strings=False)
    bib_database = bibtexparser.load(bibfile, parser=parser)

print("Generating collaboration graph...")

author_counter = Counter()
coauthor_counter = defaultdict(int)

# Load Google Scholar user id
scholar_userid = None
try:
    with open('_data/socials.yml', encoding='utf-8') as yf:
        socials = yaml.safe_load(yf) or {}
        scholar_userid = socials.get('scholar_userid')
except FileNotFoundError:
    print("Warning: _data/socials.yml not found; cannot fetch Google Scholar citations.")

# Simple on-disk cache to avoid re-fetching citations every run
cache_path = 'assets/json/scholar_citations_cache.json'
try:
    with open(cache_path, 'r', encoding='utf-8') as cf:
        citation_cache = json.load(cf)
except Exception:
    citation_cache = {}


def fetch_gs_citations(uid: str, article_id: str) -> int:
    """Fetch citation count for a single Google Scholar article.

    Args:
        uid: Google Scholar user id
        article_id: value from bib entry 'google_scholar_id'
    Returns:
        Citation count as integer (0 on failure).
    """
    # Use cache first
    if article_id in citation_cache and isinstance(citation_cache.get(article_id), int):
        return citation_cache[article_id]

    url = (
        f"https://scholar.google.com/citations?view_op=view_citation&hl=en"
        f"&user={uid}&citation_for_view={uid}:{article_id}"
    )
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    }
    try:
        # Polite delay to reduce rate-limiting
        time.sleep(random.uniform(1.2, 2.8))
        req = Request(url, headers=headers)
        with urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')

        # Try to extract from meta description or og:description
        # e.g., content="... Cited by 123 ..."
        m = re.search(r'<meta[^>]+name="description"[^>]+content="([^"]+)"', html, re.IGNORECASE)
        if not m:
            m = re.search(r'<meta[^>]+property="og:description"[^>]+content="([^"]+)"', html, re.IGNORECASE)
        cited_by = 0
        if m:
            content = m.group(1)
            m2 = re.search(r"Cited by (\d{1,3}(?:,\d{3})*|\d+)", content)
            if m2:
                cited_by = int(m2.group(1).replace(',', ''))

        # Cache and return
        citation_cache[article_id] = int(cited_by)
        return int(cited_by)
    except (HTTPError, URLError, TimeoutError, Exception) as e:
        # On any error, cache zero and move on
        print(f"Warning: failed to fetch citations for {article_id}: {e}")
        citation_cache[article_id] = 0
        return 0

for entry in bib_database.entries:
    if 'author' in entry:
        authors = [a.strip() for a in entry['author'].replace('\n', ' ').split(' and ')]

        # Coauthor links: count per shared paper (unchanged)
        for a1, a2 in itertools.combinations(sorted(authors), 2):
            coauthor_counter[(a1, a2)] += 1

        # Node value: sum Google Scholar citations for each author
        citations_for_entry = 0
        gs_id = entry.get('google_scholar_id')
        if scholar_userid and gs_id:
            citations_for_entry = fetch_gs_citations(scholar_userid, gs_id)
        else:
            # Fallback: if no scholar id available, treat as 0 citations
            citations_for_entry = 0

        for a in authors:
            author_counter[a] += citations_for_entry

# Persist citation cache
try:
    with open(cache_path, 'w', encoding='utf-8') as cf:
        json.dump(citation_cache, cf, ensure_ascii=False, indent=2)
except Exception as e:
    print(f"Warning: failed to write citation cache: {e}")

nodes = [{"id": a, "group": 1, "value": author_counter[a]} for a in author_counter]
links = [{"source": a1, "target": a2, "value": v} for (a1, a2), v in coauthor_counter.items()]

with open('assets/json/collabo_graph.json', 'w', encoding='utf-8') as f:
    json.dump({"nodes": nodes, "links": links}, f, ensure_ascii=False, indent=2)