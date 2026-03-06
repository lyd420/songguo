/* ============================================
   网文写作助手 v4 - 行标记模块 (重构版)
   ============================================ */

import { state } from '../core/state.js';
import { loadLineMarks, saveLineMarks } from '../core/storage.js';
import { showToast, getMarkTypeIcon, getMarkTypeLabel } from '../utils/ui.js';

let lineNumbersEl = null;
let markPopup = null;
let currentMarkLine = null;
let selectedMarkType = 'todo';
const LINE_HEIGHT = 28.8;

// 标记类型配置
const MARK_TYPES = {
    todo: { color: '#D4A574', label: '待修改' },
    question: { color: '#7A9CC6', label: '疑问' },
    idea: { color: '#9CAF94', label: '灵感' },
    issue: { color: '#D4A5A5', label: '问题' }
};

// 初始化行标记系统
export function initLineMarkEvents() {
    lineNumbersEl = document.getElementById('lineNumbers');
    markPopup = document.getElementById('markPopup');

    if (!lineNumbersEl || !state.editor) {
        console.warn('[LineMark] Required elements not found');
        return;
    }

    // 编辑器输入时更新行号
    state.editor.addEventListener('input', updateLineNumbers);

    // 同步滚动
    state.editor.addEventListener('scroll', syncScroll);

    // 点击编辑器其他地方隐藏弹窗
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.mark-popup') && !e.target.closest('.line-number')) {
            hideMarkPopup();
        }
    });

    // 初始化行号
    updateLineNumbers();

    console.log('[LineMark] Initialized');
}

// 更新行号显示
function updateLineNumbers() {
    if (!lineNumbersEl || !state.editor) return;

    const lines = state.editor.value.split('\n');
    const totalLines = lines.length;
    const marks = state.lineMarks || {};

    let html = '';
    for (let i = 1; i <= totalLines; i++) {
        const mark = marks[i];
        const hasMark = mark ? `has-mark ${mark.type}` : '';
        const title = mark ? `${MARK_TYPES[mark.type]?.label || '标记'}: ${mark.comment || ''}` : `第 ${i} 行`;
        html += `<div class="line-number ${hasMark}" data-line="${i}" title="${title}" onclick="window.handleMarkClick(${i})">${i}</div>`;
    }

    lineNumbersEl.innerHTML = html;
}

// 同步滚动 - 行号随 textarea 滚动
function syncScroll() {
    if (lineNumbersEl && state.editor) {
        // 计算滚动位置，使行号与文本行对齐
        lineNumbersEl.scrollTop = state.editor.scrollTop;
    }
}

// 处理行号点击
export function handleMarkClick(line) {
    currentMarkLine = line;
    showMarkPopup(line);
}

// 显示标记弹窗
function showMarkPopup(line) {
    if (!markPopup || !state.editor) return;

    const existingMark = state.lineMarks?.[line];

    // 获取点击的行号元素位置
    const lineNumEl = lineNumbersEl?.querySelector(`[data-line="${line}"]`);
    if (lineNumEl) {
        const lineRect = lineNumEl.getBoundingClientRect();
        const wrapperRect = document.querySelector('.editor-wrapper')?.getBoundingClientRect();
        if (wrapperRect) {
            // 相对于 editor-wrapper 定位
            const popupTop = lineRect.top - wrapperRect.top;
            markPopup.style.top = `${popupTop}px`;
            markPopup.style.left = '60px'; // 在行号右侧（行号宽度36px + 间距）
        }
    }
    markPopup.style.display = 'block';

    // 更新弹窗内容
    document.getElementById('popupLineNumber').textContent = line;
    document.getElementById('popupComment').value = existingMark?.comment || '';

    const type = existingMark?.type || 'todo';
    selectMarkType(type);

    // 显示/隐藏删除按钮
    const deleteBtn = document.getElementById('popupDeleteBtn');
    if (deleteBtn) {
        deleteBtn.style.display = existingMark ? 'block' : 'none';
    }

    // 聚焦输入框
    setTimeout(() => document.getElementById('popupComment')?.focus(), 100);
}

// 隐藏标记弹窗
export function hideMarkPopup() {
    if (markPopup) {
        markPopup.style.display = 'none';
    }
    currentMarkLine = null;
}

// 选择标记类型
export function selectMarkType(type) {
    selectedMarkType = type;
    document.querySelectorAll('.mark-type-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.type === type) {
            btn.classList.add('selected');
        }
    });
}

// 保存标记
export function saveMark() {
    if (!currentMarkLine) return;

    const comment = document.getElementById('popupComment')?.value?.trim() || '';

    state.lineMarks[currentMarkLine] = {
        type: selectedMarkType,
        comment: comment,
        timestamp: new Date().toISOString()
    };

    saveLineMarks(state.currentChapter, state.lineMarks);

    // 更新UI
    updateLineNumbers();
    renderMarksPanel();
    hideMarkPopup();

    showToast('标记已保存');
}

// 删除标记
export function deleteMark() {
    if (!currentMarkLine) return;

    delete state.lineMarks[currentMarkLine];
    saveLineMarks(state.currentChapter, state.lineMarks);

    // 更新UI
    updateLineNumbers();
    renderMarksPanel();
    hideMarkPopup();

    showToast('标记已删除');
}

// 渲染右侧标记面板
function renderMarksPanel() {
    const panelList = document.getElementById('marksPanelList');
    const countEl = document.getElementById('marksPanelCount');

    if (!panelList) return;

    const marks = Object.entries(state.lineMarks || {})
        .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

    // 更新计数
    if (countEl) {
        countEl.textContent = marks.length;
    }

    if (marks.length === 0) {
        panelList.innerHTML = '<div class="marks-empty">点击行号添加标记</div>';
        return;
    }

    const lines = state.editor?.value?.split('\n') || [];

    panelList.innerHTML = marks.map(([line, mark]) => {
        const lineText = lines[parseInt(line) - 1]?.substring(0, 30) || '';
        return `
            <div class="marks-panel-item" onclick="window.jumpToLine(${line})" data-line="${line}">
                <div class="marks-panel-dot ${mark.type}"></div>
                <div class="marks-panel-content">
                    <div class="marks-panel-line">第 ${line} 行</div>
                    <div class="marks-panel-text">${mark.comment || getMarkTypeLabel(mark.type)}</div>
                </div>
            </div>
        `;
    }).join('');
}

// 跳转到指定行
export function jumpToLine(line) {
    if (!state.editor) return;

    const lines = state.editor.value.split('\n');
    let charPos = 0;

    for (let i = 0; i < line - 1 && i < lines.length; i++) {
        charPos += lines[i].length + 1;
    }

    state.editor.focus();
    state.editor.selectionStart = state.editor.selectionEnd = charPos;

    // 滚动到该行
    const lineHeight = 28.8;
    const scrollTop = (line - 1) * lineHeight - state.editor.clientHeight / 3;
    state.editor.scrollTop = Math.max(0, scrollTop);

    // 同步行号滚动
    syncScroll();
}

// 加载章节标记
export function loadChapterMarks(chapterId) {
    state.lineMarks = loadLineMarks(chapterId);
    updateLineNumbers();
    renderMarksPanel();
}

// 保留旧接口兼容性
export function hideMarkThread() {
    hideMarkPopup();
}

export function showMarkThread(line) {
    handleMarkClick(line);
}

// 为兼容性保留的空函数
export function renderMarkIndicators() {
    // 标记现在直接显示在行号上，此函数不再需要
}
