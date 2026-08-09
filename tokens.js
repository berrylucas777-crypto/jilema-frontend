/* ═══════════════════════════════════════════════════════════════
 OPENPALATE UI TOKENS — 设计数值的唯一正本
 治理规则见 doc/design-system.md §3、§5、§7。
 任何组件实现中出现与本文件冲突的颜色、字号、间距、时长，以本文件为准。
 组件只允许使用 var(--op-*) CSS 变量；变量由本文件 BASE_CSS 生成。
 单文件交付物在构建期内联 BASE_CSS，禁止手工摘抄 token 值。

 分层：
   L0 结构层 — 灰阶与表面/墨色（明度承担结构）
   L1 语义层 — accent / info / success / warning / danger（只表达状态与类别）
   L2 密度层 — learn / build 两档（只改密度，不改结构与色值）
 ═══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* ── L0 · 结构灰阶 ──────────────────────────────────────────
     暖象牙纸面 + 深炭黑墨色。明度即层级：越重要越接近墨。 */
  const PAPER = '#F5F4F0';   // 文档纸面（暖象牙）
  const SURFACE = '#FFFFFF'; // 产品主表面（纯白）
  const INK = '#1B1B18';     // 主文字、主数据（深炭黑）
  const MUTED = '#62615B';   // 次级文字、副标题（白底对比度充足）
  const FAINT = '#75746D';   // 来源行、辅助信息（小字仍满足可读性）
  const LINE = '#DDDCD4';    // 发丝线、分隔线
  const CARD = '#FBFAF7';    // 卡片面（比纸面亮半级，靠明度差而非边框分卡）

  /* 7 级灰阶 ladder：多系列 / 多层级时按重要性从墨到浅分配 */
  const LADDER = ['#1B1B18', '#3D3C37', '#5B5A54', '#75746D', '#96958D', '#B4B3AB', '#D0CFC7'];

  /* 深表面（dark surface）：底为墨色，角色反转 */
  const DARK = {
    bg: '#1B1B18',
    card: '#242420',
    ink: '#F5F4F0',
    muted: '#BCBBB2',
    faint: '#9B9A92',
    line: '#33322D',
    ladder: ['#F5F4F0', '#D8D7CF', '#BCBBB2', '#9B9A92', '#75746D', '#5B5A54', '#3D3C37'],
  };

  /* ── L1 · 语义色 ────────────────────────────────────────────
     只表达状态与类别，不表达数据大小。每个色给出 light / dark 两种表面上的取值。 */
  const SEMANTIC = {
    accent:  { light: '#5B4FD0', dark: '#9D92F0' },  // 品牌紫：交互、当前节点、强调
    info:    { light: '#0E7D8F', dark: '#4FC3D4' },  // 青：链接、来源、信息
    success: { light: '#5A7A1E', dark: '#A9C96A' },  // 酸性绿（压暗版）：完成态、积极结论
    warning: { light: '#9A6208', dark: '#E0A94E' },  // 琥珀：风险、注意
    danger:  { light: '#A32E22', dark: '#E07A6C' },  // 朱红：严重风险、冲突
  };
  /* 语义色浅底衬（tint）：标记、tag、来源徽章的背景，仅 light 表面使用 */
  const TINT = {
    accent:  '#EAE8FA',
    info:    '#E0EFF1',
    success: '#EBF0DC',
    warning: '#F5EBD8',
    danger:  '#F6E3E0',
  };

  /* 业务场景色：表达内容类别，与 success / warning / danger 状态色分离。 */
  const SCENE = {
    question: { light: SEMANTIC.warning.light, dark: SEMANTIC.warning.dark, tint: TINT.warning },
    review: { light: SEMANTIC.accent.light, dark: SEMANTIC.accent.dark, tint: TINT.accent },
    resource: { light: SEMANTIC.success.light, dark: SEMANTIC.success.dark, tint: TINT.success },
    campus: { light: '#B35431', dark: '#F09A7B', tint: '#F7E7DF' },
    matchBuddy: { light: SEMANTIC.info.light, dark: SEMANTIC.info.dark, tint: TINT.info },
    matchRelationship: { light: '#A83F63', dark: '#EC8EAE', tint: '#F6E3EA' },
    matchPlaza: { light: SEMANTIC.accent.light, dark: SEMANTIC.accent.dark, tint: TINT.accent },
    trust: { light: SEMANTIC.success.light, dark: SEMANTIC.success.dark, tint: TINT.success },
    wait: { light: SEMANTIC.warning.light, dark: SEMANTIC.warning.dark, tint: TINT.warning },
  };

  /* ── 字体 ─────────────────────────────────────────────────── */
  const FONT = {
    family: "'Inter', -apple-system, 'PingFang SC', 'Noto Sans SC', sans-serif",
    mono: "'SF Mono', 'JetBrains Mono', Menlo, monospace",
    link: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
    /* 字号刻度（build 密度基准；learn 密度由 DENSITY 系数放大） */
    display: { size: 20,   weight: 700, spacing: '-.02em' },  // 区块级标题
    title:   { size: 15.5, weight: 700, spacing: '-.01em' },  // 组件标题（结论卡的结论句也用它）
    body:    { size: 14.5, weight: 400, lineHeight: 1.55 },   // 正文
    sub:     { size: 12.5, weight: 400 },                     // 副标题、说明
    caption: { size: 12,   weight: 500 },                     // tag、徽章、表头
    src:     { size: 11.5, weight: 600, spacing: '.04em' },   // 来源行，全大写
    input:   { size: 16,   weight: 400 },                     // 表单输入，避免 iOS 聚焦缩放
    min:     11.5,                                             // 移动产品文字下限
  };

  /* ── 间距 / 形状 / 深度 ───────────────────────────────────── */
  const SPACE = [2, 4, 8, 12, 16, 24, 32, 48];  // 4px 基网，只允许取此序列
  const SHAPE = {
    cardRadius: 14,
    innerRadius: 8,     // 卡内嵌套元素（代码块、tint 区块）
    pillRadius: 99,     // tag、徽章、按钮
    borderWidth: 1,     // 需要边框时只用发丝线
  };
  const HIT = {
    min: 44,
    gap: 8,
  };
  const ELEVATION = {
    /* 全系统默认扁平；唯一允许的阴影给浮层（预览卡、tooltip） */
    pop: '0 8px 28px rgba(27,27,24,.14)',
  };

  /* ── 动效 ───────────────────────────────────────────────────
     快进快停，不弹跳。进入视野才播；尊重 prefers-reduced-motion。 */
  const MOTION = {
    fast: 160,    // hover、展开反馈
    enter: 400,   // 组件入场
    slow: 800,    // 地图、大结构入场
    ease: 'cubic-bezier(.2,.7,.3,1)',
    css: `
      .op-enter{animation:op-enter .4s cubic-bezier(.2,.7,.3,1) both}
      @keyframes op-enter{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
      @media (prefers-reduced-motion:reduce){
        .op-enter{animation:none}
      }`,
  };

  /* ── L2 · 密度档 ────────────────────────────────────────────
     Learn：更大字号、更松间距、细节默认折叠。
     Build：基准密度、细节默认展开。两档只改下列系数，不动 L0/L1。 */
  const DENSITY = {
    learn: { fontScale: 1.12, spaceScale: 1.25, detailDefaultOpen: false },
    build: { fontScale: 1.0,  spaceScale: 1.0,  detailDefaultOpen: true },
  };
  const TEXT_SIZE = {
    large: 1.12,
    xlarge: 1.24,
  };

  /* ── 来源 / 变换类型徽标（可追溯性是视觉元素） ─────────────── */
  const TRANSFORM = {
    summarized: { label: 'SUMMARIZED', color: 'info' },
    reordered:  { label: 'REORDERED',  color: 'accent' },
    quoted:     { label: 'QUOTED',     color: 'success' },
    locked:     { label: 'LOCKED',     color: 'warning' },  // 代码、数字、引用：只重排不改写
  };

  /* ── SKETCH · 手绘交互文档层 ─────────────────────────────────
     用途：架构讲解页、交互式技术文档（Sketch Docs），与产品渲染层互补。
     灰阶与表面复用 L0（不新增灰），只新增"模块类别"色相与手绘形制。
     规则同 §3：色相只表达模块类别，不表达数据大小。 */
  const SKETCH = {
    /* 模块类别色相：线（边框/标题）+ 浅衬（tint 底） */
    hue: {
      orange: { line: '#E8590C', tint: '#FFF4E6' },   // agent 核心 / 循环
      pink:   { line: '#C2255C', tint: '#FFF0F6' },   // 模型 / LLM 节点
      green:  { line: '#2B8A3E', tint: '#EBFBEE' },   // 输出 / 完成态（REPLY、SESSION）
      blue:   { line: '#1971C2', tint: '#E7F5FF' },   // 输入 / 接入形态
      violet: { line: '#6741D9', tint: '#F3F0FF' },   // 上下文 / 状态
    },
    /* 手绘形制 */
    fontHand: "'Caveat', 'Noto Sans SC', cursive",
    fontHandLink: 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap',
    radius1: '255px 15px 225px 15px / 15px 225px 15px 255px',  // 手绘抖边 A
    radius2: '15px 225px 15px 255px / 225px 15px 255px 15px',  // 手绘抖边 B
    grid: 'rgba(0,0,0,.028)',                // 纸面网格线
    headerBg: 'rgba(245,244,240,.88)',       // 顶栏（纸面 + 88% 不透明度）
    hoverShadow: '4px 6px 0 rgba(27,27,24,.14)',  // 模块卡 hover 硬投影（手绘感，非浮层）
    /* 手绘字号刻度（文档页大标题需要超出产品 FONT 刻度） */
    fs: {
      hero: 54, view: 44, section: 30, card: 26, h3: 27,
      tagline: 22, arr: 24, llm: 21, back: 20, tool: 19,
      lives: 18, diamond: 17, hint: 16, meta: 15, doc: 15,
      crumb: 14, table: 14, li: 13.5, pre: 13,
    },
  };

  /* ── BASE_CSS：由以上 token 生成，组件唯一合法的取值来源 ── */
  const BASE_CSS = `
    :root{
      --op-paper:${PAPER};--op-surface:${SURFACE};--op-ink:${INK};--op-muted:${MUTED};--op-faint:${FAINT};
      --op-line:${LINE};--op-card:${CARD};
      --op-l1:${LADDER[0]};--op-l2:${LADDER[1]};--op-l3:${LADDER[2]};--op-l4:${LADDER[3]};
      --op-l5:${LADDER[4]};--op-l6:${LADDER[5]};--op-l7:${LADDER[6]};
      --op-accent:${SEMANTIC.accent.light};--op-info:${SEMANTIC.info.light};
      --op-success:${SEMANTIC.success.light};--op-warning:${SEMANTIC.warning.light};
      --op-danger:${SEMANTIC.danger.light};
      --op-tint-accent:${TINT.accent};--op-tint-info:${TINT.info};--op-tint-success:${TINT.success};
      --op-tint-warning:${TINT.warning};--op-tint-danger:${TINT.danger};
      --op-scene-question:${SCENE.question.light};--op-scene-question-tint:${SCENE.question.tint};
      --op-scene-review:${SCENE.review.light};--op-scene-review-tint:${SCENE.review.tint};
      --op-scene-resource:${SCENE.resource.light};--op-scene-resource-tint:${SCENE.resource.tint};
      --op-scene-campus:${SCENE.campus.light};--op-scene-campus-tint:${SCENE.campus.tint};
      --op-scene-match-buddy:${SCENE.matchBuddy.light};--op-scene-match-buddy-tint:${SCENE.matchBuddy.tint};
      --op-scene-match-relationship:${SCENE.matchRelationship.light};--op-scene-match-relationship-tint:${SCENE.matchRelationship.tint};
      --op-scene-match-plaza:${SCENE.matchPlaza.light};--op-scene-match-plaza-tint:${SCENE.matchPlaza.tint};
      --op-scene-trust:${SCENE.trust.light};--op-scene-trust-tint:${SCENE.trust.tint};
      --op-scene-wait:${SCENE.wait.light};--op-scene-wait-tint:${SCENE.wait.tint};
      --op-font:${FONT.family};--op-mono:${FONT.mono};
      --op-fs-display:${FONT.display.size}px;--op-fs-title:${FONT.title.size}px;
      --op-fs-body:${FONT.body.size}px;--op-fs-sub:${FONT.sub.size}px;
      --op-fs-caption:${FONT.caption.size}px;--op-fs-src:${FONT.src.size}px;--op-fs-input:${FONT.input.size}px;
      --op-sp-1:${SPACE[0]}px;--op-sp-2:${SPACE[1]}px;--op-sp-3:${SPACE[2]}px;--op-sp-4:${SPACE[3]}px;
      --op-sp-5:${SPACE[4]}px;--op-sp-6:${SPACE[5]}px;--op-sp-7:${SPACE[6]}px;--op-sp-8:${SPACE[7]}px;
      --op-r-card:${SHAPE.cardRadius}px;--op-r-inner:${SHAPE.innerRadius}px;--op-r-pill:${SHAPE.pillRadius}px;
      --op-hit:${HIT.min}px;--op-hit-gap:${HIT.gap}px;
      --op-shadow-pop:${ELEVATION.pop};
      --op-t-fast:${MOTION.fast}ms;--op-t-enter:${MOTION.enter}ms;--op-ease:${MOTION.ease};
      --op-sk-orange:${SKETCH.hue.orange.line};--op-sk-orange-tint:${SKETCH.hue.orange.tint};
      --op-sk-pink:${SKETCH.hue.pink.line};--op-sk-pink-tint:${SKETCH.hue.pink.tint};
      --op-sk-green:${SKETCH.hue.green.line};--op-sk-green-tint:${SKETCH.hue.green.tint};
      --op-sk-blue:${SKETCH.hue.blue.line};--op-sk-blue-tint:${SKETCH.hue.blue.tint};
      --op-sk-violet:${SKETCH.hue.violet.line};--op-sk-violet-tint:${SKETCH.hue.violet.tint};
      --op-font-hand:${SKETCH.fontHand};
      --op-sk-r1:${SKETCH.radius1};--op-sk-r2:${SKETCH.radius2};
      --op-sk-grid:${SKETCH.grid};--op-sk-header-bg:${SKETCH.headerBg};
      --op-sk-shadow:${SKETCH.hoverShadow};
      --op-sk-fs-hero:${SKETCH.fs.hero}px;--op-sk-fs-view:${SKETCH.fs.view}px;
      --op-sk-fs-section:${SKETCH.fs.section}px;--op-sk-fs-card:${SKETCH.fs.card}px;
      --op-sk-fs-h3:${SKETCH.fs.h3}px;--op-sk-fs-tagline:${SKETCH.fs.tagline}px;
      --op-sk-fs-arr:${SKETCH.fs.arr}px;--op-sk-fs-llm:${SKETCH.fs.llm}px;
      --op-sk-fs-back:${SKETCH.fs.back}px;--op-sk-fs-tool:${SKETCH.fs.tool}px;
      --op-sk-fs-lives:${SKETCH.fs.lives}px;--op-sk-fs-diamond:${SKETCH.fs.diamond}px;
      --op-sk-fs-hint:${SKETCH.fs.hint}px;--op-sk-fs-meta:${SKETCH.fs.meta}px;
      --op-sk-fs-doc:${SKETCH.fs.doc}px;--op-sk-fs-crumb:${SKETCH.fs.crumb}px;
      --op-sk-fs-table:${SKETCH.fs.table}px;--op-sk-fs-li:${SKETCH.fs.li}px;
      --op-sk-fs-pre:${SKETCH.fs.pre}px;
    }
    [data-theme="dark"]{
      --op-paper:${DARK.bg};--op-surface:${DARK.bg};--op-ink:${DARK.ink};--op-muted:${DARK.muted};
      --op-faint:${DARK.faint};--op-line:${DARK.line};--op-card:${DARK.card};
      --op-l1:${DARK.ladder[0]};--op-l2:${DARK.ladder[1]};--op-l3:${DARK.ladder[2]};--op-l4:${DARK.ladder[3]};
      --op-l5:${DARK.ladder[4]};--op-l6:${DARK.ladder[5]};--op-l7:${DARK.ladder[6]};
      --op-accent:${SEMANTIC.accent.dark};--op-info:${SEMANTIC.info.dark};
      --op-success:${SEMANTIC.success.dark};--op-warning:${SEMANTIC.warning.dark};
      --op-danger:${SEMANTIC.danger.dark};
      --op-tint-accent:color-mix(in srgb,var(--op-accent) 18%,var(--op-surface));
      --op-tint-info:color-mix(in srgb,var(--op-info) 18%,var(--op-surface));
      --op-tint-success:color-mix(in srgb,var(--op-success) 18%,var(--op-surface));
      --op-tint-warning:color-mix(in srgb,var(--op-warning) 18%,var(--op-surface));
      --op-tint-danger:color-mix(in srgb,var(--op-danger) 18%,var(--op-surface));
      --op-scene-question:${SCENE.question.dark};--op-scene-question-tint:color-mix(in srgb,var(--op-scene-question) 18%,var(--op-surface));
      --op-scene-review:${SCENE.review.dark};--op-scene-review-tint:color-mix(in srgb,var(--op-scene-review) 18%,var(--op-surface));
      --op-scene-resource:${SCENE.resource.dark};--op-scene-resource-tint:color-mix(in srgb,var(--op-scene-resource) 18%,var(--op-surface));
      --op-scene-campus:${SCENE.campus.dark};--op-scene-campus-tint:color-mix(in srgb,var(--op-scene-campus) 18%,var(--op-surface));
      --op-scene-match-buddy:${SCENE.matchBuddy.dark};--op-scene-match-buddy-tint:color-mix(in srgb,var(--op-scene-match-buddy) 18%,var(--op-surface));
      --op-scene-match-relationship:${SCENE.matchRelationship.dark};--op-scene-match-relationship-tint:color-mix(in srgb,var(--op-scene-match-relationship) 18%,var(--op-surface));
      --op-scene-match-plaza:${SCENE.matchPlaza.dark};--op-scene-match-plaza-tint:color-mix(in srgb,var(--op-scene-match-plaza) 18%,var(--op-surface));
      --op-scene-trust:${SCENE.trust.dark};--op-scene-trust-tint:color-mix(in srgb,var(--op-scene-trust) 18%,var(--op-surface));
      --op-scene-wait:${SCENE.wait.dark};--op-scene-wait-tint:color-mix(in srgb,var(--op-scene-wait) 18%,var(--op-surface));
    }
    [data-density="learn"]{
      --op-fs-display:${FONT.display.size * DENSITY.learn.fontScale}px;
      --op-fs-title:${FONT.title.size * DENSITY.learn.fontScale}px;
      --op-fs-body:${FONT.body.size * DENSITY.learn.fontScale}px;
    }
    [data-text-size="large"]{
      --op-fs-display:${FONT.display.size * TEXT_SIZE.large}px;
      --op-fs-title:${FONT.title.size * TEXT_SIZE.large}px;
      --op-fs-body:${FONT.body.size * TEXT_SIZE.large}px;
      --op-fs-sub:${FONT.sub.size * TEXT_SIZE.large}px;
      --op-fs-caption:${FONT.caption.size * TEXT_SIZE.large}px;
      --op-fs-src:${FONT.src.size * TEXT_SIZE.large}px;
      --op-fs-input:${FONT.input.size * TEXT_SIZE.large}px;
    }
    [data-text-size="xlarge"]{
      --op-fs-display:${FONT.display.size * TEXT_SIZE.xlarge}px;
      --op-fs-title:${FONT.title.size * TEXT_SIZE.xlarge}px;
      --op-fs-body:${FONT.body.size * TEXT_SIZE.xlarge}px;
      --op-fs-sub:${FONT.sub.size * TEXT_SIZE.xlarge}px;
      --op-fs-caption:${FONT.caption.size * TEXT_SIZE.xlarge}px;
      --op-fs-src:${FONT.src.size * TEXT_SIZE.xlarge}px;
      --op-fs-input:${FONT.input.size * TEXT_SIZE.xlarge}px;
    }
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:var(--op-paper);color:var(--op-ink);font-family:var(--op-font);
         font-size:var(--op-fs-body);line-height:${FONT.body.lineHeight};
         -webkit-font-smoothing:antialiased}
    ${MOTION.css}`;

  /* ── 确定性伪随机：演示数据一律用它，不用 Math.random() ── */
  const rnd = (i, k) => Math.abs(((i * 73856093) ^ (k * 19349663)) % 1000) / 1000;

  const OP = {
    PAPER, SURFACE, INK, MUTED, FAINT, LINE, CARD, LADDER, DARK,
    SEMANTIC, TINT, SCENE, FONT, SPACE, SHAPE, HIT, ELEVATION, MOTION, DENSITY, TEXT_SIZE, TRANSFORM,
    SKETCH, BASE_CSS, rnd,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = OP;
  global.OP = OP;
})(typeof window !== 'undefined' ? window : globalThis);
