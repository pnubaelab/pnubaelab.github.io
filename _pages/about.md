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
  padding: 120px 20px;
  margin: -40px -20px 60px -20px;
  text-align: center;
  position: relative;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), 
              url('https://baelab.pusan.ac.kr/sites/baelab/atchmnfl/bbs/15879/temp_1697086842004100.tmp');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
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
  font-size: clamp(4rem, 15vw, 15rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: -0.05em;
  line-height: 0.85;
  margin: 0 0 20px 0;
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
  font-size: clamp(1.2rem, 3vw, 2.5rem);
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

@media (max-width: 768px) {
  .hero-section {
    padding: 80px 20px;
    margin: -20px -20px 40px -20px;
    background-attachment: scroll;
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
}
</style>

<div class="hero-section">
  <h1 class="hero-title">BAE LAB</h1>
  <p class="hero-subtitle">BIGDATA ANALYTICS ENGINEERING</p>
  <p class="hero-subtitle">PNU, Hyerim Bae</p>
</div>

<div class="section-container">
  <div class="highlight-box">
    <p class="highlight-text">Data-Driven Solutions for Industrial Innovation<span class="hero-colon">.</span></p>
  </div>

  <div class="section-grid">
    <div class="info-card">
      <h2 class="card-title">Research Focus</h2>
      <div class="card-content">
        <p>The <strong>Bigdata Analytics Engineering</strong> (BAE) laboratory uses data to find solutions to various problems in the industry and conduct research necessary for servitization and systematization of them.</p>
        <p>We study methodologies to find hidden keys to process productivity and service competitiveness through data, building systematic operational processes to gain enterprise competitiveness.</p>
      </div>
    </div>

    <div class="info-card">
      <h2 class="card-title">Applications</h2>
      <div class="card-content">
        <p>Our research covers the implementation of pilot systems required for the development, service and commercialization of key source technologies.</p>
        <p>We apply our solutions to <strong>port logistics</strong>, <strong>shipbuilding</strong>, <strong>manufacturing</strong>, <strong>service industries</strong>,
        and <strong>>military</strong></p>
      </div>
    </div>
  </div>

  <div class="tech-grid">
    <div class="tech-item">Artificial<br>Intelligence</div>
    <div class="tech-item">Reinforcement<br>Learning</div>
    <div class="tech-item">Big Data</div>
    <div class="tech-item">Process<br>Mining</div>
  </div>

  <div class="info-card">
    <h2 class="card-title">Innovation & Collaboration</h2>
    <div class="card-content">
      <p>Cloud computing and IoT, the core technologies of the Fourth Industrial Revolution, produce massive amounts of data. Many industries are seeking <strong>hidden knowledge</strong> to gain competitiveness from this data.</p>
      <p>We work on <strong>technology transfer and commercialization</strong> through cooperation with diverse domestic companies, increasing efficiency and productivity in manufacturing, logistics, and finance sectors.</p>
    </div>
  </div>

  <div style="margin-top: 60px;" class="info-card">
    <h2 class="card-title">Join Our Team</h2>
    <div class="card-content">
      <p>Room 602, 10th Engineering Building, PNU<br>
      hrbae@pusan.ac.kr</p>
    </div>
  </div>
</div>
<br>
<br>
<br>
<br>
