/* ============================================
   网文写作助手 v5 - UI工具函数
   ============================================ */

import { state, countWords } from '../core/state.js';
import { NAMES } from './constants.js';

// 显示提示
export function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// 更新字数显示
export function updateWordCountDisplay() {
    const content = state.editor?.value || '';
    const count = countWords(content);
    const display = document.getElementById('wordCount');
    if (display) {
        display.textContent = `${count.toLocaleString()} 字`;
    }
    return count;
}

// 更新日更目标显示
export function updateDailyGoalDisplay() {
    const display = document.getElementById('dailyGoalDisplay');
    if (display) {
        display.textContent = `${state.todayWordCount.toLocaleString()} / ${state.dailyGoal.toLocaleString()} 字`;
    }
}

// 更新保存状态
export function updateSaveStatus(status) {
    const display = document.getElementById('saveStatus');
    if (display) {
        display.textContent = status;
    }
}

// 更新标记列表面板
export function updateMarksList() {
    const container = document.getElementById('marksList');
    if (!container) return;

    const marks = Object.entries(state.lineMarks);
    
    if (marks.length === 0) {
        container.innerHTML = '<div class="empty-text" style="padding: 20px; text-align: center; color: var(--text-tertiary);">暂无标记</div>';
        return;
    }

    container.innerHTML = marks.map(([line, mark]) => {
        const typeConfig = {
            todo: { label: '待修改', class: 'todo' },
            question: { label: '疑问', class: 'question' },
            idea: { label: '灵感', class: 'idea' },
            issue: { label: '问题', class: 'issue' }
        }[mark.type] || { label: '标记', class: 'todo' };

        return `
            <div class="mark-item" onclick="jumpToLine(${line})">
                <div class="mark-item-header">
                    <span class="mark-item-type ${typeConfig.class}">${typeConfig.label}</span>
                    <span class="mark-item-line">第${line}行</span>
                </div>
                ${mark.note ? `<div class="mark-item-note">${mark.note}</div>` : ''}
            </div>
        `;
    }).join('');
}

// 生成随机名字
export function generateName(gender = 'male') {
    const surname = NAMES.surnames[Math.floor(Math.random() * NAMES.surnames.length)];
    const names = gender === 'female' ? NAMES.female : NAMES.male;
    const name = names[Math.floor(Math.random() * names.length)];
    return surname + name;
}

// 插入文本到编辑器
export function insertText(text) {
    const editor = state.editor;
    if (!editor) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const value = editor.value;

    editor.value = value.substring(0, start) + text + value.substring(end);
    editor.selectionStart = editor.selectionEnd = start + text.length;
    editor.focus();
    
    // 触发input事件更新字数
    editor.dispatchEvent(new Event('input'));
}

// 防抖函数
export function debounce(fn, delay) {
    let timer = null;
    return function(...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// 节流函数
export function throttle(fn, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            fn.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
