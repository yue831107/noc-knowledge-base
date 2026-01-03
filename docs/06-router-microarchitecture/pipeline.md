# Router Pipeline 設計

Router Pipeline 決定了每跳延遲和整體網路效能。本節介紹基本 Pipeline 階段和各種優化技術。

## 基本 VC Router Pipeline

![Figure 6.15: Router Pipeline](/images/ch06/Figure%206.15.jpg)

Figure 6.15a 展示了基本 VC Router 的邏輯 Pipeline 階段。這些邏輯階段會根據實際時脈頻率組成物理 Pipeline。

### Pipeline 階段

| 階段 | 全名 | 功能 |
|------|------|------|
| **BW** | Buffer Write | Flit 到達輸入 Port，解碼並寫入 Buffer |
| **RC** | Route Computation | 計算 Packet 的輸出 Port |
| **VA** | VC Allocation | 分配下游 Router 的 VC |
| **SA** | Switch Allocation | 仲裁 Switch 輸入和輸出 Port |
| **ST** | Switch Traversal | Flit 穿越 Crossbar |
| **LT** | Link Traversal | Flit 傳輸到下一個 Router |

### Head Flit vs Body/Tail Flit

```
Head Flit:       BW → RC → VA → SA → ST → LT
Body/Tail Flit:  BW → (bubble) → (bubble) → SA → ST → LT
```

- **Head Flit**：需要所有階段
- **Body/Tail Flit**：不需要 RC 和 VA，繼承 Head 的路由和 VC
- **Tail Flit**：離開 Router 時釋放 Head 預留的 VC

### 無 VC 的 Wormhole Router

沒有 VC 的 Wormhole Router 不需要 VA 階段，只需 4 個邏輯階段。

## Pipeline 實作考量

邏輯 VC Pipeline 包含 5 個階段。低時脈頻率的 Router 可以在單一 Cycle 內完成所有 5 個階段。對於積極的時脈頻率，Router 架構必須 Pipelined。

### Critical Path

決定時脈頻率的因素：
- **VC Allocator** 或 **Switch Allocator**：當 VC 數量多時
- **Crossbar Traversal**：當 Crossbar Port 很多或很寬時
- **處理器 Pipeline**：Router 頻率可能由系統整體時脈決定

### Pipeline 深度的影響

增加物理 Pipeline 階段會：
- ✓ 提高時脈頻率
- ✗ 增加每跳 Router 延遲
- ✗ 增加 Buffer Turnaround Time
- ✗ 需要更多 Buffer 來維持吞吐量

## Pipeline 優化技術

### Lookahead Routing

![Figure 6.15b: Lookahead Routing Pipeline](/images/ch06/Figure%206.15.jpg)

**Lookahead Routing**（也稱為 Next Route Compute, NRC）從 Critical Path 移除 RC 階段：

- Packet 的路由在前一跳提前一跳計算並編碼在 Header 中
- 進入的 Flit 可以在 BW 階段後立即競爭 VC/Switch
- 下一跳的 Route Computation 可以與 VC/Switch Allocation 平行執行
- 不再需要用於決定仲裁的輸出 Port

**優勢**：省掉一個 Pipeline 階段

### Low-load Bypassing

![Figure 6.15c: Low-load Bypass Pipeline](/images/ch06/Figure%206.15.jpg)

**Low-load Bypassing** 從輕負載 Router 移除 BW 和 SA 階段：

- 如果輸入 Buffer Queue 沒有排隊的 Flit
- 進入的 Flit 可以投機地進入 ST 階段
- 跳過 Buffer 寫入
- 同時分配對應輸出 Port 的空閒 VC
- 然後是 ST 和 LT

**遇到衝突時**：Flit 寫入 Buffer (BW)，隨後執行 SA

### Low-load Bypass 範例

![Figure 6.16: Low-load Bypass 範例](/images/ch06/Figure%206.16.jpg)

**Figure 6.16a**：成功的 Bypass
1. Time 1：A 從 South Input 到達，輸入 Queue 為空
2. Step 1a：執行 Lookahead Routing Computation
3. Step 1b：設定 South Input 到 East Output 的 Crossbar 連接
4. Time 2：A 穿越 Crossbar 並離開 Router（Bypass 成功）

**Figure 6.16b**：Bypass 因衝突中止
1. Time 1：A 和 B 同時到達，都有空的輸入 Queue
2. Step 1b：在 Crossbar Setup 時偵測到 Port 衝突（都想要 East Output）
3. Step 1c：兩者都必須寫入輸入 Buffer
4. 後續：執行正常的 VA (2a)、SA (2b, 3)、ST (3, 4) Pipeline

### Speculative VC Allocation

![Figure 6.15d: Speculative VC Allocation Pipeline](/images/ch06/Figure%206.15.jpg)

**Speculative VA** 從 Critical Path 移除 VA 階段：

- Flit 在 BW 之後**投機地**進入 SA 階段
- 同時嘗試獲取空閒 VC
- 如果投機成功，Flit 直接進入 ST 階段
- 如果投機失敗，Flit 必須重新執行部分 Pipeline

### VC Selection

**VC Selection** 從 Router Pipeline 消除 VA 階段：

核心思想：
- 對於 Buffered Flit，完整的多輸出 VC VA 是不必要的
- 因為每 Cycle 只有一個 Flit 可以從輸出 Port 出去
- 在每個輸出 Port 維護一個空閒 VC ID 的 Queue
- 每個輸出 Port 的 SA Winner 被分配 Queue Head 的 VC ID

Pipeline 與 Speculative VC 相同（Figure 6.15d），但不涉及投機。

### Lookahead Bypass

![Figure 6.15e: Lookahead-aided Bypass Pipeline](/images/ch06/Figure%206.15.jpg)

**Lookahead Bypass** 利用上述優化設計單 Cycle Router：

- 從 Flit Traversal 的 Critical Path 移除 BW 和 SA 階段
- 在 Flit 穿越當前和下一個 Router 之間的 Link 時，在**下一個** Router 執行 SA
- 透過發送稱為 **Lookahead** 的幾個 Bit 到下一個 Router 實現
- Lookahead 是 Flit 的 Header 資訊（Route、VCid 等）
- 當 Flit 執行 LT 時，其 Lookahead 在下一個 Router 執行 SA
- 成功的 Lookahead 仲裁允許 Flit 繞過 BW 和 SA，直接進入 ST

**結果**：每跳只需 2 Cycle（ST + LT）

### Lookahead Bypass 範例

![Figure 6.17: Lookahead Bypass 範例](/images/ch06/Figure%206.17.jpg)

Figure 6.17 展示了兩個 Lookahead 在 Cycle 1 到達 Router：

1. **Cycle 1**：B 的 Lookahead 贏得 Switch Allocation 並選擇 VC (1a, 1b, 2a, 2c)
2. **Cycle 2**：Flit B 繞過 Buffering 直接進入 Switch (2)
3. **Cycle 3**：B 離開 Router (3)

對於 A：
- A 的 Lookahead 輸了，Flit A 被 Buffer
- A 在 Cycle 2 執行 Switch Allocation 和 VC Selection (2a, 2b)
- A 在 Cycle 3 執行 Switch Traversal (3)
- A 在 Cycle 4 離開 Router (4)

## State-of-the-art

現代網路可以設計為：
- Router 內單 Cycle 完成 Switch Arbitration 和 VC Selection
- 後續 Cycle 同時穿越 Switch 和 Link
- 在 GHz 頻率下運行
- 達到 **2 Cycle per-hop**（無競爭時）

## 參考資料

- On-Chip Networks Second Edition, Chapter 6.5
