# Routing Algorithm 類型

Routing Algorithm 一般可分為三大類：**Deterministic**、**Oblivious** 和 **Adaptive**。

## 分類方式

### 依決策位置

| 類型 | 說明 |
|------|------|
| Source Routing | Source 決定完整路徑，編碼在 Packet Header 中 |
| Distributed Routing | 每個 Router 獨立決策下一步 |

### 依路徑選擇

| 類型 | 說明 | 特點 |
|------|------|------|
| **Deterministic** | 相同 S-D pair 總是走同一路徑 | 最簡單，是 Oblivious 的子集 |
| **Oblivious** | 路徑選擇與網路狀態無關，但可能有多條路徑可選 | 可隨機選擇路徑 |
| **Adaptive** | 根據網路狀態（如擁塞）選擇路徑 | 最靈活，但實作複雜 |

## 三種 Routing 類型的比較

![Figure 4.1: DOR、Oblivious 和 Adaptive Routing 比較](/images/ch04/Figure%204.1.jpg)

以 Figure 4.1 為例，從 (0,0) 到 (2,3) 的路由：

### Deterministic (DOR)
- **X-Y Dimension-Ordered Routing**：先沿 X 軸走，再沿 Y 軸走
- 從 (0,0) 到 (2,3)：先沿 X 軸走 2 hop 到達 (2,0)，再沿 Y 軸走 3 hop 到達 (2,3)
- 相同的 Source-Destination pair 總是走同一條路徑

### Oblivious
- 有多條路徑可選（如 X-Y 或 Y-X），但選擇與網路狀態無關
- 可以在發送前隨機選擇路徑
- Deterministic Routing 是 Oblivious Routing 的子集

### Adaptive
- 根據網路流量狀況動態選擇路徑
- 例如：沿 X-Y 路徑前進時，如果在 (1,0) 的 East 方向遇到擁塞，可以改走 North 方向

## Minimal vs Non-minimal

### Minimal Routing

只選擇需要最少 Hop 數的路徑：

- **優點**：最低延遲、最低功耗
- **限制**：無法避開擁塞區域

### Non-minimal Routing

允許繞路，增加 Hop 數：

- **缺點**：在沒有擁塞時增加延遲和功耗
- **優點**：可避開擁塞的 Link，在有擁塞時可能反而更快
- **風險**：需要注意 **Livelock** 問題

::: warning Livelock
當使用 Non-minimal Routing 時，Packet 可能不斷被 Misroute（誤導）而永遠無法到達目的地。解決方法包括：
- 限制每個 Packet 的最大 Misroute 次數
- 給已被多次 Misroute 的 Packet 較高優先權
:::

## 設計考量

| 特性 | Deterministic | Oblivious | Adaptive |
|------|---------------|-----------|----------|
| 實作複雜度 | 低 | 中 | 高 |
| Load Balancing | 差 | 中 | 好 |
| Path Diversity | 無 | 有限 | 最佳 |
| Deadlock 處理 | 簡單 | 中等 | 複雜 |
| 繞過故障能力 | 無 | 有限 | 最佳 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 4.1
