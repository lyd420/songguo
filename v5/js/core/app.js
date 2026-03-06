/* ============================================
   网文写作助手 v5 - 应用主入口
   ============================================ */

import { state } from './state.js';
import { loadChapterContent, loadNextChapterId } from './storage.js';
import { countWords } from './state.js';

// 导入各模块
import { 
    initWorkshop, enterBook, switchToWorkshop, 
    showCreateBookModal, closeCreateBookModal, confirmCreateBook,
    generateBookTitleSuggestions, useBookTitle, polishBookSummary,
    switchPage, toggleNavSection, switchSidebarTab, setEditorCallbacks,
    filterBooks, renderWorksList, changeMonth,
    filterEarningsByBook, filterEarningsByMonth
} from '../modules/workshop.js';

import {
    saveContent, saveDraft, publishChapter, toggleVolume,
    switchChapter, goBack, initChapterTree, renderChapterTree,
    addChapter, closeChapterModal, confirmAddChapter,
    showAddVolumeModal, closeVolumeModal, confirmAddVolume,
    deleteChapter, deleteVolume, autoSaveContent, setChapterManagerCallbacks
} from '../modules/chapterManager.js';

import {
    openGoalEditor, closeGoalModal, setGoalPreset, saveGoal,
    initDailyGoal, checkAndResetDailyProgress
} from '../modules/dailyGoal.js';

import {
    handleMarkClick, hideMarkPopup, selectMarkType, saveMark, deleteMark,
    jumpToLine, initLineMarkEvents, loadChapterMarks, updateLineNumbers
} from '../modules/lineMark.js';

import {
    toggleAIPanel, switchAITab, showTemplateDetail, closeTemplateModal, applyTemplate
} from '../modules/aiPanel.js';

import {
    initCharacterCards, showCharacterDetail, closeCharacterPanel, insertCharacterName,
    confirmAddNewCharacter, ignoreNewCharacter, showAddCharacterModal,
    editCurrentCharacter, editCharacter, closeCharacterEditModal, saveCharacter, deleteCharacter
} from '../modules/characterCard.js';

import {
    initEditorEvents, toggleFocusMode, toggleTheme, loadTheme
} from '../modules/editor.js';

import { showToast, updateWordCountDisplay, updateDailyGoalDisplay, updateMarksList } from '../utils/ui.js';

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('[App] v5 Starting initialization...');

        // 设置编辑器回调
        setEditorCallbacks({
            initEditorEvents,
            initLineMarkEvents,
            loadChapterMarks,
            initCharacterCards
        });
        
        // 设置章节管理器回调
        setChapterManagerCallbacks({
            updateLineNumbers,
            updateMarksList
        });

        // 加载主题
        loadTheme();

        // 初始化DOM引用
        state.editor = document.getElementById('editor');

        // 初始化数据
        state.nextChapterId = loadNextChapterId();

        // 初始化工作台
        initWorkshop();

        // 设置默认页面
        switchPage('workshop');

        console.log('[App] v5 Initialization complete');
    } catch (error) {
        console.error('[App] Initialization failed:', error);
    }
});

// 挂载全局函数供HTML调用
window.switchPage = switchPage;
window.toggleNavSection = toggleNavSection;
window.switchSidebarTab = switchSidebarTab;

// 工作台
window.initWorkshop = initWorkshop;
window.enterBook = enterBook;
window.switchToWorkshop = switchToWorkshop;
window.showCreateBookModal = showCreateBookModal;
window.closeCreateBookModal = closeCreateBookModal;
window.confirmCreateBook = confirmCreateBook;
window.generateBookTitleSuggestions = generateBookTitleSuggestions;
window.useBookTitle = useBookTitle;
window.polishBookSummary = polishBookSummary;
window.filterBooks = filterBooks;
window.renderWorksList = renderWorksList;
window.changeMonth = changeMonth;

// 收益分析
window.filterEarningsByBook = filterEarningsByBook;
window.filterEarningsByMonth = filterEarningsByMonth;

// 章节目录
window.saveContent = saveContent;
window.saveDraft = saveDraft;
window.publishChapter = publishChapter;
window.toggleVolume = toggleVolume;
window.switchChapter = switchChapter;
window.goBack = goBack;
window.initChapterTree = initChapterTree;
window.renderChapterTree = renderChapterTree;
window.addChapter = addChapter;
window.closeChapterModal = closeChapterModal;
window.confirmAddChapter = confirmAddChapter;
window.showAddVolumeModal = showAddVolumeModal;
window.closeVolumeModal = closeVolumeModal;
window.confirmAddVolume = confirmAddVolume;
window.deleteChapter = deleteChapter;
window.deleteVolume = deleteVolume;

// 日更目标
window.openGoalEditor = openGoalEditor;
window.closeGoalModal = closeGoalModal;
window.setGoalPreset = setGoalPreset;
window.saveGoal = saveGoal;

// 行标记
window.handleMarkClick = handleMarkClick;
window.hideMarkPopup = hideMarkPopup;
window.selectMarkType = selectMarkType;
window.saveMark = saveMark;
window.deleteMark = deleteMark;
window.jumpToLine = jumpToLine;

// AI面板
window.toggleAIPanel = toggleAIPanel;
window.switchAITab = switchAITab;
window.showTemplateDetail = showTemplateDetail;
window.closeTemplateModal = closeTemplateModal;
window.applyTemplate = applyTemplate;

// 人物卡
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

// 编辑器
window.toggleFocusMode = toggleFocusMode;
window.toggleTheme = toggleTheme;

// 工具函数
window.showToast = showToast;

console.log('[App] v5 Global functions mounted');
