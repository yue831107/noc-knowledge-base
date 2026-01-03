# Packet-based Flow Control

Packet-based Flow Control 以 **Packet** 為單位分配 Buffer 和 Link 資源，要求每個 Router 有足夠的 Buffer 來儲存整個 Packet。

## Store and Forward (SAF)

**Store and Forward** 是最早的 Packet Switching 技術，在 Packet 完整到達 Input Buffer 後才能轉發。

![Figure 5.3: Store and Forward 範例](/images/ch05/Figure%205.3.jpg)

### 運作流程

以 Figure 5.3 為例，一個 5-Flit Packet 從 Core 0 發送到 Core 2：

1. **時間 0-4**：Source 發送 5 個 Flit 到 Router 0
2. **時間 5-9**：Router 0 等待整個 Packet 到達後，才轉發到 Router 1
3. **時間 10-14**：Router 1 完整接收後，再轉發到 Core 2

### Latency 分析

$$
T_{SAF} = H \times \left( \frac{L}{B} + t_r \right)
$$

其中：
- $H$：Hop count（跳數）
- $L$：Packet length（Packet 長度）
- $B$：Bandwidth（頻寬）
- $t_r$：Router delay（Router 延遲）

### 特性

| 優點 | 說明 |
|------|------|
| 簡單直觀 | 實作容易，每 Hop 獨立處理 |
| 錯誤檢測 | 可在轉發前進行完整性檢查 |
| Flow Control 簡單 | 每個 Packet 完整佔用/釋放 Buffer |

| 缺點 | 說明 |
|------|------|
| Latency 高 | 每 Hop 必須等待整個 Packet 到達 |
| Buffer 需求大 | 每個 Input Port 需要存放整個 Packet |
| 頻寬利用率低 | 大量時間花在等待 Packet 完整到達 |

### 與 Circuit Switching 比較

Circuit Switching 的 Latency 被認為比 SAF 高，因為 Circuit Setup 的延遲（Probe 往返網路）通常超過 SAF 的 Serialization Latency。

## Virtual Cut-through (VCT)

**Virtual Cut-through** 允許 Head Flit 在整個 Packet 到達前就開始向下游轉發，前提是下游有足夠的 Buffer 空間。

![Figure 5.4: Virtual Cut-through 範例](/images/ch05/Figure%205.4.jpg)

### 運作流程

以 Figure 5.4 為例：

1. **時間 0**：Source 開始發送第一個 Flit
2. **時間 1**：Router 0 收到 Head Flit 後立即轉發（不等待 Tail）
3. **時間 2**：Router 1 收到 Head Flit 後立即轉發
4. **時間 6**：Packet 完成傳輸

### Latency 分析（無阻塞時）

$$
T_{VCT} = H \times t_r + \frac{L}{B}
$$

- **關鍵差異**：Serialization Latency ($\frac{L}{B}$) 不再與 Hop Count 相乘
- **Pipeline 效果**：多個 Router 可以同時處理同一 Packet 的不同部分

### 阻塞時的行為

當下游阻塞時，VCT 回退到 SAF 行為：

1. Head Flit 被阻擋，停止轉發
2. 後續 Flit 繼續到達，累積在 Buffer
3. 整個 Packet 必須 Buffer 在單一 Router
4. 當下游空出時，恢復轉發

::: warning Buffer 需求
VCT 和 SAF 的 Buffer 需求相同：每個 Input Port 必須能存放至少一個完整的 Packet。這是 VCT 的主要缺點之一。
:::

### 特性

| 優點 | 說明 |
|------|------|
| Latency 低 | 無阻塞時，達到近似 Pipeline 效果 |
| 錯誤處理 | 保留在轉發前進行錯誤檢測的能力 |
| Deadlock 處理 | 整個 Packet 在單一 Buffer，便於管理 |

| 缺點 | 說明 |
|------|------|
| Buffer 需求大 | 與 SAF 相同，需要 Packet 大小的 Buffer |
| 阻塞時效能下降 | 回退到 SAF 行為 |
| 頻寬浪費 | 阻塞時佔用完整 Packet 大小的 Buffer |

## SAF vs VCT 比較

| 特性 | Store and Forward | Virtual Cut-through |
|------|-------------------|---------------------|
| Buffer 分配 | Packet | Packet |
| Link 分配 | Packet | Packet |
| 無阻塞 Latency | $H \times (L/B + t_r)$ | $H \times t_r + L/B$ |
| 阻塞時行為 | 原生行為 | 回退到 SAF |
| Pipeline 效果 | 無 | 有（無阻塞時） |
| Buffer 需求 | 大（Packet 大小） | 大（Packet 大小） |
| 實作複雜度 | 低 | 中等 |

## 為何需要更細粒度的 Flow Control

Packet-based Flow Control 的主要限制是 **Buffer 需求**：

- On-chip Network 的面積有限
- Packet 可能很大（如 Cache Line + Header）
- 每個 Input Port 需要多個 Packet Buffer 以避免 Head-of-line Blocking

這些限制促使發展出 **Flit-based Flow Control（Wormhole）**，將在下一節介紹。

## 參考資料

- On-Chip Networks Second Edition, Chapter 5.3
