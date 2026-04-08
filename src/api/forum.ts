/**
 * 论坛模块 HTTP 对接（路径与《论坛1.0》PDF 一致）
 *
 * 使用方式：
 * 1. 在项目根目录 `.env` / `.env.local` 中配置 `VITE_API_BASE_URL`（如 `http://localhost:8080`，不要末尾斜杠）。
 * 2. 在本文件中取消各函数内被块注释包裹的 fetch 实现，并删除或注释掉对 forumApiDisabled() 的调用。
 * 3. 在 `forumHeaders()` 中取消 `Authorization` 相关注释，接入 JWT。
 * 4. 在 `src/stores/forum.ts` 的 actions 中调用此处方法，并用 `mapApi*` 映射到前端模型（mapper 见下方注释示例）。
 *
 * 与 PDF 对照后，当前前端未单独实现页面/交互的能力（仅 API 预留）：
 * - 管理员：标签 CRUD、精华/审核/待审核列表、驳回理由日志
 * - 帖子：发布/隐藏/审核通过、售卖帖 product_id 表单
 * - 媒体：分步上传（先 POST /post/create 再 POST /post/{id}/media）
 * - 转发记录（forum_post_share 表无独立 POST 路径于文档）
 * - 日统计 UV/PV（表存在，文档未给独立查询接口）
 */

import type {
  ForumCommentCreateBody,
  ForumCommentDto,
  ForumCommentReplyBody,
  ForumMediaDto,
  ForumPostCreateBody,
  ForumPostDto,
  ForumPostListQuery,
  ForumReactionUserDto,
  ForumTagDto,
  Paginated,
} from './forum.types'

export function forumBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
}

/** 对接时取消注释以携带 token */
export function forumHeaders(json = true): HeadersInit {
  const h: Record<string, string> = {}
  if (json) h['Content-Type'] = 'application/json'
  // const token = localStorage.getItem('token') ?? sessionStorage.getItem('token')
  // if (token) h.Authorization = `Bearer ${token}`
  return h
}

function forumApiDisabled(): never {
  throw new Error('[forum-api] 请取消 src/api/forum.ts 中对应函数的 fetch 注释块，并配置 VITE_API_BASE_URL')
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!text) return {} as T
  return JSON.parse(text) as T
}

// ---------------------------------------------------------------------------
// 标签 forum_tag
// ---------------------------------------------------------------------------

/** GET /api/forum/tag/list — 获取所有可用标签 (is_enabled=1) */
export async function getForumTagList(): Promise<ForumTagDto[]> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/tag/list`, { headers: forumHeaders() })
  if (!res.ok) throw new Error(`getForumTagList: ${res.status}`)
  const data = await parseJson<ForumTagDto[] | { data: ForumTagDto[] }>(res)
  return Array.isArray(data) ? data : (data as { data: ForumTagDto[] }).data
  */
  return forumApiDisabled()
}

/** POST /api/forum/tag/create — 管理员创建标签 */
export async function createForumTag(body: { tag_name: string; is_enabled?: number }): Promise<ForumTagDto> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/tag/create`, {
    method: 'POST',
    headers: forumHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`createForumTag: ${res.status}`)
  return parseJson<ForumTagDto>(res)
  */
  return forumApiDisabled()
}

/** PUT /api/forum/tag/{id} — 更新标签 */
export async function updateForumTag(
  id: number | string,
  body: Partial<{ tag_name: string; is_enabled: number }>,
): Promise<ForumTagDto> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/tag/${encodeURIComponent(String(id))}`, {
    method: 'PUT',
    headers: forumHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`updateForumTag: ${res.status}`)
  return parseJson<ForumTagDto>(res)
  */
  return forumApiDisabled()
}

/** DELETE /api/forum/tag/{id} — 删除或禁用标签 */
export async function deleteForumTag(id: number | string): Promise<void> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/tag/${encodeURIComponent(String(id))}`, {
    method: 'DELETE',
    headers: forumHeaders(),
  })
  if (!res.ok) throw new Error(`deleteForumTag: ${res.status}`)
  */
  return forumApiDisabled()
}

// ---------------------------------------------------------------------------
// 帖子 forum_post
// ---------------------------------------------------------------------------

