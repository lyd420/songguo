/* ============================================
   网文写作助手 v4 - 自动保存模块
   ============================================ */

import { getState } from '../core/state.js';
import { saveContent } from './editor.js';
import { debounce, showToast } from '../utils/helpers.js';

let autoSaveTimer = null;
let isAutoSaveEnabled = true;

/**
 * 初始化自动保存
 */
export function initAutoSave() {
    // 监听内容变化，触发自动保存倒计时
    document.addEventListener('editor:input', () => {
        if (isAutoSaveEnabled) {
            scheduleAutoSave();
        }
    });

    // 页面关闭前保存
    window.addEventListener('beforeunload', () => {
        if (getState('isModified')) {
            saveContent();
        }
    });

    // 定期保存（每30秒）
    setInterval(() => {
        if (isAutoSaveEnabled && getState('isModified')) {
            saveContent();
            showAutoSaveIndicator();
        }
    }, 30000);
}

/**
 * 安排自动保存（延迟执行）
 */
const scheduleAutoSave = debounce(() => {
    if (getState('isModified')) {
        saveContent();
        showAutoSaveIndicator();
    }
}, 3000);

/**
 * 显示自动保存指示器
 */
function showAutoSaveIndicator() {
    const indicator = document.getElementById('autoSaveIndicator');
    if (indicator) {
        indicator.textContent = '已保存';
        indicator.style.opacity = '1';

        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 2000);
    }
}

/**
 * 立即保存
 */
export function saveNow() {
    saveContent();
    showAutoSaveIndicator();
    showToast('已保存', 'success');
}

/**
 * 启用/禁用自动保存
 * @param {boolean} enabled
 */
export function setAutoSaveEnabled(enabled) {
    isAutoSaveEnabled = enabled;
}

/**
 * 检查是否有未保存内容
 * @returns {boolean}
 */
export function hasUnsavedContent() {
    return getState('isModified');
}

/**
 * 获取最后保存时间
 * @returns {Date|null}
 */
export function getLastSavedTime() {
    return getState('lastSaved');
}
