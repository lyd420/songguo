/* ============================================
   网文写作助手 v5 - AI 助手面板
   ============================================ */

import { state } from '../core/state.js';
import { showToast } from '../utils/ui.js';

// 切换AI面板
export function toggleAIPanel() {
    const panel = document.getElementById('aiPanel');
    panel?.classList.toggle('active');
}

// 切换AI标签
export function switchAITab(tabName) {
    document.querySelectorAll('.ai-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    
    const content = document.getElementById('aiContent');
    if (!content) return;

    const contents = {
        outline: `
            <div class="ai-feature">
                <h4>📝 大纲生成</h4>
                <p>基于当前章节内容，AI可以帮您：</p>
                <ul>
                    <li>生成章节大纲</li>
                    <li>梳理剧情脉络</li>
                    <li>优化故事结构</li>
                </ul>
                <button class="btn-primary" style="margin-top: 12px; width: 100%;">生成大纲</button>
            </div>
        `,
        plot: `
            <div class="ai-feature">
                <h4>🎭 剧情推演</h4>
                <p>AI帮您分析剧情发展：</p>
                <ul>
                    <li>预测剧情走向</li>
                    <li>生成转折建议</li>
                    <li>设计悬念冲突</li>
                </ul>
                <button class="btn-primary" style="margin-top: 12px; width: 100%;">推演剧情</button>
            </div>
        `,
        polish: `
            <div class="ai-feature">
                <h4>✨ 智能润色</h4>
                <p>选中文字进行润色：</p>
                <ul>
                    <li>优化语句表达</li>
                    <li>增强画面感</li>
                    <li>统一文风语调</li>
                </ul>
                <button class="btn-primary" style="margin-top: 12px; width: 100%;">润色选中文本</button>
            </div>
        `,
        expand: `
            <div class="ai-feature">
                <h4>📖 内容扩写</h4>
                <p>基于现有内容扩写：</p>
                <ul>
                    <li>扩展细节描写</li>
                    <li>补充人物心理</li>
                    <li>增加环境描写</li>
                </ul>
                <button class="btn-primary" style="margin-top: 12px; width: 100%;">扩写选中文本</button>
            </div>
        `
    };

    content.innerHTML = contents[tabName] || contents.outline;
}

// 显示模板详情
export function showTemplateDetail(templateId) {
    console.log('显示模板:', templateId);
}

// 关闭模板弹窗
export function closeTemplateModal() {
    console.log('关闭模板弹窗');
}

// 应用模板
export function applyTemplate() {
    showToast('模板应用成功');
}
