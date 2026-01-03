# Debug Methodology

On-chip Network 的除錯需要系統性的方法。由於網路涉及分散式狀態和並行操作，問題往往難以重現和定位。

## 常見問題類型

### Deadlock

**症狀**：某些 Packet 永遠無法送達，網路吞吐量驟降。

| 類型 | 原因 | 解決方案 |
|------|------|----------|
| **Routing Deadlock** | CDG 有環 | 使用 VC 打破循環 |
| **Protocol Deadlock** | Message Class 相互等待 | 分離 VNet |
| **Resource Deadlock** | Buffer 資源競爭 | 增加 VC 或使用 Escape VC |

**除錯步驟**：
1. 識別「卡住」的 Packet
2. 追蹤每個 Packet 等待的資源
3. 建立等待圖（Wait-for Graph）
4. 找出循環依賴

### Livelock

**症狀**：Packet 一直在網路中移動但無法到達目的地。

| 原因 | 情境 |
|------|------|
| Non-minimal Routing 配置錯誤 | Packet 被反覆 Misroute |
| Priority Inversion | 高優先級 Packet 被低優先級阻擋 |
| Oscillation | 負載平衡決策震盪 |

**除錯步驟**：
1. 追蹤問題 Packet 的完整路徑
2. 檢查是否有重複經過相同 Router
3. 分析 Misroute 決策邏輯

### Starvation

**症狀**：某些 Packet 延遲極高，但網路未 Deadlock。

| 原因 | 解決方案 |
|------|----------|
| 不公平的 Arbitration | 使用 Round-robin 或 Age-based |
| Hotspot 效應 | 負載平衡、增加頻寬 |
| VC 分配不均 | 動態 VC 分配 |

### 資料損壞

**症狀**：接收到的資料與發送的不一致。

| 可能原因 | 檢查方法 |
|----------|----------|
| Buffer 溢出 | 檢查 Credit 管理 |
| Timing 問題 | 檢查 Setup/Hold 違規 |
| 競爭條件 | 檢查 Arbitration 邏輯 |

## Debug 技術

### 階層式除錯

從高層到低層逐步定位問題：

| 層級 | 檢查項目 | 工具 |
|------|----------|------|
| **系統層** | 端到端連通性 | 功能測試 |
| **網路層** | Packet 路由正確性 | Transaction Tracker |
| **Router 層** | Pipeline 行為 | Waveform |
| **元件層** | Buffer、Arbiter | Assertion |

### Waveform 分析

觀察訊號時序變化：

**關鍵訊號**：
| 訊號 | 用途 |
|------|------|
| `valid` / `ready` | 握手協定 |
| `flit_data` | 資料內容 |
| `vc_id` | VC 分配 |
| `credit_return` | Credit 更新 |

**常見問題模式**：
- `valid` 持續高但 `ready` 一直低 → 下游阻塞
- Credit 不回來 → Credit 管理問題
- 資料在 Buffer 中停留過久 → Arbitration 問題

### Transaction Tracker

追蹤每個 Packet 的完整生命週期：

```
Packet ID: 42
  Type: Request
  Source: Node 3
  Destination: Node 12

  Timeline:
    Cycle 100: Injected at NI
    Cycle 102: Entered Router 3, allocated VC 0
    Cycle 103: Won SA, traversing crossbar
    Cycle 104: Entered Router 7
    Cycle 106: Entered Router 11
    Cycle 108: Entered Router 12
    Cycle 109: Ejected at NI

  Total Latency: 9 cycles
  Hop Count: 4
```

### Assertion-based Verification

在 RTL 中加入檢查：

**協定檢查**：
```verilog
// Credit 永遠不應該為負
property credit_non_negative;
  @(posedge clk) credit_count >= 0;
endproperty
assert property (credit_non_negative);

// Buffer 不應溢出
property no_buffer_overflow;
  @(posedge clk) buffer_count <= BUFFER_DEPTH;
endproperty
assert property (no_buffer_overflow);
```

**狀態機檢查**：
```verilog
// VC 狀態轉換合法性
property valid_vc_transition;
  @(posedge clk)
    (state == IDLE) |=> (state inside {IDLE, ROUTE_COMPUTE});
endproperty
assert property (valid_vc_transition);
```

### Coverage-driven Debug

使用覆蓋率引導測試：

| 覆蓋類型 | 目標 |
|----------|------|
| **Functional** | 所有 Routing 路徑 |
| **Code** | 所有 RTL 分支 |
| **FSM** | 所有狀態轉換 |
| **Cross** | 參數組合 |

## Debug 工具

### 模擬器內建工具

| 工具 | 功能 |
|------|------|
| **gem5 Debug Flags** | 追蹤特定模組 |
| **BookSim Stats** | 網路統計 |
| **Garnet Network Stats** | 詳細網路指標 |

### RTL Debug 工具

| 工具 | 用途 |
|------|------|
| **Verdi** | Waveform 和原始碼連結 |
| **DVE** | Synopsys 波形檢視 |
| **GTKWave** | 開源波形檢視 |

### 自動化 Debug

```python
# 簡單的 Deadlock 偵測腳本
def detect_deadlock(packet_traces):
    stalled_packets = []
    for pkt in packet_traces:
        if pkt.cycles_since_progress > THRESHOLD:
            stalled_packets.append(pkt)

    if len(stalled_packets) > 0:
        # 建立等待圖
        wait_graph = build_wait_graph(stalled_packets)
        cycles = find_cycles(wait_graph)
        if cycles:
            print(f"Deadlock detected: {cycles}")
```

## Debug 檢查清單

### 設計階段

- [ ] CDG 無環或使用足夠 VC
- [ ] Protocol Message 正確分離到不同 VNet
- [ ] Credit 初始值正確
- [ ] Buffer 深度足夠

### 驗證階段

- [ ] 所有 Routing 路徑測試
- [ ] 邊界條件測試（滿 Buffer、無 Credit）
- [ ] 高負載壓力測試
- [ ] 隨機測試覆蓋

### 問題定位

- [ ] 問題可重現嗎？
- [ ] 最小重現測試案例
- [ ] 哪個 Packet 最先出問題？
- [ ] 問題是偶發還是必現？

## 常見 Debug 場景

### 場景 1：吞吐量低於預期

**檢查步驟**：
1. 確認 Injection Rate 正確
2. 檢查是否有 Hotspot
3. 分析 Buffer 利用率
4. 檢查 Arbitration 公平性

### 場景 2：延遲異常高

**檢查步驟**：
1. 檢查是否有 Starvation
2. 分析 Contention 位置
3. 確認 Pipeline 階段正確
4. 檢查 Credit 延遲

### 場景 3：功能錯誤

**檢查步驟**：
1. 追蹤問題 Packet 路徑
2. 檢查 Routing 決策
3. 驗證 Buffer 讀寫
4. 確認 Credit 管理

## 參考資料

- On-Chip Networks Second Edition, Chapter 7.4

