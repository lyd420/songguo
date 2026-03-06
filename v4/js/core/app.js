/* ============================================
   网文写作助手 v4 - 应用主入口
   ============================================ */

console.log('[App] Module loading started');

import { state } from './state.js';
import { loadChapterContent } from './storage.js';
import { countWords } from './state.js';

console.log('[App] Core modules imported');

import { initDailyGoal, checkAndResetDailyProgress } from '../modules/dailyGoal.js';
import { initLineMarkEvents, loadChapterMarks } from '../modules/lineMark.js';
import { startBlockDetection } from '../modules/blockDetection.js';
import { initEditorEvents, toggleFocusMode, toggleTheme } from '../modules/editor.js';
import { checkOnboarding } from '../modules/onboarding.js';
import { updateWordCountDisplay, updateDailyGoalDisplay, showToast, updateMarksList } from '../utils/ui.js';

console.log('[App] All modules imported successfully');

import {
    saveContent, saveDraft, publishChapter, toggleVolume,
    switchChapter, cancelSwitch, discardAndSwitch, saveAndSwitch, goBack,
    initChapterTree, renderChapterTree, addChapter, closeChapterModal,
    confirmAddChapter, showAddVolumeModal, closeVolumeModal, confirmAddVolume,
    deleteChapter, deleteVolume, updateChapterTitle
} from '../modules/chapterManager.js';

import {
    openGoalEditor, closeGoalModal, setGoalPreset, saveGoal
} from '../modules/dailyGoal.js';

import {
    handleMarkClick, hideMarkThread, hideMarkPopup, selectMarkType, saveMark, deleteMark, jumpToLine
} from '../modules/lineMark.js';

import {
    toggleAIPanel, switchAITab, showTemplateDetail, closeTemplateModal, applyTemplate
} from '../modules/aiPanel.js';

import {
    dismissBlock, openBlockHelp
} from '../modules/blockDetection.js';

import {
    nextOnboardingStep, selectAuthorType, selectGenre, finishOnboarding, skipOnboarding, selectTemplate
} from '../modules/onboarding.js';

import {
    initWorkshop, enterBook, switchToWorkshop, filterBooks, 
    showCreateBookModal, closeCreateBookModal, confirmCreateBook,
    generateBookTitleSuggestions, useBookTitle, polishBookSummary, generateBookInspiration,
    continueLastBook, showStats, showRecycleBin
} from '../modules/workshop.js';

import {
    initCharacterCards, showCharacterDetail, closeCharacterPanel, insertCharacterName,
    confirmAddNewCharacter, ignoreNewCharacter, showAddCharacterModal, editCurrentCharacter,
    editCharacter, closeCharacterEditModal, saveCharacter, deleteCharacter
} from '../modules/characterCard.js';

import {
    insertText, generateName
} from '../utils/ui.js';

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('[App] Starting initialization...');

        // 初始化DOM引用
        state.editor = document.getElementById('editor');
        state.editorContent = document.getElementById('editorContent');

        if (!state.editor) {
            console.error('[App] Critical: Editor element (#editor) not found');
            return;
        }
        console.log('[App] Editor element found');

        // 检查引导
        const hasCompleted = checkOnboarding();
        console.log('[App] Onboarding completed:', hasCompleted);

        if (!hasCompleted) {
            // 引导未完成，隐藏工作台和编辑器，显示引导
            const workshop = document.getElementById('workshopContainer');
            const editor = document.getElementById('mainContainer');
            const header = document.querySelector('.header');
            
            if (workshop) workshop.style.display = 'none';
            if (editor) editor.style.display = 'none';
            if (header) header.style.display = 'none';
            return;
        }

        // 引导已完成，初始化工作台
        initWorkshop();

        console.log('[App] Initialization complete');
    } catch (error) {
        console.error('[App] Initialization failed:', error);
    }
});

