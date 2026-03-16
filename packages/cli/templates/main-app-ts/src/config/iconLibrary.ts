/**
 * 图标库配置
 * 
 * 提供常用图标集合，供用户在配置子应用时选择使用
 * 存储方式：只存储图标 ID 或名称，不存储完整 SVG 数据
 * 
 * 使用场景：
 * 1. 左侧菜单/侧边栏显示的应用图标
 * 2. 应用列表中的图标列展示
 * 3. 导航标签页的应用标识
 * 
 * 图标分类：
 * - element-icons: Element Plus Icons（官方图标库 - 完整 293 个）
 * - svg: SVG 图标（自定义 SVG 字符串或文件名）
 * - emoji: Emoji 表情符号
 * - image: 图片地址（网络 URL、本地路径、Base64）
 */

export const iconLibrary = {
  // Element Plus Icons（官方图标库 - 完整 293 个）
  'element-icons': [
    /* ================= System ================= */
    { id: 'Plus', name: '加号' },
    { id: 'Minus', name: '减号' },
    { id: 'CirclePlus', name: '圆形加号' },
    { id: 'Search', name: '搜索' },
    { id: 'Female', name: '女性' },
    { id: 'Male', name: '男性' },
    { id: 'Aim', name: '目标' },
    { id: 'House', name: '房屋' },
    { id: 'FullScreen', name: '全屏' },
    { id: 'Loading', name: '加载' },
    { id: 'Link', name: '链接' },
    { id: 'Service', name: '服务' },
    { id: 'Pointer', name: '指针' },
    { id: 'Star', name: '星标' },
    { id: 'Notification', name: '通知' },
    { id: 'Connection', name: '连接' },
    { id: 'ChatDotRound', name: '聊天圆点' },
    { id: 'Setting', name: '设置' },
    { id: 'Clock', name: '时钟' },
    { id: 'Position', name: '位置' },
    { id: 'Discount', name: '折扣' },
    { id: 'Odometer', name: '里程表' },
    { id: 'ChatSquare', name: '方形聊天' },
    { id: 'ChatRound', name: '圆形聊天' },
    { id: 'ChatLineRound', name: '圆形聊天线' },
    { id: 'ChatLineSquare', name: '方形聊天线' },
    { id: 'ChatDotSquare', name: '方形聊天点' },
    { id: 'View', name: '查看' },
    { id: 'Hide', name: '隐藏' },
    { id: 'Unlock', name: '解锁' },
    { id: 'Lock', name: '锁定' },
    { id: 'RefreshRight', name: '右刷新' },
    { id: 'RefreshLeft', name: '左刷新' },
    { id: 'Refresh', name: '刷新' },
    { id: 'Bell', name: '铃铛' },
    { id: 'MuteNotification', name: '静音通知' },
    { id: 'User', name: '用户' },
    { id: 'Check', name: '勾选' },
    { id: 'CircleCheck', name: '圆形勾选' },
    { id: 'Warning', name: '警告' },
    { id: 'CircleClose', name: '圆形关闭' },
    { id: 'Close', name: '关闭' },
    { id: 'PieChart', name: '饼图' },
    { id: 'More', name: '更多' },
    { id: 'Compass', name: '指南针' },
    { id: 'Filter', name: '过滤' },
    { id: 'Switch', name: '开关' },
    { id: 'Select', name: '选择' },
    { id: 'SemiSelect', name: '半选' },
    { id: 'CloseBold', name: '粗体关闭' },
    { id: 'EditPen', name: '编辑笔' },
    { id: 'Edit', name: '编辑' },
    { id: 'Message', name: '消息' },
    { id: 'MessageBox', name: '消息框' },
    { id: 'TurnOff', name: '关闭电源' },
    { id: 'Finished', name: '完成' },
    { id: 'Delete', name: '删除' },
    { id: 'Crop', name: '裁剪' },
    { id: 'SwitchButton', name: '开关按钮' },
    { id: 'Operation', name: '操作' },
    { id: 'Open', name: '打开' },
    { id: 'Remove', name: '移除' },
    { id: 'ZoomOut', name: '缩小' },
    { id: 'ZoomIn', name: '放大' },
    { id: 'InfoFilled', name: '信息' },
    { id: 'CircleCheckFilled', name: '圆形成功' },
    { id: 'SuccessFilled', name: '成功' },
    { id: 'WarningFilled', name: '警告填充' },
    { id: 'CircleCloseFilled', name: '圆形关闭填充' },
    { id: 'QuestionFilled', name: '问题' },
    { id: 'WarnTriangleFilled', name: '警告三角' },
    { id: 'UserFilled', name: '用户填充' },
    { id: 'MoreFilled', name: '更多填充' },
    { id: 'Tools', name: '工具' },
    { id: 'HomeFilled', name: '首页填充' },
    { id: 'Menu', name: '菜单' },
    { id: 'UploadFilled', name: '上传填充' },
    { id: 'Avatar', name: '头像' },
    { id: 'HelpFilled', name: '帮助' },
    { id: 'Share', name: '分享' },
    { id: 'StarFilled', name: '星标填充' },
    { id: 'Comment', name: '评论' },
    { id: 'Histogram', name: '柱状图' },
    { id: 'Grid', name: '网格' },
    { id: 'Promotion', name: '推广' },
    { id: 'DeleteFilled', name: '删除填充' },
    { id: 'RemoveFilled', name: '移除填充' },
    { id: 'CirclePlusFilled', name: '圆形加号填充' },

    /* ================= Arrow ================= */
    { id: 'ArrowLeft', name: '左箭头' },
    { id: 'ArrowUp', name: '上箭头' },
    { id: 'ArrowRight', name: '右箭头' },
    { id: 'ArrowDown', name: '下箭头' },
    { id: 'ArrowLeftBold', name: '粗左箭头' },
    { id: 'ArrowUpBold', name: '粗上箭头' },
    { id: 'ArrowRightBold', name: '粗右箭头' },
    { id: 'ArrowDownBold', name: '粗下箭头' },
    { id: 'DArrowRight', name: '双右箭头' },
    { id: 'DArrowLeft', name: '双左箭头' },
    { id: 'Download', name: '下载' },
    { id: 'Upload', name: '上传' },
    { id: 'Top', name: '顶部' },
    { id: 'Bottom', name: '底部' },
    { id: 'Back', name: '返回' },
    { id: 'Right', name: '向右' },
    { id: 'TopRight', name: '右上' },
    { id: 'TopLeft', name: '左上' },
    { id: 'BottomRight', name: '右下' },
    { id: 'BottomLeft', name: '左下' },
    { id: 'Sort', name: '排序' },
    { id: 'SortUp', name: '升序' },
    { id: 'SortDown', name: '降序' },
    { id: 'Rank', name: '排行' },
    { id: 'CaretLeft', name: '左插入箭头' },
    { id: 'CaretTop', name: '上插入箭头' },
    { id: 'CaretRight', name: '右插入箭头' },
    { id: 'CaretBottom', name: '下插入箭头' },
    { id: 'DCaret', name: '双插入箭头' },
    { id: 'Expand', name: '展开' },
    { id: 'Fold', name: '折叠' },

    /* ================= Document ================= */
    { id: 'DocumentAdd', name: '文档新增' },
    { id: 'Document', name: '文档' },
    { id: 'Notebook', name: '笔记本' },
    { id: 'Tickets', name: '票据' },
    { id: 'Memo', name: '备忘录' },
    { id: 'Collection', name: '集合' },
    { id: 'Postcard', name: '明信片' },
    { id: 'ScaleToOriginal', name: '原始尺寸' },
    { id: 'SetUp', name: '设置' },
    { id: 'DocumentDelete', name: '文档删除' },
    { id: 'DocumentChecked', name: '文档已检查' },
    { id: 'DataBoard', name: '数据看板' },
    { id: 'DataAnalysis', name: '数据分析' },
    { id: 'CopyDocument', name: '复制文档' },
    { id: 'FolderChecked', name: '文件夹已检查' },
    { id: 'Files', name: '文件' },
    { id: 'Folder', name: '文件夹' },
    { id: 'FolderDelete', name: '删除文件夹' },
    { id: 'FolderRemove', name: '移除文件夹' },
    { id: 'FolderOpened', name: '打开文件夹' },
    { id: 'DocumentCopy', name: '文档复制' },
    { id: 'DocumentRemove', name: '移除文档' },
    { id: 'FolderAdd', name: '新增文件夹' },
    { id: 'FirstAidKit', name: '急救包' },
    { id: 'Reading', name: '阅读' },
    { id: 'DataLine', name: '数据线' },
    { id: 'Management', name: '管理' },
    { id: 'Checked', name: '已检查' },
    { id: 'Ticket', name: '票' },
    { id: 'Failed', name: '失败' },
    { id: 'TrendCharts', name: '趋势图' },
    { id: 'List', name: '列表' },

    /* ================= Media ================= */
    { id: 'Microphone', name: '麦克风' },
    { id: 'Mute', name: '静音' },
    { id: 'Mic', name: '话筒' },
    { id: 'VideoPause', name: '视频暂停' },
    { id: 'VideoCamera', name: '摄像机' },
    { id: 'VideoPlay', name: '视频播放' },
    { id: 'Headset', name: '耳机' },
    { id: 'Monitor', name: '显示器' },
    { id: 'Film', name: '胶片' },
    { id: 'Camera', name: '相机' },
    { id: 'Picture', name: '图片' },
    { id: 'PictureRounded', name: '圆角图片' },
    { id: 'Iphone', name: 'iPhone' },
    { id: 'Cellphone', name: '手机' },
    { id: 'VideoCameraFilled', name: '摄像机填充' },
    { id: 'PictureFilled', name: '图片填充' },
    { id: 'Platform', name: '平台' },
    { id: 'CameraFilled', name: '相机填充' },
    { id: 'BellFilled', name: '铃铛填充' },

    /* ================= Traffic ================= */
    { id: 'Location', name: '位置' },
    { id: 'LocationInformation', name: '位置信息' },
    { id: 'DeleteLocation', name: '删除位置' },
    { id: 'Coordinate', name: '坐标' },
    { id: 'Bicycle', name: '自行车' },
    { id: 'OfficeBuilding', name: '办公楼' },
    { id: 'School', name: '学校' },
    { id: 'Guide', name: '导航' },
    { id: 'AddLocation', name: '新增位置' },
    { id: 'MapLocation', name: '地图位置' },
    { id: 'Place', name: '地点' },
    { id: 'LocationFilled', name: '位置填充' },
    { id: 'Van', name: '货车' },

    /* ================= Food ================= */
    { id: 'Watermelon', name: '西瓜' },
    { id: 'Pear', name: '梨' },
    { id: 'NoSmoking', name: '禁止吸烟' },
    { id: 'Smoking', name: '吸烟' },
    { id: 'Mug', name: '马克杯' },
    { id: 'GobletSquareFull', name: '方形高脚杯满' },
    { id: 'GobletFull', name: '高脚杯满' },
    { id: 'KnifeFork', name: '刀叉' },
    { id: 'Sugar', name: '糖' },
    { id: 'Bowl', name: '碗' },
    { id: 'MilkTea', name: '奶茶' },
    { id: 'Lollipop', name: '棒棒糖' },
    { id: 'Coffee', name: '咖啡' },
    { id: 'Chicken', name: '鸡肉' },
    { id: 'Dish', name: '菜肴' },
    { id: 'IceTea', name: '冰茶' },
    { id: 'ColdDrink', name: '冷饮' },
    { id: 'CoffeeCup', name: '咖啡杯' },
    { id: 'DishDot', name: '点菜' },
    { id: 'IceDrink', name: '冰饮' },
    { id: 'IceCream', name: '冰淇淋' },
    { id: 'Dessert', name: '甜点' },
    { id: 'IceCreamSquare', name: '方形冰淇淋' },
    { id: 'ForkSpoon', name: '叉勺' },
    { id: 'IceCreamRound', name: '圆形冰淇淋' },
    { id: 'Food', name: '食物' },
    { id: 'HotWater', name: '热水' },
    { id: 'Grape', name: '葡萄' },
    { id: 'Fries', name: '薯条' },
    { id: 'Apple', name: '苹果' },
    { id: 'Burger', name: '汉堡' },
    { id: 'Goblet', name: '高脚杯' },
    { id: 'GobletSquare', name: '方形高脚杯' },
    { id: 'Orange', name: '橙子' },
    { id: 'Cherry', name: '樱桃' },

    /* ================= Items ================= */
    { id: 'Printer', name: '打印机' },
    { id: 'Calendar', name: '日历' },
    { id: 'CreditCard', name: '信用卡' },
    { id: 'Box', name: '盒子' },
    { id: 'Money', name: '钱币' },
    { id: 'Refrigerator', name: '冰箱' },
    { id: 'Cpu', name: 'CPU' },
    { id: 'Football', name: '橄榄球' },
    { id: 'Brush', name: '刷子' },
    { id: 'Suitcase', name: '行李箱' },
    { id: 'SuitcaseLine', name: '线条行李箱' },
    { id: 'Umbrella', name: '雨伞' },
    { id: 'AlarmClock', name: '闹钟' },
    { id: 'Medal', name: '奖牌' },
    { id: 'GoldMedal', name: '金牌' },
    { id: 'Present', name: '礼物' },
    { id: 'Mouse', name: '鼠标' },
    { id: 'Watch', name: '手表' },
    { id: 'QuartzWatch', name: '石英表' },
    { id: 'Magnet', name: '磁铁' },
    { id: 'Help', name: '帮助' },
    { id: 'Soccer', name: '足球' },
    { id: 'ToiletPaper', name: '卫生纸' },
    { id: 'ReadingLamp', name: '台灯' },
    { id: 'Paperclip', name: '回形针' },
    { id: 'MagicStick', name: '魔法棒' },
    { id: 'Basketball', name: '篮球' },
    { id: 'Baseball', name: '棒球' },
    { id: 'Coin', name: '硬币' },
    { id: 'Goods', name: '商品' },
    { id: 'Sell', name: '出售' },
    { id: 'SoldOut', name: '售罄' },
    { id: 'Key', name: '钥匙' },
    { id: 'ShoppingCart', name: '购物车' },
    { id: 'ShoppingCartFull', name: '满购物车' },
    { id: 'ShoppingTrolley', name: '购物手推车' },
    { id: 'Phone', name: '电话' },
    { id: 'Scissor', name: '剪刀' },
    { id: 'Handbag', name: '手提包' },
    { id: 'ShoppingBag', name: '购物袋' },
    { id: 'Trophy', name: '奖杯' },
    { id: 'TrophyBase', name: '奖杯底座' },
    { id: 'Stopwatch', name: '秒表' },
    { id: 'Timer', name: '计时器' },
    { id: 'CollectionTag', name: '收藏标签' },
    { id: 'TakeawayBox', name: '外卖盒' },
    { id: 'PriceTag', name: '价格标签' },
    { id: 'Wallet', name: '钱包' },
    { id: 'Opportunity', name: '机会' },
    { id: 'PhoneFilled', name: '电话填充' },
    { id: 'WalletFilled', name: '钱包填充' },
    { id: 'GoodsFilled', name: '商品填充' },
    { id: 'Flag', name: '旗帜' },
    { id: 'BrushFilled', name: '刷子填充' },
    { id: 'Briefcase', name: '公文包' },
    { id: 'Stamp', name: '印章' },

    /* ================= Weather ================= */
    { id: 'Sunrise', name: '日出' },
    { id: 'Sunny', name: '晴天' },
    { id: 'Ship', name: '船' },
    { id: 'MostlyCloudy', name: '多云' },
    { id: 'PartlyCloudy', name: '局部多云' },
    { id: 'Sunset', name: '日落' },
    { id: 'Drizzling', name: '毛毛雨' },
    { id: 'Pouring', name: '大雨' },
    { id: 'Cloudy', name: '阴天' },
    { id: 'Moon', name: '月亮' },
    { id: 'MoonNight', name: '夜月' },
    { id: 'Lightning', name: '闪电' },

    /* ================= Other ================= */
    { id: 'ChromeFilled', name: 'Chrome浏览器' },
    { id: 'Eleme', name: '饿了么' },
    { id: 'ElemeFilled', name: '饿了么填充' },
    { id: 'ElementPlus', name: 'ElementPlus' },
    { id: 'Shop', name: '商店' },
    { id: 'SwitchFilled', name: '开关填充' },
    { id: 'WindPower', name: '风力发电' }
  ],

  // SVG 图标（实际可用的 SVG 资源）
  svg: [
    { id: 'vue-logo', name: 'Vue Logo', svgName: 'vue-logo' },
    { id: 'react-logo', name: 'React Logo', svgName: 'react-logo' },
    { id: 'angular-logo', name: 'Angular Logo', svgName: 'angular-logo' },
    { id: 'star-icon', name: '星星', svgName: 'star-icon' },
    { id: 'heart-icon', name: '爱心', svgName: 'heart-icon' },
    { id: 'home-icon', name: '首页', svgName: 'home-icon' },
    { id: 'user-icon', name: '用户', svgName: 'user-icon' },
    { id: 'setting-icon', name: '设置', svgName: 'setting-icon' },
  ],

  // Emoji 表情
  emoji: [
    { id: 'rocket', name: '火箭', emoji: '🚀' },
    { id: 'star', name: '星星', emoji: '⭐' },
    { id: 'fire', name: '火焰', emoji: '🔥' },
    { id: 'lightning', name: '闪电', emoji: '⚡' },
    { id: 'diamond', name: '钻石', emoji: '💎' },
    { id: 'trophy', name: '奖杯', emoji: '🏆' },
    { id: 'target', name: '目标', emoji: '🎯' },
    { id: 'chart', name: '图表', emoji: '📊' },
    { id: 'book', name: '书籍', emoji: '📚' },
    { id: 'gear', name: '齿轮', emoji: '⚙️' },
    { id: 'bulb', name: '灯泡', emoji: '💡' },
    { id: 'heart', name: '爱心', emoji: '❤️' },
    { id: 'thumbsup', name: '点赞', emoji: '👍' },
    { id: 'clap', name: '鼓掌', emoji: '👏' },
    { id: 'muscle', name: '肌肉', emoji: '💪' },
    { id: 'brain', name: '大脑', emoji: '🧠' },
    { id: 'atom', name: '原子', emoji: '⚛️' },
    { id: 'globe', name: '地球', emoji: '🌍' },
    { id: 'sun', name: '太阳', emoji: '☀️' },
    { id: 'moon', name: '月亮', emoji: '🌙' },
  ],

  // 远程图片（使用可靠的在线图片服务）
  image: [
    { id: 'placeholder-1', name: '占位图 1', iconUrl: 'https://picsum.photos/seed/icon1/48/48', imageFormat: 'JPEG' },
    { id: 'placeholder-2', name: '占位图 2', iconUrl: 'https://picsum.photos/seed/icon2/48/48', imageFormat: 'PNG' },
    { id: 'placeholder-3', name: '占位图 3', iconUrl: 'https://picsum.photos/seed/icon3/48/48', imageFormat: 'SVG' },
    { id: 'placeholder-4', name: '占位图 4', iconUrl: 'https://picsum.photos/seed/icon4/48/48', imageFormat: 'GIF' },
  ]
}

