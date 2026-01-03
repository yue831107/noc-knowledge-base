# Buffers 與 Virtual Channels

Buffer 用於在 Flit 無法立即轉發到輸出 Link 時暫存 Packet 或 Flit。Buffer 組織對網路吞吐量有重大影響，因為它決定了 Packet 如何有效地共享 Link 頻寬。

## Buffer 組織

![Figure 6.2: Buffer 與 VC 組織](/images/ch06/Figure%206.2.jpg)

### Single Fixed-length Queue

Figure 6.2a 展示了每個輸入 Port 只有單一 Queue 的 Input-buffered Router（沒有 VC）：

- 進入的 Flit 寫入 Queue 的 Tail
- Queue Head 的 Flit 被讀出並送往 Crossbar
- Queue 有固定長度，上游 Router 追蹤 Buffer 可用性

**問題：Head-of-line (HOL) Blocking**

單一 Queue 會導致 HOL Blocking：
- Queue 前方的 Packet 佔用其輸出 Port
- 後方的 Packet（即使其輸出 Port 可用）無法前進
- 必須等待前方 Packet 離開

### Multiple Fixed-length Queues

Figure 6.2b 展示了每個輸入 Port 有多個獨立 Queue 的設計：

- 每個 Queue 稱為一個 **Virtual Channel**
- 多個 VC 多工並共享 Physical Channel/Link 頻寬
- 可緩解 HOL Blocking：不同 VC 的 Packet 可以獨立前進

### Multiple Variable-length Queues

Figure 6.2c 展示了 Variable-length Queue 設計：

- 每個 VC Queue 可以是可變長度
- 共享一個大的 Buffer Pool
- 允許更好的 Buffer 利用率
- 但需要更複雜的控制電路（追蹤 Head/Tail 指標）

**注意事項：**
- 必須為每個 VC 保留至少一個 Buffer Slot
- 避免其他 VC 填滿整個 Shared Buffer 而餓死某個 VC

## VC 數量設計

### VC 的兩個用途

1. **Deadlock Avoidance**（Protocol 或 Routing）
2. **Performance Improvement**（減少 HOL Blocking）

### 最小 VC 數量

| 用途 | 最小數量 |
|------|----------|
| Protocol Deadlock | 2+（如 Request/Response 分離） |
| Routing Deadlock | 取決於 Routing Algorithm |
| Performance | 越多越好（但有 Trade-off） |

### Many Shallow VCs vs Few Deep VCs

在相同總 Buffer 量下：

| 選擇 | 優點 | 缺點 |
|------|------|------|
| **Many Shallow VCs** | 更好的 HOL Blocking 緩解 | 更複雜的 VC Allocator |
| **Few Deep VCs** | 簡單的控制邏輯 | 高負載時效率較低 |

效率取決於流量模式：
- 輕負載：Many Shallow VCs 可能浪費 Buffer
- 重負載：Few Deep VCs 會因缺乏可用 VC 而阻塞

## 最小 Buffer 數量

### 功能正確性

為避免 Deadlock，每個 VC 至少需要 **1 個 Buffer**：
- 不同 VC 的 Packet 不應永久阻塞彼此

### 維持完整吞吐量

為了達到完整吞吐量，需要足夠的 Buffer 覆蓋 **Buffer Turnaround Time**：

$$
Buffer_{min} \geq \frac{RTT_{credit} \times Bandwidth}{Flit_{size}}
$$

如 Chapter 5 所討論，Buffer Turnaround Time 包括：
- Credit 傳輸時間
- Credit 處理時間
- Flit 傳輸時間

## VC 狀態管理

每個 VC 關聯的狀態用於 Flit 追蹤：

| 狀態 | 說明 |
|------|------|
| **Global (G)** | Idle / Routing / 等待輸出 VC / 等待 Credit / Active |
| **Route (R)** | 輸出 Port（由 Head Flit 的 Route Computation 填入） |
| **Output VC (O)** | 下游 Router 的 VC（由 VA 填入） |
| **Credit Count (C)** | 輸出 Port R 的 VC O 的可用 Credit 數量 |
| **Pointers (P)** | Head/Tail Flit 指標（用於 Variable-length Queue） |

### 狀態轉換

```
IDLE → RC → VA → ACTIVE → IDLE
         ↓
    (Head Flit)    (Tail Flit)
```

- **IDLE**：VC 沒有 Packet
- **RC**：等待 Route Computation
- **VA**：等待 VC Allocation
- **ACTIVE**：已分配 VC，可以做 Switch Allocation

## Buffer 實作選擇

| 實作方式 | 優點 | 缺點 | 適用場景 |
|----------|------|------|----------|
| **Flip-flops** | 速度快、容易合成 | 面積大、功耗高 | 小 Buffer |
| **Register File** | 速度快、面積中等 | 需要讀寫埠 | 中等 Buffer |
| **SRAM** | 密度高、功耗低 | 需要 Memory Compiler | 大 Buffer |

### 選擇考量

- 小 Buffer（< 16 entries）：Flip-flops 足夠
- 中等 Buffer：Register File 提供較好的面積/速度平衡
- 大 Buffer：SRAM 提供最佳密度

詳細實作選擇請參考 [Physical Implementation](./physical-impl)。

## 參考資料

- On-Chip Networks Second Edition, Chapter 6.2