// 初始化编辑器（从工作台进入书籍时调用）
export function initEditor() {
    // 重新获取编辑器引用（因为可能刚显示出来）
    state.editor = document.getElementById('editor');
    state.editorContent = document.getElementById('editorContent');
    
    if (!state.editor) {
        console.error('[App] Editor element not found');
        return;
    }

    // 如果没有当前书籍，创建默认书籍数据
    if (!state.currentBook) {
        state.currentBook = {
            id: 1,
            title: '至尊龙婿',
            genre: 'urban',
            totalChapters: 15
        };
    }

    // 初始化章节目录（加载默认卷和章节）
    initChapterTree();

    // 初始化人物卡
    initCharacterCards();

    // 初始化功能
    initDailyGoal();
    checkAndResetDailyProgress();

    // 加载章节内容
    const content = loadChapterContent(state.currentChapter);
    state.editor.value = content;
    state.originalContent = content;
    state.wordCountAtOpen = countWords(content);

    // 初始化事件
    initEditorEvents();
    initLineMarkEvents();

    // 加载标记
    loadChapterMarks(state.currentChapter);

    // 更新UI
    updateWordCountDisplay();
    updateDailyGoalDisplay();

    // 启动卡文检测
    startBlockDetection();

    // 自动保存
    setInterval(async () => {
        if (state.isDirty) {
            const { autoSaveContent } = await import('../modules/chapterManager.js');
            autoSaveContent();
        }
    }, 30000);
    
    console.log('[App] Editor initialized successfully');
}

// 挂载全局函数供HTML调用
console.log('[App] Mounting global functions...');

window.saveContent = saveContent;
window.saveDraft = saveDraft;
window.publishChapter = publishChapter;
window.toggleVolume = toggleVolume;
window.switchChapter = switchChapter;
window.cancelSwitch = cancelSwitch;
window.discardAndSwitch = discardAndSwitch;
window.saveAndSwitch = saveAndSwitch;
window.goBack = goBack;

// 章节目录管理函数
window.addChapter = addChapter;
window.closeChapterModal = closeChapterModal;
window.confirmAddChapter = confirmAddChapter;
window.showAddVolumeModal = showAddVolumeModal;
window.closeVolumeModal = closeVolumeModal;
window.confirmAddVolume = confirmAddVolume;
window.deleteChapter = deleteChapter;
window.deleteVolume = deleteVolume;

window.openGoalEditor = openGoalEditor;
window.closeGoalModal = closeGoalModal;
window.setGoalPreset = setGoalPreset;
window.saveGoal = saveGoal;

window.handleMarkClick = handleMarkClick;
window.hideMarkThread = hideMarkThread;
window.hideMarkPopup = hideMarkPopup;
window.selectMarkType = selectMarkType;
window.saveMark = saveMark;
window.deleteMark = deleteMark;
window.jumpToLine = jumpToLine;

window.toggleAIPanel = toggleAIPanel;
window.switchAITab = switchAITab;
window.showTemplateDetail = showTemplateDetail;
window.closeTemplateModal = closeTemplateModal;
window.applyTemplate = applyTemplate;

window.dismissBlock = dismissBlock;
window.openBlockHelp = openBlockHelp;

window.nextOnboardingStep = nextOnboardingStep;
window.selectAuthorType = selectAuthorType;
window.selectGenre = selectGenre;
window.finishOnboarding = finishOnboarding;
window.skipOnboarding = skipOnboarding;
window.selectTemplate = selectTemplate;

// 工作台函数
window.initWorkshop = initWorkshop;
window.enterBook = enterBook;
window.switchToWorkshop = switchToWorkshop;
window.filterBooks = filterBooks;
window.showCreateBookModal = showCreateBookModal;
window.closeCreateBookModal = closeCreateBookModal;
window.confirmCreateBook = confirmCreateBook;
window.generateBookTitleSuggestions = generateBookTitleSuggestions;
window.useBookTitle = useBookTitle;
window.polishBookSummary = polishBookSummary;
window.generateBookInspiration = generateBookInspiration;
window.continueLastBook = continueLastBook;
window.showStats = showStats;
window.showRecycleBin = showRecycleBin;

// 人物卡函数
window.initCharacterCards = initCharacterCards;
window.showCharacterDetail = showCharacterDetail;
window.closeCharacterPanel = closeCharacterPanel;
window.insertCharacterName = insertCharacterName;
window.confirmAddNewCharacter = confirmAddNewCharacter;
window.ignoreNewCharacter = ignoreNewCharacter;
window.showAddCharacterModal = showAddCharacterModal;
window.editCurrentCharacter = editCurrentCharacter;
window.editCharacter = editCharacter;
window.closeCharacterEditModal = closeCharacterEditModal;
window.saveCharacter = saveCharacter;
window.deleteCharacter = deleteCharacter;

window.toggleFocusMode = toggleFocusMode;
window.toggleTheme = toggleTheme;

window.insertText = insertText;
window.generateName = generateName;

window.showToast = showToast;

console.log('[App] Global functions mounted');
