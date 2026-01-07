# NoC Interface 標準

## 為什麼需要標準化

On-chip Network 必須遵循標準化 Protocol，以便它們可以與也設計為與相同標準介接的 IP Block 進行即插即用。這些標準化 Protocol 定義了 IP Block 和通訊 Fabric 之間所有信號的規則，同時允許特定實例的配置。

## 常見標準

目前 SoC 中廣泛使用的 On-chip 通訊標準包括：

| 標準 | 制定者 | 特點 |
|------|--------|------|
| **AMBA AXI** | ARM | 最廣泛使用，支援高頻寬 |
| **STBus** | ST Microelectronics | 歐洲 SoC 常用 |
| **OCP** | Sonics (OCP-IP) | 開放標準 |
| **Wishbone** | OpenCores | 開源社群 |

## Bus-based Transaction 語義

由於目前 SoC 主要使用 Bus 作為 On-chip 互連，這些標準介面採用 Bus-based 語義：

1. Master 發起 Transaction（發出 Request）
2. Slave 接收並處理 Request
3. Slave 回應 Response
4. Transaction 完成

這種 Request-Response Transaction 模型與 Bus 中使用的模型相符，使得更容易圍繞原本設計為與 Bus 介接的 IP Block 設計 Network Interface Wrapper。

## ARM AMBA AXI Protocol

### AXI Channel 結構

AXI Protocol 中的每個 Transaction 在 Address Channel 上發送位址和控制資訊，而資料則在 Data Channel 上以 Burst 方式發送。Write 還有一個額外的 Response Channel。

**Read Transaction：**
- Read Address Channel：Address and Control
- Read Data Channel：Read Data (burst)

**Write Transaction：**
- Write Address Channel：Address and Control
- Write Data Channel：Write Data (burst)
- Write Response Channel：Write Response

![Figure 2.10: AXI read and write channels](/images/ch02/Figure%202.10.jpg)

### Channel 寬度

這些 Channel 的大小可以從 **8 到 1024 bits**，具體大小為每個設計實例化。

### NoC 與 AXI 的整合

使用 AXI Protocol 介接的 NoC 必須具有這三個 Channel：

1. Master Node 的 Write 會導致其 Network Interface：
   - 將 Address Channel 中的位址封裝到 Slave Node 的 Destination Address
   - 將 Write Data Channel 中的資料編碼為 Message 的 Body
   - Message 被分解成 Packet 並注入到 Router 的 Injection Port

2. 在 Destination：
   - Packet 被組裝成 Message
   - 從 Header 提取位址和控制資訊，送入 AXI Write Address Channel
   - 從 Body 獲取資料，送入 AXI Write Data Channel

3. 收到 Message 的最後一個 Flit 後：
   - Network Interface 組成 Write Response Message
   - 發送回 Master Node
   - 送入 Master 的 AXI Write Response Channel

## Out-of-Order Transaction

許多最新版本的標準放寬了 Bus-based 語義的嚴格排序，以便可以插入 Point-to-Point 互連 Fabric（如 Crossbar 和 On-chip Network），同時保持對 Bus 的向後相容性。

### 為什麼需要 Out-of-Order 支援？

::: info 強制排序的問題
在傳統 Bus 中，所有 Transaction 都按照**發出順序**完成。但在 NoC 中強制這種順序會造成嚴重問題：
:::

#### 問題 1：Head-of-Line (HOL) Blocking

```
假設 Master 發出：Req1 → Req2 → Req3

傳統 Bus（強制排序）：
  Req1 ──► Slow Slave（需要 100 cycles）
  Req2 ──► Fast Slave（只需 10 cycles）──► 必須等 Req1！
  Req3 ──► Fast Slave（只需 10 cycles）──► 必須等 Req2！

總延遲：100 + 10 + 10 = 120 cycles

NoC + Out-of-Order：
  Req1 ──► Slow Slave（100 cycles）
  Req2 ──► Fast Slave（10 cycles）──► 立即返回 ✓
  Req3 ──► Fast Slave（10 cycles）──► 立即返回 ✓

有效延遲：max(100, 10, 10) = 100 cycles（Req2, Req3 早就完成）
```

