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
  columns: 3;
  column-gap: 8px;
  margin: 20px 0;
}

.photo-masonry .grid-item {
  width: 100% !important;
  margin-bottom: 8px !important;
  break-inside: avoid;
  display: inline-block;
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
    columns: 3;
    column-gap: 6px;
  }
  .photo-masonry .grid-item {
    margin-bottom: 6px !important;
  }
}

@media (max-width: 768px) {
  .photo-masonry {
    columns: 2;
    column-gap: 5px;
  }
  .photo-masonry .grid-item {
    margin-bottom: 5px !important;
  }
  .category-title {
    font-size: 1.6rem;
  }
}

@media (max-width: 480px) {
  .photo-masonry {
    columns: 1;
    column-gap: 0;
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
  {% if site.enable_project_categories and page.display_categories %}
  <!-- Display categorized projects -->
    {% for category in page.display_categories %}
      <div class="category-section">
        <h2 class="category-title">{{ category }}</h2>
        {% assign categorized_projects = site.photo | where: "category", category %}
        {% assign sorted_projects = categorized_projects | sort: 'date' | reverse %}
        <!-- Generate cards for each project -->
        <div class="photo-masonry">
          {% for project in sorted_projects %}
            {% include photo.html %}
          {% endfor %}
        </div>
      </div>
    {% endfor %}

  {% else %}
  <!-- Display projects without categories -->
    {% assign sorted_projects = site.photo | sort: 'date' | reverse %}
    <!-- Generate cards for each project -->
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