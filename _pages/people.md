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
.projects h2.category { color: var(--category-heading-color) !important; }
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
        {% comment %} Sort by description: Professor (0th), PhD (1st), M.S (2nd), Undergraduate (3rd), others (4th) {% endcomment %}
        {% assign professor_projects = categorized_projects | where_exp: "item", "item.description contains 'Professor'" | sort: "importance" %}
        {% assign phd_projects = categorized_projects | where_exp: "item", "item.description contains 'PhD'" | sort: "importance" %}
        {% assign ms_projects = categorized_projects | where_exp: "item", "item.description contains 'M.S'" | sort: "importance" %}
        {% assign undergrad_projects = categorized_projects | where_exp: "item", "item.description contains 'Undergraduate'" | sort: "importance" %}
        {% assign other_projects = categorized_projects | sort: "importance" %}
        {% assign temp_others = "" | split: "" %}
        {% for p in other_projects %}
          {% unless p.description contains 'Professor' or p.description contains 'PhD' or p.description contains 'M.S' or p.description contains 'Undergraduate' %}
            {% assign temp_others = temp_others | push: p %}
          {% endunless %}
        {% endfor %}
        {% assign sorted_projects = professor_projects | concat: phd_projects | concat: ms_projects | concat: undergrad_projects | concat: temp_others %}
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