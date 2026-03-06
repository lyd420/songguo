/* ============================================
   网文写作助手 v4 - 工具函数
   ============================================ */

/**
 * 防抖函数
 * @param {Function} func - 要执行的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 * @param {Function} func - 要执行的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function}
 */
export function throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 字数统计（中文优化）
 * @param {string} text - 文本内容
 * @returns {number} - 字数
 */
export function countWords(text) {
    if (!text || text.trim().length === 0) return 0;

    // 中文字符
    const cnChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;

    // 英文单词
    const enWords = (text.match(/[a-zA-Z]+/g) || []).length;

    // 数字
    const numbers = (text.match(/\d+/g) || []).length;

    return cnChars + enWords + numbers;
}

/**
 * 格式化数字（千分位）
 * @param {number} num - 数字
 * @returns {string}
 */
export function formatNumber(num) {
    return num.toLocaleString('zh-CN');
}

/**
 * 格式化日期
 * @param {Date} date - 日期对象
 * @returns {string}
 */
export function formatDate(date = new Date()) {
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
}

/**
 * 获取今天是今年的第几天
 * @returns {number}
 */
export function getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

/**
 * 生成唯一ID
 * @param {string} prefix - ID前缀
 * @returns {string}
 */
export function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 截断文本
 * @param {string} text - 文本
 * @param {number} length - 最大长度
 * @returns {string}
 */
export function truncate(text, length = 50) {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + '...';
}

/**
 * 深拷贝对象
 * @param {any} obj - 要拷贝的对象
 * @returns {any}
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (Array.isArray(obj)) return obj.map(item => deepClone(item));
    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}

/**
 * 合并对象（浅合并）
 * @param {Object} target - 目标对象
 * @param {Object} source - 源对象
 * @returns {Object}
 */
export function merge(target, source) {
    return { ...target, ...source };
}

/**
 * 根据鼠标位置获取行号
 * @param {MouseEvent} e - 鼠标事件
 * @param {HTMLElement} textarea - 文本域元素
 * @param {number} lineHeight - 行高
 * @returns {number}
 */
export function getLineFromMouseEvent(e, textarea, lineHeight = 28.8) {
    const rect = textarea.getBoundingClientRect();
    const scrollTop = textarea.scrollTop;
    const relativeY = e.clientY - rect.top + scrollTop;
    const lineNumber = Math.floor(relativeY / lineHeight) + 1;
    const totalLines = textarea.value.split('\n').length;
    return Math.max(1, Math.min(lineNumber, totalLines));
}

/**
 * 滚动到指定行
 * @param {HTMLElement} textarea - 文本域元素
 * @param {number} line - 行号
 * @param {number} lineHeight - 行高
 */
export function scrollToLine(textarea, line, lineHeight = 28.8) {
    const scrollTop = (line - 1) * lineHeight;
    textarea.scrollTop = scrollTop;
}

/**
 * 显示 Toast 通知
 * @param {string} message - 消息内容
 * @param {string} type - 类型：'success' | 'warning' | 'error'
 * @param {number} duration - 持续时间（毫秒）
 */
export function showToast(message, type = 'success', duration = 2000) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * 确认对话框
 * @param {string} message - 确认消息
 * @returns {Promise<boolean>}
 */
export function confirmDialog(message) {
    return new Promise(resolve => {
        const result = window.confirm(message);
        resolve(result);
    });
}

/**
 * 下载文本为文件
 * @param {string} content - 文件内容
 * @param {string} filename - 文件名
 * @param {string} type - MIME类型
 */
export function downloadFile(content, filename, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * 读取文件内容
 * @param {File} file - 文件对象
 * @returns {Promise<string>}
 */
export function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

/**
 * 格式化时间差
 * @param {number} minutes - 分钟数
 * @returns {string}
 */
export function formatDuration(minutes) {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}小时`;
    return `${hours}小时${mins}分钟`;
}

/**
 * 检查元素是否在视口内
 * @param {HTMLElement} element - 元素
 * @returns {boolean}
 */
export function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
    );
}

/**
 * 等待指定时间
 * @param {number} ms - 毫秒数
 * @returns {Promise<void>}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
