import bibtexparser
import yaml
import re

# KCI(국내) 논문: title이 한글로 시작하거나, journal에 '한국' 또는 '대한' 등 포함
# 해외 논문: 그 외

def is_korean(text):
    # 한글이 포함되어 있으면 True
    return bool(re.search(r'[가-힣]', text or ''))

def main():
    with open('_bibliography/papers.bib', encoding='utf-8') as f:
        bib_database = bibtexparser.load(f)

    kci_count = 0
    intl_count = 0
    total_count = 0

    for entry in bib_database.entries:
        title = entry.get('title', '')
        journal = entry.get('journal', '')
        # 한글 논문: title이나 journal에 한글이 있으면 KCI로 간주
        if is_korean(title) or is_korean(journal):
            kci_count += 1
        else:
            intl_count += 1
        total_count += 1

    result = {
        'kci': kci_count,
        'intl': intl_count,
        'total': total_count
    }
    with open('_data/pub_count.yml', 'w', encoding='utf-8') as f:
        yaml.dump(result, f, allow_unicode=True)

if __name__ == '__main__':
    main()