#### 問題 2：路徑長度差異

在 NoC 中，不同目的地有不同的跳數：

| Source → Dest | 跳數 | 基本延遲 |
|---------------|------|----------|
| Node(0,0) → Node(0,1) | 1 hop | ~5 cycles |
| Node(0,0) → Node(3,3) | 6 hops | ~30 cycles |

強制按順序返回意味著近的 Response 要等遠的，浪費大量時間。

#### 問題 3：壅塞造成的延遲變異

即使目的地相同，不同時間的網路壅塞狀況不同，強制排序會讓所有 Transaction 受限於最慢的那個。

### AXI Out-of-Order 支援

**特點：**
- AXI 放寬了 Request 和 Response 之間的排序
- Response 不需要按照 Request 的相同順序返回
- 允許多個 Request Outstanding
- Slave 可以以不同速度運作
- 允許使用多個 Address 和 Data Bus
- 支援 Split-Transaction Bus

![Figure 2.11: AXI out-of-order transactions](/images/ch02/Figure%202.11.jpg)

### Transaction ID 機制

為了讓 Master 能夠識別 Out-of-Order 返回的 Response，AXI 使用 **Transaction ID**：

```
Master 發出：
  Req(ID=1) → Slave A
  Req(ID=2) → Slave B
  Req(ID=3) → Slave A

Response 可能以任意順序返回：
  Resp(ID=2) ← Slave B 先完成
  Resp(ID=1) ← Slave A 完成
  Resp(ID=3) ← Slave A 完成

Master 透過 ID 匹配 Request 和 Response
```

::: tip NoC 與 Out-of-Order
在 On-chip Network 中，不同 Node 對之間發送的 Packet 可能以與發送順序不同的順序到達，這取決於 Node 之間的距離和實際的壅塞程度。在所有 Node 之間強制執行全域排序很難實現且效能損失大。因此，Out-of-Order 通訊標準對於 On-chip Network 部署是必要的。
:::

## Coherence 支援

系統級 Coherence 支援由以下標準提供：

### AMBA 4 ACE

**ACE（AXI Coherency Extensions）** 提供：
- 額外的 Channel 支援各種 Coherence Message
- Snoop Response Controller
- Barrier 支援
- QoS（Quality of Service）

### AMBA 5 CHI

**CHI（Coherent Hub Interface）** 是更新的標準：
- 更完整的 Coherence 支援
- 允許多個處理器共享記憶體
- 支援 ARM 的 big.LITTLE 等架構

## TileLink（RISC-V 生態系統）

TileLink Conformance Levels：

- **TL-UL (Uncached Lightweight)**：最簡單的讀寫操作
- **TL-UH (Uncached Heavyweight)**：支援原子操作和 Hint
- **TL-C (Coherent)**：完整的 Cache Coherence 支援

特點：
- RISC-V 生態系統中常用的介面
- 支援 Coherence
- 多種 Conformance Level

## 選擇考量

| 考量因素 | 說明 |
|----------|------|
| **生態系統** | 是否有足夠的 IP 支援該標準 |
| **功能需求** | 是否支援所需的功能（Coherence、QoS 等） |
| **複雜度** | 實作和驗證的難度 |
| **效能** | 頻寬、延遲特性 |
| **相容性** | 與現有 IP 的相容性 |
| **未來擴展** | 標準的演進和支援 |

## 標準比較

| 特性 | AMBA AXI | OCP | Wishbone |
|------|----------|-----|----------|
| **授權** | 需要 ARM 授權 | 開放 | 開源 |
| **複雜度** | 高 | 中 | 低 |
| **功能完整性** | 非常完整 | 完整 | 基本 |
| **生態系統** | 最大 | 中等 | 開源社群 |
| **Coherence 支援** | ACE/CHI | 有限 | 無 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 2.3
- ARM AMBA AXI Protocol Specification
- OCP-IP Specification
