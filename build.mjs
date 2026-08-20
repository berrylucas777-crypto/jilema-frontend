#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
 build.mjs — OpenPalate 单文件交付物构建脚本（skill 分发版）
 用法：
   1. 把本文件复制到你的交付目录（与 template.html 同目录）；
   2. 确保 tokens.js 可达：把 skill 自带的 assets/tokens.js 复制到本目录，
      或用环境变量 OP_TOKENS 指定其绝对路径；
   3. node build.mjs  →  生成同目录 index.html。
 机检：任何颜色字面量（hex / rgb）必须命中 token 注册表；
      禁止 font-size px 字面量与 Math.random()。
 ═══════════════════════════════════════════════════════════════ */
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, isAbsolute } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const candidates = [
  process.env.OP_TOKENS,
  join(here, 'tokens.js'),
  join(here, '../assets/tokens.js'),
].filter(Boolean);
const tokensPath = candidates.find(p => existsSync(isAbsolute(p) ? p : join(here, p)));
if (!tokensPath) {
  console.error('✗ 找不到 tokens.js：请把 assets/tokens.js 复制到本目录，或设置 OP_TOKENS');
  process.exit(1);
}
const OP = require(tokensPath);

const template = readFileSync(join(here, 'template.html'), 'utf8');
const legacyAdapterPath = join(here, 'integration/legacy-api-adapter.js');
if (!existsSync(legacyAdapterPath)) {
  console.error('✗ 找不到旧接口兼容层：integration/legacy-api-adapter.js');
  process.exit(1);
}
const legacyAdapter = readFileSync(legacyAdapterPath, 'utf8');

const registry = new Set();
const collect = (v) => {
  if (typeof v === 'string') {
    for (const m of v.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) registry.add(m[0].toLowerCase());
    for (const m of v.matchAll(/rgba?\([^)]*\)/gi)) registry.add(m[0].replace(/\s+/g, '').toLowerCase());
  } else if (Array.isArray(v)) v.forEach(collect);
  else if (v && typeof v === 'object') Object.values(v).forEach(collect);
};
collect(OP);

const violations = [];
for (const m of template.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
  if (!registry.has(m[0].toLowerCase())) violations.push(`未注册的颜色字面量 ${m[0]}（offset ${m.index}）`);
}
for (const m of template.matchAll(/rgba?\([^)]*\)/gi)) {
  if (!registry.has(m[0].replace(/\s+/g, '').toLowerCase())) violations.push(`未注册的颜色函数 ${m[0]}（offset ${m.index}）`);
}
for (const m of template.matchAll(/font-size\s*:\s*[\d.]+px/g)) {
  violations.push(`禁止的字号 px 字面量「${m[0]}」（offset ${m.index}），请改用 var(--op-*)`);
}
if (/Math\.random\s*\(/.test(template)) violations.push('禁止 Math.random()，演示数据必须确定性');

if (violations.length) {
  console.error('✗ 构建拒绝：token 漂移 detected');
  violations.forEach(v => console.error('  - ' + v));
  process.exit(1);
}

const PLACEHOLDER = '<!--OP_BASE_CSS-->';
const LEGACY_ADAPTER_PLACEHOLDER = '<!--JILEMA_LEGACY_API_ADAPTER-->';
if (!template.includes(PLACEHOLDER)) {
  console.error(`✗ 模板缺少占位符 ${PLACEHOLDER}`);
  process.exit(1);
}
if (!template.includes(LEGACY_ADAPTER_PLACEHOLDER)) {
  console.error(`✗ 模板缺少占位符 ${LEGACY_ADAPTER_PLACEHOLDER}`);
  process.exit(1);
}
const out = template.replace(
  PLACEHOLDER,
  () => `<style data-source="tokens.js · BASE_CSS（构建期内联，禁止手改）">\n${OP.BASE_CSS}\n</style>\n` +
    `<script data-source="tokens.js · TRANSFORM（构建期内联，禁止手改）">\n` +
    `window.OP = { TRANSFORM: ${JSON.stringify(OP.TRANSFORM, null, 2)} };\n</script>`
).replace(
  LEGACY_ADAPTER_PLACEHOLDER,
  () => `<script data-source="integration/legacy-api-adapter.js · 构建期内联">\n${legacyAdapter}\n</script>`
);
if (out.includes(PLACEHOLDER)) {
  console.error('✗ 构建异常：替换后仍存在占位符');
  process.exit(1);
}
if (out.includes(LEGACY_ADAPTER_PLACEHOLDER)) {
  console.error('✗ 构建异常：旧接口兼容层占位符未替换');
  process.exit(1);
}

writeFileSync(join(here, 'index.html'), out);
console.log(`✓ 构建完成：${join(here, 'index.html')}`);
console.log(`  tokens: ${tokensPath} · 颜色注册表 ${registry.size} 项 · 无漂移`);
