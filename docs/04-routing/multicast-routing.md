# Multicast Routing

到目前為止，我們專注於 **Unicast**（一對一）Routing Algorithm。然而，在許多情況下，Core 需要將相同的 Message 發送到多個目的地。

## 基本概念

- **Broadcast**：如果系統中所有 Core 都需要接收信號
- **Multicast**：如果系統中部分 Core 需要接收信號

## 應用場景

| 應用場景 | 說明 |
|----------|------|
| **Cache Coherence** | Invalidation 訊息需要送到多個 Cache（見於 Broadcast-based 和 Limited Directory-based Coherence Protocol） |
| **Barrier Synchronization** | 通知多個 Core 同步點已到達 |
| **Message Passing** | MPI_Bcast 等例程需要 Broadcast 功能 |
| **Data Distribution** | 複製資料到多個節點 |

## 簡單實作：Multiple Unicast

最簡單的 Multicast 實作是發送多個 Unicast，每個目的地一個：

**缺點**：
- 大幅增加網路流量
- 導致網路延遲和吞吐量惡化

## 進階 Multicast 方案

### VCTM (Virtual Circuit Tree Multicasting)

**Virtual Circuit Tree Multicasting (VCTM)** 在每個 Router 添加小型 Routing Table：

1. 對於每個 Multicast，在 Multicast 資料傳輸前，為每個目的地發送一個 Unicast Setup Packet 來配置 Routing Table
2. 同一 Multicast 目的地集合的所有 Setup Packet 攜帶唯一的 **VCT ID**，對應 Routing Table 中的索引
3. 每個 Setup Packet 將其輸出 Port 附加到 Routing Table 中的 VCT ID Entry，設定 Multicast Flit 應該被 Fork 的方向
4. 所有後續到此目的地集合的 Multicast 都以此 VCT ID 注入，並在路徑上的 Router 中被適當地 Fork

### Whirl

**Whirl** 是一種針對 Broadcast 優化的 Routing Algorithm：

- 嘗試在運行時創建 Load-balanced Broadcast Tree
- 允許 Broadcast 使用不同的 Link 組合
- 提高 Link 利用率和吞吐量

### Router 硬體需求

在這兩種設計中，Router 都需要支持將相同的 Flit **Fork（分叉）**到多個方向。

## 設計考量

### Unicast-based Multicast

| 優點 | 缺點 |
|------|------|
| 實作簡單 | 佔用較多 Bandwidth |
| 不需要特殊硬體 | 延遲較高 |
| 容易維護 | 吞吐量較低 |

### Tree-based Multicast

| 優點 | 缺點 |
|------|------|
| 頻寬效率較高 | 需要額外的 Routing Table |
| 延遲較低 | Setup 開銷 |
| 吞吐量較高 | 實作複雜度較高 |

## Deadlock 考量

::: warning Multicast Deadlock
Multicast 可能引入新的 Deadlock 情況：
- 當 Multicast Message 需要佔用多條路徑時
- 可能與其他 Multicast 或 Unicast Message 形成循環依賴
- 需要特別的處理機制來避免
:::

## 實作方式比較

| 實作方式 | Table-based | Circuit-based |
|----------|-------------|---------------|
| 靈活性 | 高 | 低 |
| 延遲 | 較高（需要查表） | 較低 |
| 面積開銷 | 較大（需要儲存 Table） | 較小 |
| 可重配置性 | 容易 | 困難 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 4.6
