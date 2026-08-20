#!/usr/bin/env node
/*
 * 暨了么确认版前端本地预览服务器
 *
 * - 静态页面从当前仓库提供。
 * - /api/* 透明转发到旧 jidian 后端，解决本地联调跨域问题。
 * - 可用 JILEMA_API_TARGET 指向测试环境，默认只读联调线上同源接口。
 */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
const port = Number(process.env.JILEMA_PREVIEW_PORT || 4174)
const apiTarget = String(process.env.JILEMA_API_TARGET || 'https://jilema.match-lab.cn').replace(/\/+$/, '')

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
}

function safeStaticPath(pathname) {
  const decoded = decodeURIComponent(pathname === '/' ? '/index.html' : pathname)
  const relative = normalize(decoded).replace(/^([/\\])+/, '')
  const absolute = join(root, relative)
  return absolute.startsWith(root) ? absolute : null
}

async function proxyApi(request, response, url) {
  const headers = new Headers()
  Object.entries(request.headers).forEach(([name, value]) => {
    if (value == null || ['host', 'connection', 'content-length'].includes(name.toLowerCase())) return
    headers.set(name, Array.isArray(value) ? value.join(', ') : value)
  })
  const chunks = []
  for await (const chunk of request) chunks.push(chunk)
  const method = request.method || 'GET'
  const upstream = await fetch(`${apiTarget}${url.pathname}${url.search}`, {
    method,
    headers,
    body: ['GET', 'HEAD'].includes(method) ? undefined : Buffer.concat(chunks),
    redirect: 'manual',
  })
  response.statusCode = upstream.status
  upstream.headers.forEach((value, name) => {
    if (['content-encoding', 'content-length', 'transfer-encoding', 'connection'].includes(name.toLowerCase())) return
    response.setHeader(name, value)
  })
  response.setHeader('X-Jilema-Proxy', apiTarget)
  if (method === 'HEAD' || upstream.status === 204) {
    response.end()
    return
  }
  response.end(Buffer.from(await upstream.arrayBuffer()))
}

async function serveStatic(response, url) {
  const filePath = safeStaticPath(url.pathname)
  if (!filePath) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Forbidden')
    return
  }
  try {
    const info = await stat(filePath)
    if (!info.isFile()) throw new Error('not-file')
    const body = await readFile(filePath)
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    })
    response.end(body)
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Not Found')
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || `127.0.0.1:${port}`}`)
  try {
    if (url.pathname.startsWith('/api/')) await proxyApi(request, response, url)
    else await serveStatic(response, url)
  } catch (error) {
    console.error(`[preview] ${request.method} ${url.pathname}`, error)
    if (!response.headersSent) response.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' })
    response.end(JSON.stringify({ error: '本地预览代理暂时无法连接旧后端' }))
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`✓ 暨了么本地预览：http://127.0.0.1:${port}/`)
  console.log(`✓ 旧接口代理：/api/* → ${apiTarget}`)
})
