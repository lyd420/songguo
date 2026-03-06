/* ============================================
   网文写作助手 v5 - 章节目录管理
   ============================================ */

import { state, countWords, formatWordCount } from '../core/state.js';
import { loadVolumes, saveVolumes, saveChapterContent, loadChapterContent, saveNextChapterId, createDefaultVolumes, loadLineMarks } from '../core/storage.js';
import { showToast, updateWordCountDisplay, updateSaveStatus, updateMarksList } from '../utils/ui.js';

// UI更新回调（由app.js设置）
let updateLineNumbersCallback = null;
let updateMarksListCallback = null;

export function setChapterManagerCallbacks(callbacks) {
    updateLineNumbersCallback = callbacks.updateLineNumbers;
    updateMarksListCallback = callbacks.updateMarksList;
}

// 初始化章节树 - 根据当前书籍加载
export function initChapterTree() {
    if (!state.currentBook) return;
    
    let volumes = loadVolumes(state.currentBook.id);
    
    // 如果没有数据，创建默认结构
    if (!volumes) {
        volumes = createDefaultVolumes();
        saveVolumes(state.currentBook.id, volumes);
    }
    
    state.volumes = volumes;
    state.nextVolumeId = Math.max(...volumes.map(v => v.id), 0) + 1;
    state.nextChapterId = Math.max(...volumes.flatMap(v => v.chapters.map(c => c.id)), 0) + 1;
    
    renderChapterTree();
}

