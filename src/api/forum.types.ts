/**
 * 与《论坛1.0》API 文档字段/路径对齐的请求与响应类型（蛇形命名与后端一致）。
 * 前端展示模型见 `src/types/forum.ts`，对接时在 mapper 中转换。
 */

export type ForumPostStatus = 'pending_review' | 'published' | 'hidden' | 'deleted' | 'rejected'
export type ForumCommentStatus = 'pending_review' | 'published' | 'hidden' | 'deleted'
export type ForumMediaTypeApi = 'image' | 'video'
export type ForumReactionTargetType = 'post' | 'comment'
export type ForumReactionType = 'like'
export type ForumShareChannel = 'in_app' | 'wechat' | 'qq' | 'weibo' | 'copy_link'

export interface ForumTagDto {
  id: number | string
  tag_name: string
  is_enabled?: number | boolean
  created_at?: string
}

export interface ForumAuthorDto {
  id: number | string
  nickname?: string
  name?: string
  avatar?: string
  avatar_url?: string
}

/** 帖子详情/列表接口返回（字段以实际后端为准，此处覆盖文档列出的核心字段） */
export interface ForumPostDto {
  id: number | string
  author_id?: number | string
  author?: ForumAuthorDto
  post_type?: string
  product_id?: number | string | null
  title: string
  content: string
  post_status?: ForumPostStatus
  is_featured?: number | boolean
  like_count?: number
  comment_count?: number
  share_count?: number
  view_count?: number
  tags?: Array<{ tag_id?: number | string; tag_name?: string } | string>
  tag_ids?: Array<number | string>
  created_at?: string
  updated_at?: string
  published_at?: string
  reject_reason?: string | null
}

export interface ForumPostListQuery {
  page?: number
  page_size?: number
  sort?: 'latest' | 'hot' | string
  tag_id?: number | string
  post_type?: string
  keyword?: string
}

export interface ForumPostCreateBody {
  title: string
  content: string
  post_type?: string
  product_id?: number | string | null
  tag_ids?: Array<number | string>
}

export interface ForumMediaDto {
  id: number | string
  post_id?: number | string
  media_type: ForumMediaTypeApi
  media_url: string
  sort_no?: number
  created_at?: string
}

export interface ForumCommentDto {
  id: number | string
  post_id: number | string
  parent_comment_id?: number | string | null
  commenter_id?: number | string
  author?: ForumAuthorDto
  content: string
  comment_status?: ForumCommentStatus
  like_count?: number
  created_at?: string
  updated_at?: string
  replies?: ForumCommentDto[]
}

export interface ForumCommentCreateBody {
  content: string
}

export interface ForumCommentReplyBody {
  content: string
  /** 被回复用户（若后端需要） */
  reply_to_user_id?: number | string
}

export interface ForumReactionUserDto {
  user_id: number | string
  nickname?: string
  avatar?: string
}

export interface Paginated<T> {
  list?: T[]
  items?: T[]
  total?: number
  page?: number
  page_size?: number
}
