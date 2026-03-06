/* ============================================
   网文写作助手 v4 - 章节管理模块
   ============================================ */

import { state, countWords } from '../core/state.js';
import { saveChapterContent, loadChapterContent, saveLineMarks, saveVolumes, loadVolumes, saveNextChapterId, loadNextChapterId } from '../core/storage.js';
import { updateWordCountDisplay, showToast, updateMarksList } from '../utils/ui.js';
import { renderMarkIndicators, loadChapterMarks } from './lineMark.js';
import { switchToWorkshop } from './workshop.js';

// 保存内容
export function saveContent() {
    saveChapterContent(state.currentChapter, state.editor.value);
    state.originalContent = state.editor.value;
    state.isDirty = false;

    const activeItem = document.querySelector('.chapter-item.active');
    if (activeItem) activeItem.classList.remove('dirty');

    // 更新当前章节的字数
    updateCurrentChapterWordCount();

    showToast('内容已保存');
}

// 更新当前章节字数
function updateCurrentChapterWordCount() {
    const wordCount = countWords(state.editor.value);
    const volume = state.volumes.find(v => v.chapters.some(c => c.id === state.currentChapter));
    if (volume) {
        const chapter = volume.chapters.find(c => c.id === state.currentChapter);
        if (chapter) {
            chapter.wordCount = wordCount;
            saveVolumes(state.volumes);
            renderChapterTree();
        }
    }
}

// 自动保存
export function autoSaveContent() {
    saveChapterContent(state.currentChapter, state.editor.value);
    updateCurrentChapterWordCount();
    showToast('自动保存成功');
}

// 保存草稿
export function saveDraft() {
    saveContent();
}

// 发布章节
export function publishChapter() {
    saveContent();
    showToast('🎉 章节发布成功！');
}

// 返回工作台
export function goBack() {
    if (state.isDirty) {
        if (confirm('有未保存的更改，是否保存？')) {
            saveContent();
        }
    }
    switchToWorkshop();
}

// 切换卷展开/折叠
export function toggleVolume(header) {
    const volumeItem = header.parentElement;
    const chapterList = volumeItem.querySelector('.chapter-list');
    const toggle = header.querySelector('.volume-toggle');

    if (chapterList.style.display === 'none') {
        chapterList.style.display = 'block';
        toggle.classList.remove('collapsed');
    } else {
        chapterList.style.display = 'none';
        toggle.classList.add('collapsed');
    }
}

// 切换章节
export function switchChapter(chapterId) {
    if (chapterId === state.currentChapter) return;

    if (state.isDirty) {
        state.pendingChapter = chapterId;
        document.getElementById('unsavedModal').classList.add('active');
        return;
    }

    doSwitchChapter(chapterId);
}

// 执行切换
export function doSwitchChapter(chapterId) {
    if (!state.editor) {
        console.warn('[ChapterManager] Editor not initialized');
        return;
    }

    // 更新UI
    document.querySelectorAll('.chapter-item').forEach(item => {
        item.classList.remove('active');
        if (parseInt(item.dataset.chapter) === chapterId) {
            item.classList.add('active');
        }
    });

    // 保存当前章节标记
    saveLineMarks(state.currentChapter, state.lineMarks);

    // 加载新章节
    state.currentChapter = chapterId;
    const content = loadChapterContent(chapterId);
    state.editor.value = content;
    state.originalContent = content;
    state.wordCountAtOpen = countWords(content);
    state.isDirty = false;

    // 更新标题
    const volume = state.volumes.find(v => v.chapters.some(c => c.id === chapterId));
    const chapter = volume ? volume.chapters.find(c => c.id === chapterId) : null;
    const chapterName = chapter ? `第${chapterId}章 ${chapter.title}` : `第${chapterId}章`;

    const headerNameEl = document.getElementById('headerChapterName');
    const titleEl = document.getElementById('chapterTitle');

    if (headerNameEl) headerNameEl.textContent = chapterName;
    if (titleEl) titleEl.value = chapterName;

    // 加载标记
    loadChapterMarks(chapterId);

    updateWordCountDisplay();
    showToast(`已切换到${chapterName}`);
}

// 取消切换
export function cancelSwitch() {
    state.pendingChapter = null;
    document.getElementById('unsavedModal').classList.remove('active');
}

// 放弃修改并切换
export function discardAndSwitch() {
    document.getElementById('unsavedModal').classList.remove('active');
    state.isDirty = false;
    if (state.pendingChapter) {
        doSwitchChapter(state.pendingChapter);
        state.pendingChapter = null;
    }
}

// 保存并切换
export function saveAndSwitch() {
    document.getElementById('unsavedModal').classList.remove('active');
    saveContent();
    if (state.pendingChapter) {
        doSwitchChapter(state.pendingChapter);
        state.pendingChapter = null;
    }
}

// ==================== 章节目录管理 ====================

