const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

/**
 * 默认占位图 — 使用 SVG data URI，不依赖外部网站
 * 尺寸由调用方通过参数指定
 */
export const PLACEHOLDER_IMG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect fill="#f0f0f0" width="300" height="300"/><text fill="#999" font-family="sans-serif" font-size="16" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">暂无图片</text></svg>'
)}`

/**
 * 将相对路径图片 URL 转为完整路径
 * - 已是 http/https 开头 → 原样返回
 * - 以 / 开头的相对路径 → 拼接后端基地址
 * - 空值 → 返回空字符串
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  // /filebucket 由 Vite dev server proxy 转发到 MinIO
  if (path.startsWith('/filebucket/') || path === '/filebucket') return path
  // product/xxx 格式 — MinIO 存储路径，补上 /filebucket/ 前缀让 Vite 代理转发到 MinIO
  if (path.startsWith('product/')) return '/filebucket/' + path
  // /api 开头的请求由 axios/fetch 通过 Vite 代理发出，也不需要拼接
  if (path.startsWith('/api/')) return path
  return `${API_BASE}${path}`
}
