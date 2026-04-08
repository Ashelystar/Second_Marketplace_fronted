import type { GoodsItem } from '../types/goods'

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function svgDataUri(label: string, a = '#06b6d4', b = '#6366f1') {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="960" height="720">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${a}" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="${b}" stop-opacity="0.22"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect x="54" y="62" width="852" height="596" rx="40" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.18)"/>
    <text x="96" y="250" font-family="system-ui,Segoe UI,Roboto,Arial" font-size="64" fill="rgba(255,255,255,0.92)" font-weight="800">${escapeXml(
      label,
    )}</text>
    <text x="96" y="320" font-family="system-ui,Segoe UI,Roboto,Arial" font-size="28" fill="rgba(255,255,255,0.78)">Mock Cover</text>
  </svg>
  `.trim()
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const mockGoods: GoodsItem[] = [
  {
    id: 'g1',
    name: 'iPhone 12 128G（成色优秀）',
    coverUrl: svgDataUri('iPhone 12 128G', '#06b6d4', '#22c55e'),
    priceText: '¥1889',
    desc: '电池健康正常、无维修史，支持面交。仅演示用 mock 数据。',
  },
  {
    id: 'g2',
    name: 'AirPods Pro 二代（降噪强）',
    coverUrl: svgDataUri('AirPods Pro 2', '#6366f1', '#f59e0b'),
    priceText: '¥799',
    desc: '降噪良好、收纳盒外观干净。仅演示用 mock 数据。',
  },
  {
    id: 'g3',
    name: '运动跑鞋（尺码齐全）',
    coverUrl: svgDataUri('运动跑鞋', '#34d399', '#06b6d4'),
    priceText: '¥350',
    desc: '鞋面完好、脚感舒适。仅演示用 mock 数据。',
  },
]

