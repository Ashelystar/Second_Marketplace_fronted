export type ForumMediaType = 'image' | 'video'

export type ForumPostStatus = 'pending_review' | 'published' | 'hidden' | 'deleted' | 'rejected'

export interface ForumAuthor {
  id: string
  name: string
  avatarUrl: string
}

export interface ForumMedia {
  id: string
  type: ForumMediaType
  url: string
  posterUrl?: string
  width?: number
  height?: number
  durationSec?: number
}

export interface ForumComment {
  id: string
  postId: string
  parentCommentId?: string
  replyToAuthorId?: string
  replyToAuthorName?: string
  author: ForumAuthor
  content: string
  createdAt: string
  likeCount: number
}

export interface ForumPost {
  id: string
  title: string
  content: string
  tags: string[]
  author: ForumAuthor
  media: ForumMedia[]
  coverUrl?: string
  /**
   * 帖子类型：普通 / 售卖 等（由后端枚举决定，当前用于展示与关联商品）
   * NOTE：后端对字段名可能不同；这里是前端模型字段
   */
  postType?: string
  /**
   * 关联商品 ID（售卖帖必填；普通帖为空）
   * NOTE：后端字段可能是 product_id
   */
  productId?: string | number | null
  /**
   * 审核状态：后续与管理端关联
   */
  postStatus: ForumPostStatus
  /**
   * 精华状态：后续与管理端关联
   */
  isFeatured: boolean
  createdAt: string
  viewCount: number
  likeCount: number
  commentCount: number
}

