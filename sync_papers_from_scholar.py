#!/usr/bin/env python3
"""
Google Scholar에서 2024년 이후 논문을 가져와 papers.bib에 없는 논문을 추가하는 스크립트

사용법:
    python3 sync_papers_from_scholar.py [--dry-run] [--year YEAR] [--detail]
    
옵션:
    --dry-run: 실제로 파일을 수정하지 않고 추가될 논문만 출력
    --year YEAR: 기준 연도 (기본값: 2024)
    --detail: 상세 정보 가져오기 (느림, 더 정확한 정보)
    --no-reformat: Copilot CLI로 재형식화하지 않음
"""

import yaml
import re
import argparse
import subprocess
import shutil
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
        if authors:  # 빈 문자열이 아닌 경우에만
            authors = [a.strip() for a in authors.split(' and ')]
        else:
            authors = []
    
    # 저자가 없으면 경고 표시
    if not authors:
        print(f"  ⚠️  저자 정보 없음: {title[:50]}...")
    
    venue = bib_fields.get('venue', '') or bib_fields.get('journal', '') or bib_fields.get('conference', '')
    abstract = bib_fields.get('abstract', '')
    
    # venue가 없으면 citation 정보에서 추출 시도
    if not venue:
        citation = bib_fields.get('citation', '')
        if citation:
            venue = citation
    
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
                   주의: quick_mode에서는 저자/venue 정보가 부실할 수 있음
    """
    publications = []
    
    try:
        print(f"Google Scholar에서 저자 정보를 가져오는 중... (ID: {scholar_id})")
        
        # 저자 검색
        author = scholarly.search_author_id(scholar_id)
        
        # 저자 정보 채우기 (publications 포함)
        print("논문 목록을 가져오는 중...")
        author = scholarly.fill(author, sections=['publications'])
        
        author_name = author.get('name', '')  # 저자 이름 저장 (fallback용)
        
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
            # Quick 모드에서도 각 논문의 상세 정보를 가져옴 (저자/venue 확보를 위해)
            print("논문 상세 정보를 가져오는 중...")
            for i, pub in enumerate(candidate_pubs):
                try:
                    title = pub.get('bib', {}).get('title', 'Unknown')[:50]
                    print(f"  [{i+1}/{len(candidate_pubs)}] {title}...")
                    
                    # 상세 정보 가져오기 시도
                    pub_filled = scholarly.fill(pub)
                    
                    # 저자 정보가 없으면 저자 이름으로 대체
                    bib = pub_filled.get('bib', {})
                    if not bib.get('author'):
                        bib['author'] = author_name
                        pub_filled['bib'] = bib
                    
                    publications.append(pub_filled)
                    print(f"    -> 완료")
                except Exception as e:
                    print(f"    -> 오류 발생: {e}")
                    # 오류 시에도 저자 이름 추가하여 저장
                    bib = pub.get('bib', {})
                    if not bib.get('author'):
                        bib['author'] = author_name
                        pub['bib'] = bib
                    publications.append(pub)
        else:
            # 상세 모드: 각 논문의 상세 정보 가져오기 (동일)
            print("상세 모드: 각 논문의 상세 정보를 가져옵니다...")
            for i, pub in enumerate(candidate_pubs):
                try:
                    title = pub.get('bib', {}).get('title', 'Unknown')[:50]
                    print(f"  [{i+1}/{len(candidate_pubs)}] {title}...")
                    pub_filled = scholarly.fill(pub)
                    
                    # 저자 정보가 없으면 저자 이름으로 대체
                    bib = pub_filled.get('bib', {})
                    if not bib.get('author'):
                        bib['author'] = author_name
                        pub_filled['bib'] = bib
                    
                    publications.append(pub_filled)
                    print(f"    -> 완료")
                except Exception as e:
                    print(f"    -> 오류 발생 (기본 정보 사용): {e}")
                    bib = pub.get('bib', {})
                    if not bib.get('author'):
                        bib['author'] = author_name
                        pub['bib'] = bib
                    publications.append(pub)
        
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


def check_copilot_cli_available() -> bool:
    """Copilot CLI가 설치되어 있는지 확인"""
    return shutil.which('copilot') is not None


def reformat_bib_entry_with_copilot(bib_entry: str) -> str:
    """
    Copilot CLI를 사용하여 단일 BibTeX 엔트리를 재형식화
    - level, abbr, keywords 필드를 필수로 추가
    - 기존 형식과 일치하도록 정리
    
    Args:
        bib_entry: 재형식화할 BibTeX 엔트리 문자열
        
    Returns:
        재형식화된 BibTeX 엔트리 문자열 (실패 시 원본 반환)
    """
    if not check_copilot_cli_available():
        return bib_entry
    
    print("  🔄 Copilot CLI로 엔트리 재형식화 중...")

    # Copilot CLI 프롬프트 생성
    prompt = f"""다음 BibTeX 엔트리를 재형식화해줘. 반드시 BibTeX 형식의 결과만 출력해:

