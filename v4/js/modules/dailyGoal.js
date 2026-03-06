/* ============================================
   网文写作助手 v4 - 日更目标模块
   ============================================ */

import { state } from '../core/state.js';
import { loadDailyGoal, saveDailyGoal, loadDailyProgress, saveDailyProgress, loadLastDate, saveLastDate } from '../core/storage.js';
import { updateDailyGoalDisplay, showToast } from '../utils/ui.js';

// 初始化日更目标
export function initDailyGoal() {
    state.dailyGoal = loadDailyGoal();
    state.todayWordCount = loadDailyProgress();
    state.lastSaveDate = loadLastDate();

    checkAndResetDailyProgress();
    updateDailyGoalDisplay();
}

// 检查并重置每日进度
export function checkAndResetDailyProgress() {
    const today = new Date().toDateString();
    if (state.lastSaveDate !== today) {
        state.todayWordCount = 0;
        state.lastSaveDate = today;
        saveDailyProgress(0);
        saveLastDate(today);
    }
}

// 更新日更进度
export function updateDailyProgress(newWords) {
    if (newWords > 0) {
        state.todayWordCount += newWords;
        saveDailyProgress(state.todayWordCount);
        updateDailyGoalDisplay();

        if (state.todayWordCount >= state.dailyGoal && (state.todayWordCount - newWords) < state.dailyGoal) {
            showToast('🎉 恭喜！今日写作目标已达成！');
        }
    }
}

// 打开目标编辑器
export function openGoalEditor() {
    document.getElementById('goalInput').value = state.dailyGoal;
    document.getElementById('goalModal').classList.add('active');
}

// 关闭目标编辑器
export function closeGoalModal() {
    document.getElementById('goalModal').classList.remove('active');
}

// 设置目标预设
export function setGoalPreset(value) {
    document.getElementById('goalInput').value = value;
}

// 保存目标
export function saveGoal() {
    state.dailyGoal = parseInt(document.getElementById('goalInput').value) || 4000;
    saveDailyGoal(state.dailyGoal);
    updateDailyGoalDisplay();
    closeGoalModal();
    showToast('日更目标已更新');
}
