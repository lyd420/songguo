/* ============================================
   网文写作助手 v5 - 工作台模块
   ============================================ */

import { state, formatWordCount, formatTimeAgo } from '../core/state.js';
import { saveBooks, loadBooks, saveCurrentBook, saveChapterContent, loadChapterContent } from '../core/storage.js';
import { showToast, updateWordCountDisplay } from '../utils/ui.js';
import { GENRES, BOOK_STATUS } from '../utils/constants.js';

// ==================== 初始化 ====================

export function initWorkshop() {
    state.books = loadBooks();
    renderBookList();
    renderCalendar();
    updateTotalStats();
    initEarningsData();
}

// 更新总统计数据
function updateTotalStats() {
    const totalWords = state.books.reduce((sum, book) => sum + book.totalWords, 0);
    const totalEarnings = state.books.reduce((sum, book) => sum + (book.totalEarnings || 0), 0);
    
    const wordsDisplay = document.getElementById('totalWords');
    const earningsDisplay = document.getElementById('totalEarnings');
    
    if (wordsDisplay) wordsDisplay.textContent = formatWordCount(totalWords);
    if (earningsDisplay) earningsDisplay.textContent = totalEarnings.toFixed(2);
}

// ==================== 页面切换 ====================

export function switchPage(pageName) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    // 显示目标页面
    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) targetPage.classList.add('active');
    
    // 更新导航状态
    document.querySelector(`[data-page="${pageName}"]`)?.classList.add('active');
    
    // 页面特定初始化
    if (pageName === 'works') {
        renderWorksList();
    } else if (pageName === 'earnings') {
        initEarningsPage();
    } else if (pageName === 'stats') {
        initStatsPage();
    }
}

// ==================== 书籍列表渲染 ====================

