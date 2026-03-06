/* ============================================
   网文写作助手 v5 - 存储模块
   ============================================ */

import { STORAGE_KEYS } from '../utils/constants.js';

// 基础存储操作
export function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.warn('Storage failed:', e);
        return false;
    }
}

export function loadFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.warn('Load failed:', e);
        return defaultValue;
    }
}

// 章节内容存储
export function saveChapterContent(chapterId, content) {
    saveToStorage(STORAGE_KEYS.CHAPTER_CONTENT + chapterId, content);
}

export function loadChapterContent(chapterId) {
    return loadFromStorage(STORAGE_KEYS.CHAPTER_CONTENT + chapterId, '');
}

// 行标记存储
export function saveLineMarks(chapterId, marks) {
    saveToStorage(STORAGE_KEYS.LINE_MARKS + chapterId, marks);
}

export function loadLineMarks(chapterId) {
    return loadFromStorage(STORAGE_KEYS.LINE_MARKS + chapterId, {});
}

// 日更目标存储
export function saveDailyGoal(goal) {
    saveToStorage(STORAGE_KEYS.DAILY_GOAL, goal);
}

export function loadDailyGoal() {
    return loadFromStorage(STORAGE_KEYS.DAILY_GOAL, 4000);
}

// 日更进度存储
export function saveDailyProgress(progress) {
    saveToStorage(STORAGE_KEYS.DAILY_PROGRESS, progress);
}

export function loadDailyProgress() {
    return loadFromStorage(STORAGE_KEYS.DAILY_PROGRESS, 0);
}

// 最后保存日期
export function saveLastDate(date) {
    saveToStorage(STORAGE_KEYS.LAST_SAVE_DATE, date);
}

export function loadLastDate() {
    return loadFromStorage(STORAGE_KEYS.LAST_SAVE_DATE, '');
}

// 作品数据存储
export function saveBooks(books) {
    saveToStorage(STORAGE_KEYS.BOOKS, books);
}

export function loadBooks() {
    const defaultBooks = [
        {
            id: 1,
            title: '至尊龙婿',
            genre: 'urban',
            genreName: '都市女婿',
            status: 'ongoing',
            cover: null,
            totalChapters: 15,
            totalWords: 450000,
            todayWords: 2340,
            lastUpdated: new Date().toISOString(),
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            targetWords: 1000000,
            summary: '一代龙王回归都市，却发现妻子被人欺辱...'
        }
    ];
    return loadFromStorage(STORAGE_KEYS.BOOKS, defaultBooks);
}

// 当前选中作品
export function saveCurrentBook(bookId) {
    saveToStorage(STORAGE_KEYS.CURRENT_BOOK, bookId);
}

export function loadCurrentBook() {
    return loadFromStorage(STORAGE_KEYS.CURRENT_BOOK, null);
}

// 人物数据存储
export function saveCharacters(bookId, characters) {
    saveToStorage(STORAGE_KEYS.CHARACTERS + bookId, characters);
}

export function loadCharacters(bookId) {
    const defaultCharacters = [
        {
            id: 1,
            name: '林尘',
            role: 'protagonist',
            roleName: '主角',
            gender: '男',
            age: '28',
            appearance: '身高185，剑眉星目，气质冷峻',
            personality: '隐忍、护短、重情义',
            background: '隐藏身份的龙王殿主，因故入赘苏家',
            relationships: [
                { characterId: 2, type: '妻子', desc: '深爱并保护着她' },
                { characterId: 3, type: '岳母', desc: '表面恭敬，内心厌恶' }
            ],
            quotes: '我林尘的人，谁都不能动！',
            notes: '标志性动作：整理袖口',
            firstAppearChapter: 1
        },
        {
            id: 2,
            name: '苏清雪',
            role: 'supporting',
            roleName: '女主',
            gender: '女',
            age: '25',
            appearance: '清冷如仙，气质高雅',
            personality: '外冷内热、善良坚强',
            background: '苏家千金，被迫与林尘结婚',
            relationships: [
                { characterId: 1, type: '丈夫', desc: '逐渐发现他的不凡' },
                { characterId: 3, type: '母亲', desc: '关系复杂' }
            ],
            quotes: '不管怎样，我都会站在你身边',
            notes: '擅长古筝',
            firstAppearChapter: 1
        },
        {
            id: 3,
            name: '王美凤',
            role: 'antagonist',
            roleName: '反派',
            gender: '女',
            age: '50',
            appearance: '珠光宝气，面相刻薄',
            personality: '势利、贪婪、欺软怕硬',
            background: '苏清雪的母亲，看不起林尘',
            relationships: [
                { characterId: 1, type: '女婿', desc: '极度嫌弃，想要赶走' },
                { characterId: 2, type: '女儿', desc: '控制欲强' }
            ],
            quotes: '你一个废物，也配得上我女儿？',
            notes: '最怕有权有势的人',
            firstAppearChapter: 5
        }
    ];
    return loadFromStorage(STORAGE_KEYS.CHARACTERS + bookId, defaultCharacters);
}

// 卷和章节结构存储 - 按书籍ID分开存储
export function saveVolumes(bookId, volumes) {
    saveToStorage(STORAGE_KEYS.VOLUMES + bookId, volumes);
}

// 示例书籍的章节数据（书籍ID=1）
const defaultVolumesForDemo = [
    {
        id: 1,
        name: '第一卷：觉醒',
        chapters: [
            { id: 1, title: '龙王归来', wordCount: 3500 },
            { id: 2, title: '离婚协议', wordCount: 4200 },
            { id: 3, title: '身份暴露', wordCount: 3800 },
            { id: 14, title: '宴会邀请', wordCount: 4100 },
            { id: 15, title: '打脸丈母娘', wordCount: 0 },
            { id: 16, title: '宴会风波', wordCount: 0 }
        ]
    },
    {
        id: 2,
        name: '第二卷：崛起',
        chapters: [
            { id: 25, title: '待添加', wordCount: 0 }
        ]
    }
];

export function loadVolumes(bookId) {
    // 示例书籍（id=1）总是返回默认章节数据（避免LocalStorage中的错误数据）
    if (bookId === 1 || bookId === '1') {
        return JSON.parse(JSON.stringify(defaultVolumesForDemo));
    }
    // 其他书籍从LocalStorage读取，如果没有数据返回null
    return loadFromStorage(STORAGE_KEYS.VOLUMES + bookId, null);
}

// 创建默认的卷和章节结构
export function createDefaultVolumes() {
    return [
        {
            id: 1,
            name: '第一卷',
            chapters: [
                { id: 1, title: '第一章', wordCount: 0 }
            ]
        }
    ];
}

// 码字日历数据
export function saveWritingCalendar(calendar) {
    saveToStorage(STORAGE_KEYS.WRITING_CALENDAR, calendar);
}

export function loadWritingCalendar() {
    return loadFromStorage(STORAGE_KEYS.WRITING_CALENDAR, {});
}

// 下一个章节ID
export function saveNextChapterId(id) {
    saveToStorage(STORAGE_KEYS.NEXT_CHAPTER_ID, id);
}

export function loadNextChapterId() {
    return loadFromStorage(STORAGE_KEYS.NEXT_CHAPTER_ID, 17);
}
