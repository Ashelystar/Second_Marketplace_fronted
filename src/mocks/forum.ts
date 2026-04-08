import type { ForumAuthor, ForumComment, ForumPost } from '../types/forum'

function svgDataUri(label: string, a = '#06b6d4', b = '#6366f1') {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="960" height="1280">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${a}" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="${b}" stop-opacity="0.22"/>
      </linearGradient>
      <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="24" stdDeviation="18" flood-color="#0f172a" flood-opacity="0.18"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="70" y="80" width="820" height="1120" rx="44" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.18)"/>
    <g filter="url(#s)">
      <text x="96" y="220" font-family="system-ui,Segoe UI,Roboto,Arial" font-size="54" fill="rgba(255,255,255,0.92)" font-weight="800">${escapeXml(
        label,
      )}</text>
      <text x="96" y="290" font-family="system-ui,Segoe UI,Roboto,Arial" font-size="26" fill="rgba(255,255,255,0.78)">Mock Media</text>
    </g>
  </svg>
  `.trim()
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function isoDaysAgo(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

const authors: ForumAuthor[] = [
  { id: 'u1', name: '周四ZYF', avatarUrl: svgDataUri('ZYF', '#22c55e', '#06b6d4') },
  { id: 'u2', name: '小山同学', avatarUrl: svgDataUri('XS', '#fb7185', '#f59e0b') },
  { id: 'u3', name: 'Seemmy', avatarUrl: svgDataUri('SM', '#a78bfa', '#06b6d4') },
  { id: 'u4', name: '阿白同学', avatarUrl: svgDataUri('AB', '#60a5fa', '#34d399') },
]

export const forumMockTags = [
  '二手',
  '数码',
  '穿搭',
  '宿舍',
  '开学',
  '清单',
  '验机',
  '跑鞋',
  '运动',
  '测评',
  '避雷',
  '干货',
]

export const forumMockPosts: ForumPost[] = [
  {
    id: 'p101',
    title: '穿搭技巧：男女老少通用（避雷清单）',
    content:
      '总结 7 个穿搭“显贵但不费钱”的小技巧：领口比例、肩线、下摆长度、材质纹理对比、同色系层次、鞋包统一、饰品留白。最后附上常见踩雷示例。',
    tags: ['穿搭', '干货', '避雷'],
    author: authors[0]!,
    postType: 'common',
    productId: null,
    postStatus: 'published',
    isFeatured: false,
    media: [
      {
        id: 'm1',
        type: 'video',
        url: '',
        posterUrl: svgDataUri('穿搭技巧 · 0:22', '#06b6d4', '#a78bfa'),
        durationSec: 22,
        width: 1080,
        height: 1920,
      },
    ],
    createdAt: isoDaysAgo(1),
    viewCount: 229_415,
    likeCount: 4_700,
    commentCount: 57,
  },
  {
    id: 'p102',
    title: '开学第一天宿舍必备：省钱但好用',
    content:
      '按“必买 / 可选 / 别买”分类整理宿舍清单：收纳、床品、清洁、数码。每类给 2-3 个平替思路，最后讲讲怎么买更划算。',
    tags: ['开学', '宿舍', '清单'],
    author: authors[1]!,
    postType: 'common',
    productId: null,
    postStatus: 'published',
    isFeatured: false,
    media: [{ id: 'm2', type: 'image', url: svgDataUri('宿舍必备', '#f59e0b', '#06b6d4'), width: 1080, height: 1440 }],
    createdAt: isoDaysAgo(3),
    viewCount: 12_680,
    likeCount: 533,
    commentCount: 18,
  },
  {
    id: 'p103',
    title: '运动跑鞋怎么挑？从脚型到落地方式',
    content:
      '根据足弓、脚宽、落地方式（后跟/前掌）选择缓震与支撑。附上试穿要点：尺码、包裹感、前掌空间与回弹感。',
    tags: ['运动', '跑鞋', '测评'],
    author: authors[2]!,
    postType: 'common',
    productId: null,
    postStatus: 'published',
    isFeatured: true,
    media: [{ id: 'm3', type: 'image', url: svgDataUri('跑鞋挑选', '#34d399', '#60a5fa'), width: 1280, height: 960 }],
    createdAt: isoDaysAgo(6),
    viewCount: 8_022,
    likeCount: 318,
    commentCount: 9,
  },
  {
    id: 'p104',
    title: '二手电子产品验机 checklist（收藏版）',
    content:
      '屏幕、外观、边框、相机、麦克风、扬声器、电池健康、充电口、序列号、激活锁、配件与票据。附上“拒收话术”。',
    tags: ['二手', '数码', '验机'],
    author: authors[3]!,
    // 示例：让其中一条帖子关联商品，方便你验证“商品卡片跳转”
    postType: 'sell',
    productId: 'g1',
    postStatus: 'published',
    isFeatured: false,
    media: [{ id: 'm4', type: 'image', url: svgDataUri('验机清单', '#60a5fa', '#fb7185'), width: 1080, height: 1680 }],
    createdAt: isoDaysAgo(2),
    viewCount: 34_120,
    likeCount: 1_056,
    commentCount: 42,
  },
]

export const forumMockComments: ForumComment[] = [
  {
    id: 'c1',
    postId: 'p101',
    author: authors[1]!,
    content: '第 3 条太有用了！衣服贵不贵真的看肩线和领口比例。',
    createdAt: isoDaysAgo(1),
    likeCount: 61,
  },
  {
    id: 'c2',
    postId: 'p101',
    parentCommentId: 'c1',
    replyToAuthorId: 'u2',
    replyToAuthorName: '小山同学',
    author: authors[2]!,
    content: '能不能再补一条关于裤长的？我总买到显腿短的。',
    createdAt: isoDaysAgo(1),
    likeCount: 12,
  },
  {
    id: 'c3',
    postId: 'p104',
    author: authors[0]!,
    content: '“拒收话术”这个太真实了，收藏了下次直接复制。',
    createdAt: isoDaysAgo(2),
    likeCount: 48,
  },
]

export function formatCompactNumber(n: number) {
  if (n >= 10000) return `${Math.round((n / 10000) * 10) / 10}w`
  if (n >= 1000) return `${Math.round((n / 1000) * 10) / 10}k`
  return `${n}`
}

export function formatDateShort(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const delta = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (delta < 60) return '刚刚'
  if (delta < 3600) return `${Math.floor(delta / 60)} 分钟前`
  if (delta < 86400) return `${Math.floor(delta / 3600)} 小时前`
  return `${d.getMonth() + 1}-${String(d.getDate()).padStart(2, '0')}`
}

