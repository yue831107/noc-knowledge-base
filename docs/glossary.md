# 術語表

本頁列出 NoC 相關的重要術語，並連結到相關章節以供深入學習。

## A

### Adaptive Routing
根據網路狀態動態選擇路徑的 Routing 方式。
→ 詳見 [Adaptive Routing](/04-routing/adaptive-routing)

### Allocator
分配資源（如 VC、Crossbar Port）給請求者的硬體單元。
→ 詳見 [Allocators](/06-router-microarchitecture/allocators)

### Arbiter
從多個請求中選擇一個的硬體單元。
→ 詳見 [Allocators](/06-router-microarchitecture/allocators)

## B

### Bandwidth
單位時間內可傳輸的資料量。
→ 詳見 [Evaluation Metrics](/07-modeling-evaluation/metrics)

### Bisection Bandwidth
將網路分成兩半時，跨越切割線的總頻寬。
→ 詳見 [Topology Metrics](/03-topology/metrics)

### Buffer
暫存 Flit 的記憶體。
→ 詳見 [Buffers](/06-router-microarchitecture/buffers)

### Backpressure
下游通知上游停止發送的機制。
→ 詳見 [Buffer Backpressure](/05-flow-control/buffer-backpressure)

## C

### Cache Coherence
確保多個 Cache 中同一資料一致性的機制。
→ 詳見 [Coherence Protocol](/02-system-architecture/coherence-protocol)

### Channel Dependency Graph
描述 Channel 之間依賴關係的圖，用於分析 Deadlock。
→ 詳見 [Deadlock Avoidance](/04-routing/deadlock-avoidance)

### Circuit Switching
在傳輸前建立完整路徑的 Switching 方式。
→ 詳見 [Message-based Flow Control](/05-flow-control/message-based)

### Credit
表示下游可用 Buffer 數量的計數。
→ 詳見 [Buffer Backpressure](/05-flow-control/buffer-backpressure)

### Crossbar
連接所有輸入到所有輸出的 Switch。
→ 詳見 [Switch Design](/06-router-microarchitecture/switch-design)

## D

### Deadlock
Packet 形成 Circular Wait，無法前進的情況。
→ 詳見 [Deadlock Avoidance](/04-routing/deadlock-avoidance) 和 [Deadlock-free Flow Control](/05-flow-control/deadlock-free)

### Deterministic Routing
相同 Source-Destination pair 總是使用相同路徑的 Routing。
→ 詳見 [Dimension-ordered Routing](/04-routing/dimension-ordered)

### Diameter
網路中最長的最短路徑長度。
→ 詳見 [Topology Metrics](/03-topology/metrics)

## F

### Flit (Flow Control Unit)
Flow Control 的最小單位。
→ 詳見 [資料單位](/05-flow-control/data-units)

### Flow Control
管理資料在 Link 上傳輸的機制。
→ 詳見 [Flow Control 概覽](/05-flow-control/)

## H

### Head Flit
Packet 的第一個 Flit，包含路由資訊。
→ 詳見 [資料單位](/05-flow-control/data-units)

### Head-of-line Blocking
前方 Packet 阻塞導致後方 Packet 無法前進。
→ 詳見 [Virtual Channels](/05-flow-control/virtual-channels)

### Hop
資料經過一個 Router 或 Link。
→ 詳見 [Topology Metrics](/03-topology/metrics)

## L

### Latency
資料從 Source 到 Destination 的時間。
→ 詳見 [Network 基礎](/01-introduction/network-basics) 和 [Evaluation Metrics](/07-modeling-evaluation/metrics)

### Link
連接兩個 Router 的通道。
→ 詳見 [Building Blocks](/01-introduction/building-blocks)

### Livelock
Packet 持續移動但永遠無法到達目的地。
→ 詳見 [Routing 類型](/04-routing/routing-types)

## M

### Mesh
Router 排列成 2D 網格，每個 Router 與相鄰四個連接。
→ 詳見 [Direct Topologies](/03-topology/direct-topologies)

### Message
應用層的完整訊息單位。
→ 詳見 [資料單位](/05-flow-control/data-units)

### Multicast
將同一 Packet 送到多個目的地。
→ 詳見 [Multicast Routing](/04-routing/multicast-routing)

## N

### Network Interface (NI)
連接 Core 與 Router 的介面。
→ 詳見 [Shared Memory](/02-system-architecture/shared-memory)

### Node
網路中的端點（Core、Memory Controller 等）。
→ 詳見 [Building Blocks](/01-introduction/building-blocks)

## O

### Oblivious Routing
路徑選擇不考慮網路狀態的 Routing。
→ 詳見 [Oblivious Routing](/04-routing/oblivious-routing)

## P

### Packet
Network 層的傳輸單位。
→ 詳見 [資料單位](/05-flow-control/data-units)

### Phit (Physical Unit)
一個 Cycle 傳輸的資料量。
→ 詳見 [資料單位](/05-flow-control/data-units)

### Pipeline
將操作分成多個階段執行。
→ 詳見 [Pipeline](/06-router-microarchitecture/pipeline)

## R

### Router
轉發 Packet 的網路元件。
→ 詳見 [VC Router](/06-router-microarchitecture/vc-router)

### Routing
決定 Packet 路徑的過程。
→ 詳見 [Routing 概覽](/04-routing/)

## S

### Store and Forward
完整 Packet 到達後才轉發的 Flow Control。
→ 詳見 [Packet-based Flow Control](/05-flow-control/packet-based)

### Switch Allocation
分配 Crossbar 使用權的過程。
→ 詳見 [Allocators](/06-router-microarchitecture/allocators)

## T

### Tail Flit
Packet 的最後一個 Flit。
→ 詳見 [資料單位](/05-flow-control/data-units)

### Throughput
單位時間內網路傳輸的資料量。
→ 詳見 [Network 基礎](/01-introduction/network-basics) 和 [Evaluation Metrics](/07-modeling-evaluation/metrics)

### Topology
網路的連接結構。
→ 詳見 [Topology 概覽](/03-topology/)

### Torus
Mesh 加上 Wraparound 連接。
→ 詳見 [Direct Topologies](/03-topology/direct-topologies)

## V

### VC (Virtual Channel)
在單一 Physical Channel 上建立的虛擬通道。
→ 詳見 [Virtual Channels](/05-flow-control/virtual-channels)

### VC Allocation
為 Packet 分配輸出 VC 的過程。
→ 詳見 [VC Router](/06-router-microarchitecture/vc-router)

### Virtual Cut-through
收到 Header 就開始轉發的 Flow Control。
→ 詳見 [Packet-based Flow Control](/05-flow-control/packet-based)

## W

### Wormhole
Flit 級別的 Flow Control，Packet 像蟲一樣穿過網路。
→ 詳見 [Flit-based Flow Control](/05-flow-control/flit-based)

## X

### XY Routing
先走 X 方向再走 Y 方向的 Dimension-ordered Routing。
→ 詳見 [Dimension-ordered Routing](/04-routing/dimension-ordered)
