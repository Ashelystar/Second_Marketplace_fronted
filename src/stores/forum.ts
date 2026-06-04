/**
 * 论坛状态：帖子列表对接 POST /api/forum/post/list。
 * 评论、点赞等交互仍使用本地 mock，待后续接口对接。
 */
import { defineStore } from 'pinia'
import type { ForumComment, ForumPost } from '../types/forum'
import { forumMockComments, forumMockPosts } from '../mocks/forum'
import { getForumPostList, getForumCategoryList, getForumPostById, flattenForumCategories, mapPostListItemToForumPost, mapPostDetailToForumPost } from '../api/forum'
import type { ForumCategoryFlat, PostSearchRequest } from '../api/forum.types'

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

export const useForumStore = defineStore('forum', {
  state: () => ({
    posts: [] as ForumPost[],
    comments: [...forumMockComments] as ForumComment[],
    /** 社区广场列表：顶栏提交的帖子搜索关键词（仅首页筛选使用） */
    squareSearchQuery: '',
    categories: [] as ForumCategoryFlat[],
    categoriesLoading: false,
    categoriesLoadError: '',
    postsLoading: false,
    postsLoadError: '',
    currentPostLoading: false,
    currentPostError: '',
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
    async loadCategories() {
      this.categoriesLoading = true
      this.categoriesLoadError = ''
      try {
        const tree = await getForumCategoryList()
        this.categories = flattenForumCategories(tree)
      } catch (e) {
        console.error('加载论坛板块失败:', e)
        this.categoriesLoadError = e instanceof Error ? e.message : '加载论坛板块失败'
        this.categories = []
      } finally {
        this.categoriesLoading = false
      }
    },
    async loadPosts(query?: Pick<PostSearchRequest, 'pageNum' | 'pageSize' | 'keyword' | 'categoryId' | 'sortBy' | 'order'>) {
      this.postsLoading = true
      this.postsLoadError = ''
      try {
        const page = await getForumPostList({
          pageNum: query?.pageNum ?? 1,
          pageSize: query?.pageSize ?? 50,
          keyword: query?.keyword,
          categoryId: query?.categoryId,
          sortBy: query?.sortBy ?? 'created_at',
          order: query?.order ?? 'DESC',
        })
        this.posts = page.list.map(mapPostListItemToForumPost)
      } catch (e) {
        console.error('加载帖子列表失败:', e)
        this.postsLoadError = e instanceof Error ? e.message : '加载帖子列表失败'
        this.posts = [...forumMockPosts]
      } finally {
        this.postsLoading = false
      }
    },
    async loadPostDetail(postId: string) {
      this.currentPostLoading = true
      this.currentPostError = ''
      try {
        const detail = await getForumPostById(postId)
        const mapped = mapPostDetailToForumPost(detail)
        const idx = this.posts.findIndex((p) => p.id === mapped.id)
        if (idx >= 0) {
          this.posts[idx] = mapped
        } else {
          this.posts.push(mapped)
        }
        if (detail.isLiked) {
          this.likedPostIds.add(mapped.id)
        } else {
          this.likedPostIds.delete(mapped.id)
        }
        return mapped
      } catch (e) {
        console.error('加载帖子详情失败:', e)
        this.currentPostError = e instanceof Error ? e.message : '加载帖子详情失败'
        return null
      } finally {
        this.currentPostLoading = false
      }
    },
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

