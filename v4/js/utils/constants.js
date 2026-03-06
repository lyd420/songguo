/* ============================================
   网文写作助手 v4 - 常量定义
   ============================================ */

// 存储键名
export const STORAGE_KEYS = {
    CHAPTER_CONTENT: 'novel_chapter_',
    DAILY_GOAL: 'novel_daily_goal',
    DAILY_PROGRESS: 'novel_daily_progress',
    LAST_SAVE_DATE: 'novel_last_save_date',
    CURRENT_CHAPTER: 'novel_current_chapter',
    LINE_MARKS: 'novel_line_marks_',
    VOLUMES: 'novel_volumes',
    NEXT_CHAPTER_ID: 'novel_next_chapter_id',
    BOOKS: 'novel_books',
    CURRENT_BOOK: 'novel_current_book',
    CHARACTERS: 'novel_characters_'
};

// 题材类型
export const GENRES = {
    fantasy: { name: '玄幻修仙', icon: '⚔️' },
    urban: { name: '都市女婿', icon: '🏙️' },
    romance: { name: '言情甜宠', icon: '💕' },
    mystery: { name: '悬疑灵异', icon: '🔮' },
    history: { name: '历史穿越', icon: '🏛️' },
    scifi: { name: '科幻末世', icon: '🚀' }
};

// 作品状态
export const BOOK_STATUS = {
    ongoing: { name: '连载中', color: '#9CAF94' },
    completed: { name: '已完结', color: '#7A9CC6' },
    draft: { name: '草稿', color: '#D4A574' }
};

// 标记类型配置
export const MARK_TYPES = {
    todo: { icon: '📝', label: '待修改', color: '#D4A574' },
    question: { icon: '❓', label: '疑问', color: '#7A9CC6' },
    idea: { icon: '💡', label: '灵感', color: '#9CAF94' },
    issue: { icon: '⚠️', label: '问题', color: '#D4A5A5' }
};

// 模板名称映射
export const TEMPLATE_NAMES = {
    'face-slapping': '经典打脸结构',
    'reincarnation': '重生逆袭结构',
    'medical': '神医下山结构',
    'emotional': '情感爆发结构',
    'sweet': '甜宠恋爱结构',
    'suspense': '悬疑揭晓结构',
    'horror': '恐怖复苏结构',
    'apocalypse': '末日生存结构',
    'system': '系统流结构',
    'power': '权谋争霸结构'
};

// 随机名字库
export const NAMES = {
    surnames: ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'],
    male: ['伟', '强', '磊', '洋', '勇', '军', '杰', '涛', '超', '明', '辉', '刚', '建', '峰', '宇', '浩', '文', '斌', '刚', '志'],
    female: ['芳', '娜', '秀英', '敏', '静', '丽', '艳', '娟', '霞', '秀兰', '玲', '燕', '华', '梅', '丹', '莉', '婷', '雪', '颖', '慧'],
    places: ['长安', '洛阳', '金陵', '燕京', '汴梁', '临安', '姑苏', '扬州', '西域', '大漠', '雪原', '江南', '塞北', '中原', '南疆', '东海']
};
