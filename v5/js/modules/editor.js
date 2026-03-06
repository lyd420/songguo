/* ============================================
   网文写作助手 v5 - 编辑器模块
   ============================================ */

import { state, countWords } from '../core/state.js';
import { updateWordCountDisplay, updateSaveStatus, showToast } from '../utils/ui.js';
import { autoSaveContent } from './chapterManager.js';
import { detectNewCharacters } from './characterCard.js';

// 初始化编辑器事件
export function initEditorEvents() {
    if (!state.editor) return;

    let autoSaveTimer = null;

    state.editor.addEventListener('input', () => {
        const currentContent = state.editor.value;
        state.isDirty = currentContent !== state.originalContent;
        
        const wordCount = updateWordCountDisplay();
        updateSaveStatus(state.isDirty ? '未保存' : '已保存');
        
        state.lastInputTime = Date.now();

        // 自动保存
        if (autoSaveTimer) clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            if (state.isDirty) {
                autoSaveContent();
            }
        }, 30000);

        // 检测新人物
        detectNewCharacters(currentContent);
    });

    // 键盘快捷键
    state.editor.addEventListener('keydown', async (e) => {
        // Ctrl/Cmd + S 保存
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            const { saveContent } = await import('./chapterManager.js');
            saveContent();
        }
    });
}

// 切换专注模式
export function toggleFocusMode() {
    document.body.classList.toggle('focus-mode');
    const isFocusMode = document.body.classList.contains('focus-mode');
    showToast(isFocusMode ? '已进入专注模式，按ESC退出' : '已退出专注模式');
}

// 切换主题
export function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    showToast(isDark ? '已切换到深色主题' : '已切换到浅色主题');
}

// 加载主题设置
export function loadTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

// ESC退出专注模式
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('focus-mode')) {
        document.body.classList.remove('focus-mode');
        showToast('已退出专注模式');
    }
});