// 初始化章节目录
export function initChapterTree() {
    // 加载卷和章节数据
    state.volumes = loadVolumes();
    state.nextChapterId = loadNextChapterId();

    // 找到最大的卷ID
    const maxVolumeId = Math.max(...state.volumes.map(v => v.id), 0);
    state.nextVolumeId = maxVolumeId + 1;

    // 渲染目录树
    renderChapterTree();
}

// 渲染章节目录树
export function renderChapterTree() {
    const container = document.getElementById('chapterTreeContainer');
    if (!container) return;

    // 构建HTML内容
    let html = `
        <div class="sidebar-title">
            <span>📚 章节导航</span>
            <button class="add-btn" onclick="showAddVolumeModal()">+</button>
        </div>
    `;

    state.volumes.forEach(volume => {
        const chapterCount = volume.chapters.length;
        const isExpanded = volume.chapters.some(c => c.id === state.currentChapter);

        html += `
            <div class="volume-item ${isExpanded ? '' : 'collapsed'}" data-volume="${volume.id}">
                <div class="volume-header" onclick="toggleVolume(this)">
                    <span class="volume-toggle ${isExpanded ? '' : 'collapsed'}">▼</span>
                    <span>${volume.name}</span>
                    <span class="volume-count">${chapterCount}章</span>
                    <button class="add-chapter-btn" onclick="addChapter(${volume.id}, event)" title="添加章节">+</button>
                </div>
                <div class="chapter-list" style="display: ${isExpanded ? 'block' : 'none'}">
        `;

        volume.chapters.forEach(chapter => {
            const isActive = chapter.id === state.currentChapter;
            const isDirty = isActive && state.isDirty;
            const wordCountText = chapter.wordCount > 0 ? `${chapter.wordCount}字` : '';

            html += `
                <div class="chapter-item ${isActive ? 'active' : ''} ${isDirty ? 'dirty' : ''}" 
                     data-chapter="${chapter.id}" 
                     onclick="switchChapter(${chapter.id})">
                    <span class="chapter-number">${chapter.id}</span>
                    <span class="chapter-title" title="${chapter.title}">${chapter.title}</span>
                    ${wordCountText ? `<span class="chapter-wordcount">${wordCountText}</span>` : ''}
                    <span class="dirty-dot"></span>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    html += `
        <button class="add-volume-btn" onclick="showAddVolumeModal()">+ 新增卷</button>
    `;

    // 更新容器内容
    container.innerHTML = html;
}

// 显示添加章节弹窗
export function addChapter(volumeId, event) {
    if (event) {
        event.stopPropagation();
    }

    state.currentVolumeId = volumeId;

    // 找到该卷中最大的章节号
    const volume = state.volumes.find(v => v.id === volumeId);
    let nextNum = 1;
    if (volume && volume.chapters.length > 0) {
        const maxNum = Math.max(...volume.chapters.map(c => c.id));
        nextNum = maxNum + 1;
    }

    // 设置默认值
    const numberInput = document.getElementById('chapterNumberInput');
    const titleInput = document.getElementById('chapterTitleInput');
    const hint = document.getElementById('chapterHint');

    if (numberInput) numberInput.value = nextNum;
    if (titleInput) titleInput.value = '';
    if (hint) hint.style.display = 'none';

    // 显示弹窗
    const modal = document.getElementById('chapterModal');
    if (modal) {
        modal.classList.add('active');
        setTimeout(() => titleInput?.focus(), 100);
    }
}

// 关闭添加章节弹窗
export function closeChapterModal() {
    const modal = document.getElementById('chapterModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// 确认添加章节
export function confirmAddChapter() {
    const numberInput = document.getElementById('chapterNumberInput');
    const titleInput = document.getElementById('chapterTitleInput');
    const hint = document.getElementById('chapterHint');

    const chapterNum = parseInt(numberInput?.value) || 0;
    const title = titleInput?.value?.trim() || '';

    // 验证
    if (chapterNum < 1) {
        if (hint) {
            hint.textContent = '章节序号必须大于0';
            hint.style.display = 'block';
        }
        return;
    }

    if (!title) {
        if (hint) {
            hint.textContent = '请输入章节标题';
            hint.style.display = 'block';
        }
        titleInput?.focus();
        return;
    }

    // 检查章节号是否已存在
    const volume = state.volumes.find(v => v.id === state.currentVolumeId);
    if (volume) {
        const exists = volume.chapters.some(c => c.id === chapterNum);
        if (exists) {
            if (hint) {
                hint.textContent = `第${chapterNum}章已存在`;
                hint.style.display = 'block';
            }
            return;
        }
    }

    // 创建新章节
    const newChapter = {
        id: chapterNum,
        title: title,
        wordCount: 0
    };

    // 添加到卷的章节列表（保持排序）
    if (volume) {
        volume.chapters.push(newChapter);
        volume.chapters.sort((a, b) => a.id - b.id);
    }

    // 保存数据
    saveVolumes(state.volumes);
    if (chapterNum >= state.nextChapterId) {
        state.nextChapterId = chapterNum + 1;
        saveNextChapterId(state.nextChapterId);
    }

    // 重新渲染
    renderChapterTree();

    // 关闭弹窗
    closeChapterModal();

    // 自动切换到新章节
    doSwitchChapter(chapterNum);

    showToast(`第${chapterNum}章创建成功`);
}

// 显示添加卷弹窗
export function showAddVolumeModal() {
    const numberInput = document.getElementById('volumeNumberInput');
    const titleInput = document.getElementById('volumeTitleInput');

    if (numberInput) numberInput.value = state.nextVolumeId;
    if (titleInput) titleInput.value = '';

    const modal = document.getElementById('volumeModal');
    if (modal) {
        modal.classList.add('active');
        setTimeout(() => titleInput?.focus(), 100);
    }
}

// 关闭添加卷弹窗
export function closeVolumeModal() {
    const modal = document.getElementById('volumeModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// 确认添加卷
export function confirmAddVolume() {
    const numberInput = document.getElementById('volumeNumberInput');
    const titleInput = document.getElementById('volumeTitleInput');

    const volumeNum = parseInt(numberInput?.value) || 0;
    let title = titleInput?.value?.trim() || '';

    // 验证
    if (volumeNum < 1) {
        showToast('卷序号必须大于0');
        return;
    }

    // 检查卷号是否已存在
    const exists = state.volumes.some(v => v.id === volumeNum);
    if (exists) {
        showToast(`第${volumeNum}卷已存在`);
        return;
    }

    // 如果没有输入标题，使用默认标题
    if (!title) {
        title = `第${volumeNum}卷`;
    }

    // 创建新卷
    const newVolume = {
        id: volumeNum,
        name: title,
        chapters: []
    };

    // 添加到卷列表
    state.volumes.push(newVolume);
    state.volumes.sort((a, b) => a.id - b.id);

    // 更新下一个卷ID
    state.nextVolumeId = Math.max(...state.volumes.map(v => v.id)) + 1;

    // 保存数据
    saveVolumes(state.volumes);

    // 重新渲染
    renderChapterTree();

    // 关闭弹窗
    closeVolumeModal();

    // 设置当前卷ID
    state.currentVolumeId = volumeNum;

    showToast(`${title}创建成功`);
}

// 删除章节（可选功能）
export function deleteChapter(chapterId) {
    if (!confirm(`确定要删除第${chapterId}章吗？此操作不可恢复。`)) {
        return;
    }

    // 找到包含该章节的卷
    const volumeIndex = state.volumes.findIndex(v => v.chapters.some(c => c.id === chapterId));
    if (volumeIndex === -1) return;

    const volume = state.volumes[volumeIndex];
    volume.chapters = volume.chapters.filter(c => c.id !== chapterId);

    // 如果删除的是当前章节，切换到该卷的第一个章节或上一个章节
    if (chapterId === state.currentChapter) {
        const remainingChapters = volume.chapters;
        if (remainingChapters.length > 0) {
            doSwitchChapter(remainingChapters[0].id);
        } else {
            // 该卷没有章节了，找其他卷
            const otherVolume = state.volumes.find(v => v.chapters.length > 0);
            if (otherVolume) {
                doSwitchChapter(otherVolume.chapters[0].id);
            }
        }
    }

    // 保存并刷新
    saveVolumes(state.volumes);
    renderChapterTree();

    showToast(`第${chapterId}章已删除`);
}

// 删除卷（可选功能）
export function deleteVolume(volumeId) {
    const volume = state.volumes.find(v => v.id === volumeId);
    if (!volume) return;

    const chapterCount = volume.chapters.length;
    let confirmMsg = `确定要删除${volume.name}吗？`;
    if (chapterCount > 0) {
        confirmMsg += `\n该卷包含${chapterCount}个章节，将一并删除。`;
    }
    confirmMsg += '\n此操作不可恢复。';

    if (!confirm(confirmMsg)) {
        return;
    }

    // 检查是否需要切换章节
    const needSwitch = volume.chapters.some(c => c.id === state.currentChapter);

    // 删除卷
    state.volumes = state.volumes.filter(v => v.id !== volumeId);

    // 如果需要切换，找第一个有章节的卷
    if (needSwitch) {
        const otherVolume = state.volumes.find(v => v.chapters.length > 0);
        if (otherVolume) {
            doSwitchChapter(otherVolume.chapters[0].id);
        } else {
            // 没有任何章节了，清空编辑器
            state.currentChapter = 0;
            state.editor.value = '';
            state.originalContent = '';
        }
    }

    // 保存并刷新
    saveVolumes(state.volumes);
    renderChapterTree();

    showToast(`${volume.name}已删除`);
}

// 更新章节标题（当用户在编辑器中修改标题时调用）
export function updateChapterTitle(chapterId, newTitle) {
    for (const volume of state.volumes) {
        const chapter = volume.chapters.find(c => c.id === chapterId);
        if (chapter) {
            chapter.title = newTitle;
            saveVolumes(state.volumes);
            renderChapterTree();
            break;
        }
    }
}
