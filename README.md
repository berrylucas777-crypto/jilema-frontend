# 暨了么前端（当前默认版本）

> **状态：现阶段确定版 / 当前默认前端 / 最高参考优先级**

这是暨了么现阶段已经确认的移动端前端 Demo。产品、设计、开发和 AI Agent 在讨论后续页面、迁移旧功能或实现正式前端时，应优先以本仓库的页面结构、视觉语言和交互方式为参考。

## 快速查看

- 在线预览：<https://berrylucas777-crypto.github.io/jilema-frontend/>
- 默认进入“我的”：<https://berrylucas777-crypto.github.io/jilema-frontend/?mainTab=profile>
- 本地直接打开：`index.html`

## 当前范围

- 暨了么论坛与问答
- 二手集市：出售、求购、租借、赠送、搜索、分类、收藏、详情与发布
- 校园拼车：找车、有车、跨校区、常用路线、同行申请与行程发布雏形
- 校园跑腿：取送、代办、搬运、接单状态与任务发布雏形
- 选课备考：通过“选课 / 备考”顶部开关切换；选课页支持学院、专业、课程和老师四级目录
- 我的：内容记录、积分、设置与联系我们
- MatchLab 匹配和组局（收敛在“我的 → 校园功能”）
- 发帖、评论、收藏、通知及各类二级交互 Demo

当前底部导航固定为：`暨了么 / 选课备考 / 通知 / 我的`，全局发布按钮位于四个入口正中间，通知位于发布按钮右侧。二手集市、校园拼车、校园跑腿和 MatchLab 均从“我的 → 校园功能”进入。

## 版本规则

1. `index.html` 是可以直接预览的构建产物，也是 GitHub Pages 的入口。
2. `template.html` 是页面源码；修改后运行 `npm run build` 生成新的 `index.html`。
3. 每次确立新的默认前端版本，都必须同步更新 [`CURRENT_FRONTEND.md`](./CURRENT_FRONTEND.md)。
4. 未经产品确认的探索方案应放在其他分支或独立实验目录，不直接替换默认版本。

## 本地验证

```bash
npm run check
npm run dev
```

然后访问 <http://127.0.0.1:4174/>。

## 旧系统接口兼容模式

当前确认版默认继续使用确定性的 Demo 数据，便于产品评审。需要核对旧 `jidian` 后端真实数据时，使用：

```text
http://127.0.0.1:4174/?mainTab=feed&apiMode=legacy
```

- `integration/legacy-api-adapter.js` 统一把旧 Flask 字段转换为新页面模型。
- `docs/LEGACY_FRONTEND_MIGRATION.md` 说明接口对照、迁移边界和后续批次。
- 兼容模式读取失败时自动保留 Demo 数据，不阻塞设计评审。
- `npm run dev` 会把本地 `/api/*` 转发到旧后端，避免浏览器跨域拦截；如需测试环境，可设置 `JILEMA_API_TARGET`。
- 当前只接只读接口；发布、回复、点赞、收藏和上传等写操作应逐页验收后再接入。
