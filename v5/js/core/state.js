/* ============================================
   网文写作助手 v5 - 状态管理
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
    currentBook: null,
    books: [],
    bookFilter: 'all',

    // 人物卡
    characters: [],
    selectedCharacter: null,
    newCharactersDetected: [],
    showCharacterPanel: false,
    
    // 码字日历数据
    writingCalendar: {},
    currentCalendarMonth: new Date()
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

// 格式化字数显示
export function formatWordCount(count) {
    if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万';
    }
    return count.toLocaleString();
}

// 格式化时间显示
export function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 30) return `${days}天前`;
    return date.toLocaleDateString();
}