/** POST /api/forum/post/create */
export async function createForumPost(body: ForumPostCreateBody): Promise<ForumPostDto> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/post/create`, {
    method: 'POST',
    headers: forumHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`createForumPost: ${res.status}`)
  return parseJson<ForumPostDto>(res)
  */
  return forumApiDisabled()
}

/** GET /api/forum/post/{id} */
export async function getForumPostById(id: number | string): Promise<ForumPostDto> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/post/${encodeURIComponent(String(id))}`, {
    headers: forumHeaders(),
  })
  if (!res.ok) throw new Error(`getForumPostById: ${res.status}`)
  return parseJson<ForumPostDto>(res)
  */
  return forumApiDisabled()
}

/** PUT /api/forum/post/{id} */
export async function updateForumPost(
  id: number | string,
  body: Partial<Pick<ForumPostDto, 'title' | 'content' | 'post_status'>>,
): Promise<ForumPostDto> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/post/${encodeURIComponent(String(id))}`, {
    method: 'PUT',
    headers: forumHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`updateForumPost: ${res.status}`)
  return parseJson<ForumPostDto>(res)
  */
  return forumApiDisabled()
}

/** DELETE /api/forum/post/{id} */
export async function deleteForumPost(id: number | string): Promise<void> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/post/${encodeURIComponent(String(id))}`, {
    method: 'DELETE',
    headers: forumHeaders(),
  })
  if (!res.ok) throw new Error(`deleteForumPost: ${res.status}`)
  */
  return forumApiDisabled()
}

/** GET /api/forum/post/list — 分页、筛选、排序 */
export async function getForumPostList(query?: ForumPostListQuery): Promise<Paginated<ForumPostDto>> {
  /*
  const base = forumBaseUrl()
  const q = new URLSearchParams()
  if (query?.page != null) q.set('page', String(query.page))
  if (query?.page_size != null) q.set('page_size', String(query.page_size))
  if (query?.sort) q.set('sort', query.sort)
  if (query?.tag_id != null) q.set('tag_id', String(query.tag_id))
  if (query?.post_type) q.set('post_type', query.post_type)
  if (query?.keyword) q.set('keyword', query.keyword)
  const qs = q.toString()
  const res = await fetch(`${base}/api/forum/post/list${qs ? `?${qs}` : ''}`, { headers: forumHeaders() })
  if (!res.ok) throw new Error(`getForumPostList: ${res.status}`)
  return parseJson<Paginated<ForumPostDto>>(res)
  */
  return forumApiDisabled()
}

/** GET /api/forum/post/my — 当前用户帖子 */
export async function getForumMyPosts(query?: Pick<ForumPostListQuery, 'page' | 'page_size'>): Promise<
  Paginated<ForumPostDto>
> {
  /*
  const base = forumBaseUrl()
  const q = new URLSearchParams()
  if (query?.page != null) q.set('page', String(query.page))
  if (query?.page_size != null) q.set('page_size', String(query.page_size))
  const qs = q.toString()
  const res = await fetch(`${base}/api/forum/post/my${qs ? `?${qs}` : ''}`, { headers: forumHeaders() })
  if (!res.ok) throw new Error(`getForumMyPosts: ${res.status}`)
  return parseJson<Paginated<ForumPostDto>>(res)
  */
  return forumApiDisabled()
}

/** PUT /api/forum/post/{id}/publish */
export async function publishForumPost(id: number | string): Promise<void> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/post/${encodeURIComponent(String(id))}/publish`, {
    method: 'PUT',
    headers: forumHeaders(),
  })
  if (!res.ok) throw new Error(`publishForumPost: ${res.status}`)
  */
  return forumApiDisabled()
}

/** PUT /api/forum/post/{id}/hide */
export async function hideForumPost(id: number | string): Promise<void> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/post/${encodeURIComponent(String(id))}/hide`, {
    method: 'PUT',
    headers: forumHeaders(),
  })
  if (!res.ok) throw new Error(`hideForumPost: ${res.status}`)
  */
  return forumApiDisabled()
}

/** POST /api/forum/post/{id}/tags — 为帖子选择标签（文档） */
export async function setForumPostTags(
  id: number | string,
  body: { tag_ids: Array<number | string> },
): Promise<void> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/post/${encodeURIComponent(String(id))}/tags`, {
    method: 'POST',
    headers: forumHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`setForumPostTags: ${res.status}`)
  */
  return forumApiDisabled()
}

/** GET /api/forum/post/pending-review — 管理员 */
export async function getForumPendingReviewPosts(): Promise<ForumPostDto[]> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/post/pending-review`, { headers: forumHeaders() })
  if (!res.ok) throw new Error(`getForumPendingReviewPosts: ${res.status}`)
  const data = await parseJson<ForumPostDto[] | { data: ForumPostDto[] }>(res)
  return Array.isArray(data) ? data : (data as { data: ForumPostDto[] }).data
  */
  return forumApiDisabled()
}

