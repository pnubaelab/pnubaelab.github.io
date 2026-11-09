---
layout: page
title: 📸Photos
permalink: /photos/
description:
nav: true
display_categories: [2026, 2025, 2024, 2023, 2022, 2021, 2020]
---

<style>
.parisienne-regular {
  font-family: "Parisienne", cursive;
  font-weight: 400;
  font-style: normal;
}

.photo-gallery {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 5px;
}

.photo-masonry {
  --photo-column-count: 3;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  /* Start in date order, but let later photos fill gaps around alternating wide cards. */
  grid-auto-flow: row dense;
  gap: 4px;
  margin: 20px 0;
  position: relative;
}

.photo-masonry.is-masonry {
  grid-auto-rows: 2px;
}

.photo-masonry .grid-item {
  width: 100% !important;
  margin-bottom: 0 !important;
  opacity: 0;
  transform: translateY(14px) scale(0.96);
  will-change: auto;
  pointer-events: none;
}

.photo-masonry.is-masonry .grid-item {
  grid-row-end: span var(--masonry-row-span, 1);
}

.photo-masonry .grid-item.is-photo-loaded {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}

.photo-masonry .grid-item.is-photo-entering {
  animation: photo-pop-in 0.48s cubic-bezier(0.18, 0.89, 0.32, 1.28) both;
  will-change: opacity, transform;
}

.photo-masonry .grid-item.is-photo-error {
  opacity: 1;
  transform: none;
  will-change: auto;
  pointer-events: auto;
}

.photo-masonry .grid-item.grid-item--wide {
  grid-column: span 2;
}

.photo-masonry .card {
  width: 100%;
  margin: 0;
  background: transparent;
  border: none;
  box-shadow: none;
  transition: transform 0.2s ease;
}

.photo-masonry .card:hover {
  transform: scale(1.02);
  z-index: 10;
  position: relative;
}

.photo-masonry .photo-img {
  width: 100%;
  height: auto;
  border-radius: 4px;
  display: block;
}

@keyframes photo-pop-in {
  0% {
    opacity: 0;
    transform: translateY(16px) scale(0.92);
  }
  65% {
    opacity: 1;
    transform: translateY(-2px) scale(1.025);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .photo-masonry .grid-item.is-photo-loaded,
  .photo-masonry .grid-item.is-photo-error {
    animation: none;
    opacity: 1;
    transform: none;
    will-change: auto;
  }
}

.photo-masonry .card-body {
  padding: 6px 8px !important;
  max-width: 100% !important;
  margin: 0 !important;
}

.photo-masonry .card-date {
  font-size: 0.85rem;
  margin: 0;
  opacity: 0.8;
}

.category-section {
  margin-bottom: 40px;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 600;
  margin: 30px 0 15px 0;
  color: var(--global-text-color);
}

.category-title::before,
.category-title::after {
  content: "";
  flex: 1 1 auto;
  border-bottom: 2px solid currentColor;
}

.category-title--even::before,
.category-title--odd::after {
  display: none;
}

/* 반응형 컬럼 수 조정 */
@media (max-width: 768px) {
  .photo-masonry {
    --photo-column-count: 2;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .photo-masonry .grid-item.grid-item--wide {
    grid-column: span 2;
  }
  .category-title {
    font-size: 1.6rem;
  }
}

@media (max-width: 480px) {
  .photo-masonry {
    --photo-column-count: 1;
    grid-template-columns: 1fr;
    gap: 3px;
  }
  .photo-masonry .grid-item.grid-item--wide {
    grid-column: span 1;
  }
  .photo-gallery {
    padding: 0 3px;
  }
  .category-title {
    font-size: 1.4rem;
  }
}
</style>

{% include photo-styles.liquid %}

<div class="photo-gallery">
  {% assign sorted_projects = site.photo | sort: 'date' | reverse %}

{% if page.display_categories %}
{% for year in page.display_categories %}
{% assign year_str = year | append: '' %}
{% assign has_year_projects = false %}
{% for project in sorted_projects %}
{% assign project_year = project.date | date: "%Y" %}
{% if project_year == year_str %}
{% assign has_year_projects = true %}
{% break %}
{% endif %}
{% endfor %}
{% if has_year_projects %}

<div class="category-section">
{% assign year_mod = year | modulo: 2 %}
<h2 class="category-title {% if year_mod == 0 %}category-title--even{% else %}category-title--odd{% endif %}">{{ year }}</h2>
<div class="photo-masonry">
{% for project in sorted_projects %}
{% assign project_year = project.date | date: "%Y" %}
{% if project_year == year_str %}
{% include photo.html %}
{% endif %}
{% endfor %}
</div>
</div>
{% endif %}
{% endfor %}
{% else %}
<div class="photo-masonry">
{% for project in sorted_projects %}
{% include photo.html %}
{% endfor %}
</div>
{% endif %}

</div>

<div class="parisienne-regular" style="text-align: center; color: #666;">
La photographie est l’art d’arrêter le temps. <br>
Roland Barthes
</div>

<script defer src="{{ '/assets/js/photo-gallery.js' | relative_url | bust_file_cache }}"></script>
