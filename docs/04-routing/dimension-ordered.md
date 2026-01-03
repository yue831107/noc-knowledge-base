# Deterministic Dimension-Ordered Routing

**Dimension-Ordered Routing (DOR)** 是 On-chip Network 中最常用的 Routing Algorithm，因為其簡單性和 Deadlock Freedom。

## 基本原理

DOR 是一種 **Deterministic Routing Algorithm**，從 Node A 到 Node B 的所有 Message 總是經過相同的路徑。使用 DOR 時，Message 逐維度穿越網路，在切換到下一個維度之前先到達目的地在該維度的座標。

![Figure 4.3: 2-D Mesh 中的可能轉向](/images/ch04/Figure%204.3.jpg)

## X-Y Routing

在 2-D Topology（如 Mesh）中，X-Y Dimension-Ordered Routing 先沿 X 軸方向發送 Packet，然後再沿 Y 軸方向。

### 路由範例

從 (0,0) 到 (2,3) 的路由：
1. 先沿 X 軸走 2 hop，到達 (2,0)
2. 再沿 Y 軸走 3 hop，到達目的地 (2,3)

### 演算法

```
if (current.x != dest.x)
    route to X direction (East or West)
else if (current.y != dest.y)
    route to Y direction (North or South)
else
    arrived at destination (Eject)
```

## Y-X Routing

另一種選擇是 **Y-X Routing**，其中 Message 先沿 Y 軸方向行進，可以轉向 East 或 West，但一旦 Message 往 East 或 West 方向行進，就不允許再轉向。

### 選擇 X-Y 還是 Y-X

取決於網路維度（X 或 Y 方向有更多 Node）：
- 使用 Uniform Random Traffic 時，其中一種會比另一種更好地平衡負載
- Channel Load 在 Node 數量較少的維度上較高

## 特性

### 優點

| 優點 | 說明 |
|------|------|
| 簡單 | 易於實作，只需比較座標 |
| Deadlock-free | 不會形成循環依賴 |
| 最短路徑 | 總是選擇 Minimal Path |
| 低延遲 | 無需複雜計算 |

### 缺點

| 缺點 | 說明 |
|------|------|
| 無 Path Diversity | 每個 Source-Destination pair 只有一條路徑 |
| 無法 Load Balance | 某些 Link 可能成為 Hotspot |
| 無法繞過故障 | 缺乏 Path Diversity，無法繞過故障或擁塞區域 |

::: warning Path Diversity 的限制
DOR 消除了 Mesh 網路中的 Path Diversity，因此降低了 Throughput。使用 DOR 時，每個 Source-Destination pair 之間只存在一條路徑。沒有 Path Diversity，Routing Algorithm 無法繞過網路中的故障或避開擁塞區域。由於路由限制，DOR 在 Load Balancing 方面表現不佳。
:::

## 轉向限制

DOR 透過限制允許的轉向來確保 Deadlock Freedom：

**X-Y Routing 允許的轉向**：
- E → N（East 轉 North）
- E → S（East 轉 South）
- W → N（West 轉 North）
- W → S（West 轉 South）

**禁止的轉向**：
- N → E（North 轉 East）
- N → W（North 轉 West）
- S → E（South 轉 East）
- S → W（South 轉 West）

## 實際應用

許多 On-chip Network 晶片原型都使用 DOR，因為其簡單性和 Deadlock Freedom：

- **MIT Raw**
- **Tilera TILE64**
- 其他商業和學術晶片

## 與 Turn Model Routing 的關係

X-Y Routing 是 Turn Model Routing 的一種特例：
- 在 2-D Mesh 的 8 種可能轉向中，X-Y Routing 只允許 4 種
- 這比 Turn Model Routing 更嚴格（Turn Model 允許 6 種轉向）
- 因此 X-Y Routing 犧牲了 Path Diversity 以換取實作簡單性

## 參考資料

- On-Chip Networks Second Edition, Chapter 4.3
