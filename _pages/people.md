---
layout: page
title: People
permalink: /people/
description: 
nav: true
display_categories: [current, parttime,alumni]
horizontal: false
---
<style>
.projects h2.category { color:#000 !important; }
</style>
<div class="projects">
  {% if site.enable_project_categories and page.display_categories %}
  <!-- Display categorized projects -->
    {% for category in page.display_categories %}
      {% if category == 'parttime' %}
        <h2 class="category">part-time</h2>
      {% else %}
        <h2 class="category">{{ category }}</h2>
      {% endif %}
      {% assign categorized_projects = site.people | where: "category", category %}
      {% if category == "alumni" %}
        {% assign sorted_projects = categorized_projects | sort: "importance" | reverse %}
      {% else %}
        {% assign sorted_projects = categorized_projects | sort: "importance" %}
      {% endif %}
      <!-- Generate cards for each project -->
      {% if page.horizontal %}
        <div class="container">
          <div class="row row-cols-2">
          {% for project in sorted_projects %}
            {% include projects_horizontal.html %}
          {% endfor %}
          </div>
        </div>
      {% else %}
        <div class="grid">
          {% for project in sorted_projects %}
            {% include projects.html %}
          {% endfor %}
        </div>
      {% endif %}
    {% endfor %}

  {% else %}
  <!-- Display projects without categories -->
    {% assign sorted_projects = site.people | sort: "importance"| reverse  %}
    <!-- Generate cards for each project -->
    {% if page.horizontal %}
      <div class="container">
        <div class="row row-cols-2">
        {% for project in sorted_projects %}
          {% include projects_horizontal.html %}
        {% endfor %}
        </div>
      </div>
    {% else %}
      <div class="grid">
        {% for project in sorted_projects %}
          {% include projects.html %}
        {% endfor %}
      </div>
    {% endif %}

  {% endif %}

</div>