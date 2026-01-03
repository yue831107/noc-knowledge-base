# Direct Topologies: Ring、Mesh 和 Torus

**Direct Network** 是每個 Terminal Node（例如晶片多處理器中的處理器核心或 Cache）都與一個 Router 關聯的網路；所有 Router 既作為流量的 Source/Sink，也作為其他 Node 流量的 Switch。

到目前為止，大多數 On-chip Network 設計都使用 Direct Network，因為將 Router 與 Terminal Node 共置通常最適合晶片上受面積限制的環境。

## k-ary n-cube 表示法

Direct Topology 可以用 **k-ary n-cube** 描述：
- **k**：每個維度上的 Node 數量
- **n**：維度數量
- **總 Node 數**：k^n

### 範例

| Topology | k-ary n-cube | Node 數 |
|----------|--------------|---------|
| 4×4 Mesh/Torus | 4-ary 2-cube | 16 |
| 8×8 Mesh/Torus | 8-ary 2-cube | 64 |
| 4×4×4 Mesh/Torus | 4-ary 3-cube | 64 |

::: info 實務考量
實際上，大多數 On-chip Network 使用 2D Topology，因為它們能很好地映射到平面基板上。否則，需要更多 Metal Layer。這與 Off-chip Network 不同，在 Off-chip Network 中，機箱之間的電纜可以提供 3D 連接。
:::

## Ring

**Ring** 屬於 Torus 家族的網路拓撲，是 **k-ary 1-cube**。

### 特性

| 指標 | 值 |
|------|-----|
| Degree | 2 |
| Diameter | k/2（k 為偶數時） |
| Average Hop Count | 較高 |

### 優點

- 簡單的設計
- 低 Router 複雜度
- 良好的排序特性
- 低功耗

### 缺點

- 高平均 Hop Count
- 低 Bisection Bandwidth
- 可擴展性差

### 實際應用

- **IBM Cell**：使用 4 個 Ring 來提升頻寬並減少平均 Hop Count
- **Intel Larrabee**：採用 Two-Ring Topology

## 2D Mesh

**Mesh** 是最常用的 On-chip Network Topology。

### 特性

| 指標 | k×k Mesh |
|------|----------|
| Degree | 4（邊緣 Node 較少） |
| Diameter | 2(k-1) |
| Bisection Bandwidth | k |
| Average Hop Count (k even) | nk/3 |
| Maximum Channel Load | k/4 |
| Maximum Injection Throughput | 4/k flits/node/cycle |

### Edge Symmetry

在 Mesh 中，網路邊緣的 Node 具有比中心 Node 更低的 Degree。由於缺乏 Edge Symmetry，Mesh 網路的中心 Channel 比邊緣 Channel 承受顯著更高的需求。

### 優點

- 規則的結構，易於 Place-and-Route
- 簡單的 Routing Algorithm（XY Routing）
- 適合 2D 晶片佈局
- 良好的 Path Diversity

### 缺點

- 邊緣 Node 非對稱
- 中心 Channel 負載較高
- Bisection Bandwidth 相對較低

### 實際應用

- **MIT Raw**：第一個具有 On-chip Network 的晶片，使用四個 Mesh
- **Tilera TILE64**：使用 Mesh Topology，不同類型的流量在不同的平行網路上路由

## 2D Torus

**Torus** 是 Mesh 加上 Wraparound 連接。

### 特性

| 指標 | k×k Torus |
|------|-----------|
| Degree | 4（所有 Node 相同） |
| Diameter | k（比 Mesh 減半） |
| Bisection Bandwidth | 2k（比 Mesh 加倍） |
| Average Hop Count (k even) | nk/4 |
| Maximum Channel Load | k/8 |
| Maximum Injection Throughput | 8/k flits/node/cycle |

### Edge Symmetry

在 Torus 中，所有 Node 具有相同的 Degree（而 Mesh 則不是）。Torus 也是 Edge-Symmetric 的，這種特性幫助 Torus 網路在 Channel 之間平衡流量。

### Average Hop Count 公式

**Torus**（k 為偶數）：
$$
H_{avg} = \frac{nk}{4}
$$

**Mesh**（k 為偶數）：
$$
H_{avg} = \frac{nk}{3}
$$

### 優點

- Diameter 減半
- Bisection Bandwidth 加倍
- Edge Symmetry（流量更平衡）
- 更好的 Path Diversity

### 缺點

- 長的 Wraparound Link 增加延遲和能耗
- 佈線複雜度增加
- 需要 Folded Layout 來均衡 Wire 長度

### Path Diversity

Mesh 和 Torus 網路都為路由 Message 提供 Path Diversity。隨著維度數量增加，Path Diversity 也增加。

## Topology 比較

| 特性 | Ring | Mesh | Torus |
|------|------|------|-------|
| Degree | 2 | 4* | 4 |
| Edge Symmetry | 是 | 否 | 是 |
| Diameter | k/2 | 2(k-1) | k |
| Avg Hop Count | 最高 | 中等 | 最低 |
| Bisection BW | 最低 | 中等 | 最高 |
| 實作複雜度 | 最低 | 中等 | 最高 |

*邊緣 Node 的 Degree 較低

## 參考資料

- On-Chip Networks Second Edition, Chapter 3.2
