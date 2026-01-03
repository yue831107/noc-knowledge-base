# 資料單位

當 Message 被注入網路時，它首先被分割成 **Packet**，然後再分成固定長度的 **Flit**（Flow Control Unit）。Flit 可以進一步分解為 **Phit**（Physical Unit），對應於物理通道寬度。

![Figure 5.1: Message、Packet、Flit 的組成](/images/ch05/Figure%205.1.jpg)

> **圖 5.1 解說**：此圖展示 NoC 中資料分層結構。一個完整的 Message（如 Cache Line 傳輸）會被切割成一個或多個 Packet，每個 Packet 再被切割成固定大小的 Flit。Head Flit 攜帶路由資訊，Body Flit 攜帶資料，Tail Flit 標示 Packet 結束。這種分層設計讓 [Flow Control](/05-flow-control/) 機制可以在不同粒度進行資源管理。

## 層級結構

| 層級 | 單位 | 說明 |
|------|------|------|
| 應用層 | Message | 完整的通訊訊息 |
| Network 層 | Packet | 網路傳輸單位，包含路由資訊 |
| Flow Control 層 | Flit | Flow Control 的最小單位 |
| Physical 層 | Phit | 一個 Clock Cycle 傳輸的資料量 |

## Message

- **定義**：應用層的完整訊息，是網路以上通訊的邏輯單位
- **大小**：可變
- **分割**：一個 Message 可能被分成多個 Packet

### 範例

從 Sharer 發送到 Requester 的 128-byte Cache Line 會作為一個 Message 注入。如果 Maximum Packet Size 大於 128 bytes，整個 Message 將編碼為單一 Packet。

## Packet

- **定義**：Network 層的傳輸單位，是對網路有意義的物理單位
- **內容**：包含 Header（路由資訊）和 Payload
- **特性**：Packet 包含目的地資訊，而 Flit 可能沒有
- **路由**：同一 Packet 的所有 Flit 必須走相同路徑

### Packet 結構

Packet 由以下 Flit 組成：

| Flit 類型 | 內容 | 功能 |
|-----------|------|------|
| **Head Flit** | Route、Seq#、目的地位址 | 包含路由資訊，建立路徑 |
| **Body Flit** | Payload 資料 | 攜帶實際資料 |
| **Tail Flit** | Payload 資料 | 最後一個 Flit，標示 Packet 結束並釋放資源 |

### 範例（Figure 5.1b）

假設 16-byte 寬的 Flit 和 64-byte Cache Line：
- **Cache Line Packet**：由 5 個 Flit 組成（1 Head + 3 Body + 1 Tail）

### 範例（Figure 5.1c）

- **Coherence Command Packet**：只需攜帶 Command 和 Memory Address，可以放入單一 16-byte Flit（Head & Tail 合一）

## Flit (Flow Control Unit)

- **定義**：Flow Control 的最小單位
- **Buffer 分配**：以 Flit 為單位
- **大小固定**：便於 Buffer 管理

### Flit 類型

| 類型 | 標記 | 功能 |
|------|------|------|
| Head | H | 包含路由資訊，啟動 VC 分配 |
| Body | B | 中間的資料 Flit |
| Tail | T | 最後一個 Flit，釋放 VC |
| Head & Tail | 合併 | 單一 Flit 的 Packet |

### Flit 內容

每個 Flit 包含：
- **Type**：Head、Body、Tail 或 Head & Tail
- **VCID**：Virtual Channel ID（參見 [Virtual Channels](/05-flow-control/virtual-channels)）
- **Payload**：實際資料（Cache Line 內容或 Coherence Command）

## Phit (Physical Unit)

- **定義**：一個 Clock Cycle 在物理通道上傳輸的資料量
- **大小**：等於 Link Width（bits）

$$
\text{Phit Size} = \text{Link Width (bits)}
$$

### On-chip vs Off-chip 差異

| 特性 | On-chip Network | Off-chip Network |
|------|-----------------|------------------|
| Channel 寬度 | 較寬（Wire 資源豐富） | 受 Pin Bandwidth 限制 |
| Flit vs Phit | 通常 1 Flit = 1 Phit | Flit 可能被分成多個 Phit |
| Message 大小 | 通常單一 Packet | 可能多個 Packet |

::: info On-chip Network 特性
由於 On-chip Wire 資源豐富，Channel 通常較寬，因此：
- Message 通常由單一 Packet 組成
- 許多 Message 實際上是 Single-flit Packet
- Flit 通常由單一 Phit 組成，是 Message 的最小細分
:::

## 相關章節

- [Wormhole Flow Control](/05-flow-control/flit-based) - 基於 Flit 的流量控制
- [Virtual Channels](/05-flow-control/virtual-channels) - VC 如何管理 Flit 傳輸
- [Router Buffers](/06-router-microarchitecture/buffers) - Flit 在 Router 中的儲存

## 參考資料

- On-Chip Networks Second Edition, Chapter 5.1
