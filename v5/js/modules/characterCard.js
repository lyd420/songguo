/* ============================================
   网文写作助手 v5 - 人物卡模块
   ============================================ */

import { state } from '../core/state.js';
import { loadCharacters, saveCharacters } from '../core/storage.js';
import { showToast } from '../utils/ui.js';
import { ROLE_TYPES } from '../utils/constants.js';

// 初始化人物卡
export function initCharacterCards() {
    if (!state.currentBook) return;
    
    state.characters = loadCharacters(state.currentBook.id);
    renderCharacterList();
}

// 渲染人物列表
export function renderCharacterList() {
    const container = document.getElementById('characterList');
    if (!container) return;

    if (state.characters.length === 0) {
        container.innerHTML = `
            <div class="empty-state-small">
                <div class="empty-illustration">👤</div>
                <div class="empty-text">暂无人物，点击添加</div>
            </div>
        `;
        return;
    }

    container.innerHTML = state.characters.map(char => {
        const roleConfig = ROLE_TYPES[char.role] || ROLE_TYPES.minor;
        return `
            <div class="character-item" onclick="showCharacterDetail(${char.id})">
                <div class="character-avatar ${char.role}">
                    ${roleConfig.icon}
                </div>
                <div class="character-info">
                    <div class="character-name">${char.name}</div>
                    <div class="character-role">${char.roleName}</div>
                </div>
            </div>
        `;
    }).join('');
}

