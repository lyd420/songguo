/* ============================================
   网文写作助手 v5 - 日更目标模块
   ============================================ */

import { state } from '../core/state.js';
import { loadDailyGoal, saveDailyGoal, loadDailyProgress, saveDailyProgress, loadLastDate, saveLastDate } from '../core/storage.js';
import { showToast } from '../utils/ui.js';

// 初始化日更目标
export function initDailyGoal() {
    state.dailyGoal = loadDailyGoal();
    state.todayWordCount = loadDailyProgress();
    
    checkAndResetDailyProgress();
}

// 检查并重置日更进度
export function checkAndResetDailyProgress() {
    const lastDate = loadLastDate();
    const today = new Date().toDateString();
    
    if (lastDate !== today) {
        // 新的一天，重置进度
        state.todayWordCount = 0;
        saveDailyProgress(0);
        saveLastDate(today);
    }
}

// 更新日更进度
export function updateDailyProgress(wordCount) {
    const diff = wordCount - state.wordCountAtOpen;
    if (diff > 0) {
        state.todayWordCount += diff;
        saveDailyProgress(state.todayWordCount);
        
        // 检查是否完成目标
        if (state.todayWordCount >= state.dailyGoal && state.todayWordCount - diff < state.dailyGoal) {
            showToast(`🎉 恭喜！今日目标 ${state.dailyGoal} 字已完成！`);
        }
    }
}

// 打开目标设置弹窗
export function openGoalEditor() {
    const modal = document.getElementById('goalModal');
    if (!modal) return;

    document.getElementById('dailyGoalInput').value = state.dailyGoal;
    modal.classList.add('active');
}

// 关闭目标弹窗
export function closeGoalModal() {
    document.getElementById('goalModal')?.classList.remove('active');
}

// 设置预设目标
export function setGoalPreset(value) {
    document.getElementById('dailyGoalInput').value = value;
}

// 保存目标
export function saveGoal() {
    const value = parseInt(document.getElementById('dailyGoalInput')?.value);
    
    if (!value || value < 100) {
        showToast('请输入有效的目标字数（至少100字）');
        return;
    }

    state.dailyGoal = value;
    saveDailyGoal(value);
    
    closeGoalModal();
    showToast(`日更目标已设置为 ${value} 字`);
}