{bib_entry}

다음 규칙을 적용해:
1. level 필드 추가 (venue/journal 기반 추론):
   - IEEE Transactions, Nature, Science 계열 -> SCI
   - IEEE Access, MDPI 저널 -> SCOPUS
   - arXiv, SSRN -> Arxiv
   - INFORMS, BPM, ICIS 등 국제학회 -> International Conference
   - 국내 학회 및 기타 -> Domestic Conference

2. abbr 필드 추가 (저널/학회 약어):
   - IEEE Transactions on Pattern Analysis and Machine Intelligence -> TPAMI
   - Transportation Research Part D -> TRD
   - 등 일반적인 약어 사용

3. keywords 필드:
   - 'TODO'가 있거나 없으면 제목과 abstract에서 키워드 5-7개 추출
   - 쉼표로 구분

4. 들여쓰기는 2칸 스페이스
5. level과 abbr은 title 앞에 위치

재형식화된 BibTeX 엔트리만 출력해 (설명 없이):"""

    try:
        import tempfile
        
        # 임시 파일에 결과를 저장하도록 요청
        cmd = [
            'copilot', '-p', prompt,
            '--json'
        ]
        
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0 and result.stdout:
            output = result.stdout.strip()
            
            # JSON 형식에서 응답 추출 시도
            try:
                import json
                response = json.loads(output)
                if isinstance(response, dict) and 'message' in response:
                    output = response['message']
            except:
                pass
            
            # BibTeX 엔트리 추출 (@ 로 시작하는 부분)
            if '@' in output:
                # @ 부터 마지막 } 까지 추출
                start_idx = output.find('@')
                # 중괄호 매칭으로 끝 찾기
                brace_count = 0
                end_idx = start_idx
                for i, char in enumerate(output[start_idx:], start_idx):
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            end_idx = i + 1
                            break
                
                if end_idx > start_idx:
                    reformatted = output[start_idx:end_idx]
                    print("    ✅ 재형식화 완료")
                    return reformatted
            
            print("    ⚠️  유효한 BibTeX 형식을 찾지 못함")
            return bib_entry
        else:
            print(f"    ⚠️  Copilot 응답 없음")
            return bib_entry
            
    except subprocess.TimeoutExpired:
        print("    ⚠️  Copilot CLI 타임아웃")
        return bib_entry
    except Exception as e:
        print(f"    ⚠️  Copilot CLI 오류: {e}")
        return bib_entry


def reformat_entries_with_copilot(entries: list[str]) -> list[str]:
    """
    여러 BibTeX 엔트리를 Copilot CLI로 재형식화
    
    Args:
        entries: BibTeX 엔트리 문자열 리스트
        
    Returns:
        재형식화된 BibTeX 엔트리 리스트
    """
    if not check_copilot_cli_available():
        print("⚠️  Copilot CLI가 설치되어 있지 않습니다.")
        return entries
    
    print("\n🔄 Copilot CLI로 BibTeX 엔트리 재형식화 중...")
    
    reformatted_entries = []
    for i, entry in enumerate(entries):
        print(f"\n[{i+1}/{len(entries)}] 엔트리 처리 중...")
        reformatted = reformat_bib_entry_with_copilot(entry)
        reformatted_entries.append(reformatted)
    
    return reformatted_entries


def infer_level_and_abbr(entry_text: str) -> tuple[str, str]:
    """venue/journal/booktitle에서 level과 abbr 추론"""
    entry_lower = entry_text.lower()
    
    # SCI 저널들
    sci_journals = [
        ('ieee transactions', 'SCI', 'IEEE Trans'),
        ('transportation research part d', 'SCI', 'TRD'),
        ('transportation research part e', 'SCI', 'TRE'),
        ('transportation research part a', 'SCI', 'TRA'),
        ('transportation research part b', 'SCI', 'TRB'),
        ('transportation research part c', 'SCI', 'TRC'),
        ('maritime transport research', 'SCI', 'MARTRA'),
        ('expert systems with applications', 'SCI', 'ESWA'),
        ('computers in industry', 'SCI', 'CII'),
        ('ieee tpami', 'SCI', 'IEEE TPAMI'),
        ('pattern analysis and machine intelligence', 'SCI', 'IEEE TPAMI'),
        ('ocean engineering', 'SCI', 'OE'),
        ('applied ocean research', 'SCI', 'AOR'),
    ]
    
    # SCOPUS 저널들
    scopus_journals = [
        ('ieee access', 'SCOPUS', 'IEEE Access'),
        ('sustainability', 'SCOPUS', 'Sustainability'),
        ('sensors', 'SCOPUS', 'Sensors'),
        ('applied sciences', 'SCOPUS', 'Appl. Sci.'),
    ]
    
    # Arxiv/프리프린트
    arxiv_sources = [
        ('arxiv', 'Arxiv', 'arXiv'),
        ('ssrn', 'Arxiv', 'SSRN'),
    ]
    
    # 국제 학회
    int_conferences = [
        ('informs', 'International Conference', 'INFORMS'),
        ('bpm 20', 'International Conference', 'BPM'),
        ('icis', 'International Conference', 'ICIS'),
        ('icicic', 'International Conference', 'ICICIC'),
        ('ieem', 'International Conference', 'IEEM'),
        ('apms', 'International Conference', 'APMS'),
    ]
    
    # 순서대로 매칭
    for keyword, level, abbr in sci_journals + scopus_journals + arxiv_sources + int_conferences:
        if keyword in entry_lower:
            return level, abbr
    
    # 기본값
    if 'conference' in entry_lower or 'proceedings' in entry_lower or 'workshop' in entry_lower:
        return 'International Conference', 'Conf'
    elif 'journal' in entry_lower:
        return 'Journal', 'Journal'
    
    return 'Unknown', 'Unknown'


def add_required_fields_to_entry(entry: str) -> str:
    """
    단일 BibTeX 엔트리에 필수 필드(level, abbr, keywords) 추가
    
    Args:
        entry: BibTeX 엔트리 문자열
        
    Returns:
        필수 필드가 추가된 BibTeX 엔트리 문자열
    """
    lines = entry.split('\n')
    new_lines = []
    
    # level, abbr 추론
    level, abbr = infer_level_and_abbr(entry)
    
    entry_lower = entry.lower()
    has_level = 'level' in entry_lower
    has_abbr = 'abbr' in entry_lower
    has_keywords = 'keywords' in entry_lower
    
    for i, line in enumerate(lines):
        new_lines.append(line)
        
        # @ 라인 다음에 level, abbr 추가
        if line.strip().startswith('@') and '{' in line:
            if not has_level:
                new_lines.append(f'  level = {{{level}}},')
            if not has_abbr:
                new_lines.append(f'  abbr = {{{abbr}}},')
    
    # keywords가 없으면 마지막 } 전에 추가
    if not has_keywords:
        result_lines = []
        for i, line in enumerate(new_lines):
            if line.strip() == '}' and i == len(new_lines) - 1:
                result_lines.append('  keywords = {TODO: Add keywords},')
            result_lines.append(line)
        new_lines = result_lines
    
    return '\n'.join(new_lines)


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
        default=2026,
        help='기준 연도 (기본값: 2026)'
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
    parser.add_argument(
        '--no-reformat',
        action='store_true',
        help='Copilot CLI로 재형식화하지 않음'
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
        # Copilot CLI로 재형식화 (파일 추가 전에 수행)
        if not args.no_reformat:
            print("\n📝 BibTeX 엔트리 재형식화 시작...")
            
            if check_copilot_cli_available():
                # Copilot CLI로 각 엔트리 재형식화
                new_entries = reformat_entries_with_copilot(new_entries)
            else:
                print("\n💡 Copilot CLI가 설치되어 있지 않습니다.")
                print("   수동으로 필수 필드를 추가합니다...")
                # 수동으로 기본 필드 추가
                new_entries = [add_required_fields_to_entry(entry) for entry in new_entries]
        
        # 파일에 추가
        append_to_bib(bib_path, new_entries)
        print(f"\n{len(new_entries)}개의 논문이 {bib_path}에 추가되었습니다.")
        
        print("\n✅ 완료! 추가된 논문들을 검토하고 필요시 수정해주세요.")


if __name__ == '__main__':
    main()
