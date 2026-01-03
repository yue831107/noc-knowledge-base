# Message-based Flow Control

我們從 **Circuit Switching** 開始，這是一種在最粗粒度（Message 層級）運作的技術，然後在後續章節將這些技術細化到更細的粒度。

## Circuit Switching

**Circuit Switching** 在傳輸資料前，先跨多個 Hop 預先分配資源（Link）給整個 Message。

![Figure 5.2: Circuit Switching 範例](/images/ch05/Figure%205.2.jpg)

### 運作流程

以 Figure 5.2 為例（假設使用 X-Y Routing），從 Core 0 到 Core 8：

1. **Setup Phase**（時間 0-4）：
   - 發送一個 **Probe**（小型 Setup Message，標記為 S）進入網路
   - Probe 沿著選定的路由預留 Link
   - Probe 到達目的地後，目的地發送 **Acknowledgement**（A）回 Source

2. **Data Transfer Phase**（時間 9-17）：
   - Source 收到 Acknowledgement 後，釋放 Message（D）
   - Message 可以快速穿越網路（無需每 Hop 等待資源分配）
   - 可以在單一 Circuit 上發送多個 Message

3. **Teardown Phase**（時間 17-20）：
   - 發送 **Tail**（T）釋放沿途資源

### 特性

| 優點 | 說明 |
|------|------|
| Setup 後無競爭 | 資源已預留，傳輸時無延遲 |
| Bufferless | 由於 Link 已預留，不需要每 Hop 的 Buffer |
| 適合大量資料 | Setup Latency 可被大量資料攤銷 |
| 可發送多個 Message | 單一 Circuit 可傳送多個 Message |

| 缺點 | 說明 |
|------|------|
| Setup Latency 高 | 需要等待 Probe + Acknowledgement |
| 資源利用率低 | Setup 期間和閒置時，Link 被佔用但未使用 |
| 阻擋其他流量 | 其他需要這些 Link 的 Message 被阻擋 |
| 不適合短訊息 | Setup 開銷無法被攤銷 |

### 頻寬浪費範例

從 Figure 5.2 可以看到明顯的頻寬浪費（灰色區域）：
- **Setup 期間**：Link 被保留但閒置
- **閒置時段**：Cycle 12 和 16，Source 沒有資料要發送但 Link 仍被佔用
- **Core 2 的延遲**：Core 2 想發送到 Core 8，但必須等到 Core 0 的 Circuit 釋放（時間 19 才能開始 Setup）

### ATM (Asynchronous Transfer Mode)

**ATM** 建立虛擬電路連接：
- 在發送資料前，必須從 Source 到 Destination 預留網路資源（類似 Circuit Switching）
- 但資料以 **Packet 粒度**而非 Message 粒度切換

## 與 Packet Switching 比較

| 特性 | Circuit Switching | Packet Switching |
|------|-------------------|------------------|
| Latency | 高（含 Setup） | 低 |
| 資源利用率 | 低 | 高 |
| Buffer 需求 | 無 | 需要 |
| 適用流量 | 大量持續流量 | 短暫突發流量 |
| 實作複雜度 | 需要 Setup/Teardown 機制 | 需要 Buffer 管理 |

## 應用場景

- **Streaming Data**：持續的資料流（如影片串流）
- **Real-time Traffic**：需要保證頻寬的流量
- **大型資料傳輸**：足夠大的 Message 可攤銷 Setup 開銷

## 參考資料

- On-Chip Networks Second Edition, Chapter 5.2
