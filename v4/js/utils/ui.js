/* ============================================
   网文写作助手 v4 - UI工具函数
   ============================================ */

import { state } from '../core/state.js';
import { saveToStorage } from '../core/storage.js';
import { MARK_TYPES, TEMPLATE_NAMES, NAMES } from './constants.js';

// Toast通知
export function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) {
        console.warn('[Toast] Toast element not found:', message);
        return;
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// 获取标记类型图标
export function getMarkTypeIcon(type) {
    return MARK_TYPES[type]?.icon || '📝';
}

// 获取标记类型标签
export function getMarkTypeLabel(type) {
    return MARK_TYPES[type]?.label || '标记';
}

// 获取模板名称
export function getTemplateName(id) {
    return TEMPLATE_NAMES[id] || '结构模板';
}

// 更新字数显示
export function updateWordCountDisplay() {
    if (!state.editor) return;

    const text = state.editor.value || '';
    const total = countWords(text);
    const newWords = Math.max(0, total - state.wordCountAtOpen);

    const totalEl = document.getElementById('wordCountTotal');
    const newEl = document.getElementById('wordCountNew');

    if (totalEl) totalEl.textContent = total.toLocaleString();
    if (newEl) newEl.textContent = newWords.toLocaleString();
}

// 字数统计
export function countWords(text) {
    if (!text || text.trim().length === 0) return 0;
    const cnChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const enWords = (text.match(/[a-zA-Z]+/g) || []).length;
    const numbers = (text.match(/\d+/g) || []).length;
    return cnChars + enWords + numbers;
}

// 更新日更目标显示
export function updateDailyGoalDisplay() {
    const todayEl = document.getElementById('todayWordCount');
    const targetEl = document.getElementById('dailyGoalTarget');
    const fill = document.getElementById('dailyGoalFill');

    if (todayEl) todayEl.textContent = (state.todayWordCount || 0).toLocaleString();
    if (targetEl) targetEl.textContent = (state.dailyGoal || 4000).toLocaleString();

    if (fill) {
        const percentage = Math.min(100, ((state.todayWordCount || 0) / (state.dailyGoal || 4000)) * 100);
        fill.style.width = percentage + '%';

        if (state.todayWordCount >= state.dailyGoal) {
            fill.classList.add('completed');
            todayEl?.classList.add('goal-completed');
        } else {
            fill.classList.remove('completed');
            todayEl?.classList.remove('goal-completed');
        }
    }
}

// 更新标记列表
export function updateMarksList() {
    const container = document.getElementById('marksList');
    const marks = Object.entries(state.lineMarks).sort((a, b) => a[0] - b[0]);

    document.getElementById('marksCount').textContent = marks.length;

    if (marks.length === 0) {
        container.innerHTML = `
            <div style="font-size: 12px; color: var(--text-muted); text-align: center; padding: 16px 0;">
                鼠标悬停行尾，点击 + 添加标记
            </div>
        `;
        return;
    }

    const lines = state.editor.value.split('\n');
    container.innerHTML = marks.map(([line, mark]) => {
        const linePreview = lines[line - 1]?.substring(0, 20) + '...' || '';
        return `
            <div class="mark-item" onclick="window.jumpToLine(${line})" data-line="${line}">
                <div class="mark-icon ${mark.type}">${getMarkTypeIcon(mark.type)}</div>
                <div class="mark-content">
                    <div class="mark-line">第 ${line} 行</div>
                    <div class="mark-text">${mark.comment || getMarkTypeLabel(mark.type)}</div>
                    <div class="mark-preview">${linePreview}</div>
                </div>
            </div>
        `;
    }).join('');
}

// 随机名字生成
export function generateName(type) {
    let result = '';
    const surname = NAMES.surnames[Math.floor(Math.random() * NAMES.surnames.length)];

    switch(type) {
        case 'male':
        case 'char':
            result = surname + NAMES.male[Math.floor(Math.random() * NAMES.male.length)];
            break;
        case 'female':
            result = surname + NAMES.female[Math.floor(Math.random() * NAMES.female.length)];
            break;
        case 'place':
            result = NAMES.places[Math.floor(Math.random() * NAMES.places.length)];
            break;
    }

    insertText(result);
    showToast(`已生成：${result}`);
}

// 插入文本
export function insertText(text) {
    const editor = state.editor;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const value = editor.value;

    editor.value = value.substring(0, start) + text + value.substring(end);
    editor.selectionStart = editor.selectionEnd = start + text.length;
    editor.focus();

    // 触发input事件
    editor.dispatchEvent(new Event('input'));
}

// 包装选中文本
export function wrapSelection(before, after) {
    const editor = state.editor;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.substring(start, end);

    if (selected) {
        const newText = before + selected + after;
        editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
        editor.selectionStart = start;
        editor.selectionEnd = start + newText.length;
        editor.focus();
        editor.dispatchEvent(new Event('input'));
    }
}

// 插入带换行的文本
export function insertWithNewline(text) {
    const editor = state.editor;
    const start = editor.selectionStart;
    const value = editor.value;

    let insertText = text;
    if (start > 0 && value[start - 1] !== '\n') {
        insertText = '\n' + text;
    }

    editor.value = value.substring(0, start) + insertText + value.substring(start);
    editor.selectionStart = editor.selectionEnd = start + insertText.length;
    editor.focus();
    editor.dispatchEvent(new Event('input'));
}

// 获取当前时间
export function getCurrentTime() {
    const now = new Date();
    return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

// 跳转到指定行
export function jumpToLine(line) {
    const editor = state.editor;
    const lines = editor.value.split('\n');
    let charPos = 0;
    for (let i = 0; i < line - 1 && i < lines.length; i++) {
        charPos += lines[i].length + 1;
    }

    editor.focus();
    editor.selectionStart = editor.selectionEnd = charPos;

    const lineHeight = 28.8;
    const scrollTop = (line - 1) * lineHeight - editor.clientHeight / 2;
    editor.scrollTop = Math.max(0, scrollTop);
}

// 将函数挂载到window供HTML调用
export function mountGlobalFunctions(functions) {
    Object.keys(functions).forEach(key => {
        window[key] = functions[key];
    });
}