// 显示人物详情
export function showCharacterDetail(id) {
    const char = state.characters.find(c => c.id === id);
    if (!char) return;

    state.selectedCharacter = char;
    const panel = document.getElementById('characterDetailPanel');
    const content = document.getElementById('characterDetailContent');
    
    if (!panel || !content) return;

    const roleConfig = ROLE_TYPES[char.role] || ROLE_TYPES.minor;
    
    content.innerHTML = `
        <div class="character-detail-header">
            <div class="character-detail-avatar ${char.role}">
                ${roleConfig.icon}
            </div>
            <div class="character-detail-basic">
                <div class="character-detail-name">${char.name}</div>
                <span class="character-detail-role ${char.role}">${char.roleName}</span>
            </div>
        </div>
        
        <div class="character-detail-actions">
            <button class="character-detail-btn" onclick="insertCharacterName('${char.name}')">插入姓名</button>
            <button class="character-detail-btn" onclick="editCurrentCharacter()">编辑</button>
        </div>
        
        <div class="character-detail-section">
            <div class="character-detail-section-title">基本信息</div>
            <div class="character-detail-item">
                <div class="character-detail-label">性别</div>
                <div class="character-detail-value">${char.gender || '未知'}</div>
            </div>
            <div class="character-detail-item">
                <div class="character-detail-label">年龄</div>
                <div class="character-detail-value">${char.age || '未知'}</div>
            </div>
        </div>
        
        <div class="character-detail-section">
            <div class="character-detail-section-title">详细资料</div>
            <div class="character-detail-item">
                <div class="character-detail-label">外貌特征</div>
                <div class="character-detail-value">${char.appearance || '暂无描述'}</div>
            </div>
            <div class="character-detail-item">
                <div class="character-detail-label">性格特点</div>
                <div class="character-detail-value">${char.personality || '暂无描述'}</div>
            </div>
            <div class="character-detail-item">
                <div class="character-detail-label">人物背景</div>
                <div class="character-detail-value">${char.background || '暂无描述'}</div>
            </div>
        </div>
        
        ${char.relationships && char.relationships.length > 0 ? `
            <div class="character-detail-section">
                <div class="character-detail-section-title">人物关系</div>
                <div class="relationship-list">
                    ${char.relationships.map(rel => {
                        const targetChar = state.characters.find(c => c.id === rel.characterId);
                        if (!targetChar) return '';
                        const targetRole = ROLE_TYPES[targetChar.role] || ROLE_TYPES.minor;
                        return `
                            <div class="relationship-item">
                                <div class="relationship-avatar ${targetChar.role}">${targetRole.icon}</div>
                                <div class="relationship-info">
                                    <div class="relationship-name">${targetChar.name}</div>
                                    <div class="relationship-type">${rel.type}</div>
                                    <div class="relationship-desc">${rel.desc}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        ` : ''}
        
        ${char.quotes ? `
            <div class="character-detail-section">
                <div class="character-detail-section-title">经典语录</div>
                <div class="character-detail-value" style="font-style: italic; color: var(--primary);">"${char.quotes}"</div>
            </div>
        ` : ''}
        
        ${char.notes ? `
            <div class="character-detail-section">
                <div class="character-detail-section-title">备注</div>
                <div class="character-detail-value">${char.notes}</div>
            </div>
        ` : ''}
    `;
    
    panel.classList.add('active');
}

// 关闭人物面板
export function closeCharacterPanel() {
    document.getElementById('characterDetailPanel')?.classList.remove('active');
    state.selectedCharacter = null;
}

// 插入人物姓名到编辑器
export async function insertCharacterName(name) {
    const { insertText } = await import('../utils/ui.js');
    insertText(name);
    showToast(`已插入：${name}`);
}

// 显示添加人物弹窗
export function showAddCharacterModal() {
    state.selectedCharacter = null;
    const modal = document.getElementById('characterModal');
    if (!modal) return;

    document.getElementById('characterModalTitle').textContent = '添加人物';
    document.getElementById('charName').value = '';
    document.getElementById('charRole').value = 'supporting';
    document.getElementById('charGender').value = '男';
    document.getElementById('charAge').value = '';
    document.getElementById('charAppearance').value = '';
    document.getElementById('charPersonality').value = '';
    document.getElementById('charBackground').value = '';
    document.getElementById('charQuotes').value = '';
    document.getElementById('charNotes').value = '';

    modal.classList.add('active');
}

// 编辑当前人物
export function editCurrentCharacter() {
    if (!state.selectedCharacter) return;
    editCharacter(state.selectedCharacter.id);
}

// 编辑人物
export function editCharacter(id) {
    const char = state.characters.find(c => c.id === id);
    if (!char) return;

    state.selectedCharacter = char;
    const modal = document.getElementById('characterModal');
    if (!modal) return;

    document.getElementById('characterModalTitle').textContent = '编辑人物';
    document.getElementById('charName').value = char.name;
    document.getElementById('charRole').value = char.role;
    document.getElementById('charGender').value = char.gender || '男';
    document.getElementById('charAge').value = char.age || '';
    document.getElementById('charAppearance').value = char.appearance || '';
    document.getElementById('charPersonality').value = char.personality || '';
    document.getElementById('charBackground').value = char.background || '';
    document.getElementById('charQuotes').value = char.quotes || '';
    document.getElementById('charNotes').value = char.notes || '';

    modal.classList.add('active');
    closeCharacterPanel();
}

// 关闭人物编辑弹窗
export function closeCharacterEditModal() {
    document.getElementById('characterModal')?.classList.remove('active');
}

// 保存人物
export function saveCharacter() {
    const name = document.getElementById('charName')?.value?.trim();
    const role = document.getElementById('charRole')?.value;
    const gender = document.getElementById('charGender')?.value;
    const age = document.getElementById('charAge')?.value;
    const appearance = document.getElementById('charAppearance')?.value?.trim();
    const personality = document.getElementById('charPersonality')?.value?.trim();
    const background = document.getElementById('charBackground')?.value?.trim();
    const quotes = document.getElementById('charQuotes')?.value?.trim();
    const notes = document.getElementById('charNotes')?.value?.trim();

    if (!name) {
        showToast('请输入人物姓名');
        return;
    }

    const roleConfig = ROLE_TYPES[role];

    if (state.selectedCharacter) {
        // 更新现有人物
        Object.assign(state.selectedCharacter, {
            name, role, gender, age, appearance, personality, 
            background, quotes, notes, roleName: roleConfig.name
        });
        showToast('人物更新成功');
    } else {
        // 创建新人物
        const newId = Math.max(...state.characters.map(c => c.id), 0) + 1;
        state.characters.push({
            id: newId,
            name, role, gender, age, appearance, personality,
            background, quotes, notes, roleName: roleConfig.name,
            relationships: [],
            firstAppearChapter: state.currentChapter
        });
        showToast('人物添加成功');
    }

    saveCharacters(state.currentBook.id, state.characters);
    renderCharacterList();
    closeCharacterEditModal();
}

// 删除人物
export function deleteCharacter(id) {
    if (!confirm('确定要删除这个人物吗？')) return;

    state.characters = state.characters.filter(c => c.id !== id);
    saveCharacters(state.currentBook.id, state.characters);
    renderCharacterList();
    closeCharacterPanel();
    showToast('人物已删除');
}

// 检测新人物（模拟AI功能）
export function detectNewCharacters(text) {
    // 简单模拟：检测文本中可能的姓名
    const names = ['赵无极', '钱多多', '孙大伟'];
    const detected = names.filter(name => text.includes(name) && !state.characters.some(c => c.name === name));
    
    if (detected.length > 0) {
        state.newCharactersDetected = detected.map(name => ({
            name,
            chapter: state.currentChapter,
            count: (text.match(new RegExp(name, 'g')) || []).length
        }));
        showNewCharacterNotification();
    }
}

// 显示新人物检测通知
function showNewCharacterNotification() {
    // 简化处理，实际可以显示一个toast通知
    console.log('检测到新人物:', state.newCharactersDetected);
}

// 确认添加新人物
export function confirmAddNewCharacter(index) {
    const detected = state.newCharactersDetected[index];
    if (!detected) return;

    const newId = Math.max(...state.characters.map(c => c.id), 0) + 1;
    state.characters.push({
        id: newId,
        name: detected.name,
        role: 'minor',
        roleName: '龙套',
        gender: '男',
        firstAppearChapter: detected.chapter,
        relationships: []
    });

    saveCharacters(state.currentBook.id, state.characters);
    renderCharacterList();
    
    state.newCharactersDetected.splice(index, 1);
    showToast(`已添加人物：${detected.name}`);
}

// 忽略新人物
export function ignoreNewCharacter(index) {
    state.newCharactersDetected.splice(index, 1);
}