/**
 * 获取所有图标分类
 */
export function getIconCategories() {
  return Object.keys(iconLibrary)
}

/**
 * 根据分类获取图标列表
 * @param {string} category - 分类名称 ('element-icons' | 'svg' | 'emoji' | 'image')
 * @returns {Array} 图标数组
 */
export function getIconsByCategory(category) {
  return iconLibrary[category] || []
}

/**
 * 根据 ID 查找图标
 * @param {string} iconId - 图标 ID
 * @param {string} category - 可选的分类名称
 * @returns {Object|undefined} 图标对象或 undefined
 */
export function findIconById(iconId, category) {
  if (category) {
    return iconLibrary[category]?.find(icon => icon.id === iconId)
  }

  // 在所有分类中查找
  for (const icons of Object.values(iconLibrary)) {
    const found = icons.find(icon => icon.id === iconId)
    if (found) return found
  }

  return undefined
}

/**
 * 判断图标是否为 Emoji
 * @param {string} icon - 图标值
 * @returns {boolean}
 */
export function isEmoji(icon) {
  if (!icon) return false
  // Emoji Unicode 范围
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u
  return emojiRegex.test(icon)
}

/**
 * 判断图标是否为 Element Plus Icons
 * @param {string} icon - 图标 ID
 * @returns {boolean}
 */
