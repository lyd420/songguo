/* ============================================
   网文写作助手 v4 - 额外功能模块
   包含：专注模式、随机名字生成、返回功能等
   ============================================ */

import { getState, setState } from '../core/state.js';
import { ThemeStorage } from '../core/storage.js';
import { TEMPLATES, EXAMPLE_CONTENT } from '../utils/constants.js';
import { showToast, insertText, insertWithNewline } from '../utils/helpers.js';
import { saveContent, setContent } from './editor.js';

// 当前选中的模板（用于详情弹窗）
let currentTemplateId = null;
let pendingSwitchChapter = null;

// 专注模式状态
let isFocusMode = false;

/**
 * 切换主题
 */
export function toggleTheme() {
    const newTheme = ThemeStorage.toggle();
    showToast(`已切换到${newTheme === 'dark' ? '深色' : '浅色'}主题`, 'success');
    return newTheme;
}

/**
 * 切换专注模式
 */
export function toggleFocusMode() {
    isFocusMode = !isFocusMode;
    document.body.classList.toggle('focus-mode', isFocusMode);

    if (isFocusMode) {
        showToast('已进入专注模式，按 Esc 退出', 'success');
    } else {
        showToast('已退出专注模式', 'success');
    }
}

/**
 * 返回上一页
 */
export function goBack() {
    // 检查是否有未保存内容
    if (getState('isModified')) {
        if (confirm('有未保存的更改，是否保存？')) {
            saveContent();
        }
    }
    // 返回工作台或首页
    window.location.href = '#';
}

/**
 * 保存草稿
 */
export function saveDraft() {
    saveContent();
    showToast('草稿已保存', 'success');
}

/**
 * 发布章节
 */
export function publishChapter() {
    saveContent();
    showToast('🎉 章节发布成功！', 'success');
    // 可以添加更多发布逻辑，如上传到服务器
}

// 姓氏和名字库
const SURNAMES = [
    '李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴',
    '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗',
    '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧',
    '程', '曹', '袁', '邓', '许', '傅', '沈', '曾', '彭', '吕',
    '苏', '卢', '蒋', '蔡', '贾', '丁', '魏', '薛', '叶', '阎',
    '段', '雷', '侯', '龙', '史', '陶', '黎', '贺', '顾', '毛',
    '郝', '龚', '邵', '万', '钱', '严', '覃', '武', '戴', '莫',
    '孔', '白', '盛', '林', '狄', '明', '沙', '缪', '宗', '翟',
    '郁', '颜', '童', '单', '詹', '闻', '党', '靳', '柯', '霍',
    '裴', '谭', '燕', '敖', '聂', '丑', '钮', '酆', '储', '伊'
];

const MALE_NAMES = [
    '伟', '强', '磊', '洋', '勇', '军', '杰', '涛', '超', '明',
    '辉', '刚', '建', '峰', '宇', '浩', '文', '斌', '刚', '志',
    '龙', '凯', '旭', '晨', '俊', '泽', '博', '昊', '天', '宇',
    '玄', '墨', '尘', '风', '云', '寒', '烈', '炎', '冰', '辰',
    '逍', '遥', '羽', '凌', '霄', '剑', '心', '枫', '叶', '殇',
    '夜', '影', '漠', '然', '洛', '川', '渊', '澈', '瑾', '瑜',
    '轩辕', '慕容', '司徒', '上官', '欧阳', '南宫', '诸葛', '司马',
    '无', '极', '道', '尊', '圣', '皇', '帝', '神', '魔', '妖',
    '仙', '佛', '魔', '鬼', '怪', '灵', '魂', '魄', '精', '怪'
];

const FEMALE_NAMES = [
    '芳', '娜', '秀英', '敏', '静', '丽', '艳', '娟', '霞', '秀兰',
    '玲', '燕', '华', '梅', '丹', '莉', '婷', '雪', '颖', '慧',
    '婉', '清', '雅', '柔', '诗', '梦', '瑶', '琳', '怡', '萱',
    '晴', '璇', '芷', '若', '兮', '语', '嫣', '凝', '霜', '雪',
    '月', '影', '舞', '蝶', '花', '落', '樱', '璃', '沫', '瞳',
    '夏', '秋', '冬', '春', '晨', '暮', '晓', '晚', '依', '诺',
    '倾城', '绝世', '无双', '天仙', '圣女', '魔女', '妖女', '仙子',
    '红颜', '蓝颜', '紫衣', '青衫', '白衣', '黑衣', '红衣', '绿衣'
];

const PLACE_NAMES = [
    '长安', '洛阳', '金陵', '燕京', '汴梁', '临安', '姑苏', '扬州',
    '西域', '大漠', '雪原', '江南', '塞北', '中原', '南疆', '东海',
    '昆仑', '峨眉', '武当', '少林', '华山', '泰山', '黄山', '庐山',
    '蓬莱', '瀛洲', '方丈', '瑶池', '丹墀', '金銮', '紫宸', '玄武',
    '青龙', '白虎', '朱雀', '麒麟', '凤凰', '天龙', '地虎', '神凤',
    '云梦泽', '洞庭湖', '鄱阳湖', '太湖', '西湖', '东湖', '南湖', '北湖',
    '天玄大陆', '苍澜界', '九霄域', '幽冥地', '仙灵岛', '魔神谷', '妖兽林', '人皇城',
    '青云门', '天剑宗', '万法阁', '丹鼎派', '炼器盟', '符箓寺', '阵道院', '御兽庄'
];

