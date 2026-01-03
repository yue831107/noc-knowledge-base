# Switch Design

Router 的 **Crossbar Switch** 是 Router Datapath 的核心，負責將 Bit 從輸入 Port 切換到輸出 Port，執行 Router 的基本功能。

## Crossbar 設計

### Multiplexer-based Crossbar

![Figure 6.3: Multiplexer 組成的 Crossbar](/images/ch06/Figure%206.3.jpg)

輸入 Select 信號設定 Switch 的連接，即哪個輸入 Port 應該連接到哪個輸出 Port。

將 Verilog 合成後會產生由多個 Multiplexer 組成的 Crossbar，如 Figure 6.3 所示。大多數低頻率 Router 設計使用這種合成的 Crossbar。

![Table 6.1: 4-bit 5-port Crossbar 的 Verilog](/images/ch06/Table%206.1.jpg)

### Crosspoint-based Crossbar

![Figure 6.4: 5×5 Crosspoint Crossbar Switch](/images/ch06/Figure%206.4.jpg)

當設計追求 GHz 時脈並面臨更嚴格的功耗預算時，傾向使用 **Custom-designed Crossbar**。這些設計採用 Crosspoint-based 組織，Select 信號送到每個 Crosspoint 設定連接。

在 Figure 6.4 中：
- 每條水平和垂直線寬度為 w bit（1 Phit）
- 粗線顯示從 South Input Port 到 East Output Port 的連接

### 面積與功耗

無論哪種設計，Switch 的面積和功耗都以 $O((pw)^2)$ 縮放：
- $p$：Crossbar Port 數量
- $w$：Crossbar Port 寬度（bits）

Router 架構師必須謹慎選擇：
- $p$：取決於 Topology
- $w$：影響 Flit 大小和 Packet 能量延遲

## Crossbar Speedup

![Figure 6.5: 不同 Speedup 的 Crossbar](/images/ch06/Figure%206.5.jpg)

Router Microarchitect 需要決定 **Crossbar Switch Speedup**，即 Crossbar 的輸入和輸出 Port 數量相對於 Router 輸入和輸出 Port 數量的比例。

### Input Speedup

如果每個 VC 有自己的 Crossbar 輸入 Port（如 Figure 6.5b 的 10×5 Crossbar）：
- Flit 可以每 Cycle 從每個 VC 讀出
- 多個 VC 不需要競爭同一個 Crossbar 輸入 Port
- 即使用簡單的 Allocator 也能接近 100% 吞吐量
- 有更多輸入可選擇，每個輸出 Port 被匹配（使用）的機率更高

### Output Speedup

Figure 6.5c 展示了 5×10 Crossbar（Output Speedup = 2）：
- 允許每 Cycle 將多個 Flit 送到同一輸出 Port
- 減少競爭
- **需要輸出 Buffer** 來將 Flit 多工到單一輸出 Port

### 時脈 Speedup

Crossbar Speedup 也可以透過 **將 Crossbar 以更高頻率運行** 來實現：
- 如果 Crossbar 以 Router 兩倍頻率運行
- 每 Cycle 可以在單一輸入-輸出對之間發送兩個 Flit
- 達到與 Input/Output Speedup = 2 相同的效能

::: warning On-chip Network 限制
這在 On-chip Network 中較不可能，因為 Router 通常使用已經很積極的單一時脈供應。
:::

## Crossbar Slicing

Crossbar 佔據 Router 面積和功耗預算的重要部分，因此有多種 Microarchitectural 技術用於優化 Crossbar。

### Dimension Slicing

**Dimension Slicing** 在 2-D Mesh 中使用兩個 3×3 Crossbar 而非一個 5×5 Crossbar：

- **第一個 Crossbar**：處理留在 X 維度的流量
- **第二個 Crossbar**：處理留在 Y 維度的流量
- 從 X 轉到 Y 維度的流量穿越兩個 Crossbar
- 留在同一維度的流量只穿越一個 Crossbar

這特別適合 **Dimension-ordered Routing**，因為流量大多留在同一維度內。

### Bit Interleaving

**Bit Interleaving** 針對 $w$（Port 寬度）：

- 在時脈的兩個相位上發送交替的 Bit
- 將 $w$ 減半
- TeraFLOPS 架構使用 Bit Interleaving（將在 Chapter 8 討論）

## 設計權衡

| 設計選擇 | 優點 | 缺點 |
|----------|------|------|
| Multiplexer Crossbar | 容易合成、靈活 | 高頻時效能較差 |
| Crosspoint Crossbar | 高頻效能好 | 需要客製設計 |
| Input Speedup | 高吞吐量 | Crossbar 面積增加 |
| Output Speedup | 減少競爭 | 需要輸出 Buffer |
| Dimension Slicing | 面積減少 | 只適用於特定 Routing |
| Bit Interleaving | 面積減少 | 時序複雜 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 6.3
