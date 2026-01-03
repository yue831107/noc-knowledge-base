# 常用公式

## Latency 公式

### Store and Forward

$$
T_{SAF} = H \times \left( \frac{L}{B} + t_r \right)
$$

- $H$：Hop count
- $L$：Packet length (bits)
- $B$：Bandwidth (bits/cycle)
- $t_r$：Router delay (cycles)

### Virtual Cut-through / Wormhole (無競爭)

$$
T_{VCT} = T_{WH} = H \times t_r + \frac{L}{B}
$$

### 有競爭時的 Latency

$$
T = T_{zero-load} + T_{contention}
$$

## Throughput 公式

### 理想 Throughput

$$
Throughput_{max} = \frac{Bandwidth}{Average\ Path\ Length}
$$

### 實際 Throughput

$$
Throughput = \frac{Accepted\ Flits}{Time \times Nodes}
$$

## Topology Metrics

### 2D Mesh (N×N)

| Metric | Formula |
|--------|---------|
| Nodes | $N^2$ |
| Degree | 5 (corner: 3, edge: 4) |
| Diameter | $2(N-1)$ |
| Bisection BW | $N$ |

### 2D Torus (N×N)

| Metric | Formula |
|--------|---------|
| Nodes | $N^2$ |
| Degree | 5 |
| Diameter | $N$ (even N) |
| Bisection BW | $2N$ |

### Ring (N nodes)

| Metric | Formula |
|--------|---------|
| Degree | 3 |
| Diameter | $\lfloor N/2 \rfloor$ |
| Bisection BW | 2 |

## Buffer 公式

### 最小 Buffer 深度 (Credit-based)

$$
Buffer_{min} = \lceil \frac{RTT \times Bandwidth}{Flit_{size}} \rceil + 1
$$

- $RTT$：Round-trip time for credit

## 功耗公式

### Dynamic Power

$$
P_{dynamic} = \alpha \cdot C \cdot V^2 \cdot f
$$

- $\alpha$：Activity factor
- $C$：Capacitance
- $V$：Voltage
- $f$：Frequency

### Energy per Bit

$$
E_{bit} = E_{buffer} + E_{crossbar} + E_{link}
$$

## 排隊論公式

### Little's Law

$$
L = \lambda \cdot W
$$

- $L$：平均排隊長度
- $\lambda$：到達率
- $W$：平均等待時間

### M/M/1 Queue 延遲

$$
W = \frac{1}{\mu - \lambda}
$$

- $\mu$：服務率
- $\lambda$：到達率
