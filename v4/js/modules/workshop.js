/* ============================================
   网文写作助手 v4 - 工作台模块
   ============================================ */

import { state, countWords } from '../core/state.js';
import { saveBooks, loadBooks, saveCurrentBook, saveChapterContent, loadChapterContent } from '../core/storage.js';
import { showToast } from '../utils/ui.js';
import { GENRES, BOOK_STATUS } from '../utils/constants.js';

// 初始化工作台
export function initWorkshop() {
    // 加载作品列表
    state.books = loadBooks();
    
    // 渲染作品列表
    renderBookList();
    
    // 渲染概览面板
    renderOverviewPanel();
}

// 渲染作品列表
export function renderBookList() {
    const container = document.getElementById('bookListContainer');
    if (!container) return;

    // 筛选作品
    let filteredBooks = state.books;
    if (state.bookFilter !== 'all') {
        filteredBooks = state.books.filter(book => book.status === state.bookFilter);
    }

    // 排序：最近更新在前
    filteredBooks.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

    if (filteredBooks.length === 0) {
        container.innerHTML = `
            <div class="workshop-empty">
                <div class="workshop-empty-icon">📚</div>
                <div class="workshop-empty-text">还没有作品</div>
                <button class="btn-primary" onclick="showCreateBookModal()">创建第一部作品</button>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredBooks.map(book => {
        const genreInfo = GENRES[book.genre] || { name: '其他', icon: '📝' };
        const statusInfo = BOOK_STATUS[book.status] || { name: '未知', color: '#999' };
        const timeText = formatTimeAgo(book.lastUpdated);
        const coverStyle = book.cover ? 
            `background-image: url(${book.cover})` : 
            `background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)`;
        
        return `
            <div class="book-item" data-book-id="${book.id}" onclick="enterBook(${book.id})">
                <div class="book-cover" style="${coverStyle}">
                    ${!book.cover ? `<span class="book-cover-text">${book.title.charAt(0)}</span>` : ''}
                </div>
                <div class="book-info">
                    <div class="book-header">
                        <span class="book-title">${book.title}</span>
                        <span class="book-status" style="background: ${statusInfo.color}20; color: ${statusInfo.color}">
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

// 渲染概览面板
function renderOverviewPanel() {
    // 计算总字数
    const totalWords = state.books.reduce((sum, book) => sum + book.totalWords, 0);
    
    // 计算本周写作量（简化计算，实际应该按周统计）
    const weekWords = state.books.reduce((sum, book) => sum + book.todayWords, 0);
    
    // 计算今日写作量
    const todayWords = state.books.reduce((sum, book) => sum + book.todayWords, 0);
    
    // 连续创作天数（简化，从日更模块获取更准确）
    const streakDays = 5; // 占位
    
    // 作品数量
    const ongoingCount = state.books.filter(b => b.status === 'ongoing').length;

    // 更新概览数据
    const totalWordsEl = document.getElementById('overviewTotalWords');
    const weekWordsEl = document.getElementById('overviewWeekWords');
    const todayWordsEl = document.getElementById('overviewTodayWords');
    const streakDaysEl = document.getElementById('overviewStreakDays');

    if (totalWordsEl) totalWordsEl.textContent = formatWordCount(totalWords);
    if (weekWordsEl) weekWordsEl.textContent = formatWordCount(weekWords);
    if (todayWordsEl) todayWordsEl.textContent = formatWordCount(todayWords);
    if (streakDaysEl) streakDaysEl.textContent = streakDays + '天';
}

// 进入书籍编辑器
export function enterBook(bookId) {
    const book = state.books.find(b => b.id === bookId);
    if (!book) return;

    state.currentBook = book;
    saveCurrentBook(bookId);

    // 更新编辑器中的书籍信息
    updateEditorBookInfo(book);

    // 切换到编辑器视图
    switchToEditor();
}

// 更新编辑器中的书籍信息
function updateEditorBookInfo(book) {
    // 更新标题栏
    const headerTitle = document.querySelector('.novel-title');
    const headerChapter = document.getElementById('headerChapterName');
    const editorTitle = document.getElementById('chapterTitle');

    if (headerTitle) headerTitle.textContent = `《${book.title}》`;
    if (headerChapter) headerChapter.textContent = `第${book.totalChapters}章`;
    if (editorTitle) editorTitle.value = `第${book.totalChapters}章 `;

    // 更新章节数据
    state.currentChapter = book.totalChapters;
    
    // 加载该书籍最后一章的内容
    const content = loadChapterContent(book.id + '_' + book.totalChapters);
    if (state.editor) {
        state.editor.value = content;
        state.originalContent = content;
        state.wordCountAtOpen = countWords(content);
    }
}

// 切换工作台/编辑器视图
export async function switchToEditor() {
    const workshop = document.getElementById('workshopContainer');
    const editor = document.getElementById('mainContainer');
    const header = document.querySelector('.header');

    if (workshop) workshop.style.display = 'none';
    if (editor) editor.style.display = 'flex';
    if (header) header.style.display = 'flex';
    
    // 动态导入避免循环依赖
    const { initEditor } = await import('../core/app.js');
    initEditor();
}

export function switchToWorkshop() {
    const workshop = document.getElementById('workshopContainer');
    const editor = document.getElementById('mainContainer');
    const header = document.querySelector('.header');

    // 刷新工作台数据
    initWorkshop();

    if (workshop) workshop.style.display = 'block';
    if (editor) editor.style.display = 'none';
    if (header) header.style.display = 'none';
}

// 筛选作品
export function filterBooks(filter) {
    state.bookFilter = filter;
    
    // 更新按钮状态
    document.querySelectorAll('.workshop-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    renderBookList();
}

// ==================== 新建作品 ====================

// 显示新建作品弹窗
export function showCreateBookModal() {
    const modal = document.getElementById('createBookModal');
    if (!modal) return;

    // 重置表单
    document.getElementById('newBookTitle').value = '';
    document.getElementById('newBookGenre').value = 'urban';
    document.getElementById('newBookSummary').value = '';
    document.getElementById('newBookTarget').value = '1000000';
    document.getElementById('aiSuggestions').innerHTML = '';

    modal.classList.add('active');
    setTimeout(() => document.getElementById('newBookTitle')?.focus(), 100);
}

// 关闭新建作品弹窗
export function closeCreateBookModal() {
    const modal = document.getElementById('createBookModal');
    if (modal) modal.classList.remove('active');
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

    // 检查书名是否已存在
    if (state.books.some(b => b.title === title)) {
        showToast('该书名的作品已存在');
        return;
    }

    // 生成新ID
    const newId = Math.max(...state.books.map(b => b.id), 0) + 1;

    // 创建新作品
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

    // 添加到列表
    state.books.push(newBook);
    saveBooks(state.books);

    // 创建第一章的初始内容
    saveChapterContent(`${newId}_1`, '');

    // 关闭弹窗
    closeCreateBookModal();

    showToast(`《${title}》创建成功！`);

    // 自动进入编辑器
    enterBook(newId);
}

// ==================== AI 辅助功能（占位） ====================

// AI 生成书名建议
export function generateBookTitleSuggestions() {
    const genre = document.getElementById('newBookGenre')?.value || 'urban';
    const container = document.getElementById('aiSuggestions');
    
    // 模拟 AI 建议（实际应调用 AI API）
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

// AI 润色简介
export function polishBookSummary() {
    const summary = document.getElementById('newBookSummary')?.value?.trim();
    if (!summary) {
        showToast('请先输入简介内容');
        return;
    }

    // 模拟 AI 润色（实际应调用 AI API）
    const polished = `${summary}\n\n【AI 润色版】\n一代强者回归都市，面对重重挑战，看他如何翻云覆雨，成就无上传奇！`;
    
    document.getElementById('newBookSummary').value = polished;
    showToast('简介已润色');
}

// AI 开书灵感
export function generateBookInspiration() {
    const genre = document.getElementById('newBookGenre')?.value || 'urban';
    const container = document.getElementById('aiSuggestions');

    const inspirations = {
        urban: [
            { title: '赘婿逆袭流', desc: '隐藏身份，打脸反派，宠妻护短' },
            { title: '神医下山流', desc: '医术通天，救人扬名，建立势力' },
            { title: '战神归来流', desc: '征战归来，护妻复仇，平定天下' }
        ],
        fantasy: [
            { title: '废材逆袭流', desc: '天生废材，获得奇遇，逆天改命' },
            { title: '重生复仇流', desc: '含恨重生，清算旧账，登临巅峰' },
            { title: '系统流', desc: '绑定系统，完成任务，飞速升级' }
        ],
        romance: [
            { title: '先婚后爱流', desc: '契约婚姻，日久生情，甜蜜宠爱' },
            { title: '破镜重圆流', desc: '误会分离，重逢和解，再续前缘' },
            { title: '替身文学流', desc: '身份替换，真假难辨，情归何处' }
        ],
        mystery: [
            { title: '悬疑探案流', desc: '离奇案件，抽丝剥茧，真相大白' },
            { title: '灵异复苏流', desc: '诡异降临，生存挣扎，揭秘真相' },
            { title: '无限恐怖流', desc: '副本挑战，生死一线，突破自我' }
        ],
        history: [
            { title: '穿越争霸流', desc: '穿越古代，凭借先知，争霸天下' },
            { title: '权谋斗争流', desc: '朝堂之上，尔虞我诈，权倾朝野' },
            { title: '经营建设流', desc: '白手起家，发展势力，富甲一方' }
        ],
        scifi: [
            { title: '末日生存流', desc: '末日降临，资源争夺，建立基地' },
            { title: '星际文明流', desc: '探索宇宙，星际战争，文明崛起' },
            { title: '无限流', desc: '副本挑战，能力提升，揭开真相' }
        ]
    };

    const items = inspirations[genre] || inspirations.urban;

    container.innerHTML = `
        <div class="ai-suggestion-box">
            <div class="ai-suggestion-title">💡 AI 开书灵感</div>
            <div class="ai-inspiration-list">
                ${items.map(item => `
                    <div class="ai-inspiration-item">
                        <div class="ai-inspiration-title">${item.title}</div>
                        <div class="ai-inspiration-desc">${item.desc}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ==================== 快捷操作 ====================

// 继续写作（进入最近更新的作品）
export function continueLastBook() {
    if (state.books.length === 0) {
        showToast('还没有作品，先创建一个吧');
        return;
    }
    
    // 找到最近更新的作品
    const sorted = [...state.books].sort((a, b) => 
        new Date(b.lastUpdated) - new Date(a.lastUpdated)
    );
    
    enterBook(sorted[0].id);
}

// 显示统计（占位）
export function showStats() {
    showToast('数据统计功能开发中...');
}

// 显示回收站（占位）
export function showRecycleBin() {
    showToast('回收站功能开发中...');
}

// ==================== 工具函数 ====================

// 格式化字数显示
function formatWordCount(count) {
    if (count >= 10000) {
        return (count / 10000).toFixed(1) + '万字';
    }
    return count.toLocaleString() + '字';
}

// 格式化时间显示
function formatTimeAgo(dateString) {
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
