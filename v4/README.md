# 网文写作助手 v4

## 架构概述

v4 版本采用模块化架构设计，将功能拆分为独立的模块，提高代码可维护性和 AI 读取效率。

## 目录结构

```
v4/
├── index.html              # 入口文件，HTML 结构
├── css/
│   ├── base.css           # 基础样式：CSS变量、重置样式、工具类
│   ├── layout.css         # 布局样式：主布局、侧边栏、面板
│   └── components/        # 组件样式
│       ├── editor.css     # 编辑器组件
│       ├── sidebar.css    # 侧边栏组件
│       ├── panels.css     # AI面板、设置面板
│       ├── modals.css     # 弹窗组件
│       └── onboarding.css # 引导流程
└── js/
    ├── core/              # 核心模块
    │   ├── app.js         # 应用主入口
    │   ├── storage.js     # 本地存储管理
    │   └── state.js       # 状态管理
    ├── modules/           # 功能模块
    │   ├── editor.js      # 编辑器核心
    │   ├── lineMark.js    # 行标记功能
    │   ├── dailyGoal.js   # 日更目标
    │   ├── autoSave.js    # 自动保存
    │   ├── blockDetection.js # 卡文检测
    │   ├── aiPanel.js     # AI面板
    │   ├── chapterManager.js # 章节管理
    │   └── onboarding.js  # 引导流程
    └── utils/             # 工具函数
        ├── constants.js   # 常量定义
        └── helpers.js     # 通用辅助函数
```

## 模块说明

### 核心模块 (core/)

- **app.js**: 应用主入口，负责初始化所有模块，绑定全局事件
- **storage.js**: 封装 localStorage 操作，提供各种存储对象的读写方法
- **state.js**: 集中式状态管理，支持订阅状态变化

### 功能模块 (modules/)

每个功能模块独立管理自己的状态和逻辑，通过事件系统与其他模块通信：

- **editor.js**: 编辑器核心功能，包括内容编辑、字数统计、键盘快捷键
- **lineMark.js**: 行标记功能，鼠标悬停显示按钮，点击添加标记
- **dailyGoal.js**: 日更目标设置和进度追踪
- **autoSave.js**: 自动保存功能，定期保存和页面关闭前保存
- **blockDetection.js**: 卡文检测，长时间无输入时提示帮助
- **aiPanel.js**: AI 面板，结构分析、情绪曲线、模板推荐
- **chapterManager.js**: 章节管理，卷/章 CRUD 操作
- **onboarding.js**: 引导流程，5步引导新用户

### 工具模块 (utils/)

- **constants.js**: 常量定义，包括存储键名、默认配置、标记类型、模板数据
- **helpers.js**: 通用辅助函数，防抖节流、字数统计、DOM 操作等

## 状态管理

采用集中式状态管理，所有模块通过 `state.js` 读写状态：

```javascript
// 读取状态
import { getState } from './core/state.js';
const content = getState('editorContent');

// 设置状态
import { setState } from './core/state.js';
setState('editorContent', newContent);

// 订阅状态变化
import { subscribe } from './core/state.js';
const unsubscribe = subscribe('editorContent', (newValue, key) => {
    console.log('内容变化:', newValue);
});
```

## 事件系统

模块间通过自定义事件通信：

```javascript
// 触发事件
document.dispatchEvent(new CustomEvent('editor:saved', {
    detail: { chapterId, wordCount }
}));

// 监听事件
document.addEventListener('editor:saved', (e) => {
    console.log('章节已保存:', e.detail);
});
```

## 存储结构

使用 localStorage 存储数据，键名前缀为 `novel_`：

- `novel_chapter_content_{id}`: 章节内容
- `novel_chapter_meta_{id}`: 章节元数据
- `novel_line_marks_{id}`: 行标记数据
- `novel_daily_goal`: 日更目标
- `novel_daily_progress`: 今日进度
- `novel_theme`: 主题设置
- `novel_onboarding_completed`: 引导完成状态

## 开发指南

### 添加新模块

1. 在 `js/modules/` 创建模块文件
2. 在 `app.js` 中导入并初始化
3. 将需要在 HTML 调用的方法挂载到 `window.App`

### 添加新样式

1. 在 `css/components/` 创建样式文件（如需要）
2. 在 `index.html` 中引入

### 修改现有功能

- 编辑器功能: 修改 `js/modules/editor.js`
- 行标记功能: 修改 `js/modules/lineMark.js`
- AI 功能: 修改 `js/modules/aiPanel.js`

## 与 v3 的功能对比

v4 完全对齐了 v3 的所有核心功能：

### 编辑功能
- ✅ 富文本编辑器（textarea）
- ✅ 字数统计（本章/新增）
- ✅ 自动保存（30秒间隔）
- ✅ 快捷键（Ctrl+S保存，Tab缩进，Ctrl+Shift+数字标记）
- ✅ 插入文本（标点符号、时间戳）
- ✅ 文本包装（加粗、斜体）

### 行标记功能
- ✅ 鼠标悬停显示 + 按钮
- ✅ 四种类别（待修改、疑问、灵感、问题）
- ✅ 标记列表面板
- ✅ 点击跳转对应行

### 日更目标
- ✅ 目标设置（弹窗）
- ✅ 进度追踪（自动计算）
- ✅ 完成提示
- ✅ 每日自动重置

### AI 功能
- ✅ AI 面板（诊断、模板、工具）
- ✅ 结构分析（起承转合）
- ✅ 模板推荐（6种经典结构）
- ✅ 模板详情弹窗
- ✅ 快捷工具（人名/地名生成）

### 章节管理
- ✅ 卷/章层级结构
- ✅ 章节切换（带保存提示）
- ✅ 新建章节/卷
- ✅ 未保存标记（dirty状态）

### 额外功能
- ✅ 专注模式（隐藏界面元素）
- ✅ 主题切换（浅色/深色）
- ✅ 随机名字生成（男名/女名/地名）
- ✅ 卡文检测（5分钟无输入提示）
- ✅ 卡文急救弹窗
- ✅ 导出章节
- ✅ 引导流程（5步 onboarding）

## 架构优势

1. **模块化**: 功能拆分为独立模块，每个文件职责单一
2. **状态管理**: 集中式状态管理，避免状态分散
3. **存储封装**: 存储操作统一封装，易于维护和迁移
4. **事件驱动**: 模块间通过事件通信，降低耦合
5. **代码分割**: CSS 拆分为多个文件，便于按需加载
6. **AI 友好**: 每个文件有明确的功能边界，便于 AI 理解和修改

## 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

使用 ES6 模块，需要现代浏览器支持。
