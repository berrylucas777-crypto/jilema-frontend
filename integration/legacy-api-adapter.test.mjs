import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const source = readFileSync(new URL('./legacy-api-adapter.js', import.meta.url), 'utf8')
const context = vm.createContext({
  URL,
  URLSearchParams,
  Headers,
  Intl,
  Date,
  console,
})
vm.runInContext(source, context)

const api = context.JilemaLegacyApi
assert.ok(api, '兼容层必须导出 JilemaLegacyApi')

const post = api.normalizePost({
  id: 518,
  user_id: 668,
  nickname: '66',
  college: '化学与材料学院',
  category: '求资料',
  content: '求材料科学基础期末真题',
  comment_count: 2,
  like_count: 3,
})
assert.equal(post.id, 'legacy-post-518')
assert.equal(post.feedSection, 'question')
assert.equal(post.author, '66')
assert.equal(post.replyCount, 2)

const courses = api.normalizeCourses(
  [
    { course: '大学计算机基础', teacher: '王勇杰', tags: ['给分高'], comment_count: 37 },
    { course: '大学计算机基础', teacher: '李老师', tags: ['闭卷'], comment_count: 37 },
  ],
  {
    大学计算机基础: {
      credits: 2,
      subject_group: '公共基础课',
      major_hint: '信息科学技术学院',
      rating_avg: 4.6,
      rating_count: 31,
      ai_summary: '真实评价已聚合。',
    },
  },
  { 大学计算机基础: [] },
)
assert.equal(courses.length, 1)
assert.equal(courses[0].teachers.length, 2)
assert.equal(courses[0].school, '信息科学技术学院')
assert.equal(courses[0].credits, '2 学分')

const material = api.normalizeMaterial({
  id: 2427,
  course: '习概',
  file_name: '习概复习指南.doc',
  material_type: '历年真题',
  status: 'ok',
})
assert.equal(material.id, 'legacy-material-2427')
assert.equal(material.format, 'DOC')
assert.equal(material.downloadPath, '/api/materials/2427/download')

const responses = new Map([
  ['/api/posts?sort=new&limit=1', { posts: [{ id: 1, category: '求资料', content: '资料' }] }],
  ['/api/jile/today-stats', { post_count: 1 }],
  ['/api/courses', []],
  ['/api/course-meta', {}],
  ['/api/materials?campus=zhuhai', []],
])
const client = api.createClient({
  mode: 'legacy',
  apiBase: 'https://example.test',
  location: { search: '', origin: 'https://example.test' },
  storage: { getItem: () => JSON.stringify({ token: 'token-1' }) },
  fetchImpl: async (url, init) => {
    const path = new URL(url).pathname + new URL(url).search
    assert.equal(init.headers.get('X-Token'), 'token-1')
    return {
      ok: true,
      json: async () => responses.get(path),
    }
  },
})
const snapshot = await client.loadSnapshot({ campus: 'zhuhai', postLimit: 1 })
assert.equal(client.enabled, true)
assert.equal(snapshot.posts.length, 1)
assert.equal(snapshot.stats.post_count, 1)

console.log('✓ 旧接口兼容层测试通过')