/**
 * 生成随机名字
 * @param {string} type - 'male' | 'female' | 'char' | 'place'
 */
export function generateName(type = 'char') {
    let result = '';

    switch (type) {
        case 'male':
        case 'char':
            result = SURNAMES[Math.floor(Math.random() * SURNAMES.length)] +
                     MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)];
            break;
        case 'female':
            result = SURNAMES[Math.floor(Math.random() * SURNAMES.length)] +
                     FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)];
            break;
        case 'place':
            result = PLACE_NAMES[Math.floor(Math.random() * PLACE_NAMES.length)];
            break;
        default:
            result = SURNAMES[Math.floor(Math.random() * SURNAMES.length)] +
                     MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)];
    }

    insertText(result);
    showToast(`已生成：${result}`, 'success');
    return result;
}

/**
 * 包装选中的文本
 * @param {string} wrap - 包装符号，如 '**' 或 '*'
 */
export function wrapSelection(wrap) {
    const editor = document.getElementById('editor');
    if (!editor) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);

    if (selectedText) {
        const wrappedText = wrap + selectedText + wrap;
        editor.value = editor.value.substring(0, start) + wrappedText + editor.value.substring(end);
        editor.selectionStart = start;
        editor.selectionEnd = start + wrappedText.length;
        editor.focus();

        // 触发 input 事件
        editor.dispatchEvent(new Event('input'));
    } else {
        // 没有选中文字，直接插入包装符
        insertText(wrap + wrap);
    }
}

/**
 * 获取当前时间字符串
 * @returns {string}
 */
export function getCurrentTime() {
    const now = new Date();
    return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

/**
 * 切换侧边栏
 */
export function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

/**
 * 显示模板详情弹窗
 * @param {string} templateId
 */
export function showTemplateDetail(templateId) {
    currentTemplateId = templateId;
    const template = TEMPLATES[templateId];
    if (!template) return;

    document.getElementById('templateModalTitle').textContent = `${template.icon} ${template.name}`;
    document.getElementById('templateModalBody').innerHTML = `
        <div style="margin-bottom: 20px;">
            <h3 style="margin-bottom: 10px;">结构步骤</h3>
            <div style="display: flex; flex-direction: column; gap: 10px;">
                ${template.steps.map((step, i) => `
                    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 8px;">
                        <span style="width: 28px; height: 28px; background: var(--accent-primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600;">${i + 1}</span>
                        <span style="font-weight: 500;">${step}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        <div>
            <h3 style="margin-bottom: 10px;">适用题材</h3>
            <p style="color: var(--text-secondary);">${template.genre.join('、')}</p>
        </div>
        <div style="margin-top: 20px; padding: 16px; background: var(--highlight); border-radius: 8px;">
            <p style="color: var(--text-secondary); font-size: 13px;">💡 点击"应用模板"会将此结构插入到编辑器中</p>
        </div>
    `;

    document.getElementById('templateModal').classList.add('active');
}

/**
 * 关闭模板详情弹窗
 */
export function closeTemplateModal() {
    document.getElementById('templateModal').classList.remove('active');
    currentTemplateId = null;
}

/**
 * 从弹窗应用模板
 */
export function applyTemplateFromModal() {
    if (currentTemplateId) {
        const template = TEMPLATES[currentTemplateId];
        if (template && EXAMPLE_CONTENT[currentTemplateId]) {
            setContent(EXAMPLE_CONTENT[currentTemplateId]);
            showToast(`已应用「${template.name}」模板`, 'success');
        }
        closeTemplateModal();
    }
}

/**
 * 显示章节切换确认弹窗
 * @param {string} chapterId
 */
export function showSwitchConfirm(chapterId) {
    pendingSwitchChapter = chapterId;
    document.getElementById('switchConfirmModal').classList.add('active');
}

/**
 * 取消切换
 */
export function cancelSwitch() {
    pendingSwitchChapter = null;
    document.getElementById('switchConfirmModal').classList.remove('active');
}

/**
 * 放弃修改并切换
 */
export function discardAndSwitch() {
    if (pendingSwitchChapter) {
        document.dispatchEvent(new CustomEvent('chapter:switch', {
            detail: { chapterId: pendingSwitchChapter, save: false }
        }));
    }
    cancelSwitch();
}

/**
 * 保存并切换
 */
export function saveAndSwitch() {
    saveContent();
    if (pendingSwitchChapter) {
        document.dispatchEvent(new CustomEvent('chapter:switch', {
            detail: { chapterId: pendingSwitchChapter, save: true }
        }));
    }
    cancelSwitch();
}

/**
 * 导出当前章节内容
 */
export function exportChapter() {
    const content = getState('editorContent');
    const chapterId = getState('currentChapter');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `章节_${chapterId}_${new Date().toLocaleDateString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('章节已导出', 'success');
}
