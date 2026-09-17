---
layout: post
title: Yard Simulator
date: 2026-09-16 10:30:00
description: 자동화 컨테이너 터미널의 물류 흐름을 살펴보는 3D 야드 시뮬레이터
giscus_comments: true
related_publications: false
author: [김탁형]
tags: [yard, simulator, container-terminal]
_styles: |
  .yard-simulator-frame {
    display: block;
    width: 100%;
    height: 70vh;
    min-height: 480px;
    max-height: 800px;
    border: 1px solid var(--global-divider-color);
    border-radius: 6px;
  }
---

## **컨테이너는 배에서 내려 어디로 이동하고, 어떤 과정을 거쳐 터미널을 떠날까요?**

<br>

**Yard Simulator**는 자동화 컨테이너 터미널의 야드 운영을 시간의 흐름에 따라 보여 주는 **3D 시뮬레이터**입니다. 선박, 크레인, 무인운반차, 외부 트럭의 움직임을 한 화면에서 살펴볼 수 있습니다.

> _이 시뮬레이터는 **동원 글로벌 터미널과 동일한 구조**로 구성되어 있습니다._

## 시뮬레이터

_아래 화면에서 바로 실행할 수 있습니다. 메뉴와 여러 정보 창을 함께 살펴보려면 새 탭에서 열기를 이용하세요._

<p>
  <a class="btn btn-sm z-depth-0" href="{{ '/assets/html/yard_simulator.html' | relative_url }}" target="_blank" rel="noopener noreferrer">시뮬레이터 새 탭에서 열기 &rarr;</a>
</p>

<iframe
  class="yard-simulator-frame"
  src="{{ '/assets/html/yard_simulator.html' | relative_url }}"
  title="자동화 컨테이너 터미널 3D 야드 시뮬레이터"
  loading="lazy"
  allow="fullscreen"
  allowfullscreen
></iframe>

<div class="caption">
  합성 데이터로 재현한 터미널 운영 화면. 화면 안을 클릭하면 키보드 단축키를 사용할 수 있습니다.
</div>
<br>
<br>
### Quick Start

1. **전체 흐름 보기** — 안벽에서 야드까지 무인운반차(AGV)가 이동하는 경로를 따라가 보세요.
2. **적재와 반출 보기** — 야드 크레인이 컨테이너를 쌓고 꺼내는 모습을 관찰하세요. 꺼낼 컨테이너 위에 다른 컨테이너가 있으면 이를 먼저 옮기는 **재취급(rehandling)**이 발생합니다.
3. **상태 확인하기** — **Yard status**에서 점유율과 재취급 수를 확인하고, **Container search**에서 개별 컨테이너의 위치와 이력을 찾아보세요.

## 조작법과 정보 창

### 화면 조작

| 조작                    | 기능                                                      |
| :---------------------- | :-------------------------------------------------------- |
| 마우스 드래그           | 시점 회전                                                 |
| 마우스 우클릭 후 드래그 | 화면 이동                                                 |
| 마우스 휠               | 확대·축소                                                 |
| `Space`                 | 일시정지·재생                                             |
| `1` / `2` / `3` / `4`   | 시점 전환                                                 |
| `F` 또는 **Fullscreen** | 전체화면 전환                                             |
| **Speed**               | 재생 속도 조절 — 프레임당 약 0.1–600개 이벤트             |
| **Controls**            | 컨테이너 색 기준 변경 — 물류 흐름·잔여 체류시간·적재 단수 |



### 메뉴에서 확인할 수 있는 정보


- **Yard status** — 야드 점유율, 재취급 수, 가동 장비 현황
- **Blocks** — 블록별 야드 상태
- **Vessels** — 선박 항차별 선석, 접안·출항 시각, 양하·적하 진행 상황
- **Container search / Container info** — 컨테이너 검색과 상세 정보: 위치, 위에 쌓인 컨테이너 수, 잔여 체류시간, 이벤트 이력

