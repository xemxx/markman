# TODO

1. 编辑器主题与ui主题统一
2. 自动同步服务与设置（可能要拆分设置和主页面多入口，主要是初始化流程）
3. 侧边栏持续优化，支持多选，键盘快捷键删除，颜色优化

# 已知问题

1. 初始化逻辑可能隐藏bug（主页面和设置页都运行了）
2. 重命名文件夹时没有展示原有名称到输入框
3. 点击搜索按钮切换控制台报错

# v0.4.2

**Bugfix**

1. 修复添加目录永远在根目录的问题

# v0.4.1

**Bugfix**

1. 修复登录后无法正常同步数据的问题

# v0.4.0

**Features**

1. 重构登录页面
   1. 支持本地缓存远端地址以及校验远端健康
2. 重构编辑页siderbar
   1. 笔记本与笔记组织方式调整为树状结构，允许无级嵌套与随意组合
   2. 创建新文件时自动选中新的文件项并且跳转
3. 切换编辑器到milkdown
4. 更新electron36

**Bugfix**

1. 修复切换编辑器历史记录不清空的问题

**Problems**

1. 设置页面在未登录时无法打开

## v0.3.1

**BugFix**

修复windows构建包无法打开的问题

## v0.3.0

**本次升级修改数据结构，需服务端先升级v0.2.0及以上，不可回退，需谨慎**

**Features**

1. 支持服务器地址修改后维持账号数据（通过新增用户uuid实现，不再校验服务器地址）
2. 支持自动保存时间无极调整
3. 支持搜索笔记（包括笔记内容）
4. 更新依赖
   1. vue3
   2. vite5
   3. electron31
   4. ant-design-vue4
   5. uuid9
   6. vuex4->pinia2
5. 模板替换为 vite + ts +electron 提升开发体验

**Bugfix**

1. 反复按保存可能出现同步冲突
2. 修改后点击保存可能出现修改回滚的情况
3. 修复断网或者服务端不可用时偶现的白屏问题

## v0.2.5

**Features**

1. 更新到 vite 开发模板
2. 更新到 Electron 25

**Bugfix**

1. 修复了启动时不自动同步的问题
2. 修复了windows下菜单栏异常的问题

**Problems**

1. 反复按保存可能出现同步冲突
2. linux 下快捷键操作菜单，菜单无法自动切换状态

## v0.2.4

**Features**

1. 更新到Vue.js 3.0
2. 更新到Electron 12
3. 登录页面更新

**Bugfix**

1. 修复了在新设备上可能出现同步一直失败的问题
2. 修复了windows和linux下不能打开设置窗口的问题

**Problems**

1. 反复按保存可能出现同步冲突
