#!/usr/bin/env python3
"""
Fetches total citations from Google Scholar profile and saves to _data/scholar_citations.yml
"""
import yaml
import time
import random
from pathlib import Path

try:
    from scholarly import scholarly
    HAS_SCHOLARLY = True
except ImportError:
    HAS_SCHOLARLY = False

try:
    import requests
    from bs4 import BeautifulSoup
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


def get_scholar_id_from_config():
    """Read scholar_userid from _data/socials.yml"""
    socials_path = Path('_data/socials.yml')
    if socials_path.exists():
        with open(socials_path, 'r', encoding='utf-8') as f:
            socials = yaml.safe_load(f)
            return socials.get('scholar_userid')
    return None


def fetch_citations_with_scholarly(scholar_id: str) -> dict:
    """Fetch citations using scholarly library"""
    try:
        author = scholarly.search_author_id(scholar_id)
        author = scholarly.fill(author, sections=['basics', 'indices'])
        
        return {
            'total_citations': author.get('citedby', 0),
            'h_index': author.get('hindex', 0),
            'i10_index': author.get('i10index', 0),
        }
    except Exception as e:
        print(f"Error fetching with scholarly: {e}")
        return None


def fetch_citations_with_requests(scholar_id: str) -> dict:
    """Fetch citations by scraping Google Scholar profile page"""
    url = f"https://scholar.google.com/citations?user={scholar_id}&hl=en"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }
    
    try:
        # Random delay to avoid rate limiting
        time.sleep(random.uniform(1.0, 3.0))
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find the citations table
        # Google Scholar has a table with "Citations", "h-index", "i10-index"
        citations_table = soup.find('table', {'id': 'gsc_rsb_st'})
        
        result = {
            'total_citations': 0,
            'h_index': 0,
            'i10_index': 0,
        }
        
        if citations_table:
            rows = citations_table.find_all('tr')
            for row in rows:
                cells = row.find_all('td')
                if len(cells) >= 2:
                    header = cells[0].get_text(strip=True).lower()
                    # Get "All" column value (first numeric column)
                    value_text = cells[1].get_text(strip=True).replace(',', '')
                    try:
                        value = int(value_text)
                    except ValueError:
                        value = 0
                    
                    if 'citations' in header:
                        result['total_citations'] = value
                    elif 'h-index' in header:
                        result['h_index'] = value
                    elif 'i10-index' in header:
                        result['i10_index'] = value
        
        return result if result['total_citations'] > 0 else None
        
    except Exception as e:
        print(f"Error fetching with requests: {e}")
        return None


def load_cached_citations() -> dict:
    """Load previously cached citations"""
    cache_path = Path('_data/scholar_citations.yml')
    if cache_path.exists():
        with open(cache_path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f)
    return None


def save_citations(data: dict):
    """Save citations to _data/scholar_citations.yml"""
    output_path = Path('_data/scholar_citations.yml')
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        yaml.dump(data, f, allow_unicode=True, default_flow_style=False)
    
    print(f"Saved citations to {output_path}")


def main():
    scholar_id = get_scholar_id_from_config()
    
    if not scholar_id:
        print("Error: scholar_userid not found in _data/socials.yml")
        # Try to use cached data
        cached = load_cached_citations()
        if cached:
            print(f"Using cached citations: {cached.get('total_citations', 0)}")
        return
    
    print(f"Fetching citations for Google Scholar ID: {scholar_id}")
    
    result = None
    
    # Try scholarly library first
    if HAS_SCHOLARLY:
        print("Trying scholarly library...")
        result = fetch_citations_with_scholarly(scholar_id)
    
    # Fall back to requests/BeautifulSoup
    if result is None and HAS_REQUESTS:
        print("Trying requests/BeautifulSoup...")
        result = fetch_citations_with_requests(scholar_id)
    
    # Use cached data as fallback
    if result is None:
        print("Could not fetch citations, checking cache...")
        result = load_cached_citations()
        if result:
            print(f"Using cached citations: {result.get('total_citations', 0)}")
        else:
            # Default values
            result = {
                'total_citations': 2565,  # Default fallback
                'h_index': 0,
                'i10_index': 0,
            }
            print(f"Using default citations: {result['total_citations']}")
    else:
        print(f"Fetched citations: {result.get('total_citations', 0)}")
    
    save_citations(result)


if __name__ == '__main__':
    main()
