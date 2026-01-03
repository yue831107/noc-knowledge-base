# Traffic Patterns

網路效能高度依賴 Traffic Pattern。評估時使用的流量類型對於正確評估 On-chip Network 設計至關重要。

## Message Classes 與 Virtual Networks

### Message Class 需求

On-chip Network 的端點（Tile、Core 等）發送和接收多種 **Message Class**。最常見的是來自 Cache Coherence Protocol 的 Message：

| Message Class | 說明 | 優先級 |
|---------------|------|--------|
| **Request** | Cache Miss 請求 | 中 |
| **Intervention** | Coherence 干預請求 | 高 |
| **Response** | 資料回應 | 高 |
| **Writeback** | 寫回請求 | 低 |

### Virtual Network (VNet)

不同的 Message Class 通常映射到不同的 **Virtual Network**：

- 每個 VNet 由自己的 VC 組成
- VNet 之間**完全隔離**
- 防止不同 Protocol 訊息之間的相互阻塞

::: warning 重要
將可能造成循環依賴的 Message Class 分配到不同 VNet 是避免 Protocol-level Deadlock 的常見方法。
:::

### 典型配置

```
VNet 0: Request Messages
VNet 1: Response Messages
VNet 2: Ordered Messages (如 intervention)
```

## Synthetic Traffic

**Synthetic Traffic** 是研究中常用的基準測試流量，用於在受控條件下評估網路效能。每種 Traffic Pattern 測試網路的不同面向。

![Table 7.2: Synthetic Traffic Patterns for k×k Mesh](/images/ch07/Table%207.2.jpg)

Table 7.2 列出了常用的 Synthetic Traffic Pattern 及其在 k×k Mesh 中的行為特性。

### Uniform Random Traffic

每個 Node 以**等機率**發送到任意其他 Node（除自己外）：

| 特性 | 值 |
|------|-----|
| 目的地分佈 | 均勻 |
| 平均 Hop Count | $\frac{2k}{3}$ (k×k Mesh) |
| 測試目標 | 整體網路容量 |

```
對於每個 Packet:
    dest = random(0, N-1), dest ≠ source
```

### Bit-complement Traffic

目的地為 Source 位址的**位元反轉**：

$$
dest_i = \overline{source_i}
$$

| 特性 | 值 |
|------|-----|
| 目的地 | 對角位置 |
| 平均 Hop Count | 最大（對角線距離） |
| 測試目標 | 網路 Bisection Bandwidth |

例如在 4×4 Mesh 中：
- Source (0,0) → Dest (3,3)
- Source (0,1) → Dest (3,2)

### Bit-reverse Traffic

目的地為 Source 位址的**位元反轉順序**：

$$
dest_i = source_{n-1-i}
$$

例如 4-bit 位址：
- Source: 0011 → Dest: 1100
- Source: 1010 → Dest: 0101

### Shuffle Traffic

來自 **Perfect-shuffle** 互連模式：

$$
dest_i = source_{(i+1) \mod n}
$$

| 特性 | 說明 |
|------|------|
| 模式 | 位元循環左移 |
| 歷史 | 源自多階段互連網路 |

### Tornado Traffic

創造**局部熱點**，測試網路處理不均勻流量的能力：

$$
dest_x = (source_x + \lfloor k/2 \rfloor - 1) \mod k
$$

| 特性 | 說明 |
|------|------|
| 距離 | 約半個網路寬度 |
| 測試目標 | 局部擁塞處理 |

### Transpose Traffic

在 2D Mesh 中，行列座標**交換**：

$$
dest = (source_y, source_x)
$$

| 特性 | 說明 |
|------|------|
| 模式 | 沿對角線對稱 |
| 特點 | 對角線上的 Node 發送給自己 |

### 流量特性比較

| Pattern | 平均距離 | Bisection 負載 | 用途 |
|---------|----------|----------------|------|
| Uniform Random | 中等 | 均勻 | 通用測試 |
| Bit-complement | 最大 | 最高 | 壓力測試 |
| Tornado | 中等 | 局部高 | 熱點測試 |
| Transpose | 變化 | 中等 | 對稱性測試 |

## Application Traffic

### Trace-driven Simulation

記錄真實應用的通訊行為用於模擬：

| 欄位 | 說明 |
|------|------|
| Timestamp | 事件發生時間 |
| Source | 發送端 ID |
| Destination | 接收端 ID |
| Message Type | 訊息類型 |
| Size | 資料大小 |

```
# Trace File 範例
# Time, Src, Dst, Type, Size
  100,   0,   5,  REQ,  64
  105,   5,   0,  RSP,  576
  110,   3,   7,  REQ,  64
  ...
```

**優點**：
- 捕捉真實應用行為
- 可重複執行

**缺點**：
- 無法反映網路延遲變化的影響
- Trace 檔案可能很大

### Full-system Simulation

執行完整的作業系統和應用程式：

| Simulator | 特點 |
|-----------|------|
| gem5 | 完整系統模擬、支援 Garnet |
| Simics | 商業、高精度 |
| QEMU + 網路模型 | 快速、較低精度 |

**優點**：
- 最接近真實行為
- 網路延遲影響應用行為

**缺點**：
- 模擬速度慢
- 設定複雜

### 常見 Benchmark

| Benchmark Suite | 應用領域 |
|-----------------|----------|
| **SPLASH-2** | 科學計算 |
| **PARSEC** | 共享記憶體並行 |
| **SPEC OMP** | OpenMP 程式 |
| **Graph500** | 圖形處理 |

## Traffic 參數

### Injection Rate

每個 Node 每個 Cycle 注入的 Flit 數量：

| 參數 | 典型範圍 |
|------|----------|
| 低負載 | 0.01 - 0.1 flits/node/cycle |
| 中負載 | 0.1 - 0.3 flits/node/cycle |
| 高負載 | 0.3 - 飽和點 |

### Packet Size

| 訊息類型 | 典型大小 |
|----------|----------|
| Control (Request) | 1-2 flits |
| Data (Response) | 5-10 flits |
| 混合 | Bimodal 分佈 |

### Burstiness

流量的突發程度影響網路行為：

| 類型 | 特性 |
|------|------|
| Poisson | 隨機到達，無突發 |
| Bursty | 連續多個 Packet，然後靜默 |
| Self-similar | 長期相關性 |

## 設計建議

| 評估目標 | 建議流量 |
|----------|----------|
| 初期探索 | Uniform Random |
| 壓力測試 | Bit-complement |
| 實際效能 | Full-system + Benchmarks |
| 熱點處理 | Tornado, Hotspot |

## 參考資料

- On-Chip Networks Second Edition, Chapter 7.3