export function isElementPlusIcon(icon) {
  if (!icon) return false
  // 检查是否在 element-icons 分类中
  const found = iconLibrary['element-icons']?.find(i => i.id === icon)
  return !!found
}

/**
 * 判断图标是否为 SVG 类型
 * @param {string} icon - 图标 ID
 * @returns {boolean}
 */
export function isSvgIcon(icon) {
  if (!icon) return false
  // 检查是否在 svg 分类中
  const found = iconLibrary.svg?.find(i => i.id === icon)
  return !!found
}

/**
 * 判断图标是否为图片地址类型
 * @param {string} icon - 图标值
 * @returns {boolean}
 */
export function isImageUrl(icon) {
  if (!icon) return false
  // 检查是否在 image 分类中，或者直接是 URL
  const found = iconLibrary.image?.find(i => i.iconUrl === icon)
  if (found) return true

  // 检查是否是 http/https/data URL
  return /^https?:\/\//.test(icon) || /^data:image\//.test(icon)
}

/**
 * 获取图标的显示类型
 * @param {string} icon - 图标值
 * @returns {'emoji' | 'element-icon' | 'svg' | 'image' | 'unknown'}
 */
export function getIconType(icon) {
  if (!icon) return 'unknown'
  if (isEmoji(icon)) return 'emoji'
  if (isElementPlusIcon(icon)) return 'element-icon'
  if (isSvgIcon(icon)) return 'svg'
  if (isImageUrl(icon)) return 'image'
  return 'unknown'
}
