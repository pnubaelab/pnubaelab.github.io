#!/usr/bin/env python3
"""
Google Scholar에서 2024년 이후 논문을 가져와 papers.bib에 없는 논문을 추가하는 스크립트

사용법:
    python3 sync_papers_from_scholar.py [--dry-run] [--year YEAR] [--detail]
    
옵션:
    --dry-run: 실제로 파일을 수정하지 않고 추가될 논문만 출력
    --year YEAR: 기준 연도 (기본값: 2024)
    --detail: 상세 정보 가져오기 (느림, 더 정확한 정보)
"""

import yaml
import re
import argparse
from pathlib import Path
from datetime import datetime
from typing import Optional

try:
    from scholarly import scholarly, ProxyGenerator
    HAS_SCHOLARLY = True
except ImportError:
    HAS_SCHOLARLY = False
    print("scholarly 라이브러리가 설치되어 있지 않습니다.")
    print("설치: pip install scholarly")


def get_scholar_id_from_socials() -> Optional[str]:
    """_data/socials.yml에서 scholar_userid 읽기"""
    socials_path = Path('_data/socials.yml')
    if socials_path.exists():
        with open(socials_path, 'r', encoding='utf-8') as f:
            socials = yaml.safe_load(f)
            return socials.get('scholar_userid')
    return None


