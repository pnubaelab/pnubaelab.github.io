---
layout: about
title: About
permalink: /
subtitle: 

# profile:
#   align: right
#   image: bae.jpg
#   image_circular: false # crops the image to make it circular
#   more_info: >
#     <p>Room 602</p>
#     <p>10th Engineering Building</p>
#     <p>Pusan National university</p>

selected_papers: true # includes a list of papers marked as "selected={true}"
social: true # includes social icons at the bottom of the page

announcements:
  enabled: true # includes a list of news items
  scrollable: true # adds a vertical scroll bar if there are more than 3 news items
  limit: 5 # leave blank to include all the news in the `_news` folder

latest_posts:
  enabled: false
  scrollable: false # adds a vertical scroll bar if there are more than 3 new posts items
  limit: 3 # leave blank to include all the blog posts
---

<style>
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');

.hero-section {
  padding: 56px 16px;
  margin: -40px -20px 0 -20px;
  text-align: center;
  position: relative;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), 
              url('{{ "/assets/img/LOGMS2025.jpg" | relative_url }}');
  background-size: cover;
  background-position: center;
  /* background-attachment: fixed;  제거하여 스크롤 고정(parallax) 비활성화 */
  background-attachment: scroll; /* 명시적으로 일반 스크롤 */
  color: white;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.hero-title {
  font-family: 'Oswald', sans-serif;
  font-size: clamp(3.25rem, 12vw, 11rem); /* slightly wider visual footprint */
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em; /* widen title spacing */
  line-height: 0.85;
  margin: 0 0 12px 0; /* tighter spacing below title */
  position: relative;
  z-index: 2;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.hero-colon {
  color: #ff0000;
  font-size: clamp(1.2rem, 5vw, 5rem);
}

.hero-subtitle {
  font-family: 'Oswald', sans-serif;
  font-size: clamp(0.95rem, 2.2vw, 1.8rem); /* slightly smaller to keep hero compact */
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  position: relative;
  z-index: 2;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 40px;
  margin: 60px 0;
}

.info-card {
  background: #fff;
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.card-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.8rem;
  font-weight: 600;
  color: #333 !important;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-content {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: #444 !important;
}

.card-content p {
  color: #444 !important;
}


.highlight-box {
  padding: 20px;
  margin: 20px 0 40px 0;
  text-align: center;
}

/* Document style intro override */
.highlight-box.doc-intro { text-align:left; padding:10px 0 32px 0; margin:10px 0 40px 0; }
.highlight-box.doc-intro .doc-heading { font-family:'Oswald'; font-size:2.2rem; font-weight:600; margin:0 0 14px 0; letter-spacing:.5px; text-transform:none; }
.highlight-box.doc-intro .doc-body { font-size:1rem; line-height:1.6; margin:0; max-width:860px;}
.highlight-box.doc-intro.doc-center { text-align:center; }

.highlight-text {
  font-family: 'Oswald', sans-serif;
  font-size: clamp(1.4rem, 4vw, 2.1rem);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 40px 0;
  place-items: center;
}

.tech-item {
  background: #fff;
  border: 1px solid #e9ecef;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: #333;
  font-family: 'Oswald', sans-serif;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: -0.5px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 80px;
}

.tech-item:hover {
  background: #f8f9fa;
  transform: translateY(-3px);
}

/* Logo strip under hero */
.logo-strip {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 24px 36px;
  padding: 0 20px 24px 20px; /* remove top padding to close the gap */
  margin: 0 -20px 20px -20px; /* match hero-section width */
  background: transparent; /* make container transparent */
  border-top: none;
  border-bottom: none;
}

.logo-item img {
  height: 42px;
  max-width: 200px;
  width: auto;
  object-fit: contain;
}

.logo-item.smartchain {
  background: #ffffff; /* white background as requested */
  padding: 2px 6px; /* tighter padding */
  border-radius: 0; /* sharp corners */
  border: none;
}

/* make white logo text appear gray on white background */
.logo-item.smartchain img {
  filter: grayscale(100%) brightness(0.4);
}

/* reusable white box for specified logos */
.logo-item.boxed {
  background: #ffffff;
  padding: 2px 6px; /* tighter padding */
  border-radius: 0; /* sharp corners */
  border: none;
}

/* Theme-based grayscale toggle for specific logos (PNU, DS) */
.logo-item.pnu .only-dark,
.logo-item.ds .only-dark {
  filter: grayscale(0%) brightness(1);
}

@media (max-width: 768px) {
  .hero-section {
  padding: 48px 16px; /* further reduced on mobile */
  margin: -20px -20px 0 -20px; /* remove bottom gap on mobile */
  }
  
  .section-grid {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  
  .info-card {
    padding: 30px;
  }
  
  .tech-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }

  .logo-strip {
    gap: 16px 20px;
    padding: 0 12px 16px 12px; /* remove top padding on mobile */
    margin: 0 -20px 16px -20px; /* match hero-section width on mobile */
  }

  .logo-item img {
    height: 32px;
    max-width: 160px;
  }
}
</style>

<div class="hero-section">
  <h1 class="hero-title">BAE LAB</h1>
  <p class="hero-subtitle">BIGDATA ANALYTICS ENGINEERING LAB · PNU</p>
</div>
<!-- Partner/affiliation logos -->
<div class="logo-strip">
  <div class="logo-item">
    <a href="https://www.pusan.ac.kr/eng/Main.do" target="_blank" rel="noopener">
    <img class="only-light" src="{{ '/assets/img/logo_pnub.png' | relative_url }}" alt="Pusan National University logo (light)">
    <img class="only-dark" src="{{ '/assets/img/logo_pnud.png' | relative_url }}" alt="Pusan National University logo (dark)">
    </a>
  </div>
  <div class="logo-item">
  <a href="https://ds.pusan.ac.kr/ds/index.do" target="_blank" rel="noopener">
    <img class="only-light" src="{{ '/assets/img/logo_dsb.png' | relative_url }}" alt="DS logo (light)">
    <img class="only-dark" src="{{ '/assets/img/logo_dsd.png' | relative_url }}" alt="DS logo (dark)">
    </a>
  </div>
  <div class="logo-item">
  <a href="https://scsc.pusan.ac.kr/scsc/index.do" target="_blank" rel="noopener">
      <img class="only-light" src="{{ '/assets/img/logo_scsc.png' | relative_url }}" alt="SCSC logo (light)">
      <img class="only-dark" src="{{ '/assets/img/logo_scsc1.png' | relative_url }}" alt="SCSC logo (dark)">
  </a>
  </div>
  <div class="logo-item">
  <a href="https://https://smartchain.kr/" target="_blank" rel="noopener">
    <img class="only-light" src="{{ '/assets/img/logo_smartchain.png' | relative_url }}" alt="Smart Chain logo(light)">
    <img class="only-dark" src="{{ '/assets/img/logo_smartchain1.png' | relative_url }}" alt="Smart Chain logo (dark)">
    </a>
  </div>



<div class="section-container">
    <div class="highlight-box doc-intro doc-center">
      <h2 class="doc-heading">From Raw Data to Operational Intelligence<span class="hero-colon">.</span></h2>
      <p class="doc-body">We fuse advanced analytics, AI engineering, and domain knowledge to transform complex industrial processes into measurable, optimizable, and sustainable systems.</p>
    </div>
    <section class="doc-section" style="margin:0 0 42px 0;">
      <h2 style="font-family:'Oswald',sans-serif;font-size:1.85rem;margin:0 0 14px 0;letter-spacing:.5px;">
        Research Scope
      </h2>
      <p style="margin:0 0 14px 0;line-height:1.55;">
         The <strong>Bigdata Analytics Engineering</strong> (BAE) Lab develops data-driven solutions 
        to address industrial challenges and to advance the <strong>servitization and systematization</strong> 
        of operations. Harnessing the power of cloud and IoT-era data, we uncover hidden performance drivers 
        that enhance efficiency and productivity across <strong>port logistics</strong>, <strong>shipbuilding</strong>, 
        <strong>manufacturing</strong>, <strong>service industries</strong>, and <strong>defense</strong> — 
        converting raw operational traces into structured, decision-ready intelligence.
      </p>
      <p style="margin:0;line-height:1.55;">
         Our work spans the entire lifecycle (acquisition → curation → feature abstraction → 
        AI &amp; hybrid RL/OR with simulation-driven optimization → deployment &amp; monitoring) 
        and integrates deep learning, reinforcement learning, process mining, and large-scale 
        data engineering. Our collaborations foster technology transfer and commercialization, 
        enabling sustainable improvements in industrial efficiency and productivity.
      </p>
    </section>

  <section class="doc-section" style="margin:0 0 30px 0;">
      <h2 style="font-family:'Oswald',sans-serif;font-size:1.85rem;margin:0 0 14px 0;letter-spacing:.5px;">Contact & Location</h2>
      <p style="margin:0 0 6px 0;">Room 602, 10th Engineering Building, Pusan National University</p>
      <p style="margin:0 0 10px 0;">Email: <a href="mailto:hrbae@pusan.ac.kr">hrbae@pusan.ac.kr</a></p>
  </section>
</div>


</div>