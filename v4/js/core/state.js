/* ============================================
   网文写作助手 v4 - 状态管理
   ============================================ */

// 全局状态
export const state = {
    // 行标记
    lineMarks: {},
    currentMarkLine: null,
    selectedMarkType: 'todo',
    currentHoverLine: null,

    // 章节状态
    currentChapter: 15,
    isDirty: false,
    originalContent: '',
    pendingChapter: null,
    wordCountAtOpen: 0,

    // 卡文检测
    lastInputTime: Date.now(),
    isBlockModalShown: false,

    // 日更
    dailyGoal: 4000,
    todayWordCount: 0,
    lastSaveDate: '',

    // DOM引用
    editor: null,
    editorContent: null,

    // 章节目录结构
    volumes: [],
    nextChapterId: 17,
    nextVolumeId: 3,
    currentVolumeId: 1,

    // 工作台
    currentBook: null, // 当前选中的作品
    books: [], // 作品列表
    workshopView: 'list', // 视图模式：list / grid
    bookFilter: 'all', // 筛选条件：all / ongoing / completed / draft

    // 人物卡
    characters: [], // 当前书籍的人物列表
    selectedCharacter: null, // 当前选中的人物
    newCharactersDetected: [], // 检测到的新人物
    showCharacterPanel: false // 是否显示人物详情面板
};

// 字数统计
export function countWords(text) {
    if (!text || text.trim().length === 0) return 0;
    const cnChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const enWords = (text.match(/[a-zA-Z]+/g) || []).length;
    const numbers = (text.match(/\d+/g) || []).length;
    return cnChars + enWords + numbers;
}

// 获取鼠标位置对应的行号
export function getLineFromMouseEvent(e) {
    const textarea = state.editor;
    const rect = textarea.getBoundingClientRect();
    const scrollTop = textarea.scrollTop;
    const relativeY = e.clientY - rect.top + scrollTop;
    const lineHeight = 28.8;
    const lineNumber = Math.floor(relativeY / lineHeight) + 1;
    const totalLines = textarea.value.split('\n').length;
    return Math.max(1, Math.min(lineNumber, totalLines));
}
