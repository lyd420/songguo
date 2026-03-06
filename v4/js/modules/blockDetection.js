/* ============================================
   网文写作助手 v4 - 卡文检测模块
   ============================================ */

import { state } from '../core/state.js';
import { showToast } from '../utils/ui.js';

let blockCheckInterval;

// 开始卡文检测
export function startBlockDetection() {
    if (!state.editor) {
        console.warn('[BlockDetection] Editor not initialized');
        return;
    }

    blockCheckInterval = setInterval(() => {
        if (state.isBlockModalShown) return;

        const idleTime = Date.now() - state.lastInputTime;
        const text = state.editor?.value || '';

        // 5分钟无输入且有内容
        if (idleTime > 5 * 60 * 1000 && text.length > 200) {
            showBlockModal();
        }
    }, 60000); // 每分钟检查一次
}

// 显示卡文弹窗
export function showBlockModal() {
    state.isBlockModalShown = true;
    document.getElementById('blockModal').classList.add('active');
}

// 关闭卡文弹窗
export function dismissBlock() {
    document.getElementById('blockModal').classList.remove('active');
    state.lastInputTime = Date.now();
    state.isBlockModalShown = false;
}

// 打开卡文帮助
export function openBlockHelp() {
    dismissBlock();
    showToast('卡文帮助：建议先写大纲，或切换场景');
}
