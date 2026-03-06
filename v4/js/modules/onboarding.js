/* ============================================
   网文写作助手 v4 - 引导模块
   ============================================ */

import { saveOnboardingCompleted, loadOnboardingCompleted, loadChapterContent, loadLineMarks } from '../core/storage.js';
import { state, countWords } from '../core/state.js';
import { showToast, updateWordCountDisplay, updateDailyGoalDisplay } from '../utils/ui.js';
import { initWorkshop } from './workshop.js';

let currentStep = 1;
const totalSteps = 4;
let onboardingData = {
    authorType: null,
    genre: null,
    selectedTemplate: null
};

// 模板推荐配置
const TEMPLATE_RECOMMENDATIONS = {
    fantasy: [
        { id: 'face-slapping', icon: '🔥', title: '经典打脸结构', desc: '废材逆袭、系统流、重生复仇' },
        { id: 'system', icon: '⚡', title: '系统流结构', desc: '金手指觉醒、任务升级、实力碾压' }
    ],
    urban: [
        { id: 'face-slapping', icon: '🔥', title: '经典打脸结构', desc: '龙王归来、赘婿逆袭、实力碾压' },
        { id: 'medical', icon: '🏥', title: '神医下山结构', desc: '隐世医术、救人打脸、建立势力' }
    ],
    romance: [
        { id: 'sweet', icon: '💕', title: '甜宠恋爱结构', desc: '总裁追妻、先婚后爱、双向奔赴' },
        { id: 'emotional', icon: '💔', title: '情感爆发结构', desc: '重生虐渣、破镜重圆、追妻火葬场' }
    ],
    mystery: [
        { id: 'suspense', icon: '🎭', title: '悬疑揭晓结构', desc: '伏笔回收、真相大白、层层反转' },
        { id: 'horror', icon: '👻', title: '恐怖复苏结构', desc: '诡异降临、生存挣扎、揭秘真相' }
    ],
    history: [
        { id: 'power', icon: '👑', title: '权谋争霸结构', desc: '穿越大明、架空历史、权谋斗争' },
        { id: 'face-slapping', icon: '🔥', title: '经典打脸结构', desc: '历史先知、改变命运、建立霸业' }
    ],
    scifi: [
        { id: 'apocalypse', icon: '🧟', title: '末日生存结构', desc: '末日降临、资源争夺、建立基地' },
        { id: 'system', icon: '⚡', title: '无限流结构', desc: '副本挑战、能力提升、揭开真相' }
    ]
};

// 检查引导状态
export function checkOnboarding() {
    const hasCompleted = loadOnboardingCompleted();
    if (!hasCompleted) {
        document.getElementById('onboardingModal').classList.add('active');
    }
    return hasCompleted;
}

// 下一步
export function nextOnboardingStep() {
    // 验证当前步骤
    if (currentStep === 2 && !onboardingData.authorType) {
        showToast('请选择作者类型');
        return;
    }
    
    if (currentStep === 3 && !onboardingData.genre) {
        showToast('请选择创作题材');
        return;
    }

    // 如果是从第3步到第4步，渲染模板推荐
    if (currentStep === 3 && onboardingData.genre) {
        renderTemplateRecommendations();
    }

    document.getElementById(`onboarding-step-${currentStep}`).classList.remove('active');
    currentStep++;

    if (currentStep > totalSteps) {
        finishOnboarding();
        return;
    }

    document.getElementById(`onboarding-step-${currentStep}`).classList.add('active');
}

// 选择作者类型
export function selectAuthorType(type, element) {
    document.querySelectorAll('#onboarding-step-2 .option-card').forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');
    onboardingData.authorType = type;
    
    // 自动进入下一步
    setTimeout(() => nextOnboardingStep(), 300);
}

// 选择题材
export function selectGenre(genre, element) {
    document.querySelectorAll('#onboarding-step-3 .genre-card').forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');
    onboardingData.genre = genre;
    
    // 自动进入下一步
    setTimeout(() => nextOnboardingStep(), 300);
}

// 渲染模板推荐
function renderTemplateRecommendations() {
    const container = document.getElementById('templateRecommendations');
    if (!container) return;

    const templates = TEMPLATE_RECOMMENDATIONS[onboardingData.genre] || TEMPLATE_RECOMMENDATIONS.urban;
    
    container.innerHTML = templates.map(tpl => `
        <div class="rec-template-card ${onboardingData.selectedTemplate === tpl.id ? 'selected' : ''}" 
             onclick="selectTemplate('${tpl.id}', this)" 
             data-template="${tpl.id}">
            <span class="rec-template-icon">${tpl.icon}</span>
            <div class="rec-template-content">
                <div class="rec-template-title">${tpl.title}</div>
                <div class="rec-template-desc">${tpl.desc}</div>
            </div>
            <span class="rec-template-check">✓</span>
        </div>
    `).join('');
}

// 选择模板
export function selectTemplate(templateId, element) {
    document.querySelectorAll('.rec-template-card').forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');
    onboardingData.selectedTemplate = templateId;
}

// 初始化工作台
function initializeApp() {
    try {
        console.log('[Onboarding] Initializing workshop...');

        // 隐藏引导，显示工作台
        const workshop = document.getElementById('workshopContainer');
        const editor = document.getElementById('mainContainer');
        const header = document.querySelector('.header');
        
        if (workshop) workshop.style.display = 'block';
        if (editor) editor.style.display = 'none';
        if (header) header.style.display = 'none';

        // 初始化工作台
        initWorkshop();

        console.log('[Onboarding] Workshop initialized successfully');
    } catch (error) {
        console.error('[Onboarding] Failed to initialize workshop:', error);
    }
}

// 应用选中的模板
function applySelectedTemplate(templateId) {
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

（情感宣泄后的余波...）`,
        'sweet': `【相遇】

（男女主角初次相遇...）

【相知】

（逐渐了解对方...）

【心动】

（产生好感的时刻...）

【甜蜜】

（确定关系后的甜蜜...）`,
        'system': `【觉醒】

（系统觉醒的场景...）

【试炼】

（初次使用系统...）

【升级】

（通过任务提升能力...）

【碾压】

（展现实力的时刻...）`,
        'apocalypse': `【降临】

（末日降临的场景...）

【求生】

（艰难求生的过程...）

【建立】

（建立避难所/势力...）

【对抗】

（与末世威胁的对抗...）`
    };

    const content = templates[templateId];
    if (content && state.editor) {
        state.editor.value = content;
        state.editor.dispatchEvent(new Event('input'));
        showToast('模板已应用，开始创作吧！');
    }
}

// 完成引导
export function finishOnboarding() {
    // 如果没有选择模板但存在推荐模板，选择第一个
    if (!onboardingData.selectedTemplate && onboardingData.genre) {
        const templates = TEMPLATE_RECOMMENDATIONS[onboardingData.genre];
        if (templates && templates.length > 0) {
            onboardingData.selectedTemplate = templates[0].id;
        }
    }

    saveOnboardingCompleted(true);
    document.getElementById('onboardingModal').classList.remove('active');

    // 加载默认内容并初始化
    initializeApp();
    showToast('欢迎开始创作！');
}

// 跳过引导
export function skipOnboarding() {
    saveOnboardingCompleted(true);
    document.getElementById('onboardingModal').classList.remove('active');

    // 加载默认内容并初始化
    initializeApp();
}
