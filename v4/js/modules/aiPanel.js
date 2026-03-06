/* ============================================
   网文写作助手 v4 - AI面板模块
   ============================================ */

import { state } from '../core/state.js';
import { showToast, getTemplateName } from '../utils/ui.js';

// 切换AI面板
export function toggleAIPanel() {
    document.getElementById('aiPanel').classList.toggle('active');
}

// 切换AI标签
export function switchAITab(tab, element) {
    document.querySelectorAll('.ai-tab').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.ai-panel-section').forEach(el => el.classList.remove('active'));

    if (element) element.classList.add('active');
    document.getElementById(`ai-${tab}`).classList.add('active');
}

// 显示模板详情
export function showTemplateDetail(templateId) {
    const templateNames = {
        'face-slapping': '经典打脸结构',
        'suspense': '悬疑揭晓结构',
        'emotional': '情感爆发结构'
    };

    const templateSteps = {
        'face-slapping': ['受辱', '隐忍', '反击', '震惊', '余波'],
        'suspense': ['疑点', '线索', '推理', '揭晓', '复盘'],
        'emotional': ['压抑', '触动', '释放', '余韵']
    };

    const steps = templateSteps[templateId] || [];
    const name = templateNames[templateId] || '模板';

    document.getElementById('templateModalTitle').textContent = name;
    document.getElementById('templateModalContent').innerHTML = `
        <div class="template-structure-detail">
            ${steps.map((step, i) => `
                <div class="template-step-detail">
                    <div class="template-step-num">${i + 1}</div>
                    <div class="template-step-content">
                        <div class="template-step-title">${step}</div>
                        <div class="template-step-desc">在此阶段完成${step}部分的内容创作</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    document.getElementById('templateModal').classList.add('active');
}

// 关闭模板弹窗
export function closeTemplateModal() {
    document.getElementById('templateModal').classList.remove('active');
}

// 应用模板
export function applyTemplate(templateId) {
    const templates = {
        'face-slapping': `【受辱】

（描写主角遭受羞辱的场景...）

【隐忍】

（主角暂时忍耐，积蓄力量...）

【反击】

（主角开始反击...）

【震惊】

（周围人的震惊反应...）

【余波】

（事件后续影响...）`,
        'suspense': `【疑点】

（埋下悬念疑点...）

【线索】

（发现关键线索...）

【推理】

（逻辑推理过程...）

【揭晓】

（真相大白...）

【复盘】

（回顾全过程...）`,
        'emotional': `【压抑】

（情感压抑的铺垫...）

【触动】

（触发情感的契机...）

【释放】

（情感爆发的高潮...）

【余韵】

（情感宣泄后的余波...）`
    };

    const content = templates[templateId] || templates['face-slapping'];
    if (state.editor) {
        state.editor.value = content;
        state.editor.dispatchEvent(new Event('input'));
        showToast('模板已应用');
    }
    closeTemplateModal();
}
