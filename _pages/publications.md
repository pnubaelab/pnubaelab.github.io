---
layout: page
permalink: /publications/
title: Publications
description:
nav: true
nav_order: 2
collabo_background: true
---

{% include collabo.liquid %}

<section class="publications-reading-pane" aria-label="Publication list">

{% include bib_search.liquid %}

<div class="publications">
{% bibliography %}

</div>

</section>