/** PUT /api/forum/post/{id}/approve — 审核通过 */
export async function approveForumPost(id: number | string): Promise<void> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/post/${encodeURIComponent(String(id))}/approve`, {
    method: 'PUT',
    headers: forumHeaders(),
  })
  if (!res.ok) throw new Error(`approveForumPost: ${res.status}`)
  */
  return forumApiDisabled()
}

/** GET /api/forum/post/status-log/{id} — 驳回等状态日志 */
export async function getForumPostStatusLog(id: number | string): Promise<unknown[]> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/post/status-log/${encodeURIComponent(String(id))}`, {
    headers: forumHeaders(),
  })
  if (!res.ok) throw new Error(`getForumPostStatusLog: ${res.status}`)
  return parseJson<unknown[]>(res)
  */
  return forumApiDisabled()
}

// ---------------------------------------------------------------------------
// 管理员帖子
// ---------------------------------------------------------------------------

/** PUT /api/admin/forum/post/{id}/feature */
export async function featureForumPostAdmin(id: number | string): Promise<void> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/admin/forum/post/${encodeURIComponent(String(id))}/feature`, {
    method: 'PUT',
    headers: forumHeaders(),
  })
  if (!res.ok) throw new Error(`featureForumPostAdmin: ${res.status}`)
  */
  return forumApiDisabled()
}

/** PUT /api/admin/forum/post/{id}/unfeature */
export async function unfeatureForumPostAdmin(id: number | string): Promise<void> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/admin/forum/post/${encodeURIComponent(String(id))}/unfeature`, {
    method: 'PUT',
    headers: forumHeaders(),
  })
  if (!res.ok) throw new Error(`unfeatureForumPostAdmin: ${res.status}`)
  */
  return forumApiDisabled()
}

/** PUT /api/admin/forum/post/{id}/reject — PDF 路径不完整，按常见命名约定 */
export async function rejectForumPostAdmin(
  id: number | string,
  body: { reject_reason: string },
): Promise<void> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/admin/forum/post/${encodeURIComponent(String(id))}/reject`, {
    method: 'PUT',
    headers: forumHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`rejectForumPostAdmin: ${res.status}`)
  */
  return forumApiDisabled()
}

// ---------------------------------------------------------------------------
// 媒体 forum_post_media
// ---------------------------------------------------------------------------

/** POST /api/forum/post/{id}/media — multipart/form-data */
export async function uploadForumPostMedia(
  postId: number | string,
  file: File,
  extra?: { sort_no?: number; media_type?: 'image' | 'video' },
): Promise<ForumMediaDto> {
  /*
  const base = forumBaseUrl()
  const fd = new FormData()
  fd.append('file', file)
  if (extra?.sort_no != null) fd.append('sort_no', String(extra.sort_no))
  if (extra?.media_type) fd.append('media_type', extra.media_type)
  const headers: HeadersInit = {}
  // const token = localStorage.getItem('token')
  // if (token) (headers as Record<string, string>).Authorization = `Bearer ${token}`
  const res = await fetch(`${base}/api/forum/post/${encodeURIComponent(String(postId))}/media`, {
    method: 'POST',
    headers,
    body: fd,
  })
  if (!res.ok) throw new Error(`uploadForumPostMedia: ${res.status}`)
  return parseJson<ForumMediaDto>(res)
  */
  return forumApiDisabled()
}

/** GET /api/forum/post/{id}/media */
export async function getForumPostMediaList(postId: number | string): Promise<ForumMediaDto[]> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/post/${encodeURIComponent(String(postId))}/media`, {
    headers: forumHeaders(),
  })
  if (!res.ok) throw new Error(`getForumPostMediaList: ${res.status}`)
  const data = await parseJson<ForumMediaDto[] | { data: ForumMediaDto[] }>(res)
  return Array.isArray(data) ? data : (data as { data: ForumMediaDto[] }).data
  */
  return forumApiDisabled()
}