def parse_existing_bib(bib_path: str) -> set:
    """
    기존 papers.bib 파일에서 논문 제목들을 추출
    제목을 정규화하여 비교에 사용
    """
    existing_titles = set()
    
    with open(bib_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # title 필드 추출 (다양한 형식 지원)
    # title = {Some Title} 또는 title = "Some Title"
    title_pattern = r'title\s*=\s*[{"](.+?)[}"]'
    matches = re.findall(title_pattern, content, re.IGNORECASE | re.DOTALL)
    
    for title in matches:
        # 제목 정규화: 소문자, 특수문자 제거, 공백 정리
        normalized = normalize_title(title)
        existing_titles.add(normalized)
    
    return existing_titles


def normalize_title(title: str) -> str:
    """
    제목을 정규화하여 비교에 사용
    - 소문자로 변환
    - 특수문자 제거
    - 연속 공백 제거
    """
    # 소문자 변환
    title = title.lower()
    # 줄바꿈 제거
    title = title.replace('\n', ' ')
    # 특수문자 제거 (알파벳, 숫자, 공백만 유지)
    title = re.sub(r'[^a-z0-9\s]', '', title)
    # 연속 공백을 단일 공백으로
    title = re.sub(r'\s+', ' ', title).strip()
    return title


def generate_bib_key(authors: list, year: int, title: str) -> str:
    """
    BibTeX 키 생성
    형식: FirstAuthorLastName + Year + TitleFirstWord
    """
    # 첫 번째 저자의 성 추출
    if authors:
        first_author = authors[0]
        # "성 이름" 또는 "이름 성" 형식 처리
        parts = first_author.strip().split()
        if parts:
            last_name = parts[-1]  # 마지막 단어를 성으로 가정
        else:
            last_name = "Unknown"
    else:
        last_name = "Unknown"
    
    # 제목에서 첫 의미있는 단어 추출
    title_words = re.findall(r'[A-Za-z]+', title)
    stop_words = {'a', 'an', 'the', 'on', 'in', 'of', 'for', 'to', 'with', 'and', 'or'}
    first_word = ""
    for word in title_words:
        if word.lower() not in stop_words:
            first_word = word.capitalize()
            break
    
    if not first_word and title_words:
        first_word = title_words[0].capitalize()
    
    return f"{last_name}{year}{first_word}"


def format_authors_bibtex(authors: list) -> str:
    """저자 목록을 BibTeX 형식으로 변환"""
    return " and ".join(authors)


def create_bib_entry(pub: dict) -> str:
    """
    Google Scholar 논문 정보를 BibTeX 엔트리로 변환
    """
    bib_fields = pub.get('bib', {})
    
    title = bib_fields.get('title', 'Unknown Title')
    year = bib_fields.get('pub_year', datetime.now().year)
    authors = bib_fields.get('author', [])
    
    # authors가 문자열인 경우 리스트로 변환
    if isinstance(authors, str):
        authors = [a.strip() for a in authors.split(' and ')]
    
    venue = bib_fields.get('venue', '') or bib_fields.get('journal', '') or bib_fields.get('conference', '')
    abstract = bib_fields.get('abstract', '')
    
    # BibTeX 키 생성
    bib_key = generate_bib_key(authors, year, title)
    
    # URL 정보
    pub_url = pub.get('pub_url', '')
    eprint_url = pub.get('eprint_url', '')
    
    # BibTeX 타입 결정 (기본: misc)
    entry_type = 'misc'
    if venue:
        venue_lower = venue.lower()
        if any(word in venue_lower for word in ['conference', 'proceedings', 'workshop', 'symposium']):
            entry_type = 'inproceedings'
        elif any(word in venue_lower for word in ['journal', 'transactions', 'letters']):
            entry_type = 'article'
    
    # BibTeX 엔트리 생성
    lines = [f"@{entry_type}{{{bib_key},"]
    lines.append(f"  title = {{{title}}},")
    lines.append(f"  author = {{{format_authors_bibtex(authors)}}},")
    lines.append(f"  year = {{{year}}},")
    
    if venue:
        if entry_type == 'inproceedings':
            lines.append(f"  booktitle = {{{venue}}},")
        else:
            lines.append(f"  journal = {{{venue}}},")
    
    if abstract:
        # abstract에서 특수문자 이스케이프
        abstract_clean = abstract.replace('{', '\\{').replace('}', '\\}')
        lines.append(f"  abstract = {{{abstract_clean}}},")
    
    if pub_url:
        lines.append(f"  html = {{{pub_url}}},")
    
    if eprint_url:
        lines.append(f"  pdf = {{{eprint_url}}},")
    
    # 인용 수
    num_citations = pub.get('num_citations', 0)
    if num_citations:
        lines.append(f"  note = {{Cited by {num_citations}}},")
    
    lines.append("}")
    
    return "\n".join(lines)


def fetch_publications_from_scholar(scholar_id: str, min_year: int = 2024, quick_mode: bool = True) -> list:
    """
    Google Scholar에서 특정 연도 이후의 논문 목록을 가져옴
    
    Args:
        scholar_id: Google Scholar 저자 ID
        min_year: 최소 연도
        quick_mode: True이면 기본 정보만 사용하여 빠르게 처리 (상세 정보 가져오지 않음)
    """
    publications = []
    
    try:
        print(f"Google Scholar에서 저자 정보를 가져오는 중... (ID: {scholar_id})")
        
        # 저자 검색
        author = scholarly.search_author_id(scholar_id)
        
        # 저자 정보 채우기 (publications 포함)
        print("논문 목록을 가져오는 중...")
        author = scholarly.fill(author, sections=['publications'])
        
        total_pubs = len(author.get('publications', []))
        print(f"총 {total_pubs}개의 논문 발견")
        
        # 먼저 연도 기준으로 필터링
        candidate_pubs = []
        for pub in author.get('publications', []):
            bib_year = pub.get('bib', {}).get('pub_year')
            if bib_year:
                try:
                    year = int(bib_year)
                    if year >= min_year:
                        candidate_pubs.append(pub)
                except ValueError:
                    continue
        
        print(f"{min_year}년 이후 논문 후보: {len(candidate_pubs)}개")
        
        if quick_mode:
            # Quick 모드: 기본 정보만 사용
            print("Quick 모드: 기본 정보만 사용합니다.")
            for pub in candidate_pubs:
                publications.append(pub)
        else:
            # 상세 모드: 각 논문의 상세 정보 가져오기
            print("상세 모드: 각 논문의 상세 정보를 가져옵니다...")
            for i, pub in enumerate(candidate_pubs):
                try:
                    title = pub.get('bib', {}).get('title', 'Unknown')[:50]
                    print(f"  [{i+1}/{len(candidate_pubs)}] {title}...")
                    pub_filled = scholarly.fill(pub)
                    publications.append(pub_filled)
                    print(f"    -> 완료")
                except Exception as e:
                    print(f"    -> 오류 발생 (기본 정보 사용): {e}")
                    publications.append(pub)  # 오류 시 기본 정보 사용
        
    except Exception as e:
        print(f"Google Scholar 접근 중 오류 발생: {e}")
        raise
    
    return publications


def find_new_publications(publications: list, existing_titles: set) -> list:
    """
    기존 papers.bib에 없는 새로운 논문 찾기
    """
    new_pubs = []
    
    for pub in publications:
        title = pub.get('bib', {}).get('title', '')
        normalized = normalize_title(title)
        
        if normalized not in existing_titles:
            new_pubs.append(pub)
    
    return new_pubs


def append_to_bib(bib_path: str, new_entries: list[str]):
    """
    새로운 BibTeX 엔트리들을 papers.bib 파일에 추가
    """
    with open(bib_path, 'a', encoding='utf-8') as f:
        f.write("\n\n% ===== 아래는 자동으로 추가된 논문입니다 =====\n")
        f.write(f"% 추가 일시: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        for entry in new_entries:
            f.write(entry)
            f.write("\n\n")


def main():
    parser = argparse.ArgumentParser(
        description='Google Scholar에서 논문을 가져와 papers.bib에 추가'
    )
    parser.add_argument(
        '--dry-run', 
        action='store_true',
        help='실제로 파일을 수정하지 않고 추가될 논문만 출력'
    )
    parser.add_argument(
        '--year',
        type=int,
        default=2024,
        help='기준 연도 (기본값: 2024)'
    )
    parser.add_argument(
        '--scholar-id',
        type=str,
        help='Google Scholar ID (지정하지 않으면 socials.yml에서 읽음)'
    )
    parser.add_argument(
        '--detail',
        action='store_true',
        help='상세 정보 가져오기 (느리지만 abstract 등 정보 포함)'
    )
    parser.add_argument(
        '--use-proxy',
        action='store_true',
        help='프록시 사용 (rate limiting 우회)'
    )
    
    args = parser.parse_args()
    
    if not HAS_SCHOLARLY:
        print("scholarly 라이브러리를 먼저 설치해주세요: pip install scholarly")
        return
    
    # Scholar ID 가져오기
    scholar_id = args.scholar_id or get_scholar_id_from_socials()
    if not scholar_id:
        print("Google Scholar ID를 찾을 수 없습니다.")
        print("--scholar-id 옵션으로 지정하거나 _data/socials.yml에 scholar_userid를 설정해주세요.")
        return
    
    # 프록시 설정 (선택적)
    if args.use_proxy:
        print("프록시 설정 중...")
        pg = ProxyGenerator()
        pg.FreeProxies()
        scholarly.use_proxy(pg)
    
    bib_path = '_bibliography/papers.bib'
    
    # 기존 논문 제목 파싱
    print(f"기존 papers.bib 파일 분석 중...")
    existing_titles = parse_existing_bib(bib_path)
    print(f"기존 논문 수: {len(existing_titles)}")
    
    # Google Scholar에서 논문 가져오기
    print(f"\nGoogle Scholar에서 {args.year}년 이후 논문을 가져옵니다...")
    quick_mode = not args.detail
    publications = fetch_publications_from_scholar(scholar_id, args.year, quick_mode)
    print(f"\n{args.year}년 이후 논문 수: {len(publications)}")
    
    # 새로운 논문 찾기
    new_pubs = find_new_publications(publications, existing_titles)
    print(f"papers.bib에 없는 새로운 논문 수: {len(new_pubs)}")
    
    if not new_pubs:
        print("\n추가할 새로운 논문이 없습니다.")
        return
    
    # BibTeX 엔트리 생성
    print("\n=== 새로 추가될 논문 목록 ===")
    new_entries = []
    for pub in new_pubs:
        entry = create_bib_entry(pub)
        new_entries.append(entry)
        
        bib_info = pub.get('bib', {})
        print(f"\n제목: {bib_info.get('title', 'Unknown')}")
        print(f"연도: {bib_info.get('pub_year', 'Unknown')}")
        print(f"저자: {bib_info.get('author', 'Unknown')}")
        print("-" * 50)
    
    if args.dry_run:
        print("\n[Dry Run 모드] 실제 파일 수정 없이 종료합니다.")
        print("\n생성될 BibTeX 엔트리:")
        for entry in new_entries:
            print(entry)
            print()
    else:
        # 파일에 추가
        append_to_bib(bib_path, new_entries)
        print(f"\n{len(new_entries)}개의 논문이 {bib_path}에 추가되었습니다.")
        print("추가된 논문들을 검토하고 필요시 수정해주세요.")


if __name__ == '__main__':
    main()
