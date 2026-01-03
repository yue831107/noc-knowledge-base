# Introduction

自 1990 年代末期開始，隨著 Multi-core 晶片研究的興起，On-chip Network 已成為一個重要且快速發展的研究領域。隨著 Core 數量增加，Multi-core 處理器出現在從高階伺服器到智慧型手機甚至物聯網（IoT）閘道器等各種領域，對於可擴展的 On-chip 互連架構的需求也隨之增長。

## 本章內容

- [Multi-core 時代](./multi-core-era) - Multi-core 架構的興起與通訊需求
- [On-chip vs Off-chip](./on-chip-vs-off-chip) - 片上網路與片外網路的差異
- [Network 基礎](./network-basics) - 網路基礎概念與術語
- [Building Blocks](./building-blocks) - NoC 的基本建構區塊

## 重點概念

::: tip 為什麼需要 NoC？
隨著每一代製程技術提供更多的 Transistor，加上 Multi-core 晶片模組化設計降低了設計複雜度，Multi-core 浪潮勢不可擋。我們已經看到面向 HPC 的 Multi-core 產品擁有超過 50 個 Core，研究原型更超過 100 個 Core。傳統的 Bus 和 Crossbar 架構無法滿足如此多 Core 之間的通訊需求，因此需要更具擴展性的 Network 解決方案。
:::

## 常見縮寫

| 縮寫 | 全名 | 說明 |
|------|------|------|
| **NoC** | Network-on-Chip | 最常用的縮寫 |
| **OCIN** | On-Chip Interconnection Network | 片上互連網路 |
| **OCN** | On-Chip Networks | 片上網路 |

## 學習目標

完成本章後，你將能夠：

1. 解釋為什麼 Multi-core 處理器需要 On-chip Network
2. 區分 On-chip 和 Off-chip Network 的特性差異
3. 描述 NoC 的基本組成元件（Topology、Routing、Flow Control、Router Microarchitecture）
4. 理解 NoC 設計的效能與成本 Trade-off

## 參考資料

- On-Chip Networks Second Edition, Chapter 1