// 渲染章节树
export function renderChapterTree() {
    const container = document.getElementById('chapterTree');
    if (!container) return;

    container.innerHTML = state.volumes.map(volume => `
        <div class="volume-item ${volume.id === state.currentVolumeId ? 'expanded' : ''}" data-volume-id="${volume.id}">
            <div class="volume-header" onclick="toggleVolume(${volume.id})">
                <span class="volume-toggle">▶</span>
                <span>${volume.name}</span>
            </div>
            <div class="volume-chapters">
                ${volume.chapters.map(chapter => `
                    <div class="chapter-item ${chapter.id === state.currentChapter ? 'active' : ''}" 
                         onclick="switchChapter(${chapter.id})" 
                         data-chapter-id="${chapter.id}">
                        <span class="chapter-item-number">第${chapter.id}章</span>
                        <span>${chapter.title}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// 展开/收起卷
export function toggleVolume(volumeId) {
    const volumeEl = document.querySelector(`[data-volume-id="${volumeId}"]`);
    volumeEl?.classList.toggle('expanded');
}

// 切换章节
export function switchChapter(chapterId) {
    if (state.isDirty) {
        state.pendingChapter = chapterId;
        showUnsavedModal();
        return;
    }
    
    doSwitchChapter(chapterId);
}

// 执行章节切换
function doSwitchChapter(chapterId) {
    // 保存当前章节标记
    saveLineMarks(state.currentChapter, state.lineMarks);
    
    // 加载新章节
    state.currentChapter = chapterId;
    const content = loadChapterContent(state.currentBook.id + '_' + chapterId);
    
    if (state.editor) {
        state.editor.value = content;
        state.originalContent = content;
        state.wordCountAtOpen = countWords(content);
    }
    
    // 更新标题
    const chapterTitleEl = document.getElementById('editorChapterTitle');
    const chapterInputEl = document.getElementById('chapterTitle');
    
    if (chapterTitleEl) chapterTitleEl.textContent = `第${chapterId}章`;
    
    // 找到章节标题
    let chapterTitle = '';
    state.volumes.forEach(v => {
        const ch = v.chapters.find(c => c.id === chapterId);
        if (ch) chapterTitle = ch.title;
    });
    
    if (chapterInputEl) chapterInputEl.value = `第${chapterId}章 ${chapterTitle}`;
    
    // 更新UI
    renderChapterTree();
    updateWordCountDisplay();
    
    // 加载新章节标记
    const chapterKey = state.currentBook ? `${state.currentBook.id}_${chapterId}` : chapterId;
    state.lineMarks = loadLineMarks(chapterKey);
    
    // 更新UI
    if (updateLineNumbersCallback) updateLineNumbersCallback();
    if (updateMarksListCallback) updateMarksListCallback();
    
    showToast(`已切换到第${chapterId}章`);
}

// 显示未保存提示
function showUnsavedModal() {
    if (confirm('当前章节有未保存的更改，是否保存？')) {
        saveContent();
        doSwitchChapter(state.pendingChapter);
    } else {
        state.isDirty = false;
        doSwitchChapter(state.pendingChapter);
    }
    state.pendingChapter = null;
}

// 保存内容
export function saveContent() {
    if (!state.editor) return;

    const content = state.editor.value;
    const chapterKey = state.currentBook ? `${state.currentBook.id}_${state.currentChapter}` : state.currentChapter;
    
    saveChapterContent(chapterKey, content);
    saveLineMarks(chapterKey, state.lineMarks);
    
    state.originalContent = content;
    state.isDirty = false;
    
    // 更新字数统计
    const wordCount = countWords(content);
    updateBookWordCount(wordCount);
    
    updateSaveStatus('已保存');
    showToast('保存成功');
}

// 保存草稿
export function saveDraft() {
    saveContent();
}

// 自动保存
export function autoSaveContent() {
    if (!state.editor || !state.isDirty) return;
    
    const content = state.editor.value;
    const chapterKey = state.currentBook ? `${state.currentBook.id}_${state.currentChapter}` : state.currentChapter;
    
    saveChapterContent(chapterKey, content);
    saveLineMarks(chapterKey, state.lineMarks);
    
    updateSaveStatus('已自动保存');
}

// 更新书籍字数
function updateBookWordCount(wordCount) {
    if (!state.currentBook) return;
    
    const book = state.books.find(b => b.id === state.currentBook.id);
    if (book) {
        const diff = wordCount - state.wordCountAtOpen;
        if (diff > 0) {
            book.totalWords += diff;
            book.todayWords += diff;
            book.lastUpdated = new Date().toISOString();
            saveBooks(state.books);
        }
    }
}

// 发布章节
export function publishChapter() {
    saveContent();
    showToast('章节已发布');
}

// 返回工作台
export async function goBack() {
    if (state.isDirty) {
        if (confirm('当前章节有未保存的更改，是否保存？')) {
            saveContent();
        }
    }
    
    const { switchToWorkshop } = await import('./workshop.js');
    switchToWorkshop();
}

// 显示添加章节弹窗
export function addChapter() {
    const modal = document.getElementById('chapterModal');
    if (!modal) return;

    // 填充卷选择
    const select = document.getElementById('newChapterVolume');
    if (select) {
        select.innerHTML = state.volumes.map(v => `
            <option value="${v.id}">${v.name}</option>
        `).join('');
    }

    document.getElementById('newChapterTitle').value = '';
    modal.classList.add('active');
}

// 关闭章节弹窗
export function closeChapterModal() {
    document.getElementById('chapterModal')?.classList.remove('active');
}

// 确认添加章节
export function confirmAddChapter() {
    const title = document.getElementById('newChapterTitle')?.value?.trim();
    const volumeId = parseInt(document.getElementById('newChapterVolume')?.value);

    if (!title) {
        showToast('请输入章节标题');
        return;
    }

    const newChapter = {
        id: state.nextChapterId++,
        title: title,
        wordCount: 0
    };

    const volume = state.volumes.find(v => v.id === volumeId);
    if (volume) {
        volume.chapters.push(newChapter);
        saveVolumes(state.currentBook.id, state.volumes);
        saveNextChapterId(state.nextChapterId);
        renderChapterTree();
        closeChapterModal();
        showToast('章节添加成功');
    }
}

// 显示添加卷弹窗
export function showAddVolumeModal() {
    document.getElementById('volumeModal')?.classList.add('active');
    document.getElementById('newVolumeName').value = '';
}

// 关闭卷弹窗
export function closeVolumeModal() {
    document.getElementById('volumeModal')?.classList.remove('active');
}

// 确认添加卷
export function confirmAddVolume() {
    const name = document.getElementById('newVolumeName')?.value?.trim();

    if (!name) {
        showToast('请输入卷名称');
        return;
    }

    const newVolume = {
        id: state.nextVolumeId++,
        name: name,
        chapters: []
    };

    state.volumes.push(newVolume);
    saveVolumes(state.currentBook.id, state.volumes);
    renderChapterTree();
    closeVolumeModal();
    showToast('卷添加成功');
}

// 删除章节
export function deleteChapter(chapterId) {
    if (!confirm('确定要删除这个章节吗？')) return;

    state.volumes.forEach(volume => {
        volume.chapters = volume.chapters.filter(c => c.id !== chapterId);
    });
    
    saveVolumes(state.currentBook.id, state.volumes);
    renderChapterTree();
    showToast('章节已删除');
}

// 删除卷
export function deleteVolume(volumeId) {
    if (!confirm('确定要删除这个卷吗？其中的章节也会被删除。')) return;

    state.volumes = state.volumes.filter(v => v.id !== volumeId);
    saveVolumes(state.currentBook.id, state.volumes);
    renderChapterTree();
    showToast('卷已删除');
}


