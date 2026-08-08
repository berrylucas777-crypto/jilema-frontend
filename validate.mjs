import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8')
const failures = []

if (/Math\.random\s*\(/.test(html)) failures.push('禁止 Math.random()')
if (/font-size\s*:\s*[\d.]+px/.test(html)) failures.push('发现裸字号 px')
if (/#[0-9a-fA-F]{3,8}\b/.test(html.replace(/<style data-source="tokens\.js[\s\S]*?<\/style>/, ''))) failures.push('模板中发现裸 hex 颜色')

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1])
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
if (duplicates.length) failures.push(`重复 id：${[...new Set(duplicates)].join(', ')}`)

const scripts = [...html.matchAll(/<script(?![^>]*type="application\/json")[^>]*>([\s\S]*?)<\/script>/g)].map((match) => match[1])
for (const [index, script] of scripts.entries()) {
  try {
    new vm.Script(script)
  } catch (error) {
    failures.push(`脚本 ${index + 1} 语法错误：${error.message}`)
  }
}

if (failures.length) {
  console.error('✗ Apple 论坛 Demo 机检失败')
  failures.forEach((failure) => console.error(`  - ${failure}`))
  process.exit(1)
}

console.log(`✓ Apple 论坛 Demo 机检通过：${ids.length} 个唯一 id，${scripts.length} 段脚本语法正常`)
