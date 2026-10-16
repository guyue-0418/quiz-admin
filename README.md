# Quiz 后台管理系统

Web 开发技术第五次课 10-16 作业：使用 Vue 2、Element UI 和 Vue Router 完成 Quiz 管理后台。

## 功能

- 用户管理：分页、按用户名查询、添加、编辑、删除
- 题目管理：分页、按关键词查询、添加、编辑、删除
- 表格、分页、弹窗和消息反馈使用 Element UI
- 默认连接 `http://localhost:8080` 的 Java 后端
- 后端不可用时自动切换到内置演示数据，保证 Vercel 线上可操作

## 技术栈

- Vue `2.6.14`
- Vue Router `3.5.1`
- Element UI `2.15.14`
- Axios
- Vue CLI `5`

## 本地运行

```bash
npm install
npm run serve
```

访问：

```text
http://localhost:7000/#/user
```

## 构建

```bash
npm run build
```

构建结果位于 `dist/`。Vercel 可使用仓库根目录部署，构建命令为 `npm run build`，输出目录为 `dist`。

课程文档建议使用 Node.js `16.19.1`，项目已提供 `.nvmrc`。当前环境使用更高版本 Node.js 也可以完成构建。

## 在线地址

- GitHub 仓库：https://github.com/guyue-0418/quiz-admin
- Vercel 地址：待填写

## Git 分支说明

- `main`：完整 Vue 源代码
- `dist`：`npm run build` 生成的静态构建产物

创建远程仓库后，将两个分支分别推送：

```bash
git push -u origin main
git push -u origin dist
```

Vercel 部署时选择 `dist` 分支，构建命令留空，输出目录设为 `.`；也可以选择 `main` 分支，让 Vercel 自动执行 `npm run build` 并输出 `dist`。

## 完成记录

- [x] 完成页面开发
- [ ] 推送 GitHub 仓库
- [ ] 完成 Vercel 部署
