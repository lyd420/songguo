/* ============================================
   网文写作助手 v5 - 行标记模块
   ============================================ */

import { state, getLineFromMouseEvent } from '../core/state.js';
import { loadLineMarks, saveLineMarks } from '../core/storage.js';
import { showToast, updateMarksList } from '../utils/ui.js';

let lineNumbersEl = null;

// 初始化行标记事件
export function initLineMarkEvents() {
    lineNumbersEl = document.getElementById('lineNumbers');
    if (!lineNumbersEl || !state.editor) return;

    // 编辑器输入时更新行号
    state.editor.addEventListener('input', updateLineNumbers);
    state.editor.addEventListener('scroll', syncScroll);
    
    updateLineNumbers();
}

// 更新行号显示
export function updateLineNumbers() {
    if (!lineNumbersEl || !state.editor) return;

    const lines = state.editor.value.split('\n');
    let html = '';
    
    for (let i = 1; i <= lines.length; i++) {
        const mark = state.lineMarks[i];
        const markClass = mark ? `has-mark ${mark.type}` : '';
        html += `<div class="line-number ${markClass}" onclick="handleMarkClick(${i})">${i}</div>`;
    }
    
    lineNumbersEl.innerHTML = html;
}

// 同步滚动
function syncScroll() {
    if (!lineNumbersEl || !state.editor) return;
    lineNumbersEl.scrollTop = state.editor.scrollTop;
}

// 处理行号点击
export function handleMarkClick(lineNumber) {
    state.currentMarkLine = lineNumber;
    
    const existingMark = state.lineMarks[lineNumber];
    if (existingMark) {
        // 已有标记，显示详情或删除
        if (confirm(`第${lineNumber}行已有标记：${existingMark.note || '无备注'}\n是否删除？`)) {
            deleteMark(lineNumber);
        }
    } else {
        // 显示标记弹窗
        showMarkPopup(lineNumber);
    }
}

// 显示标记弹窗
function showMarkPopup(lineNumber) {
    const popup = document.getElementById('markPopup');
    if (!popup) return;

    // 重置表单
    document.querySelectorAll('.mark-type-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('markNote').value = '';
    state.selectedMarkType = 'todo';
    document.querySelector('.mark-type-btn.todo')?.classList.add('selected');

    // 定位弹窗
    const lineEl = lineNumbersEl?.children[lineNumber - 1];
    if (lineEl) {
        const rect = lineEl.getBoundingClientRect();
        popup.style.left = `${rect.right + 10}px`;
        popup.style.top = `${rect.top}px`;
    }

    popup.classList.add('show');
}

// 隐藏标记弹窗
export function hideMarkPopup() {
    document.getElementById('markPopup')?.classList.remove('show');
    state.currentMarkLine = null;
}

// 选择标记类型
export function selectMarkType(type) {
    state.selectedMarkType = type;
    document.querySelectorAll('.mark-type-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`.mark-type-btn.${type}`)?.classList.add('selected');
}

// 保存标记
export function saveMark() {
    if (!state.currentMarkLine) return;

    const note = document.getElementById('markNote')?.value?.trim();
    
    state.lineMarks[state.currentMarkLine] = {
        type: state.selectedMarkType,
        note: note,
        createdAt: new Date().toISOString()
    };

    // 保存到存储
    const chapterKey = state.currentBook ? `${state.currentBook.id}_${state.currentChapter}` : state.currentChapter;
    saveLineMarks(chapterKey, state.lineMarks);

    updateLineNumbers();
    updateMarksList();
    hideMarkPopup();
    showToast('标记添加成功');
}

// 删除标记
export function deleteMark(lineNumber) {
    delete state.lineMarks[lineNumber];
    
    const chapterKey = state.currentBook ? `${state.currentBook.id}_${state.currentChapter}` : state.currentChapter;
    saveLineMarks(chapterKey, state.lineMarks);

    updateLineNumbers();
    updateMarksList();
    showToast('标记已删除');
}

// 加载章节标记
export function loadChapterMarks(chapterId) {
    const chapterKey = state.currentBook ? `${state.currentBook.id}_${chapterId}` : chapterId;
    state.lineMarks = loadLineMarks(chapterKey);
    updateLineNumbers();
    updateMarksList();
}

// 跳转到指定行
export function jumpToLine(lineNumber) {
    if (!state.editor) return;

    const lines = state.editor.value.split('\n');
    let position = 0;
    
    for (let i = 0; i < lineNumber - 1 && i < lines.length; i++) {
        position += lines[i].length + 1;
    }

    state.editor.focus();
    state.editor.setSelectionRange(position, position);
    
    // 滚动到视野内
    const lineHeight = 28.8;
    state.editor.scrollTop = (lineNumber - 1) * lineHeight - state.editor.clientHeight / 2;
}
