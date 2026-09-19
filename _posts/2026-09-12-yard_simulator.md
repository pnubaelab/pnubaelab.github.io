---
layout: post
title: Tak's Yard Simulator
date: 2026-09-16 10:30:00
description: Follow containers, cranes, AGVs, and trucks through an automated terminal in a 3D yard simulator
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

## **From ship to gate**: what happens to a container inside an automated terminal?

<br>

The answer is a tightly choreographed sequence of handoffs. A vessel arrives at the quay, cranes lift containers ashore, automated guided vehicles (AGVs) carry them into the yard, and yard cranes stack, retrieve, and reposition them before trucks take them beyond the gate.

**Tak's Yard Simulator** brings that choreography to life in **3D**. Watch the terminal evolve over time, trace individual moves, and see how vessels, cranes, AGVs, and external trucks share the same operational rhythm.


## Simulator

_Start the simulation below, or open it in a new tab for the full workspace with menus and information panels._

<p>
  <a class="btn btn-sm z-depth-0" href="{{ '/assets/html/yard_simulator.html' | relative_url }}" target="_blank" rel="noopener noreferrer">Open Simulator in New Tab &rarr;</a>
</p>

<iframe
  class="yard-simulator-frame"
  src="{{ '/assets/html/yard_simulator.html' | relative_url }}"
  title="Automated Container Terminal 3D Yard Simulator"
  loading="lazy"
  allow="fullscreen"
  allowfullscreen
></iframe>

<div class="caption">
  A synthetic yet operationally grounded view of terminal activity. Click the simulation to enable keyboard shortcuts.
</div>
<br>
<br>
### Quick Start

1. **Follow a container's journey** — Pick an AGV at the quay and follow it as it carries a container into the yard.
2. **Catch the hidden moves** — Watch yard cranes stack and retrieve containers. When a target container is buried, the crane must first clear the containers above it; this is **rehandling**.
3. **Read the terminal at a glance** — Use **Yard status** for occupancy and rehandling counts, then open **Container search** to uncover a container's exact location and movement history.
<br>
<br>

## Controls and Information Panels

### View Controls

| Control                 | Function                                                   |
| :---------------------- | :--------------------------------------------------------- |
| Drag                    | Rotate the view                                            |
| Right-click and drag    | Pan the view                                               |
| Mouse wheel             | Zoom in or out                                             |
| `Space`                 | Pause or play                                              |
| `1` / `2` / `3` / `4`   | Switch views                                               |
| `F` or **Fullscreen**   | Toggle fullscreen                                          |
| **Speed**               | Set the pace, from a slow inspection to approximately 600 events per frame |
| **Controls**            | Color containers by flow, remaining dwell time, or stack height |



### Information Available in the Menus


- **Yard status** — See yard occupancy, rehandling totals, and which equipment is currently at work.
- **Blocks** — Compare the operating state and utilization of each yard block.
- **Vessels** — Follow each vessel call from berth assignment through arrival, departure, discharge, and loading progress.
- **Container search / Container info** — Locate any container and inspect its stack position, containers above it, remaining dwell time, and full event history.

For questions or further details, please contact [glorytak74@pusan.ac.kr](mailto:glorytak74@pusan.ac.kr).

