/* ============================================
   网文写作助手 v4 - 编辑器模块
   ============================================ */

import { state, countWords } from '../core/state.js';
import { autoSaveContent, saveContent } from './chapterManager.js';
import { updateDailyProgress } from './dailyGoal.js';
import { updateWordCountDisplay, showToast } from '../utils/ui.js';
import { getLineFromMouseEvent } from '../core/state.js';
import { saveLineMarks } from '../core/storage.js';
import { selectMarkType, saveMark, renderMarkIndicators } from './lineMark.js';

// 初始化编辑器事件
export function initEditorEvents() {
    if (!state.editor) {
        console.warn('[Editor] Editor element not initialized');
        return;
    }

    // 输入事件
    state.editor.addEventListener('input', handleInput);

    // 快捷键
    state.editor.addEventListener('keydown', handleKeyDown);
}

function handleInput() {
    const text = state.editor.value;

    // 更新字数
    updateWordCountDisplay();

    // 更新最后输入时间
    state.lastInputTime = Date.now();

    // 标记修改状态
    if (text !== state.originalContent) {
        if (!state.isDirty) {
            state.isDirty = true;
            const activeItem = document.querySelector('.chapter-item.active');
            if (activeItem) activeItem.classList.add('dirty');
        }
    } else {
        state.isDirty = false;
        const activeItem = document.querySelector('.chapter-item.active');
        if (activeItem) activeItem.classList.remove('dirty');
    }

    // 自动保存标记更新
    clearTimeout(window.markUpdateTimeout);
    window.markUpdateTimeout = setTimeout(() => {
        const lines = state.editor.value.split('\n');
        const maxLine = lines.length;
        Object.keys(state.lineMarks).forEach(line => {
            if (parseInt(line) > maxLine) {
                delete state.lineMarks[line];
            }
        });
        saveLineMarks(state.currentChapter, state.lineMarks);
        renderMarkIndicators();
    }, 500);
}

function handleKeyDown(e) {
    // Tab键插入缩进
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = state.editor.selectionStart;
        const end = state.editor.selectionEnd;
        state.editor.value = state.editor.value.substring(0, start) + '    ' + state.editor.value.substring(end);
        state.editor.selectionStart = state.editor.selectionEnd = start + 4;
        state.editor.dispatchEvent(new Event('input'));
    }

    // Ctrl+S保存
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveContent();
    }

    // Ctrl+Shift+数字快速标记
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const line = getLineFromMouseEvent({
            clientY: state.editor.getBoundingClientRect().top + 50
        });
        const types = ['todo', 'question', 'idea', 'issue'];
        selectMarkType(types[parseInt(e.key) - 1]);
        saveMark();
    }
}

// 专注模式
export function toggleFocusMode() {
    document.body.classList.toggle('focus-mode');
    const isFocusMode = document.body.classList.contains('focus-mode');
    showToast(isFocusMode ? '已进入专注模式，按 ESC 退出' : '已退出专注模式');
}

// 主题切换
export function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);

    const tooltip = document.getElementById('themeTooltip');
    if (tooltip) {
        tooltip.textContent = newTheme === 'dark' ? '切换浅色' : '切换深色';
    }

    showToast(`已切换到${newTheme === 'dark' ? '深色' : '浅色'}主题`);
}
