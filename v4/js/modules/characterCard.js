/* ============================================
   网文写作助手 v4 - 人物卡模块
   ============================================ */

import { state } from '../core/state.js';
import { saveCharacters, loadCharacters } from '../core/storage.js';
import { showToast } from '../utils/ui.js';

// 角色类型配置
const ROLE_TYPES = {
    protagonist: { name: '主角', color: '#D4A574', icon: '👑' },
    antagonist: { name: '反派', color: '#D4A5A5', icon: '👹' },
    supporting: { name: '配角', color: '#7A9CC6', icon: '🎭' },
    minor: { name: '龙套', color: '#9CAF94', icon: '👤' }
};

// 初始化人物卡
export function initCharacterCards() {
    // 如果没有当前书籍，使用默认书籍ID
    const bookId = state.currentBook?.id || 1;
    
    // 加载人物数据
    state.characters = loadCharacters(bookId);
    
    // 渲染人物列表
    renderCharacterList();
    
    // 模拟检测新人物（假功能）
    simulateDetectNewCharacters();
}

// 渲染人物列表
export function renderCharacterList() {
    const container = document.getElementById('characterList');
    const badge = document.getElementById('newCharacterBadge');
    if (!container) return;

    // 更新新人物提示
    if (badge) {
        const newCount = state.newCharactersDetected.length;
        if (newCount > 0) {
            badge.textContent = newCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    if (state.characters.length === 0) {
        container.innerHTML = `
            <div class="character-empty">
                <span>暂无人物</span>
            </div>
        `;
        return;
    }

    // 按重要性排序（主角在前）
    const sorted = [...state.characters].sort((a, b) => {
        const roleOrder = { protagonist: 0, supporting: 1, antagonist: 2, minor: 3 };
        return roleOrder[a.role] - roleOrder[b.role];
    });

    container.innerHTML = sorted.map(char => {
        const roleInfo = ROLE_TYPES[char.role] || ROLE_TYPES.minor;
        const isNew = state.newCharactersDetected.some(nc => nc.name === char.name);
        
        return `
            <div class="character-tag ${char.role} ${isNew ? 'new' : ''}" 
                 data-character-id="${char.id}"
                 onclick="showCharacterDetail(${char.id}, event)"
                 title="${char.name} - ${roleInfo.name}">
                <span class="character-role-icon" style="background: ${roleInfo.color}">
                    ${roleInfo.icon}
                </span>
                <span class="character-name">${char.name}</span>
                ${isNew ? '<span class="character-new-dot"></span>' : ''}
            </div>
        `;
    }).join('');
}

// 显示人物详情面板
export function showCharacterDetail(characterId, event) {
    if (event) {
        event.stopPropagation();
    }
    
    const character = state.characters.find(c => c.id === characterId);
    if (!character) return;
    
    state.selectedCharacter = character;
    
    // 移除其他人物的选中状态
    document.querySelectorAll('.character-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    
    // 添加当前选中状态
    const currentTag = document.querySelector(`.character-tag[data-character-id="${characterId}"]`);
    if (currentTag) currentTag.classList.add('active');
    
    // 填充面板数据
    const panel = document.getElementById('characterDetailPanel');
    if (!panel) return;
    
    const roleInfo = ROLE_TYPES[character.role] || ROLE_TYPES.minor;
    
    // 基本信息
    document.getElementById('charPanelName').textContent = character.name;
    document.getElementById('charPanelRole').textContent = roleInfo.name;
    document.getElementById('charPanelRole').style.background = roleInfo.color + '20';
    document.getElementById('charPanelRole').style.color = roleInfo.color;
    
    // 详细字段
    const fields = [
        { id: 'charGender', value: character.gender, label: '性别' },
        { id: 'charAge', value: character.age, label: '年龄' },
        { id: 'charAppearance', value: character.appearance, label: '外貌' },
        { id: 'charPersonality', value: character.personality, label: '性格' },
        { id: 'charBackground', value: character.background, label: '背景' },
        { id: 'charQuotes', value: character.quotes, label: '经典台词' },
        { id: 'charNotes', value: character.notes, label: '备注' }
    ];
    
    fields.forEach(field => {
        const el = document.getElementById(field.id);
        if (el) {
            if (field.value) {
                el.textContent = field.value;
                el.parentElement.style.display = 'block';
            } else {
                el.parentElement.style.display = 'none';
            }
        }
    });
    
    // 渲染关系图谱
    renderRelationshipGraph(character);
    
    // 显示面板
    panel.classList.add('active');
}

// 渲染关系图谱（中心辐射式）
function renderRelationshipGraph(centerCharacter) {
    const container = document.getElementById('charRelationshipGraph');
    if (!container) return;
    
    if (!centerCharacter.relationships || centerCharacter.relationships.length === 0) {
        container.innerHTML = '<div class="relationship-empty">暂无关系数据</div>';
        return;
    }
    
    // 中心人物
    const centerRole = ROLE_TYPES[centerCharacter.role] || ROLE_TYPES.minor;
    let html = `
        <div class="relationship-center">
            <div class="relationship-node center" style="border-color: ${centerRole.color}">
                <span class="node-icon">${centerRole.icon}</span>
                <span class="node-name">${centerCharacter.name}</span>
                <span class="node-role" style="background: ${centerRole.color}">${centerRole.name}</span>
            </div>
        </div>
        <div class="relationship-connections">
    `;
    
    // 相关人物
    centerCharacter.relationships.forEach(rel => {
        const relatedChar = state.characters.find(c => c.id === rel.characterId);
        if (!relatedChar) return;
        
        const roleInfo = ROLE_TYPES[relatedChar.role] || ROLE_TYPES.minor;
        
        html += `
            <div class="relationship-item" onclick="showCharacterDetail(${relatedChar.id}, event)">
                <div class="relationship-line"></div>
                <div class="relationship-node" style="border-color: ${roleInfo.color}">
                    <span class="node-icon">${roleInfo.icon}</span>
                    <span class="node-name">${relatedChar.name}</span>
                    <span class="node-role" style="background: ${roleInfo.color}">${roleInfo.name}</span>
                </div>
                <div class="relationship-type">${rel.type}</div>
                <div class="relationship-desc">${rel.desc || ''}</div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// 关闭人物详情面板
export function closeCharacterPanel() {
    const panel = document.getElementById('characterDetailPanel');
    if (panel) panel.classList.remove('active');
    
    document.querySelectorAll('.character-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    
    state.selectedCharacter = null;
}

// 插入人物名到编辑器
export function insertCharacterName(name) {
    if (!state.editor) return;
    
    const start = state.editor.selectionStart;
    const end = state.editor.selectionEnd;
    const value = state.editor.value;
    
    state.editor.value = value.substring(0, start) + name + value.substring(end);
    state.editor.selectionStart = state.editor.selectionEnd = start + name.length;
    state.editor.focus();
    state.editor.dispatchEvent(new Event('input'));
    
    showToast(`已插入「${name}」`);
}

// ==================== 添加/编辑人物 ====================

// 显示添加人物弹窗
export function showAddCharacterModal() {
    // 重置表单
    document.getElementById('charEditId').value = '';
    document.getElementById('charEditName').value = '';
    document.getElementById('charEditRole').value = 'minor';
    document.getElementById('charEditGender').value = '';
    document.getElementById('charEditAge').value = '';
    document.getElementById('charEditAppearance').value = '';
    document.getElementById('charEditPersonality').value = '';
    document.getElementById('charEditBackground').value = '';
    document.getElementById('charEditQuotes').value = '';
    document.getElementById('charEditNotes').value = '';
    
    // 更新标题和按钮
    document.getElementById('charEditModalTitle').textContent = '添加人物';
    document.getElementById('charDeleteBtn').style.display = 'none';
    
    // 显示弹窗
    document.getElementById('characterEditModal').classList.add('active');
}

// 编辑当前选中人物
export function editCurrentCharacter() {
    if (!state.selectedCharacter) return;
    editCharacter(state.selectedCharacter.id);
}

// 编辑人物
export function editCharacter(characterId) {
    const character = state.characters.find(c => c.id === characterId);
    if (!character) return;
    
    // 填充表单
    document.getElementById('charEditId').value = character.id;
    document.getElementById('charEditName').value = character.name;
    document.getElementById('charEditRole').value = character.role;
    document.getElementById('charEditGender').value = character.gender || '';
    document.getElementById('charEditAge').value = character.age || '';
    document.getElementById('charEditAppearance').value = character.appearance || '';
    document.getElementById('charEditPersonality').value = character.personality || '';
    document.getElementById('charEditBackground').value = character.background || '';
    document.getElementById('charEditQuotes').value = character.quotes || '';
    document.getElementById('charEditNotes').value = character.notes || '';
    
    // 更新标题和按钮
    document.getElementById('charEditModalTitle').textContent = '编辑人物';
    document.getElementById('charDeleteBtn').style.display = 'block';
    
    // 显示弹窗
    document.getElementById('characterEditModal').classList.add('active');
}

// 关闭人物编辑弹窗
export function closeCharacterEditModal() {
    document.getElementById('characterEditModal').classList.remove('active');
}

// 保存人物
export function saveCharacter() {
    const id = document.getElementById('charEditId').value;
    const name = document.getElementById('charEditName').value.trim();
    
    if (!name) {
        showToast('请输入人物姓名');
        return;
    }
    
    const characterData = {
        name: name,
        role: document.getElementById('charEditRole').value,
        roleName: ROLE_TYPES[document.getElementById('charEditRole').value]?.name || '龙套',
        gender: document.getElementById('charEditGender').value,
        age: document.getElementById('charEditAge').value,
        appearance: document.getElementById('charEditAppearance').value,
        personality: document.getElementById('charEditPersonality').value,
        background: document.getElementById('charEditBackground').value,
        quotes: document.getElementById('charEditQuotes').value,
        notes: document.getElementById('charEditNotes').value,
        relationships: []
    };
    
    if (id) {
        // 编辑现有角色
        const index = state.characters.findIndex(c => c.id === parseInt(id));
        if (index !== -1) {
            // 保留原有关系数据
            characterData.relationships = state.characters[index].relationships || [];
            characterData.id = parseInt(id);
            characterData.firstAppearChapter = state.characters[index].firstAppearChapter;
            state.characters[index] = characterData;
            showToast('人物信息已更新');
        }
    } else {
        // 添加新角色
        const newId = Math.max(...state.characters.map(c => c.id), 0) + 1;
        characterData.id = newId;
        characterData.firstAppearChapter = state.currentChapter || 1;
        state.characters.push(characterData);
        showToast(`「${name}」已添加`);
    }
    
    // 保存到存储
    const bookId = state.currentBook?.id || 1;
    saveCharacters(bookId, state.characters);
    
    // 刷新列表
    renderCharacterList();
    
    // 关闭弹窗
    closeCharacterEditModal();
    
    // 如果当前正在查看该人物，刷新面板
    if (state.selectedCharacter && state.selectedCharacter.id === parseInt(id)) {
        showCharacterDetail(parseInt(id));
    }
}

// 删除人物
export function deleteCharacter() {
    const id = document.getElementById('charEditId').value;
    if (!id) return;
    
    const character = state.characters.find(c => c.id === parseInt(id));
    if (!character) return;
    
    if (!confirm(`确定要删除「${character.name}」吗？此操作不可恢复。`)) {
        return;
    }
    
    // 从列表中移除
    state.characters = state.characters.filter(c => c.id !== parseInt(id));
    
    // 保存到存储
    const bookId = state.currentBook?.id || 1;
    saveCharacters(bookId, state.characters);
    
    // 刷新列表
    renderCharacterList();
    
    // 关闭弹窗和面板
    closeCharacterEditModal();
    closeCharacterPanel();
    
    showToast(`「${character.name}」已删除`);
}

// ==================== 新人物检测（假功能） ====================

// 模拟检测新人物（假功能）
function simulateDetectNewCharacters() {
    // 模拟检测到的新人物
    state.newCharactersDetected = [
        { name: '赵无极', context: '第15章出现的新反派' }
    ];
    
    renderCharacterList();
}

// 确认添加新人物
export function confirmAddNewCharacter(name) {
    // 从待确认列表移除
    state.newCharactersDetected = state.newCharactersDetected.filter(
        nc => nc.name !== name
    );
    
    // 打开编辑弹窗，预填姓名
    document.getElementById('charEditId').value = '';
    document.getElementById('charEditName').value = name;
    document.getElementById('charEditRole').value = 'minor';
    document.getElementById('charEditGender').value = '';
    document.getElementById('charEditAge').value = '';
    document.getElementById('charEditAppearance').value = '';
    document.getElementById('charEditPersonality').value = '';
    document.getElementById('charEditBackground').value = '';
    document.getElementById('charEditQuotes').value = '';
    document.getElementById('charEditNotes').value = '';
    
    document.getElementById('charEditModalTitle').textContent = '添加新人物';
    document.getElementById('charDeleteBtn').style.display = 'none';
    
    document.getElementById('characterEditModal').classList.add('active');
    
    renderCharacterList();
}

// 忽略新人物提示
export function ignoreNewCharacter(name) {
    state.newCharactersDetected = state.newCharactersDetected.filter(
        nc => nc.name !== name
    );
    renderCharacterList();
}
