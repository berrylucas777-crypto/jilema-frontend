# 暨了么前端（当前默认版本）

> **状态：现阶段确定版 / 当前默认前端 / 最高参考优先级**

这是暨了么现阶段已经确认的移动端前端 Demo。产品、设计、开发和 AI Agent 在讨论后续页面、迁移旧功能或实现正式前端时，应优先以本仓库的页面结构、视觉语言和交互方式为参考。

## 快速查看

- 在线预览：<https://berrylucas777-crypto.github.io/jilema-frontend/>
- 默认进入“我的”：<https://berrylucas777-crypto.github.io/jilema-frontend/?mainTab=profile>
- 本地直接打开：`index.html`

## 当前范围

- 暨了么论坛与问答
- MatchLab 匹配和组局
- 课程：选课评价与历年真题
- 我的：内容记录、积分、设置与联系我们
- 发帖、评论、收藏、通知及各类二级交互 Demo

## 版本规则

1. `index.html` 是可以直接预览的构建产物，也是 GitHub Pages 的入口。
2. `template.html` 是页面源码；修改后运行 `npm run build` 生成新的 `index.html`。
3. 每次确立新的默认前端版本，都必须同步更新 [`CURRENT_FRONTEND.md`](./CURRENT_FRONTEND.md)。
4. 未经产品确认的探索方案应放在其他分支或独立实验目录，不直接替换默认版本。

## 本地验证

```bash
npm run build
npm run validate
python3 -m http.server 4174
```

然后访问 <http://127.0.0.1:4174/>。

