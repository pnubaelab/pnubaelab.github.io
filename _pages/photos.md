---
layout: page
title: 📸Photos
permalink: /photos/
description: 
nav: true
display_categories: [2025,2024,2023,2022,2021,2020]
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
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-flow: dense;
  column-gap: 8px;
  row-gap: 5px;
  margin: 20px 0;
}

.photo-masonry.is-masonry {
  grid-auto-rows: 8px;
}

.photo-masonry .grid-item {
  width: 100% !important;
  margin-bottom: 0 !important;
}

.photo-masonry.is-masonry .grid-item {
  grid-row-end: span var(--masonry-row-span, 1);
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
  font-size: 2rem;
  font-weight: 600;
  margin: 30px 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--global-divider-color);
  color: var(--global-text-color);
}

/* 반응형 컬럼 수 조정 */
@media (max-width: 1200px) {
  .photo-masonry {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: 6px;
    row-gap: 4px;
  }
}

@media (max-width: 768px) {
  .photo-masonry {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 5px;
    row-gap: 3px;
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
    grid-template-columns: 1fr;
    row-gap: 3px;
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
          <h2 class="category-title">{{ year }}</h2>
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

<script>
  (function () {
    function applyMasonry(grid) {
      var computedStyle = window.getComputedStyle(grid);
      var rowHeight = parseFloat(computedStyle.getPropertyValue('grid-auto-rows'));
      var rowGap = parseFloat(computedStyle.getPropertyValue('row-gap'));

      if (!rowHeight || rowHeight <= 0) return;

      var items = grid.querySelectorAll('.grid-item');
      items.forEach(function (item) {
        var content = item.querySelector('.card') || item;
        var contentHeight = content.getBoundingClientRect().height;
        var rowSpan = Math.ceil((contentHeight + rowGap) / (rowHeight + rowGap));
        item.style.setProperty('--masonry-row-span', rowSpan);
      });
    }

    function layoutAllMasonry() {
      var grids = document.querySelectorAll('.photo-masonry');
      grids.forEach(function (grid) {
        grid.classList.add('is-masonry');
        applyMasonry(grid);
      });
    }

    var resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layoutAllMasonry, 120);
    }

    document.addEventListener('DOMContentLoaded', function () {
      layoutAllMasonry();

      document.querySelectorAll('.photo-masonry .photo-img').forEach(function (img) {
        if (img.complete) return;
        img.addEventListener('load', layoutAllMasonry, { once: true });
        img.addEventListener('error', layoutAllMasonry, { once: true });
      });
    });

    window.addEventListener('resize', onResize);
  })();
</script>