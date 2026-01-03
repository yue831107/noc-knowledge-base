# Routing 實作

本節討論 Routing Algorithm 的各種實作選項。Routing Algorithm 可以使用 Source Node 或每個 Router 內的 Look-up Table 來實作。Combinational Circuit 可作為 Table-based Routing 的替代方案。

## 實作選項概覽

![Table 4.1: Routing Algorithm 與實作選項](/images/ch04/Table%204.1.jpg)

不同的實作方式有各種權衡，並非所有 Routing Algorithm 都可以用每種實作方式實現。Table 4.1 展示了三種不同類別的 Routing Algorithm 如何用不同方式實作。

| Routing Algorithm | Source Routing | Combinational | Node Table |
|-------------------|----------------|---------------|------------|
| **Deterministic (DOR)** | Yes | Yes | Yes |
| **Oblivious (Valiant's)** | Yes | Yes | Yes |
| **Oblivious (Minimal)** | Yes | Yes | Yes |
| **Adaptive** | No | Yes | Yes |

## Source Routing

Routing Algorithm 可以透過在 Source 將路由嵌入 Packet Header 來實作，稱為 **Source Routing**。

### 路由編碼範例

以 Figure 4.1 為例：
- **X-Y 路由**可編碼為：`< E, E, N, N, N, Eject >`
- **Y-X 路由**可編碼為：`< N, N, N, E, E, Eject >`

在每一 Hop，Router 會讀取 Header 最左邊的方向，將 Packet 發送到指定的出口 Link，並剝離 Header 中對應當前 Hop 的部分。

### Source Routing Table 範例

![Table 4.2: Node (0,0) 的 Source Routing Table](/images/ch04/Table%204.2.jpg)

Table 4.2 展示了 Figure 4.1 中 2×3 Mesh 在 Node (0,0) 的 Source Routing Table，每個目的地有兩條可選路由。

### 優點

| 優點 | 說明 |
|------|------|
| 減少每 Hop 延遲 | 路由決策在 Source 完成，每 Hop 不需計算或查表 |
| 簡化 Router 硬體 | 不需要 Combinational Routing Logic 或 Routing Table |
| 支持 Irregular Topology | 可重新配置以處理故障和支持不規則拓撲 |
| 支持 Load Balancing | 可儲存多條路由並隨機選擇以改善負載分佈 |

### 缺點

| 缺點 | 說明 |
|------|------|
| Header 開銷 | 需要在每個 Packet 中儲存完整路徑，路徑可能任意長 |
| Table 儲存開銷 | 需要在每個 Source 的 Network Interface 儲存 Routing Table |
| 無法利用動態資訊 | 在 Source 選擇完整路由後，無法利用動態網路狀況避免擁塞 |
| 可變長度路徑 | 對於 5-port Switch，每個 Routing Step 編碼為 3-bit Binary Number |

## Node Table-based Routing

更精細的演算法可使用每個 Router 的 **Routing Table** 來實現，儲存 Packet 到達特定目的地應該採用的 Outgoing Link。

![Table 4.3: West-First Turn Model 的 Node Routing Table](/images/ch04/Table%204.3.jpg)

Table 4.3 展示了 3-ary 2-mesh 上 West-First Turn Model Routing Algorithm 的 Routing Table。每個 Node 的 Table 由對應其 Node Identifier 的那一行組成，每個目的地最多有兩個可能的 Outgoing Link。

- **X** 表示 Eject（到達目的地）
- **-** 表示該方向不可用

### 優點

| 優點 | 說明 |
|------|------|
| 較小的 Table | 每個 Routing Table 只需儲存到每個目的地的下一跳資訊，而非完整路徑 |
| 支持適應性 | 當每個目的地包含多個輸出時，支持一定程度的適應性 |
| 利用本地資訊 | 可使用本地擁塞或故障資訊來偏向路由選擇 |
| 可程式化 | 允許 Routing Table 變更，更好地容忍網路故障 |

### 缺點

| 缺點 | 說明 |
|------|------|
| 增加 Packet 延遲 | Source Routing 只需單次查詢；Node-based Routing 每 Hop 都需查詢 |
| 需要額外硬體 | 每個 Router 都需要儲存和查詢 Routing Table 的硬體 |

## Combinational Circuits

或者，Message 可以編碼目的地的座標，並在每個 Router 使用 Comparator 來決定是接受（Eject）還是轉發 Message。簡單的 Routing Algorithm 通常以 **Combinational Circuit** 實作，因為其開銷低。

![Figure 4.9: 2-D Mesh 的 Combinational Routing Circuit](/images/ch04/Figure%204.9.jpg)

Figure 4.9 展示了一個在 2-D Mesh 中根據當前 Buffer 佔用率計算下一跳的範例電路：

1. 比較 Source 座標 (sx, sy) 和目前座標 (x, y)
2. 產生 **Productive Direction Vector**（可行方向向量）
3. 結合 **Queue Lengths** 資訊
4. 經過 **Route Selection** 產生 **Selected Direction Vector**

或者，路由選擇可以實作 DOR 而非基於 Queue Length 做選擇。

### 優點

| 優點 | 說明 |
|------|------|
| 快速 | Circuit 簡單且以非常低的延遲執行 |
| 低面積 | 不需要儲存 Routing Table |
| 只需目的地 ID | Packet 只需攜帶目的地識別符，而非完整路徑 |

### 缺點

| 缺點 | 說明 |
|------|------|
| 特定於 Topology | 實作特定於一種 Topology 和一種 Routing Algorithm |
| 缺乏靈活性 | 犧牲了 Table-based 策略的通用性和可配置性 |
| 增加延遲 | 與 Source Routing 相比，每 Hop 的計算增加 Packet 遍歷延遲 |

::: info Router Pipeline
如 Chapter 6 所討論，這個 Routing 計算可能會為 Router 遍歷增加一個 Pipeline Stage。
:::

## Adaptive Routing 實作

Adaptive Routing Algorithm 需要機制來追蹤網路擁塞程度並更新路由。

### 實作方式

- 修改 Header（透過 Combinational Circuit 接受擁塞信號作為輸入）
- 更新 Routing Table 中的 Entry
- 利用 Flow Control Protocol 已捕獲的資訊（如 Buffer Occupancy 或 Credits）

### 優點

透過基於網路狀況改進路由決策，網路可以實現更高頻寬並減少 Packet 經歷的擁塞延遲。

### 缺點

- **複雜度**：需要額外電路來做 Congestion-based Routing 決策
- **延遲增加**：電路可能增加 Routing Decision 的延遲
- **面積增加**：可能增加 Router 面積
- **額外通訊**：增加路由決策的精細度可能需要從相鄰 Router 通訊額外資訊

## Irregular Topology 的 Routing

本章的 Routing Algorithm 討論假設 Regular Topology（如 Torus 或 Mesh）。對於 MPSoC 中由異構 Node 組成的 Irregular Topology，需要特殊考量。

### 常見實作

- **Source Table Routing**：在 Source 儲存完整路徑
- **Node Table Routing**：每個 Router 儲存 Routing Table

### Up*/Down* Routing

**Up\*/Down\*** Routing 是一種流行的 Irregular Topology Deadlock-free Routing Algorithm：

1. 從 Root Node 開始，將每條 Link 標記為 **Up** 或 **Down**
2. 所有 Flit 只能從 Up Link 轉換到 Down Link，**但絕不能反向**
3. 這保證了 Deadlock Freedom

### 注意事項

- 指定路由時必須小心避免引入 Deadlock
- 如果某些連接因 Mesh 網路中超大 Core 而被移除，Turn Model Routing 可能不可行

## 實作方式比較

| 特性 | Source Routing | Combinational | Node Table |
|------|----------------|---------------|------------|
| 每 Hop 延遲 | 最低 | 中等 | 最高 |
| Header 開銷 | 最高 | 最低 | 最低 |
| 靈活性 | 高 | 低 | 高 |
| Adaptive 支持 | 不支持 | 支持 | 支持 |
| 面積開銷 | 在 Source | 在每個 Router（小） | 在每個 Router（大） |
| Irregular Topology | 支持 | 不支持 | 支持 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 4.7, 4.8
