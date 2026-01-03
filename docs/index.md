---
layout: home

hero:
  name: "NoC 知識庫"
  text: "Network on Chip"
  tagline: 基於《On-Chip Networks Second Edition》的完整學習資源
  image:
    src: /images/hero-image.svg
    alt: NoC
  actions:
    - theme: brand
      text: 開始學習
      link: /01-introduction/
    - theme: alt
      text: 術語表
      link: /glossary

features:
  - icon: 🏗️
    title: Introduction
    details: 了解 NoC 的基本概念、Multi-core 時代的通訊需求，以及 On-chip Network 的建構區塊。
    link: /01-introduction/

  - icon: 🔗
    title: System Architecture
    details: 探索 NoC 與系統架構的介面，包含 Shared Memory、Coherence Protocol 和 Message Passing。
    link: /02-system-architecture/

  - icon: 🌐
    title: Topology
    details: 學習各種網路拓撲結構：Ring、Mesh、Torus、Crossbar、Butterfly、Fat Tree 等。
    link: /03-topology/

  - icon: 🛤️
    title: Routing
    details: 深入了解 Routing 演算法：Dimension-ordered、Oblivious、Adaptive、Multicast Routing。
    link: /04-routing/

  - icon: 🚦
    title: Flow Control
    details: 掌握 Flow Control 機制：Flit、Packet、Virtual Channel、Wormhole、Deadlock-free 設計。
    link: /05-flow-control/

  - icon: ⚙️
    title: Router Microarchitecture
    details: Router 微架構設計：Buffer、Switch、Allocator、Pipeline 和低功耗技術。
    link: /06-router-microarchitecture/

  - icon: 📊
    title: Modeling & Evaluation
    details: NoC 建模與評估方法、Traffic Pattern 分析、Debug 技巧和 NoC Generator。
    link: /07-modeling-evaluation/

  - icon: 📚
    title: Case Studies
    details: 真實案例分析：MIT Eyeriss、Intel Xeon Phi、IBM Cell、Tilera 等實際 NoC 實作。
    link: /08-case-studies/

  - icon: 🔮
    title: Conclusions
    details: 未來趨勢與新興技術：光互連、3D 堆疊、Resilient NoC、FPGA NoC、異構 SoC。
    link: /09-conclusions/
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #3b82f6 30%, #8b5cf6);
}

.dark {
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #60a5fa 30%, #a78bfa);
}
</style>
