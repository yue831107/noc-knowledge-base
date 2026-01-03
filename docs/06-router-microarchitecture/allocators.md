# Allocators 與 Arbiters

**Allocator** 將 N 個請求匹配到 M 個資源，而 **Arbiter** 將 N 個請求匹配到 1 個資源。在 Router 中，資源是 VC（用於 VC Router）和 Crossbar Switch Port。

## Arbiter 與 Allocator 的角色

| 元件 | 功能 | 輸入 | 輸出 |
|------|------|------|------|
| **Switch Arbiter** | N:1 匹配 | P 個輸入 Port 請求 | 1 個輸出 Port |
| **VC Allocator** | N:M 匹配 | 輸入 VC 請求 | 輸出 VC |
| **Switch Allocator** | N:M 匹配 | 輸入 VC 請求 | Switch Port |

- **VC Allocator**：只有 Head Flit 需要
- **Switch Allocator**：所有 Flit 都需要，每 Cycle 授予 Switch 存取權

高 Matching Probability 的 Allocator/Arbiter 意味著更多 Packet 成功獲得 VC 和穿越 Crossbar，從而提高網路吞吐量。在大多數 NoC 中，Allocation Logic 決定 Router Cycle Time，因此 Allocator 和 Arbiter 必須快速且可 Pipeline。

## Round-robin Arbiter

![Figure 6.6: Round-robin Arbiter](/images/ch06/Figure%206.6.jpg)

使用 Round-robin Arbiter，最後被服務的請求在下一輪仲裁中具有最低優先權。

### 運作原理

- 如果 Grant$_i$ 為 High，Priority$_{i+1}$ 在下一 Cycle 變為 High
- 所有其他優先權變為 Low
- 提供公平性：每個請求者輪流獲得最高優先權

### 範例

![Figure 6.7: Arbiter 範例的請求隊列](/images/ch06/Figure%206.7.jpg)

Figure 6.7 展示了 4 個不同請求者的請求集合。假設在這組請求之前最後服務的是 Requestor A，因此 B 在範例開始時具有最高優先權。

使用 Round-robin Arbiter，請求按以下順序滿足：
**B1, C1, D1, A1, D2, A2**

## Matrix Arbiter

![Figure 6.8: Matrix Arbiter](/images/ch06/Figure%206.8.jpg)

**Matrix Arbiter** 的運作方式是最近最少被服務的請求具有最高優先權。

### 實作原理

- 儲存三角形陣列的狀態位 $w_{ij}$，其中 $w_{ij} = \neg w_{ji}\ \forall i \neq j$
- 當 $w_{ij}$ 被設定時，請求 $i$ 比請求 $j$ 有更高優先權
- 當請求線被觸發時，請求與該行的狀態位 AND 以停用較低優先權請求
- 每次請求 $k$ 被授予時，清除第 $k$ 行的所有位並設定第 $k$ 列的所有位

### 範例

![Figure 6.9: Matrix Arbiter 優先權更新範例](/images/ch06/Figure%206.9.jpg)

使用 Figure 6.7 的相同請求，Figure 6.9 展示了 Matrix Arbiter 的優先權更新過程。

從初始狀態可以看出：
- 請求者 D 具有最高優先權（[1,0], [2,0], [3,0], [2,1], [3,1], [3,2] 都設為 1）
- 然後是 C，然後是 B，最後是 A

Grant 順序為：**D1, C1, B1, A1, D2, A2**

## Separable Allocator

![Figure 6.10: Separable 3:4 Allocator](/images/ch06/Figure%206.10.jpg)

為了降低 Allocator 複雜度並使其可 Pipeline，可以將 Allocator 建構為多個 Arbiter 的組合。

### 兩階段設計

例如，N:M Allocator 可以用 N/k 個 k:1 Arbiter 在第一階段從 N 個初始請求中獲得 k 個候選，然後用 M 個 Arbiter 在第二階段從 k 個候選中選擇。

Figure 6.10 展示了 3:4 Separable Allocator（3 個請求者，4 個資源）：
- 第一階段：4 個 3:1 Arbiter 決定哪個請求者贏得特定資源
- 第二階段：3 個 4:1 Arbiter 確保每個請求者只獲得 1 個資源

### 範例

![Figure 6.11: Separable Allocator 範例](/images/ch06/Figure%206.11.jpg)

Figure 6.11 展示了 Separable Allocator 的一個可能結果：

- (a) **Request Matrix**：初始請求
- (b) **Intermediate Matrix**：第一階段 3:1 Arbiter 選擇每行一個值
- (c) **Grant Matrix**：第二階段 4:1 Arbiter 仲裁，最終只有一個請求被授予

### 缺點

Separable Allocator 的挑戰是 Matching Inefficiency：
- 第一階段不知道第二階段的結果
- 可能導致低匹配率

## Wavefront Allocator

![Figure 6.12: 4×4 Wavefront Allocator](/images/ch06/Figure%206.12.jpg)

**Wavefront Allocator** 一次完成整個分配，比 Separable Allocator 更有效率。Figure 6.12 展示了用於 SGI SPIDER 晶片和 Intel SCC 的 4×4 Wavefront Allocator。

### 運作原理

1. 設定四條優先權線之一（p0...p3）
2. 這為連接到所選優先權線的對角群組提供行和列 Token
3. 如果某個 Cell 請求資源，它會消耗行和列 Token，其資源請求被授予
4. 無法使用 Token 的 Cell 將行 Token 向右傳遞，列 Token 向下傳遞
5. 為了提高公平性，初始優先權群組每 Cycle 改變

### 範例

![Figure 6.13: Wavefront Allocator 範例](/images/ch06/Figure%206.13.jpg)

使用 Figure 6.11a 的相同 Request Matrix：

- (a) **Wavefront 1**：從 p0 開始的對角波，Entry [0,0] 首先收到 Grant
- (b) **Wavefront 2**：[0,0] 在第一階段消耗了 Token，[0,1] 和 [1,0] 在第二波沒有收到 Token
- (c) **Wavefront 3**：Entry [3,2] 從 [3,1] 和 [2,2] 收到 Token，被授予
- (d) **Wavefront 4**：Request [1,1] 在這波收到有效 Token 並被授予

![Figure 6.14: Wavefront Grant Matrix](/images/ch06/Figure%206.14.jpg)

Wavefront Allocator 能夠授予 **3 個請求**（相比 Separable Allocator 的 1 個請求）。

## Speculative Allocator

使用 **Speculative VC Allocation**，非投機的 Switch 請求必須比投機請求有更高優先權。

### 實作方式

使用兩個平行的 Switch Allocator：
- **Non-speculative Allocator**：處理非投機請求
- **Speculative Allocator**：處理投機請求

結果選擇：
- 有成功的非投機請求 → 選擇非投機結果
- 沒有非投機請求 → 投機 Switch 請求成功

### 投機失敗處理

如果 Flit 在投機 Switch Allocation 成功但在平行的 VC Allocation 失敗：
- 投機不正確
- Switch Allocator 預留的 Crossbar 通道被浪費
- 只有 Head Flit 需要做 VC Allocation
- Body/Tail Flit 標記為非投機（使用 Head 分配的 VC）

## VC Allocator vs Switch Allocator

| 特性 | VC Allocator | Switch Allocator |
|------|--------------|------------------|
| **時機** | 只有 Head Flit | 每個 Flit |
| **輸入** | 輸入 VC | 輸入 VC |
| **輸出** | 輸出 VC | 輸出 Port |
| **複雜度** | 較高（多對多） | 中等 |
| **Pipeline** | 可以投機 | 每 Cycle 執行 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 6.4