export function renderBookList() {
    const container = document.getElementById('bookListContainer');
    if (!container) return;

    const filteredBooks = getFilteredBooks();

    if (filteredBooks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-illustration">📖</div>
                <div class="empty-text">还没有作品，开始创作吧</div>
                <button class="btn-primary btn-large" onclick="showCreateBookModal()" style="margin-top: 16px;">去创作</button>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredBooks.map(book => renderBookItem(book)).join('');
}

// 渲染作品管理页面列表
export function renderWorksList() {
    const container = document.getElementById('worksListContainer');
    if (!container) return;

    const filteredBooks = getFilteredBooks();

    if (filteredBooks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-illustration">📚</div>
                <div class="empty-text">暂无符合条件的作品</div>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredBooks.map(book => renderBookItem(book)).join('');
}

// 获取过滤后的书籍
function getFilteredBooks() {
    let books = state.books;
    if (state.bookFilter && state.bookFilter !== 'all') {
        books = books.filter(book => book.status === state.bookFilter);
    }
    return books.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
}

// 渲染单个书籍项
function renderBookItem(book) {
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
}

// 筛选书籍
export function filterBooks(filter) {
    state.bookFilter = filter;
    
    // 更新按钮状态
    document.querySelectorAll('.works-tab').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    renderBookList();
    renderWorksList();
}

// ==================== 进入书籍/编辑器 ====================

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

// 初始化编辑器
function initEditor() {
    // 延迟一点执行，确保DOM已经更新
    setTimeout(() => {
        const editor = document.getElementById('editor');
        if (!editor) {
            console.error('[initEditor] Editor element not found');
            return;
        }

        state.editor = editor;
        
        // 加载章节内容
        const content = loadChapterContent(state.currentBook.id + '_' + state.currentChapter);
        editor.value = content;
        state.originalContent = content;
        state.wordCountAtOpen = updateWordCountDisplay();

        // 初始化事件
        if (initEditorEvents) initEditorEvents();
        else console.error('[initEditor] initEditorEvents not set');
        
        if (initLineMarkEvents) initLineMarkEvents();
        else console.error('[initEditor] initLineMarkEvents not set');
        
        // 加载标记
        if (loadChapterMarks) loadChapterMarks(state.currentChapter);
        else console.error('[initEditor] loadChapterMarks not set');
        
        // 初始化人物卡
        if (initCharacterCards) initCharacterCards();
        else console.error('[initEditor] initCharacterCards not set');
        
        console.log('[initEditor] Editor initialized successfully');
    }, 50);
}

// ==================== 日历功能 ====================

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
    
    // 获取星期几 (1-7, 周一为1)
    let firstDayWeek = firstDay.getDay();
    if (firstDayWeek === 0) firstDayWeek = 7;
    
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
                ${hasWords ? `<span class="calendar-day-count">${formatWordCount(wordCount)}</span>` : ''}
            </div>
        `;
    }

    // 下月日期
    const totalCells = firstDayWeek - 1 + daysInMonth;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let day = 1; day <= remainingCells; day++) {
        html += `<div class="calendar-day other-month"><span class="calendar-day-number">${day}</span></div>`;
    }

    daysContainer.innerHTML = html;
}

// 切换月份
export function changeMonth(delta) {
    state.currentCalendarMonth.setMonth(state.currentCalendarMonth.getMonth() + delta);
    renderCalendar();
}

// ==================== 收益功能 ====================

// 初始化收益数据
function initEarningsData() {
    // 为每本书生成模拟收益数据
    state.books.forEach(book => {
        if (!book.totalEarnings) {
            book.totalEarnings = Math.floor(Math.random() * 5000) + 1000;
        }
        if (!book.monthEarnings) {
            book.monthEarnings = Math.floor(book.totalEarnings * 0.3);
        }
        if (!book.readCount) {
            book.readCount = Math.floor(Math.random() * 100000) + 10000;
        }
    });
}

// 初始化收益页面
function initEarningsPage() {
    initEarningsData();
    updateEarningsFilter();
    renderEarningsOverview();
    renderEarningsTable();
    renderEarningsRank();
}

// 更新收益筛选器
function updateEarningsFilter() {
    const select = document.getElementById('earningsBookFilter');
    if (!select) return;
    
    select.innerHTML = `
        <option value="all">全部作品</option>
        ${state.books.map(book => `<option value="${book.id}">${book.title}</option>`).join('')}
    `;
}

// 渲染收益概览
function renderEarningsOverview() {
    const bookFilter = document.getElementById('earningsBookFilter')?.value || 'all';
    const monthFilter = document.getElementById('earningsMonthFilter')?.value || 'all';
    
    let books = state.books;
    if (bookFilter !== 'all') {
        books = books.filter(b => b.id == bookFilter);
    }
    
    const totalEarnings = books.reduce((sum, b) => sum + (b.totalEarnings || 0), 0);
    const monthEarnings = books.reduce((sum, b) => sum + (b.monthEarnings || 0), 0);
    const totalReads = books.reduce((sum, b) => sum + (b.readCount || 0), 0);
    
    const totalEl = document.getElementById('earningsTotal');
    const monthEl = document.getElementById('earningsMonth');
    const booksEl = document.getElementById('earningsBooks');
    const readsEl = document.getElementById('earningsReads');
    
    if (totalEl) totalEl.textContent = `¥${totalEarnings.toFixed(2)}`;
    if (monthEl) monthEl.textContent = `¥${monthEarnings.toFixed(2)}`;
    if (booksEl) booksEl.textContent = books.length;
    if (readsEl) readsEl.textContent = formatWordCount(totalReads);
}

// 渲染收益明细表
function renderEarningsTable() {
    const tbody = document.getElementById('earningsTableBody');
    if (!tbody) return;

    const sources = ['订阅分成', '打赏分成', '全勤奖', '完本奖', '渠道分成'];
    const statuses = ['paid', 'pending'];
    const statusLabels = { paid: '已结算', pending: '待结算' };
    
    let html = '';
    
    // 生成模拟数据
    state.books.forEach(book => {
        const days = 10;
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
            const source = sources[Math.floor(Math.random() * sources.length)];
            const amount = (Math.random() * 100 + 10).toFixed(2);
            const reads = Math.floor(Math.random() * 1000 + 100);
            const status = Math.random() > 0.3 ? 'paid' : 'pending';
            
            html += `
                <tr>
                    <td>${dateStr}</td>
                    <td>${book.title}</td>
                    <td>${source}</td>
                    <td>${reads}</td>
                    <td class="amount">¥${amount}</td>
                    <td><span class="status ${status}">${statusLabels[status]}</span></td>
                </tr>
            `;
        }
    });
    
    tbody.innerHTML = html || '<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-tertiary);">暂无收益数据</td></tr>';
}

// 渲染收益排行
function renderEarningsRank() {
    const container = document.getElementById('earningsRankList');
    if (!container) return;

    const sortedBooks = [...state.books].sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0));
    
    container.innerHTML = sortedBooks.map((book, index) => `
        <div class="earnings-rank-item">
            <div class="earnings-rank-number">${index + 1}</div>
            <div class="book-cover" style="width: 40px; height: 54px; font-size: 16px;">
                <span>${book.title.charAt(0)}</span>
            </div>
            <div class="earnings-rank-info">
                <div class="earnings-rank-name">${book.title}</div>
                <div class="earnings-rank-detail">${book.totalChapters}章 · ${formatWordCount(book.totalWords)}</div>
            </div>
            <div class="earnings-rank-amount">¥${(book.totalEarnings || 0).toFixed(2)}</div>
        </div>
    `).join('');
}

// 筛选收益
export function filterEarningsByBook() {
    renderEarningsOverview();
}

export function filterEarningsByMonth() {
    renderEarningsOverview();
}

// ==================== 数据统计页面 ====================

function initStatsPage() {
    const totalWords = state.books.reduce((sum, b) => sum + b.totalWords, 0);
    const totalBooks = state.books.length;
    const writingDays = Object.keys(state.writingCalendar).length || 30;
    const streakDays = 5; // 模拟连续创作天数
    
    const wordsEl = document.getElementById('statsTotalWords');
    const booksEl = document.getElementById('statsTotalBooks');
    const daysEl = document.getElementById('statsWritingDays');
    const streakEl = document.getElementById('statsStreak');
    
    if (wordsEl) wordsEl.textContent = formatWordCount(totalWords);
    if (booksEl) booksEl.textContent = totalBooks;
    if (daysEl) daysEl.textContent = writingDays;
    if (streakEl) streakEl.textContent = streakDays + '天';
}

// ==================== 创建作品 ====================

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

export function closeCreateBookModal() {
    document.getElementById('createBookModal')?.classList.remove('active');
}

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
        totalEarnings: 0,
        monthEarnings: 0,
        readCount: 0,
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

export function useBookTitle(title) {
    document.getElementById('newBookTitle').value = title;
}

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

// 导入
let initEditorEvents, initLineMarkEvents, loadChapterMarks, initCharacterCards;

export function setEditorCallbacks(callbacks) {
    initEditorEvents = callbacks.initEditorEvents;
    initLineMarkEvents = callbacks.initLineMarkEvents;
    loadChapterMarks = callbacks.loadChapterMarks;
    initCharacterCards = callbacks.initCharacterCards;
}
