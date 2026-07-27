import bibtexparser
import yaml

def main():
    with open('_bibliography/papers.bib', encoding='utf-8') as f:
        bib_database = bibtexparser.load(f)

    counts = {
        "KCI": 0,
        "SCOPUS": 0,
        "SCI": 0,
        "International Conference": 0,
        "Domestic Conference": 0,
        "Arxiv": 0,
    }

    for entry in bib_database.entries:
        level = entry.get('level', '').strip()
        if level in counts:
            counts[level] += 1

    total_count = sum(counts.values())

    result = {
        'kci': counts["KCI"],
        'scopus': counts["SCOPUS"],
        'sci': counts["SCI"],
        'international_conference': counts["International Conference"],
        'domestic_conference': counts["Domestic Conference"],
        'arxiv': counts["Arxiv"],
        'total': total_count
    }
    with open('_data/pub_count.yml', 'w', encoding='utf-8') as f:
        yaml.dump(result, f, allow_unicode=True)

if __name__ == '__main__':
    main()
