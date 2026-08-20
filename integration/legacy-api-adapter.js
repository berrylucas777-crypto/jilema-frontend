/*
 * 暨了么旧接口兼容层
 *
 * 目的：让新前端只依赖稳定的页面模型，不直接依赖旧 Flask 返回字段。
 * 旧接口字段变化时优先修改这里，不要把兼容判断散落到 UI 组件中。
 *
 * 启用方式：
 *   ?apiMode=legacy
 *   ?apiMode=legacy&apiBase=https://jilema.match-lab.cn
 *
 * 默认仍使用 Demo 数据，避免 GitHub Pages、离线文件和设计评审被网络状态影响。
 */
(function installJilemaLegacyApi(global) {
  'use strict'

  const QUERY_MODE = 'apiMode'
  const QUERY_BASE = 'apiBase'
  const SESSION_KEY = 'jidian_session'

  function number(value, fallback) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  function text(value, fallback) {
    const normalized = value == null ? '' : String(value).trim()
    return normalized || fallback || ''
  }

  function list(value) {
    if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean)
    if (typeof value !== 'string' || !value.trim()) return []
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed.map(String).map((item) => item.trim()).filter(Boolean)
    } catch {}
    return value.split(/[、,，]/).map((item) => item.trim()).filter(Boolean)
  }

  function timestampLabel(value) {
    const raw = number(value, 0)
    if (!raw) return '时间待补'
    const milliseconds = raw > 10_000_000_000 ? raw : raw * 1000
    try {
      return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' }).format(new Date(milliseconds))
    } catch {
      return '时间待补'
    }
  }

  function parseSessionToken(storage) {
    try {
      const raw = storage?.getItem?.(SESSION_KEY)
      if (!raw) return ''
      return text(JSON.parse(raw)?.token)
    } catch {
      return ''
    }
  }

  function normalizeBase(rawBase, locationLike) {
    const fallback = locationLike?.origin && locationLike.origin !== 'null' ? locationLike.origin : ''
    const value = text(rawBase, fallback).replace(/\/+$/, '')
    if (!value) return ''
    try {
      const url = new URL(value, fallback || 'http://localhost')
      if (!['http:', 'https:'].includes(url.protocol)) return fallback.replace(/\/+$/, '')
      return url.origin === 'http://localhost' && !rawBase ? '' : url.href.replace(/\/+$/, '')
    } catch {
      return fallback.replace(/\/+$/, '')
    }
  }

  function postSection(category) {
    const value = text(category)
    if (/吐槽|吐个槽/.test(value)) return 'rant'
    if (/活动|组局|找人|匹配/.test(value)) return 'event'
    if (/求|问答|问题|咨询/.test(value)) return 'question'
    return 'campus'
  }

  function postMeta(record) {
    if (record.linked_material_id || record.material_file_name || record.help_status === 'material_submitted') return '资料贡献'
    const section = postSection(record.category)
    if (section === 'question') return text(record.category, '校园问答')
    if (section === 'rant') return '校园吐槽'
    if (section === 'event') return '校园活动'
    return text(record.category, '校园生活')
  }

  function normalizePost(record) {
    const id = `legacy-post-${number(record.id, 0)}`
    const title = text(record.title)
    const body = text(record.content, '内容待补')
    const author = text(record.nickname, record.is_anonymous ? '暨大匿名同学' : '暨了么同学')
    const section = postSection(record.category)
    return {
      id,
      legacyId: number(record.id, 0),
      authorId: `legacy-user-${text(record.user_id, 'anonymous')}`,
      author,
      avatar: author.slice(0, 1) || '暨',
      avatarUrl: text(record.avatar_url),
      college: text(record.college, '学院信息待补'),
      title: title || postMeta(record),
      body,
      meta: postMeta(record),
      feedSection: section,
      hasCustomTitle: Boolean(title),
      replyCount: number(record.comment_count, 0),
      reactionCount: number(record.like_count, 0),
      viewCount: number(record.view_count, 0),
      time: timestampLabel(record.created_at),
      owned: false,
      isAnonymous: Boolean(record.is_anonymous),
      linkedMaterial: record.linked_material_id ? {
        id: number(record.linked_material_id, 0),
        fileName: text(record.material_file_name, '关联资料'),
        type: text(record.material_type, '资料'),
        linkType: text(record.link_type),
        linkUrl: text(record.link_url),
      } : null,
      previews: Array.isArray(record.comment_previews) ? record.comment_previews.map((comment) => ({
        id: number(comment.id, 0),
        author: text(comment.nickname, '暨了么同学'),
        body: text(comment.content),
        likes: number(comment.likes, 0),
        replies: number(comment.reply_count, 0),
      })) : [],
    }
  }

  function normalizeReview(record, index) {
    return {
      id: `legacy-review-${number(record.id, index + 1)}`,
      author: text(record.nickname, '校友评价'),
      teacher: text(record.teacher),
      time: timestampLabel(record.created_at),
      rating: number(record.rating, 0),
      exam: text(record.exam_mode),
      grade: text(record.score_style),
      attendance: text(record.daily_weight),
      groupWork: text(record.group_work),
      content: text(record.content, '评价内容待补'),
      tags: list(record.intel_tags),
      likes: number(record.likes, 0),
      comments: 0,
      kinds: [],
    }
  }

  function normalizeCourses(courseRows, metaByCourse, reviewsByCourse) {
    const groups = new Map()
    ;(Array.isArray(courseRows) ? courseRows : []).forEach((row) => {
      const name = text(row.course)
      if (!name) return
      const current = groups.get(name) || { rows: [], commentCount: 0, tags: new Set() }
      current.rows.push(row)
      current.commentCount = Math.max(current.commentCount, number(row.comment_count, 0))
      list(row.tags).forEach((tag) => current.tags.add(tag))
      groups.set(name, current)
    })

    return [...groups.entries()].map(([name, group], courseIndex) => {
      const meta = metaByCourse?.[name] || {}
      const rawReviews = Array.isArray(reviewsByCourse?.[name]) ? reviewsByCourse[name] : []
      const reviews = rawReviews.map(normalizeReview)
      const teacherNames = [...new Set(group.rows.map((row) => text(row.teacher)).filter(Boolean))]
      const rating = meta.rating_avg == null ? null : number(meta.rating_avg, null)
      const ratingCount = number(meta.rating_count, 0)
      const fallbackTeacher = teacherNames[0] || '老师信息待补'
      const teachers = (teacherNames.length ? teacherNames : [fallbackTeacher]).map((teacher) => {
        const teacherReviews = reviews.filter((review) => !review.teacher || review.teacher === teacher)
        const teacherRatings = teacherReviews.map((review) => review.rating).filter((score) => score > 0)
        const teacherRating = teacherRatings.length
          ? teacherRatings.reduce((sum, score) => sum + score, 0) / teacherRatings.length
          : rating
        return {
          name: teacher,
          rating: teacherRating,
          ratingCount: teacherRatings.length || ratingCount,
          exam: teacherReviews.find((review) => review.exam)?.exam || '暂未补充',
          grade: teacherReviews.find((review) => review.grade)?.grade || '暂未补充',
          attendance: teacherReviews.find((review) => review.attendance)?.attendance || '暂未补充',
          groupWork: teacherReviews.find((review) => review.groupWork)?.groupWork || '暂未补充',
        }
      })
      const firstTeacher = teachers[0]
      const credits = number(meta.credits, 0)
      const school = text(meta.major_hint, '学院信息待补')
      const categoryLabel = text(meta.subject_group, '课程类型待补')
      const aiTags = list(meta.ai_tags)
      const tags = [...new Set([...group.tags, ...aiTags])].slice(0, 6)
      return {
        id: `legacy-course-${courseIndex + 1}`,
        course: name,
        displayTeacher: teacherNames.length > 1 ? `${fallbackTeacher}等 ${teacherNames.length} 位老师` : fallbackTeacher,
        category: /通识|公共|体育|语言/.test(categoryLabel) ? 'general' : 'professional',
        categoryLabel,
        credits: credits ? `${credits} 学分` : '学分待补',
        school,
        major: '专业信息待补',
        commentCount: Math.max(group.commentCount, reviews.length),
        rating,
        ratingCount,
        aiScore: meta.ai_score == null ? null : number(meta.ai_score, null),
        aiConfidence: number(meta.ai_confidence, 0),
        exam: firstTeacher.exam,
        grade: firstTeacher.grade,
        attendance: firstTeacher.attendance,
        groupWork: firstTeacher.groupWork,
        tags,
        summary: text(meta.ai_summary, reviews.length ? '以下信息来自旧系统中的公开课程评价。' : '这门课的结构化情报仍待同学补充。'),
        teachers,
        reviews,
        recaps: [],
      }
    })
  }

  function normalizeMaterial(record) {
    const id = `legacy-material-${number(record.id, 0)}`
    const fileName = text(record.file_name)
    const course = text(record.course, '未知课程')
    return {
      id,
      legacyId: number(record.id, 0),
      title: fileName || `${course} ${text(record.material_type, '学习资料')}`,
      course,
      college: text(record.college, '学院信息待补'),
      teacher: text(record.teacher, '老师信息待补'),
      year: text(record.exam_year, '年份待补'),
      term: text(record.semester, '学期待补'),
      examType: text(record.exam_type, '考试类型待补'),
      type: text(record.material_type, '学习资料'),
      answer: text(record.has_answer, '答案情况待补'),
      format: fileName.includes('.') ? fileName.split('.').pop().toUpperCase() : text(record.link_type, '文件'),
      size: number(record.file_size, 0),
      pages: number(record.page_count, 0),
      downloads: number(record.download_count, 0),
      uploader: text(record.uploader_name, '暨了么同学'),
      review: text(record.trust_level, record.status === 'ok' ? '已审核' : '用户上传待确认'),
      status: record.status === 'ok' ? 'active' : 'pending',
      description: text(record.description, record.source_note || fileName || '资料说明待补'),
      downloadPath: `/api/materials/${number(record.id, 0)}/download`,
    }
  }

  function createClient(options) {
    const fetchImpl = options?.fetchImpl || global.fetch?.bind(global)
    const locationLike = options?.location || global.location
    const params = new URLSearchParams(locationLike?.search || '')
    const mode = text(options?.mode, params.get(QUERY_MODE) || 'demo')
    const apiBase = normalizeBase(options?.apiBase || params.get(QUERY_BASE), locationLike)
    const storage = options?.storage || global.localStorage
    const token = text(options?.token, parseSessionToken(storage))

    async function request(path, init) {
      if (!fetchImpl) throw new Error('当前环境不支持网络请求')
      const headers = new Headers(init?.headers || {})
      headers.set('Accept', 'application/json')
      if (token) headers.set('X-Token', token)
      const response = await fetchImpl(`${apiBase}${path}`, { ...init, headers })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        const error = new Error(text(payload.error, `接口请求失败（${response.status}）`))
        error.status = response.status
        error.payload = payload
        throw error
      }
      return response.json()
    }

    async function loadReviews(courseNames) {
      const entries = await Promise.all(courseNames.slice(0, 8).map(async (course) => {
        try {
          return [course, await request(`/api/comments?course=${encodeURIComponent(course)}`)]
        } catch {
          return [course, []]
        }
      }))
      return Object.fromEntries(entries)
    }

    async function loadSnapshot(optionsForLoad) {
      const campus = text(optionsForLoad?.campus, 'zhuhai')
      const limit = Math.max(1, Math.min(30, number(optionsForLoad?.postLimit, 12)))
      const [postsResult, statsResult, coursesResult, metaResult, materialsResult] = await Promise.allSettled([
        request(`/api/posts?sort=new&limit=${limit}`),
        request('/api/jile/today-stats'),
        request('/api/courses'),
        request('/api/course-meta'),
        request(`/api/materials?campus=${encodeURIComponent(campus)}`),
      ])
      const courseRows = coursesResult.status === 'fulfilled' && Array.isArray(coursesResult.value) ? coursesResult.value : []
      const reviewNames = [...new Set(courseRows.slice(0, 8).map((item) => text(item.course)).filter(Boolean))]
      const reviewsByCourse = await loadReviews(reviewNames)
      return {
        source: 'legacy-api',
        partial: [postsResult, statsResult, coursesResult, metaResult, materialsResult].some((result) => result.status === 'rejected'),
        posts: postsResult.status === 'fulfilled' ? (postsResult.value.posts || []).map(normalizePost) : [],
        stats: statsResult.status === 'fulfilled' ? statsResult.value : null,
        courses: normalizeCourses(
          courseRows,
          metaResult.status === 'fulfilled' ? metaResult.value : {},
          reviewsByCourse,
        ),
        materials: materialsResult.status === 'fulfilled' ? materialsResult.value.map(normalizeMaterial) : [],
      }
    }

    return Object.freeze({
      enabled: mode === 'legacy',
      mode,
      apiBase,
      hasToken: Boolean(token),
      request,
      loadSnapshot,
    })
  }

  global.JilemaLegacyApi = Object.freeze({
    createClient,
    normalizePost,
    normalizeCourses,
    normalizeMaterial,
  })
})(typeof window === 'undefined' ? globalThis : window)
