# Flit-based Flow Control (Wormhole)

**Wormhole Flow Control** 以 **Flit** 為單位分配 Buffer，大幅減少 Buffer 需求，是 On-chip Network 中最常用的 Flow Control 技術。

## 概念

在 Wormhole Flow Control 中：
- **Buffer 分配**：以 Flit 為單位
- **Link 分配**：以 Packet 為單位（整個 Packet 必須走相同路徑）

Packet 像蟲一樣穿過網路：Head 在前方探索路徑，Body 和 Tail 跟隨其後。

![Figure 5.5: Wormhole Flow Control 範例](/images/ch05/Figure%205.5.jpg)

## 運作方式

以 Figure 5.5 為例，一個 5-Flit Packet 從 Core 0 發送到 Core 2：

1. **Head Flit 到達**：
   - Router 進行 Routing 決策
   - 請求 Output Port 和 VC
   - 一旦獲得資源，立即轉發到下一跳

2. **Body Flit 跟隨**：
   - 沿著 Head 建立的路徑前進
   - 不需要重新做 Routing 決策
   - 每個 Flit 獨立佔用/釋放 Buffer

3. **Tail Flit 收尾**：
   - 標示 Packet 結束
   - 釋放沿途的 VC 和 Link 資源
   - 讓出路徑給其他 Packet

### Pipeline 效果

從 Figure 5.5 可見：
- **時間 2**：Packet 同時佔據 Source、Router 0、Router 1
- **時間 6**：傳輸完成

與 VCT 相比，Wormhole 達到相同的 Pipeline 效果，但 Buffer 需求大幅降低。

## Latency 分析

$$
T_{WH} = H \times t_r + \frac{L}{B}
$$

- 與 VCT 的無阻塞 Latency 相同
- $H \times t_r$：Head Flit 穿越 H 個 Router 的延遲
- $\frac{L}{B}$：Serialization Latency（Packet 從 Source 發出的時間）

## Buffer 需求

Wormhole 的主要優勢是 **Buffer 需求極低**：

| Flow Control | Buffer 需求（每 Port） |
|--------------|------------------------|
| Store and Forward | ≥ Packet 大小 |
| Virtual Cut-through | ≥ Packet 大小 |
| Wormhole | 幾個 Flit |

::: tip 為何 Buffer 需求低
在 Wormhole 中，當 Head 被阻擋時，Flit 可以分散在沿途的多個 Router Buffer 中。不需要在單一 Router 存放整個 Packet。
:::

## 特性

### 優點

| 優點 | 說明 |
|------|------|
| Buffer 需求小 | 只需存放幾個 Flit，大幅節省面積 |
| Latency 低 | Pipeline 效果，與 VCT 相當 |
| 適合 On-chip | 面積效率高，適合面積受限的 NoC |
| 實作簡單 | 不需要追蹤整個 Packet 的狀態 |

### 缺點

| 缺點 | 說明 |
|------|------|
| Head-of-line Blocking | Head 被擋時，整個 Packet 卡住，佔用沿途資源 |
| 佔用多個 Router | 阻塞的 Packet 會佔據多個 Router 的 Buffer |
| Link 效率降低 | 阻塞的 Packet 會阻擋該 Link 上的其他流量 |
| 潛在 Deadlock | 分散在多個 Buffer 的 Packet 可能形成 Deadlock |

## Head-of-line Blocking 問題

**Head-of-line (HOL) Blocking** 是 Wormhole 最主要的問題：

### 問題描述

當 Head Flit 被阻擋時：
1. 整個 Packet 停止前進
2. Flit 分散在沿途多個 Router 的 Buffer
3. 這些 Buffer 被佔用，無法服務其他 Packet
4. 其他 Packet 即使要去不同方向，也可能被阻擋

### 影響

- **頻寬效率降低**：Link 和 Buffer 被阻塞的 Packet 佔用
- **延遲增加**：其他 Packet 必須等待
- **吞吐量下降**：整體網路效能受影響

### 解決方案

**Virtual Channels** 可以緩解 HOL Blocking：
- 將一個 Physical Channel 分成多個 Virtual Channel
- 不同 Packet 可以使用不同 VC
- 一個 VC 阻塞不影響其他 VC
- 詳見 [Virtual Channels](./virtual-channels)

## Wormhole vs VCT 比較

| 特性 | Wormhole | Virtual Cut-through |
|------|----------|---------------------|
| Buffer 分配 | Flit | Packet |
| Link 分配 | Packet | Packet |
| Buffer 需求 | 小（幾個 Flit） | 大（整個 Packet） |
| 無阻塞 Latency | $H \times t_r + L/B$ | $H \times t_r + L/B$ |
| 阻塞時行為 | Flit 分散在多個 Router | 整個 Packet 在單一 Router |
| HOL Blocking | 嚴重 | 較不嚴重 |
| 適用場景 | 面積受限的 On-chip | Buffer 充足的環境 |

## 為何 Wormhole 主導 On-chip Network

1. **面積效率**：On-chip 面積寶貴，Wormhole 的低 Buffer 需求非常重要
2. **延遲特性**：無阻塞時 Latency 與 VCT 相同
3. **Virtual Channel 緩解 HOL**：搭配 VC 可以解決主要缺點
4. **成熟的實作**：廣泛使用，設計方法成熟

## 參考資料

- On-Chip Networks Second Edition, Chapter 5.4