/** DELETE /api/forum/post/media/{media_id} */
export async function deleteForumPostMedia(mediaId: number | string): Promise<void> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/post/media/${encodeURIComponent(String(mediaId))}`, {
    method: 'DELETE',
    headers: forumHeaders(),
  })
  if (!res.ok) throw new Error(`deleteForumPostMedia: ${res.status}`)
  */
  return forumApiDisabled()
}

// ---------------------------------------------------------------------------
// 评论 forum_comment
// ---------------------------------------------------------------------------

/** POST /api/forum/post/{id}/comment */
export async function createForumPostComment(
  postId: number | string,
  body: ForumCommentCreateBody,
): Promise<ForumCommentDto> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/post/${encodeURIComponent(String(postId))}/comment`, {
    method: 'POST',
    headers: forumHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`createForumPostComment: ${res.status}`)
  return parseJson<ForumCommentDto>(res)
  */
  return forumApiDisabled()
}

/** POST /api/forum/comment/{id}/reply */
export async function replyForumComment(
  commentId: number | string,
  body: ForumCommentReplyBody,
): Promise<ForumCommentDto> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/comment/${encodeURIComponent(String(commentId))}/reply`, {
    method: 'POST',
    headers: forumHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`replyForumComment: ${res.status}`)
  return parseJson<ForumCommentDto>(res)
  */
  return forumApiDisabled()
}

/** GET /api/forum/post/{id}/comments */
export async function getForumPostComments(
  postId: number | string,
  query?: { page?: number; page_size?: number },
): Promise<Paginated<ForumCommentDto> | ForumCommentDto[]> {
  /*
  const base = forumBaseUrl()
  const q = new URLSearchParams()
  if (query?.page != null) q.set('page', String(query.page))
  if (query?.page_size != null) q.set('page_size', String(query.page_size))
  const qs = q.toString()
  const res = await fetch(
    `${base}/api/forum/post/${encodeURIComponent(String(postId))}/comments${qs ? `?${qs}` : ''}`,
    { headers: forumHeaders() },
  )
  if (!res.ok) throw new Error(`getForumPostComments: ${res.status}`)
  return parseJson<Paginated<ForumCommentDto> | ForumCommentDto[]>(res)
  */
  return forumApiDisabled()
}

/** GET /api/forum/comment/{id} */
export async function getForumCommentById(id: number | string): Promise<ForumCommentDto> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/comment/${encodeURIComponent(String(id))}`, {
    headers: forumHeaders(),
  })
  if (!res.ok) throw new Error(`getForumCommentById: ${res.status}`)
  return parseJson<ForumCommentDto>(res)
  */
  return forumApiDisabled()
}

/** PUT /api/forum/comment/{id} */
export async function updateForumComment(
  id: number | string,
  body: Pick<ForumCommentCreateBody, 'content'>,
): Promise<ForumCommentDto> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/comment/${encodeURIComponent(String(id))}`, {
    method: 'PUT',
    headers: forumHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`updateForumComment: ${res.status}`)
  return parseJson<ForumCommentDto>(res)
  */
  return forumApiDisabled()
}

/** DELETE /api/forum/comment/{id} */
export async function deleteForumComment(id: number | string): Promise<void> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/comment/${encodeURIComponent(String(id))}`, {
    method: 'DELETE',
    headers: forumHeaders(),
  })
  if (!res.ok) throw new Error(`deleteForumComment: ${res.status}`)
  */
  return forumApiDisabled()
}

/** PUT /api/forum/comment/{id}/publish */
export async function publishForumComment(id: number | string): Promise<void> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/comment/${encodeURIComponent(String(id))}/publish`, {
    method: 'PUT',
    headers: forumHeaders(),
  })
  if (!res.ok) throw new Error(`publishForumComment: ${res.status}`)
  */
  return forumApiDisabled()
}

// ---------------------------------------------------------------------------
// 点赞 forum_reaction
// ---------------------------------------------------------------------------

/** POST /api/forum/post/{id}/like */
export async function likeForumPost(id: number | string): Promise<void> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/post/${encodeURIComponent(String(id))}/like`, {
    method: 'POST',
    headers: forumHeaders(),
  })
  if (!res.ok) throw new Error(`likeForumPost: ${res.status}`)
  */
  return forumApiDisabled()
}

