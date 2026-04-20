/**
 * 论坛状态：当前默认使用 `mocks` 本地数据。
 *
 * 与《论坛1.0》PDF 对接时：
 * - 在 `src/api/forum.ts` 中取消各函数内 fetch 注释，并配置 `VITE_API_BASE_URL`。
 * - 将下方 actions 改为 `await` 对应 API（如 `getForumPostList`、`getForumPostById`、`createForumPost`、
 *   `likeForumPost` / `unlikeForumPost`、`getForumPostComments`、`createForumPostComment` 等），
 *   响应体用 `src/api/forum.ts` 底部映射示例转为 `ForumPost` / `ForumComment` 再写入 state。
 * - 点赞态可与 `GET .../reactions` 或后端返回的 `liked` 字段同步。
 */
import { defineStore } from 'pinia'
import type { ForumComment, ForumPost } from '../types/forum'
import { forumMockComments, forumMockPosts } from '../mocks/forum'

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

export const useForumStore = defineStore('forum', {
  state: () => ({
    posts: [...forumMockPosts] as ForumPost[],
    comments: [...forumMockComments] as ForumComment[],
    /** 社区广场列表：顶栏提交的帖子搜索关键词（仅首页筛选使用） */
    squareSearchQuery: '',
    currentUserId: 'me',
    currentUserName: 'XMQ',
    currentUserAvatarUrl: forumMockPosts[0]?.author.avatarUrl ?? '',
    likedPostIds: new Set<string>(),
    likedCommentIds: new Set<string>(),
  }),
  getters: {
    postById: (s) => (id: string) => s.posts.find((p) => p.id === id) ?? null,
    commentsByPost: (s) => (postId: string) => s.comments.filter((c) => c.postId === postId),
    relatedPosts: (s) => (postId: string, limit = 6) => {
      const base = s.posts.find((p) => p.id === postId)
      if (!base) return s.posts.filter((p) => p.id !== postId).slice(0, limit)
      const tags = new Set(base.tags)
      const baseTerms = pickTerms(`${base.title} ${base.content}`)
      return s.posts
        .filter((p) => p.id !== postId)
        .map((p) => {
          const tagScore = p.tags.reduce((acc, t) => acc + (tags.has(t) ? 3 : 0), 0)
          const termScore = overlapCount(baseTerms, pickTerms(`${p.title} ${p.content}`))
          return { p, score: tagScore + termScore }
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score || b.p.likeCount - a.p.likeCount)
        .slice(0, limit)
        .map((x) => x.p)
    },
    isPostLiked: (s) => (postId: string) => s.likedPostIds.has(postId),
    isCommentLiked: (s) => (commentId: string) => s.likedCommentIds.has(commentId),
  },
  actions: {
    setSquareSearchQuery(q: string) {
      this.squareSearchQuery = q
    },
    incrementView(postId: string) {
      const p = this.posts.find((x) => x.id === postId)
      if (!p) return
      p.viewCount += 1
    },
    toggleLike(postId: string) {
      const p = this.posts.find((x) => x.id === postId)
      if (!p) return
      if (this.likedPostIds.has(postId)) {
        this.likedPostIds.delete(postId)
        p.likeCount = Math.max(0, p.likeCount - 1)
        return
      }
      this.likedPostIds.add(postId)
      p.likeCount += 1
    },
    toggleCommentLike(commentId: string) {
      const c = this.comments.find((x) => x.id === commentId)
      if (!c) return
      if (this.likedCommentIds.has(commentId)) {
        this.likedCommentIds.delete(commentId)
        c.likeCount = Math.max(0, c.likeCount - 1)
        return
      }
      this.likedCommentIds.add(commentId)
      c.likeCount += 1
    },
    addPost(
      input: Pick<ForumPost, 'title' | 'content' | 'tags' | 'media' | 'coverUrl'> & {
        postType?: string
        productId?: string | number | null
      },
    ) {
      const now = new Date().toISOString()
      const post: ForumPost = {
        id: uid('p'),
        title: input.title.trim(),
        content: input.content.trim(),
        tags: input.tags,
        media: input.media,
        coverUrl: input.coverUrl,
        postType: input.postType ?? 'common',
        productId: input.productId ?? null,
        postStatus: 'pending_review',
        isFeatured: false,
        author: {
          id: 'me',
          name: this.currentUserName,
          // 当前用户头像：不要复用上传的媒体封面图
          avatarUrl: this.currentUserAvatarUrl,
        },
        createdAt: now,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
      }
      this.posts.unshift(post)
      return post
    },
    addComment(postId: string, content: string, opts?: { parentCommentId?: string; replyTo?: { id: string; name: string } }) {
      const now = new Date().toISOString()
      const c: ForumComment = {
        id: uid('c'),
        postId,
        parentCommentId: opts?.parentCommentId,
        replyToAuthorId: opts?.replyTo?.id,
        replyToAuthorName: opts?.replyTo?.name,
        content: content.trim(),
        createdAt: now,
        likeCount: 0,
        author: {
          id: 'me',
          name: this.currentUserName,
          avatarUrl: this.currentUserAvatarUrl,
        },
      }
      this.comments.unshift(c)
      const p = this.posts.find((x) => x.id === postId)
      if (p) p.commentCount += 1
      return c
    },

    updateComment(commentId: string, content: string) {
      const c = this.comments.find((x) => x.id === commentId)
      if (!c) return false
      c.content = content.trim()
      return true
    },

    deleteComment(commentId: string) {
      const target = this.comments.find((x) => x.id === commentId)
      if (!target) return

      // 递归删除：删除目标评论及其所有楼中楼子回复
      const toDelete = new Set<string>()
      toDelete.add(commentId)

      let changed = true
      while (changed) {
        changed = false
        for (const c of this.comments) {
          if (c.parentCommentId && toDelete.has(c.parentCommentId) && !toDelete.has(c.id)) {
            toDelete.add(c.id)
            changed = true
          }
        }
      }

      const removedCount = this.comments.filter((c) => toDelete.has(c.id)).length
      const removedIds = [...toDelete]

      this.comments = this.comments.filter((c) => !toDelete.has(c.id))

      // 清理点赞态
      for (const id of removedIds) this.likedCommentIds.delete(id)

      const p = this.posts.find((x) => x.id === target.postId)
      if (p) p.commentCount = Math.max(0, p.commentCount - removedCount)
    },
  },
})

function pickTerms(text: string) {
  const set = new Set<string>()
  const clean = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ')
  const words = clean
    .split(/\s+/)
    .map((x) => x.trim())
    .filter((x) => x.length >= 2)
  for (const w of words) set.add(w)

  // 为中文内容补充 2 字分词，避免“整句一个词”导致相似度失真
  const hanOnly = text.replace(/[^\u4e00-\u9fa5]/g, '')
  for (let i = 0; i < hanOnly.length - 1; i += 1) {
    set.add(hanOnly.slice(i, i + 2))
  }
  return set
}

function overlapCount(a: Set<string>, b: Set<string>) {
  let n = 0
  for (const x of a) if (b.has(x)) n += 1
  return n
}

