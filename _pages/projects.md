---
layout: page
title: Projects
permalink: /projects/
description: A showcase of BAELAB's innovative projects.
nav: true
nav_order: 3
horizontal: false
---

<div class="projects">
  {% assign projects = site.projects | where: "category", "projects" %}
  {% assign sorted_projects = projects | sort: "start_date" | reverse %}

  {% assign year = '' %}
  {% for project in sorted_projects %}
    {% assign current_year = project.start_date | date: '%Y' %}
    {% if current_year == '' %}{% assign current_year = 'Unknown' %}{% endif %}

    {% if current_year != year %}
      {% unless forloop.first %}
          </tbody>
        </table>
      </div>
      {% endunless %}

  <h2 id="y{{ current_year }}" class="text-right">{{ current_year }}</h2>
      <div class="table-responsive">
        <table class="table table-sm table-borderless">
          <thead>
            <tr>
              <th scope="col" style="width: 25%">Date</th>
              <th scope="col">Title</th>
            </tr>
          </thead>
          <tbody>
      {% assign year = current_year %}
    {% endif %}

    <tr>
      <th scope="row" style="width: 15%">
        {{ project.start_date | date: '%b, %Y' }}
        {% if project.end_date %}
          ~ {{ project.end_date | date: '%b, %Y' }}
        {% endif %}
      </th>
      <td>
        {% if project.inline %}
          <a>{{ project.title }}</a>
        {% else %}
          <a class="news-title" href="{{ project.url | relative_url }}">{{ project.title }}</a>
        {% endif %}
        {% if project.author %}
          <br><small class="text-muted">from {{ project.author }}</small>
        {% endif %}
      </td>
    </tr>
  {% endfor %}

  {% if sorted_projects and sorted_projects.size > 0 %}
          </tbody>
        </table>
      </div>
  {% endif %}
</div>