/** DELETE /api/forum/post/{id}/like */
export async function unlikeForumPost(id: number | string): Promise<void> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/post/${encodeURIComponent(String(id))}/like`, {
    method: 'DELETE',
    headers: forumHeaders(),
  })
  if (!res.ok) throw new Error(`unlikeForumPost: ${res.status}`)
  */
  return forumApiDisabled()
}

/** POST /api/forum/comment/{id}/like */
export async function likeForumComment(id: number | string): Promise<void> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/comment/${encodeURIComponent(String(id))}/like`, {
    method: 'POST',
    headers: forumHeaders(),
  })
  if (!res.ok) throw new Error(`likeForumComment: ${res.status}`)
  */
  return forumApiDisabled()
}

/** DELETE /api/forum/comment/{id}/like */
export async function unlikeForumComment(id: number | string): Promise<void> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/comment/${encodeURIComponent(String(id))}/like`, {
    method: 'DELETE',
    headers: forumHeaders(),
  })
  if (!res.ok) throw new Error(`unlikeForumComment: ${res.status}`)
  */
  return forumApiDisabled()
}

/** GET /api/forum/post/{id}/reactions */
export async function getForumPostReactions(postId: number | string): Promise<ForumReactionUserDto[]> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/post/${encodeURIComponent(String(postId))}/reactions`, {
    headers: forumHeaders(),
  })
  if (!res.ok) throw new Error(`getForumPostReactions: ${res.status}`)
  const data = await parseJson<ForumReactionUserDto[] | { data: ForumReactionUserDto[] }>(res)
  return Array.isArray(data) ? data : (data as { data: ForumReactionUserDto[] }).data
  */
  return forumApiDisabled()
}

/** GET /api/forum/comment/{id}/reactions */
export async function getForumCommentReactions(commentId: number | string): Promise<ForumReactionUserDto[]> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/comment/${encodeURIComponent(String(commentId))}/reactions`, {
    headers: forumHeaders(),
  })
  if (!res.ok) throw new Error(`getForumCommentReactions: ${res.status}`)
  const data = await parseJson<ForumReactionUserDto[] | { data: ForumReactionUserDto[] }>(res)
  return Array.isArray(data) ? data : (data as { data: ForumReactionUserDto[] }).data
  */
  return forumApiDisabled()
}

/** 浏览量：文档未单独列出“+1”接口；常见做法为 GET /post/{id} 时后端自增，或提供专用接口，请与后端确认后补充 */
export async function recordForumPostView(id: number | string): Promise<void> {
  /*
  const base = forumBaseUrl()
  const res = await fetch(`${base}/api/forum/post/${encodeURIComponent(String(id))}/view`, {
    method: 'POST',
    headers: forumHeaders(),
  })
  if (!res.ok) throw new Error(`recordForumPostView: ${res.status}`)
  */
  return forumApiDisabled()
}

// ---------------------------------------------------------------------------
// 映射示例（对接时在 store 或 composable 中使用，取消注释后实现）
// ---------------------------------------------------------------------------
/*
import type { ForumPost, ForumMedia, ForumAuthor } from '../types/forum'
import type { ForumPostDto, ForumMediaDto } from './forum.types'

export function mapApiPostToForumPost(dto: ForumPostDto): ForumPost {
  const author: ForumAuthor = {
    id: String(dto.author?.id ?? dto.author_id ?? ''),
    name: dto.author?.nickname ?? dto.author?.name ?? '用户',
    avatarUrl: dto.author?.avatar_url ?? dto.author?.avatar ?? '',
  }
  const tags = (dto.tags ?? [])
    .map((t) => (typeof t === 'string' ? t : t.tag_name ?? ''))
    .filter(Boolean)
  return {
    id: String(dto.id),
    title: dto.title,
    content: dto.content ?? '',
    tags,
    author,
    media: [],
    createdAt: dto.created_at ?? dto.published_at ?? new Date().toISOString(),
    viewCount: dto.view_count ?? 0,
    likeCount: dto.like_count ?? 0,
    commentCount: dto.comment_count ?? 0,
  }
}

export function mapApiMediaToForumMedia(m: ForumMediaDto): ForumMedia {
  return {
    id: String(m.id),
    type: m.media_type === 'video' ? 'video' : 'image',
    url: m.media_url,
    width: undefined,
    height: undefined,
  }
}
*/

export type { ForumPostDto, ForumCommentDto, ForumTagDto } from './forum.types'
export type { ForumPost, ForumComment } from '../types/forum'
