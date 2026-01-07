import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'NoC 知識庫',
  description: 'Network on Chip 知識庫 - 基於《On-Chip Networks Second Edition》',
  lang: 'zh-TW',
  base: '/noc-knowledge-base/',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],

  themeConfig: {
    logo: '/images/logo.svg',

    nav: [
      { text: '首頁', link: '/' },
      { text: '快速入門', link: '/01-introduction/' },
      { text: '術語表', link: '/glossary' },
      { text: '延伸閱讀', link: '/references/' },
    ],

    sidebar: {
      '/': [
        {
          text: '1. Introduction',
          collapsed: false,
          items: [
            { text: '概覽', link: '/01-introduction/' },
            { text: 'Multi-core 時代', link: '/01-introduction/multi-core-era' },
            { text: 'On-chip vs Off-chip', link: '/01-introduction/on-chip-vs-off-chip' },
            { text: 'Network 基礎', link: '/01-introduction/network-basics' },
            { text: 'Building Blocks', link: '/01-introduction/building-blocks' },
          ]
        },
        {
          text: '2. System Architecture',
          collapsed: true,
          items: [
            { text: '概覽', link: '/02-system-architecture/' },
            { text: 'Shared Memory', link: '/02-system-architecture/shared-memory' },
            { text: 'Coherence Protocol', link: '/02-system-architecture/coherence-protocol' },
            { text: 'Message Passing', link: '/02-system-architecture/message-passing' },
            { text: 'NoC Interface 標準', link: '/02-system-architecture/noc-interface-standards' },
          ]
        },
        {
          text: '3. Topology',
          collapsed: true,
          items: [
            { text: '概覽', link: '/03-topology/' },
            { text: 'Metrics', link: '/03-topology/metrics' },
            { text: 'Direct Topologies', link: '/03-topology/direct-topologies' },
            { text: 'Indirect Topologies', link: '/03-topology/indirect-topologies' },
            { text: 'Irregular Topologies', link: '/03-topology/irregular-topologies' },
            { text: 'Hierarchical', link: '/03-topology/hierarchical' },
            { text: '實作考量', link: '/03-topology/implementation' },
          ]
        },
        {
          text: '4. Routing',
          collapsed: true,
          items: [
            { text: '概覽', link: '/04-routing/' },
            { text: 'Routing 類型', link: '/04-routing/routing-types' },
            { text: 'Deadlock Avoidance', link: '/04-routing/deadlock-avoidance' },
            { text: 'Dimension-ordered Routing', link: '/04-routing/dimension-ordered' },
            { text: 'Oblivious Routing', link: '/04-routing/oblivious-routing' },
            { text: 'Adaptive Routing', link: '/04-routing/adaptive-routing' },
            { text: 'Multicast Routing', link: '/04-routing/multicast-routing' },
            { text: '實作', link: '/04-routing/implementation' },
          ]
        },
        {
          text: '5. Flow Control',
          collapsed: true,
          items: [
            { text: '概覽', link: '/05-flow-control/' },
            { text: '資料單位', link: '/05-flow-control/data-units' },
            { text: 'Message-based', link: '/05-flow-control/message-based' },
            { text: 'Packet-based', link: '/05-flow-control/packet-based' },
            { text: 'Flit-based (Wormhole)', link: '/05-flow-control/flit-based' },
            { text: 'Virtual Channels', link: '/05-flow-control/virtual-channels' },
            { text: 'Deadlock-free Flow Control', link: '/05-flow-control/deadlock-free' },
            { text: 'Buffer Backpressure', link: '/05-flow-control/buffer-backpressure' },
          ]
        },
        {
          text: '6. Router Microarchitecture',
          collapsed: true,
          items: [
            { text: '概覽', link: '/06-router-microarchitecture/' },
            { text: 'VC Router', link: '/06-router-microarchitecture/vc-router' },
            { text: 'Buffers', link: '/06-router-microarchitecture/buffers' },
            { text: 'Switch Design', link: '/06-router-microarchitecture/switch-design' },
            { text: 'Allocators', link: '/06-router-microarchitecture/allocators' },
            { text: 'Pipeline', link: '/06-router-microarchitecture/pipeline' },
            { text: 'Low-power', link: '/06-router-microarchitecture/low-power' },
            { text: 'Physical Implementation', link: '/06-router-microarchitecture/physical-impl' },
          ]
        },
        {
          text: '7. Modeling & Evaluation',
          collapsed: true,
          items: [
            { text: '概覽', link: '/07-modeling-evaluation/' },
            { text: 'Metrics', link: '/07-modeling-evaluation/metrics' },
            { text: 'Modeling 基礎設施', link: '/07-modeling-evaluation/modeling-infra' },
            { text: 'Traffic Patterns', link: '/07-modeling-evaluation/traffic-patterns' },
            { text: 'Debug 方法', link: '/07-modeling-evaluation/debug' },
            { text: 'NoC Generators', link: '/07-modeling-evaluation/noc-generators' },
          ]
        },
        {
          text: '8. Case Studies',
          collapsed: true,
          items: [
            { text: '概覽', link: '/08-case-studies/' },
            { text: 'MIT Eyeriss', link: '/08-case-studies/mit-eyeriss' },
            { text: 'Princeton Piton', link: '/08-case-studies/princeton-piton' },
            { text: 'Intel Xeon Phi', link: '/08-case-studies/intel-xeon-phi' },
            { text: 'D.E. Shaw Anton 2', link: '/08-case-studies/anton2' },
            { text: 'Oracle SPARC T5', link: '/08-case-studies/oracle-sparc-t5' },
            { text: 'Tilera TILEPRO64', link: '/08-case-studies/tilera' },
            { text: 'Intel TeraFLOPS', link: '/08-case-studies/intel-teraflops' },
            { text: 'IBM Cell', link: '/08-case-studies/ibm-cell' },
          ]
        },
        {
          text: '9. Conclusions',
          collapsed: true,
          items: [
            { text: '概覽', link: '/09-conclusions/' },
            { text: 'Beyond Conventional', link: '/09-conclusions/beyond-conventional' },
            { text: 'Resilient NoC', link: '/09-conclusions/resilient-noc' },
            { text: 'FPGA NoC', link: '/09-conclusions/fpga-noc' },
            { text: 'Heterogeneous SoC', link: '/09-conclusions/heterogeneous-soc' },
          ]
        },
        {
          text: '延伸閱讀',
          collapsed: true,
          items: [
            { text: '概覽', link: '/references/' },
            { text: 'SoC Interconnect 演進史', link: '/references/soc-interconnect-history' },
          ]
        },
        {
          text: '附錄',
          collapsed: true,
          items: [
            { text: '術語表', link: '/glossary' },
            { text: '書籍參考文獻', link: '/references-book' },
            { text: '常用公式', link: '/appendix/formulas' },
            { text: '相關工具', link: '/appendix/tools' },
          ]
        },
      ]
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜尋',
            buttonAriaLabel: '搜尋'
          },
          modal: {
            noResultsText: '找不到相關結果',
            resetButtonTitle: '清除搜尋',
            footer: {
              selectText: '選擇',
              navigateText: '切換',
              closeText: '關閉'
            }
          }
        }
      }
    },

    outline: {
      label: '本頁目錄',
      level: [2, 3]
    },

    docFooter: {
      prev: '上一頁',
      next: '下一頁'
    },

    lastUpdated: {
      text: '最後更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com' }
    ],

    footer: {
      message: '基於《On-Chip Networks Second Edition》建立',
      copyright: 'MIT License'
    }
  },

  markdown: {
    math: true,
    lineNumbers: true,
  },

  lastUpdated: true,
})
