/* ============================================
   网文写作助手 v5 - 工作台模块
   ============================================ */

import { state, formatWordCount, formatTimeAgo } from '../core/state.js';
import { saveBooks, loadBooks, saveCurrentBook, saveChapterContent, loadChapterContent } from '../core/storage.js';
import { showToast, updateWordCountDisplay } from '../utils/ui.js';
import { GENRES, BOOK_STATUS } from '../utils/constants.js';

// 初始化工作台
export function initWorkshop() {
    state.books = loadBooks();
    renderBookList();
    renderCalendar();
    updateTotalWords();
}

// 更新总字数
function updateTotalWords() {
    const totalWords = state.books.reduce((sum, book) => sum + book.totalWords, 0);
    const display = document.getElementById('totalWords');
    if (display) {
        display.textContent = formatWordCount(totalWords);
    }
}

// 渲染书籍列表
export function renderBookList() {
    const container = document.getElementById('bookListContainer');
    if (!container) return;

    let filteredBooks = state.books;
    if (state.bookFilter !== 'all') {
        filteredBooks = state.books.filter(book => book.status === state.bookFilter);
    }

    filteredBooks.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

    if (filteredBooks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-illustration">📖</div>
                <button class="btn-primary btn-large" onclick="showCreateBookModal()">去创作</button>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredBooks.map(book => {
        const genreInfo = GENRES[book.genre] || { name: '其他', icon: '📝' };
        const statusInfo = BOOK_STATUS[book.status] || { name: '未知', color: '#999' };
        const timeText = formatTimeAgo(book.lastUpdated);
        
        return `
            <div class="book-item" data-book-id="${book.id}" onclick="enterBook(${book.id})">
                <div class="book-cover">
                    <span>${book.title.charAt(0)}</span>
                </div>
                <div class="book-info">
                    <div class="book-header">
                        <span class="book-title">${book.title}</span>
                        <span class="book-status" style="background: ${statusInfo.color}15; color: ${statusInfo.color}">
                            ${statusInfo.name}
                        </span>
                    </div>
                    <div class="book-meta">
                        <span>${genreInfo.icon} ${genreInfo.name}</span>
                        <span>•</span>
                        <span>${book.totalChapters}章</span>
                        <span>•</span>
                        <span>${formatWordCount(book.totalWords)}</span>
                    </div>
                    <div class="book-stats">
                        <span class="book-today ${book.todayWords > 0 ? 'active' : ''}">
                            今日 +${formatWordCount(book.todayWords)}
                        </span>
                        <span class="book-time">${timeText}</span>
                    </div>
                </div>
                <div class="book-actions">
                    <button class="book-action-btn primary" onclick="event.stopPropagation(); enterBook(${book.id})">
                        继续写作
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// 渲染码字日历
export function renderCalendar() {
    const monthDisplay = document.getElementById('calendarMonth');
    const daysContainer = document.getElementById('calendarDays');
    if (!monthDisplay || !daysContainer) return;

    const year = state.currentCalendarMonth.getFullYear();
    const month = state.currentCalendarMonth.getMonth();
    
    monthDisplay.textContent = `${year}年${month + 1}月`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const firstDayWeek = firstDay.getDay() || 7;
    const daysInMonth = lastDay.getDate();
    const daysInPrevMonth = prevLastDay.getDate();

    let html = '';

    // 上月日期
    for (let i = firstDayWeek - 1; i > 0; i--) {
        const day = daysInPrevMonth - i + 1;
        html += `<div class="calendar-day other-month"><span class="calendar-day-number">${day}</span></div>`;
    }

    // 当月日期
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const wordCount = state.writingCalendar[dateKey] || 0;
        const hasWords = wordCount > 0;
        
        html += `
            <div class="calendar-day ${isToday ? 'today' : ''} ${hasWords ? 'has-words' : ''}">
                <span class="calendar-day-number">${day}</span>
                <span class="calendar-day-count">${hasWords ? formatWordCount(wordCount) : '0'}</span>
            </div>
        `;
    }

    // 下月日期
    const remainingCells = (7 - ((firstDayWeek - 1 + daysInMonth) % 7)) % 7;
    for (let day = 1; day <= remainingCells; day++) {
        html += `<div class="calendar-day other-month"><span class="calendar-day-number">${day}</span></div>`;
    }

    daysContainer.innerHTML = html;
}

// 进入书籍
export function enterBook(bookId) {
    const book = state.books.find(b => b.id === bookId);
    if (!book) return;

    state.currentBook = book;
    saveCurrentBook(bookId);
    
    // 更新编辑器信息
    const bookTitleEl = document.getElementById('editorBookTitle');
    const chapterTitleEl = document.getElementById('editorChapterTitle');
    const chapterInputEl = document.getElementById('chapterTitle');
    
    if (bookTitleEl) bookTitleEl.textContent = `《${book.title}》`;
    if (chapterTitleEl) chapterTitleEl.textContent = `第${book.totalChapters}章`;
    if (chapterInputEl) chapterInputEl.value = `第${book.totalChapters}章 `;
    
    state.currentChapter = book.totalChapters;

    // 切换到编辑器页面
    switchPage('editor');
    
    // 初始化编辑器
    initEditor();
}

// 切换到工作台
export function switchToWorkshop() {
    switchPage('workshop');
    initWorkshop();
}

// 页面切换
export function switchPage(pageName) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-item, .nav-subitem').forEach(item => item.classList.remove('active'));
    
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) targetPage.classList.add('active');
    
    // 更新导航状态
    if (pageName === 'workshop') {
        document.querySelector('[data-page="workshop"]')?.classList.add('active');
    }
}

// 导航分组展开/收起
export function toggleNavSection(header) {
    const section = header.closest('.nav-section');
    section.classList.toggle('expanded');
}

// 侧边栏标签切换
export function switchSidebarTab(tabName) {
    document.querySelectorAll('.sidebar-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.sidebar-panel').forEach(panel => panel.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    document.getElementById(`${tabName}Panel`)?.classList.add('active');
}

// 初始化编辑器
function initEditor() {
    const editor = document.getElementById('editor');
    if (!editor) return;

    state.editor = editor;
    
    // 加载章节内容
    const content = loadChapterContent(state.currentBook.id + '_' + state.currentChapter);
    editor.value = content;
    state.originalContent = content;
    state.wordCountAtOpen = updateWordCountDisplay();

    // 初始化事件
    initEditorEvents();
    initLineMarkEvents();
    
    // 加载标记
    loadChapterMarks(state.currentChapter);
    
    // 初始化人物卡
    initCharacterCards();
}

// 显示创建作品弹窗
export function showCreateBookModal() {
    const modal = document.getElementById('createBookModal');
    if (!modal) return;

    document.getElementById('newBookTitle').value = '';
    document.getElementById('newBookGenre').value = 'urban';
    document.getElementById('newBookSummary').value = '';
    document.getElementById('newBookTarget').value = '1000000';
    document.getElementById('aiSuggestions').innerHTML = '';

    modal.classList.add('active');
    setTimeout(() => document.getElementById('newBookTitle')?.focus(), 100);
}

// 关闭创建作品弹窗
export function closeCreateBookModal() {
    document.getElementById('createBookModal')?.classList.remove('active');
}

// 确认创建作品
export function confirmCreateBook() {
    const title = document.getElementById('newBookTitle')?.value?.trim();
    const genre = document.getElementById('newBookGenre')?.value || 'urban';
    const summary = document.getElementById('newBookSummary')?.value?.trim();
    const targetWords = parseInt(document.getElementById('newBookTarget')?.value) || 1000000;

    if (!title) {
        showToast('请输入书名');
        return;
    }

    if (state.books.some(b => b.title === title)) {
        showToast('该书名的作品已存在');
        return;
    }

    const newId = Math.max(...state.books.map(b => b.id), 0) + 1;

    const newBook = {
        id: newId,
        title: title,
        genre: genre,
        genreName: GENRES[genre]?.name || '其他',
        status: 'ongoing',
        cover: null,
        totalChapters: 1,
        totalWords: 0,
        todayWords: 0,
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        targetWords: targetWords,
        summary: summary || ''
    };

    state.books.push(newBook);
    saveBooks(state.books);
    saveChapterContent(`${newId}_1`, '');

    closeCreateBookModal();
    showToast(`《${title}》创建成功！`);
    enterBook(newId);
}

// AI生成书名建议
export function generateBookTitleSuggestions() {
    const genre = document.getElementById('newBookGenre')?.value || 'urban';
    const container = document.getElementById('aiSuggestions');
    
    const suggestions = {
        urban: ['至尊龙婿', '都市神医', '战神归来', '绝世赘婿', '第一狂婿'],
        fantasy: ['逆天邪神', '斗破苍穹', '武动乾坤', '大主宰', '完美世界'],
        romance: ['甜妻来袭', '总裁大人', '宠妻成瘾', '先婚后爱', '重生甜宠'],
        mystery: ['诡秘之主', '恐怖复苏', '我有一座冒险屋', '深夜书屋', '镇妖博物馆'],
        history: ['回到明朝当王爷', '唐砖', '赘婿', '庆余年', '雪中悍刀行'],
        scifi: ['三体', '流浪地球', '全球高武', '吞噬星空', '星门']
    };

    const titles = suggestions[genre] || suggestions.urban;
    
    container.innerHTML = `
        <div class="ai-suggestion-box">
            <div class="ai-suggestion-title">✨ AI 推荐书名</div>
            <div class="ai-suggestion-list">
                ${titles.map(title => `
                    <span class="ai-suggestion-item" onclick="useBookTitle('${title}')">${title}</span>
                `).join('')}
            </div>
        </div>
    `;
}

// 使用推荐书名
export function useBookTitle(title) {
    document.getElementById('newBookTitle').value = title;
}

// AI润色简介
export function polishBookSummary() {
    const summary = document.getElementById('newBookSummary')?.value?.trim();
    if (!summary) {
        showToast('请先输入简介内容');
        return;
    }

    const polished = `${summary}\n\n【AI 润色版】\n一代强者回归都市，面对重重挑战，看他如何翻云覆雨，成就无上传奇！`;
    
    document.getElementById('newBookSummary').value = polished;
    showToast('简介已润色');
}

// 导入其他模块（避免循环依赖）
let initEditorEvents, initLineMarkEvents, loadChapterMarks, initCharacterCards;

export function setEditorCallbacks(callbacks) {
    initEditorEvents = callbacks.initEditorEvents;
    initLineMarkEvents = callbacks.initLineMarkEvents;
    loadChapterMarks = callbacks.loadChapterMarks;
    initCharacterCards = callbacks.initCharacterCards;
}
