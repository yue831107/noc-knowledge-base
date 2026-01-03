# Evaluation Metrics

On-chip Network 通常以其效能（Latency 和 Throughput）、能量消耗和面積來評估。

## Analytical Model

### Latency

On-chip Network 中每個 Packet 的延遲可以用以下方程式描述：

$$
T_{Network} = T_{wire} + T_{router} + T_{contention}
$$

展開為：

$$
T_{Network} = H \cdot t_{wire} + (H + 1) \cdot t_{router} + \sum_{h=1}^{H+1} t_{contention}(h)
$$

其中：

| 符號 | 說明 |
|------|------|
| $H$ | 通過 Topology 的平均 Hop Count |
| $t_{router}$ | 通過單一 Router 的 Pipeline 延遲 |
| $t_{wire}$ | 兩個 Router 之間的 Wire 延遲 |
| $t_{contention}(h)$ | 在距離起點 h-hop 處的競爭延遲 |

**注意**：$(H + 1)$ 因為 Packet 在進入第一跳之前要先穿越輸入 Router。

- $t_{router}$ 和 $t_{wire}$ 是 **Design-time** 指標，可用於確定 Packet 延遲的下限
- $H$ 和 $t_{contention}(h)$ 是 **Runtime** 指標，取決於流量

### Throughput

**Bisection Bandwidth**（在 Chapter 3 定義）是任何網路吞吐量的 Design-time 指標。理想吞吐量假設完美的 Flow Control 和完美的 Routing 負載平衡。

實際的 **Saturation Throughput** 可能遠低於 Bisection Bandwidth：

- **Deterministic Routing**（如 XY）可能無法平衡所有可用 Link 的流量
- 重度使用的路徑會快速飽和，降低接受率
- **Adaptive Routing** 使用本地擁塞指標可能導致下游 Link 更多擁塞
- Router 內的 Arbitration 無法完美匹配請求和可用資源
- 有限的 Buffer 數量和 Buffer Turnaround Time 也會降低吞吐量

### Energy

每個 Flit 在網路傳輸過程中消耗的能量：

$$
E_{Network} = H \cdot E_{wire} + (H + 1) \cdot E_{router}
$$

$$
E_{router} = E_{ST} + E_{BW} + E_{BR} + E_{RC} + \sum_{h=1}^{H+1} t_{contention}(h) \cdot (E_{VA} + E_{SA})
$$

其中：

| 符號 | 說明 |
|------|------|
| $E_{BW}$ | Buffer Write 能量 |
| $E_{RC}$ | Route Computation 能量 |
| $E_{VA}$ | VC Arbitration 能量 |
| $E_{SA}$ | Switch Arbitration 能量 |
| $E_{BR}$ | Buffer Read 能量 |
| $E_{ST}$ | Switch Traversal 能量 |

**注意**：$E_{RC}$ 和 $E_{VA}$ 只由 Head Flit 消耗。

### Area

On-chip Network 的面積足跡取決於 Router 的面積：

$$
A_{Network} = N \cdot A_{router}
$$

$$
A_{router} = p \cdot v \cdot A_{VC} + p \cdot A_{RouteUnit} + p \cdot A_{Arbiter\_input} + p \cdot A_{Arbiter\_output} + A_{Crossbar}
$$

其中：

| 符號 | 說明 |
|------|------|
| $N$ | Router 數量 |
| $p$ | Port 數量 |
| $v$ | 每個 Port 的 VC 數量 |
| $A_{VC}$ | 每個 VC 的 Buffer 和 Control 面積 |

**Wire** 通常不直接貢獻面積足跡，因為它們通常在邏輯上方的 Metal Layer 上佈線。

## Ideal Interconnect Fabric

### Ideal Latency

互連網路能達到的最低延遲是專用 Wire 延遲：

$$
T_{ideal} = T_{wire} = \frac{D}{v} + \frac{L}{b}
$$

其中：

| 符號 | 說明 |
|------|------|
| $D$ | Source 和 Destination 之間的距離（Manhattan Distance） |
| $v$ | 傳播速度 |
| $L$ | Packet 長度 |
| $b$ | Channel Bandwidth |

第一項對應穿越互連的時間，第二項對應長度 L 的 Packet 通過 Bandwidth b 的 Channel 的序列化延遲。

### Ideal Throughput

理想吞吐量僅取決於 Topology 提供的頻寬。可以通過計算特定流量模式的所有 Link 負載並取最大負載 Link 的倒數來計算。

### Ideal Energy

理想能量僅為互連 Wire 的能量：

$$
E_{ideal} = E_{wire} = \frac{L}{b} \cdot D \cdot E_{wire}
$$

## Network Delay-Throughput-Energy Curve

![Table 7.1: State-of-the-art Network Simulation Parameters](/images/ch07/Table%207.1.jpg)

Table 7.1 展示了 State-of-the-art 8×8 Mesh 網路的模擬參數。Router 實現了 Lookahead Routing、VC Selection 和 Lookahead Bypass，在最佳情況下達到每跳 2 Cycle。

![Figure 7.1: Latency vs. Injected Traffic](/images/ch07/Figure%207.1.jpg)

Figure 7.1 展示了兩種 Synthetic Traffic Pattern 的 Latency vs. Injection Rate：

### (a) Uniform Random Traffic

- 平均 Hop Count = 5.33
- 低負載時，State-of-the-art 設計接近 Ideal Latency
- 差距來自每跳額外的 1-cycle Router 延遲（Pipeline 優化的結果）
- State-of-the-art VC Router 達到約 80% 的 Ideal Throughput
- 20% 的差距來自 Routing 和 Arbitration 的低效率

### (b) Bit Complement Traffic

- 平均 Hop Count = 8
- 理論吞吐量較低（0.25 flits/node/cycle）
- 因為此流量模式使 Bisection Link 飽和

![Figure 7.2: Network Energy vs. Injected Traffic](/images/ch07/Figure%207.2.jpg)

Figure 7.2 展示了 Ideal Network 和 State-of-the-art Baseline Network 的能量消耗（使用 DSENT 能量模型）：

- Baseline 架構包含許多節能 Microarchitectural 特性
- 但仍顯著超過僅由 Wire 消耗的能量
- 差距存在於每個 Router 發生的額外 Buffering、Switching 和 Arbitration
- 差距隨著網路飽和而加大

## 設計權衡

| 指標 | 優化方向 | Trade-off |
|------|----------|-----------|
| Latency | 減少 Pipeline 階段 | 可能降低時脈頻率 |
| Throughput | 增加 VC 和 Buffer | 增加面積和功耗 |
| Energy | 降低電壓或使用 Clock Gating | 可能降低效能 |
| Area | 減少 Buffer 深度 | 降低吞吐量 |

## 參考資料

- On-Chip Networks Second Edition, Chapter 7.1
