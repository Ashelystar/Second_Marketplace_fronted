import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  publishNoticeApi,
  getNoticeListApi,
  revokeNoticeApi,
  getNoticeDetailApi,
  type SystemNoticeVO,
  type PublishNoticeDTO,
  type NoticeQueryDTO,
  type PublishStatus
} from '@/api/notification'

// 用户管理相关类型
export interface AdminUser {
  id: number
  username: string
  nickname: string
  phone: string
  email: string
  userStatus: string
  lastLoginAt: string
  registeredAt: string
  avatar: string | null
  isAdmin: boolean
  canBuy: boolean
  canSell: boolean
}

// 商品审核相关类型
export interface AdminProduct {
  id: number
  title: string
  subtitle: string
  description: string
  brand: string
  model: string
  conditionLevel: string
  originalPrice: number
  sellingPrice: number
  tradeMode: string
  images: any[]
  sellerId: number
  sellerName: string
  publishStatus: string
  createdAt: string
}

// 纠纷仲裁相关类型
export interface AdminDispute {
  id: number
  disputeNo: string
  orderId: number
  afterSaleId: number
  buyerId: number
  sellerId: number
  currentStatus: string
  responsibility?: string
  resolutionResult?: string
  resolutionAmount?: number
  resolvedBy?: number
  resolvedAt?: string
  createdAt: string
  updatedAt: string
  actions: {
    id: number
    disputeId: number
    actionBy: number
    actionType: string
    actionDesc: string
    createdAt: string
  }[]
}

// 运营数据相关类型
export interface AdminStats {
  // 用户相关
  totalUsers: number
  activeUsers: number
  bannedUsers: number
  newUsersToday: number

  // 商品相关
  totalProducts: number
  onSaleProducts: number
  pendingReviewProducts: number
  soldProducts: number
  productViews: number

  // 订单相关
  totalOrders: number
  pendingPaymentOrders: number
  completedOrders: number
  cancelledOrders: number
  totalSales: number
  averageOrderAmount: number

  // 交易相关
  totalTransactions: number
  transactionAmount: number
  transactionSuccessRate: number
  disputeRate: number

  // 售后相关
  totalAfterSales: number
  pendingAfterSales: number

  // 趋势数据
  dailySales: number
  weeklySales: number[]
  monthlySales: number[]
  dailyOrders: number
  weeklyOrders: number[]
}

// 管理员操作日志相关类型
export interface AdminLog {
  id: number
  adminId: number
  adminName?: string
  targetType: 'user' | 'post' | 'comment' | 'tag' | 'product' | 'dispute' | 'order' | 'other'
  targetId?: number
  action: string
  reason?: string
  beforeData?: any
  afterData?: any
  ipAddress?: string
  createdAt: string
}


export const useAdminStore = defineStore('admin', () => {
  // 用户管理
  const users = ref<AdminUser[]>([])
  const currentUserPage = ref(1)
  const userPageSize = ref(10)
  const totalUsers = ref(0)
  const userLoading = ref(false)

  // 商品审核
  const products = ref<AdminProduct[]>([])
  const currentProductPage = ref(1)
  const productPageSize = ref(10)
  const totalProducts = ref(0)
  const productLoading = ref(false)
  const selectedProduct = ref<any>(null)
  const productDetailLoading = ref(false)

  // 纠纷仲裁
  const disputes = ref<AdminDispute[]>([])
  const currentDisputePage = ref(1)
  const disputePageSize = ref(10)
  const totalDisputes = ref(0)
  const disputeLoading = ref(false)
  const selectedDispute = ref<any>(null)
  const disputeDetailLoading = ref(false)

  // 运营数据
  const stats = ref<AdminStats>({
    // 用户相关
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    newUsersToday: 0,

    // 商品相关
    totalProducts: 0,
    onSaleProducts: 0,
    pendingReviewProducts: 0,
    soldProducts: 0,
    productViews: 0,

    // 订单相关
    totalOrders: 0,
    pendingPaymentOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalSales: 0,
    averageOrderAmount: 0,

    // 交易相关
    totalTransactions: 0,
    transactionAmount: 0,
    transactionSuccessRate: 0,
    disputeRate: 0,

    // 售后相关
    totalAfterSales: 0,
    pendingAfterSales: 0,

    // 趋势数据
    dailySales: 0,
    weeklySales: [0, 0, 0, 0, 0, 0, 0],
    monthlySales: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    dailyOrders: 0,
    weeklyOrders: [0, 0, 0, 0, 0, 0, 0]
  })
  const statsLoading = ref(false)

  // 操作日志管理
  const adminLogs = ref<AdminLog[]>([])
  const logsLoading = ref(false)
  const currentLogPage = ref(1)
  const logPageSize = ref(10)
  const totalLogs = ref(0)
  const selectedLog = ref<any>(null)
  const logDetailVisible = ref(false)
  const logDetailLoading = ref(false)

  // 系统通知管理
  const notifications = ref<SystemNoticeVO[]>([])
  const notificationLoading = ref(false)
  const currentNotificationPage = ref(1)
  const notificationPageSize = ref(10)
  const totalNotifications = ref(0)
  const selectedNotification = ref<SystemNoticeVO | null>(null)
  const notificationDetailVisible = ref(false)
  const notificationDetailLoading = ref(false)


  // 模拟数据
  const loadMockData = () => {
    // 使用真实用户数据
    users.value = [
      { id: 1, username: 'admin', nickname: 'admin', phone: '13800000000', email: 'admin@example.com', userStatus: 'banned', lastLoginAt: '2026-04-23T14:19:55', registeredAt: '2026-04-15T14:43:00', avatar: null, isAdmin: true, canBuy: true, canSell: true },
      { id: 10001, username: '张三', nickname: '张三', phone: '13800000001', email: 'zhangsan@example.com', userStatus: 'active', lastLoginAt: '2026-04-20T06:11:48', registeredAt: '2026-04-15T14:43:00', avatar: null, isAdmin: false, canBuy: true, canSell: true },
      { id: 10002, username: '李四', nickname: '李四', phone: '13800000002', email: 'lisi@example.com', userStatus: 'active', lastLoginAt: '', registeredAt: '2026-04-15T14:43:00', avatar: null, isAdmin: false, canBuy: true, canSell: true },
      { id: 10003, username: '王五', nickname: '王五', phone: '13800000003', email: 'wangwu@example.com', userStatus: 'active', lastLoginAt: '', registeredAt: '2026-04-15T14:43:00', avatar: null, isAdmin: false, canBuy: true, canSell: true },
      { id: 10004, username: '赵六', nickname: '赵六', phone: '13800000004', email: 'zhaoliu@example.com', userStatus: 'active', lastLoginAt: '', registeredAt: '2026-04-15T14:43:00', avatar: null, isAdmin: false, canBuy: true, canSell: true },
      { id: 10005, username: '小明', nickname: '小明', phone: '13800000005', email: 'xiaoming@example.com', userStatus: 'active', lastLoginAt: '', registeredAt: '2026-04-15T14:43:00', avatar: null, isAdmin: false, canBuy: true, canSell: true },
      { id: 10006, username: '小红', nickname: '小红', phone: '13800000006', email: 'xiaohong@example.com', userStatus: 'banned', lastLoginAt: '', registeredAt: '2026-04-15T14:43:00', avatar: null, isAdmin: false, canBuy: true, canSell: true },
      { id: 10007, username: '大刘', nickname: '大刘', phone: '13800000007', email: 'daliu@example.com', userStatus: 'active', lastLoginAt: '', registeredAt: '2026-04-15T14:43:00', avatar: null, isAdmin: false, canBuy: true, canSell: true },
      { id: 10008, username: '小陈', nickname: '小陈', phone: '13800000008', email: 'xiaochen@example.com', userStatus: 'active', lastLoginAt: '', registeredAt: '2026-04-15T14:43:00', avatar: null, isAdmin: false, canBuy: true, canSell: true },
      { id: 900001, username: 'seed_seller_1', nickname: '测试卖家1', phone: '13990000001', email: 'seed_seller_1@example.com', userStatus: 'active', lastLoginAt: '', registeredAt: '2026-04-15T14:43:03', avatar: null, isAdmin: false, canBuy: true, canSell: true },
      { id: 900002, username: 'seed_seller_2', nickname: '测试卖家2', phone: '13990000002', email: 'seed_seller_2@example.com', userStatus: 'active', lastLoginAt: '', registeredAt: '2026-04-15T14:43:03', avatar: null, isAdmin: false, canBuy: true, canSell: true }
    ]
    totalUsers.value = users.value.length

    // 模拟商品数据
    products.value = [
      {
        id: 1,
        title: 'iPhone 13 Pro',
        subtitle: '9成新，无划痕',
        description: '去年购买的iPhone 13 Pro，使用一年，无划痕，功能正常',
        brand: 'Apple',
        model: 'iPhone 13 Pro',
        conditionLevel: 'almost_new',
        originalPrice: 7999,
        sellingPrice: 5999,
        tradeMode: 'both',
        images: [{ imageUrl: 'product/900001/554de4bf-8bf7-4da3-9dd1-54b957e9930f.gif' }],
        sellerId: 1,
        sellerName: '测试用户1',
        publishStatus: 'pending_review',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'MacBook Air M2',
        subtitle: '全新未拆封',
        description: '全新MacBook Air M2，未拆封，低价出售',
        brand: 'Apple',
        model: 'MacBook Air M2',
        conditionLevel: 'new',
        originalPrice: 9999,
        sellingPrice: 8999,
        tradeMode: 'shipping',
        images: [{ imageUrl: 'product/900002/abc123def-4567-8901-2345-67890abcdef1.jpg' }],
        sellerId: 10001,
        sellerName: '张三',
        publishStatus: 'on_sale',
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        title: 'iPad Pro 12.9',
        subtitle: '8成新，轻微划痕',
        description: 'iPad Pro 12.9英寸，使用痕迹明显，功能完好',
        brand: 'Apple',
        model: 'iPad Pro',
        conditionLevel: 'good',
        originalPrice: 7999,
        sellingPrice: 5299,
        tradeMode: 'both',
        images: [{ imageUrl: 'product/900003/abc987def-6543-2109-8765-43210cba987.jpg' }],
        sellerId: 10002,
        sellerName: '李四',
        publishStatus: 'draft',
        createdAt: new Date().toISOString()
      }
    ]
    totalProducts.value = 3

    // 模拟纠纷数据
    disputes.value = [
      {
        id: 1,
        disputeNo: 'DP202405200001',
        orderId: 940009,
        afterSaleId: 1,
        buyerId: 900001,
        sellerId: 900002,
        currentStatus: 'pending',
        responsibility: undefined,
        resolutionResult: undefined,
        resolutionAmount: undefined,
        resolvedBy: undefined,
        resolvedAt: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        actions: [
          {
            id: 1,
            disputeId: 1,
            actionBy: 900001,
            actionType: 'submit',
            actionDesc: '双方对退款金额存在争议，申请平台介入。',
            createdAt: new Date().toISOString()
          }
        ]
      },
      {
        id: 2,
        disputeNo: 'DP202405200002',
        orderId: 940010,
        afterSaleId: 2,
        buyerId: 900003,
        sellerId: 900004,
        currentStatus: 'processing',
        responsibility: undefined,
        resolutionResult: undefined,
        resolutionAmount: undefined,
        resolvedBy: undefined,
        resolvedAt: undefined,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        actions: [
          {
            id: 2,
            disputeId: 2,
            actionBy: 900003,
            actionType: 'submit',
            actionDesc: '商品有质量问题，申请平台介入处理。',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 3,
            disputeId: 2,
            actionBy: 1,
            actionType: 'status_change',
            actionDesc: '管理员已受理，正在核实相关证据',
            createdAt: new Date().toISOString()
          }
        ]
      }
    ]
    totalDisputes.value = 2

    // 基于SQL数据的模拟运营数据
    stats.value = {
      // 用户相关
      totalUsers: 12,
      activeUsers: 11,
      bannedUsers: 1,
      newUsersToday: 0,

      // 商品相关
      totalProducts: 3,
      onSaleProducts: 3,
      pendingReviewProducts: 0,
      soldProducts: 0,
      productViews: 0,

      // 订单相关
      totalOrders: 9,
      pendingPaymentOrders: 4,
      completedOrders: 1,
      cancelledOrders: 4,
      totalSales: 3626,
      averageOrderAmount: 1813,

      // 交易相关
      totalTransactions: 2,
      transactionAmount: 3626,
      transactionSuccessRate: 100,
      disputeRate: 11.1,

      // 售后相关
      totalAfterSales: 2,
      pendingAfterSales: 0,

      // 趋势数据
      dailySales: 3626,
      weeklySales: [0, 0, 0, 0, 0, 3626, 0],
      monthlySales: [0, 0, 0, 3626, 0, 0, 0, 0, 0, 0, 0, 0],
      dailyOrders: 2,
      weeklyOrders: [0, 0, 0, 0, 0, 2, 0]
    }

    // 模拟操作日志数据
    adminLogs.value = [
      {
        id: 1,
        adminId: 900003,
        adminName: 'admin',
        targetType: 'product',
        targetId: 1,
        action: 'approve_product',
        reason: '商品信息完整，符合平台规范',
        beforeData: { publishStatus: 'pending_review' },
        afterData: { publishStatus: 'on_sale' },
        ipAddress: '192.168.1.1',
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
      },
      {
        id: 2,
        adminId: 900003,
        adminName: 'admin',
        targetType: 'user',
        targetId: 10006,
        action: 'ban_user',
        reason: '用户多次发布违规商品',
        beforeData: { userStatus: 'active' },
        afterData: { userStatus: 'banned' },
        ipAddress: '192.168.1.2',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: 3,
        adminId: 900003,
        adminName: 'admin',
        targetType: 'post',
        targetId: 2,
        action: 'reject_post',
        reason: '帖子内容涉嫌广告，不符合社区规范',
        beforeData: { status: 'pending' },
        afterData: { status: 'rejected' },
        ipAddress: '192.168.1.1',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: 4,
        adminId: 900003,
        adminName: 'admin',
        targetType: 'post',
        targetId: 4,
        action: 'feature_post',
        reason: '内容质量高，具有参考价值',
        beforeData: { isFeatured: false },
        afterData: { isFeatured: true },
        ipAddress: '192.168.1.3',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 5,
        adminId: 900003,
        adminName: 'admin',
        targetType: 'dispute',
        targetId: 2,
        action: 'resolve_dispute',
        reason: '根据平台规则进行裁决',
        beforeData: { currentStatus: 'processing' },
        afterData: { currentStatus: 'resolved', responsibility: 'seller', resolutionResult: 'partial_refund', resolutionAmount: 100 },
        ipAddress: '192.168.1.1',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 6,
        adminId: 900003,
        adminName: 'admin',
        targetType: 'post',
        targetId: 4,
        action: 'top_post',
        reason: '内容具有时效性，置顶展示',
        beforeData: { isTop: false },
        afterData: { isTop: true },
        ipAddress: '192.168.1.2',
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
      },
      {
        id: 7,
        adminId: 900003,
        adminName: 'admin',
        targetType: 'product',
        targetId: 3,
        action: 'reject_product',
        reason: '商品图片质量过低，不符合平台要求',
        beforeData: { publishStatus: 'pending_review' },
        afterData: { publishStatus: 'rejected' },
        ipAddress: '192.168.1.1',
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
      }
    ]
    totalLogs.value = 7
  }


  // 封禁/解封用户
  const banUser = async (userId: number, ban: boolean, reason?: string, notify?: boolean) => {
    try {
      const token = localStorage.getItem('token')
      const endpoint = ban ? `/api/admin/user/ban/${userId}` : `/api/admin/user/unban/${userId}`
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason, notify })
      })

      if (!response.ok) {
        throw new Error(`${ban ? '封禁' : '解封'}用户失败: ${response.status}`)
      }

      // 更新本地数据
      const user = users.value.find(u => u.id === userId)
      if (user) {
        user.userStatus = ban ? 'banned' : 'active'
      }

      return true
    } catch (error) {
      console.error(`${ban ? '封禁' : '解封'}用户失败:`, error)
      return false
    }
  }

  // 加载统计数据
  const loadStats = async () => {
    try {
      statsLoading.value = true
      const token = localStorage.getItem('token')

      const overviewResponse = await fetch('/api/admin/dashboard/overview', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!overviewResponse.ok) {
        throw new Error(`加载仪表盘概览数据失败: HTTP ${overviewResponse.status}`)
      }

      const overviewData = await overviewResponse.json()

      if (overviewData.code !== 200) {
        throw new Error(`加载仪表盘概览数据失败: ${overviewData.message || overviewData.code}`)
      }

      const trendsResponse = await fetch('/api/admin/dashboard/trends', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!trendsResponse.ok) {
        throw new Error(`加载趋势数据失败: HTTP ${trendsResponse.status}`)
      }

      const trendsData = await trendsResponse.json()

      if (trendsData.code !== 200) {
        throw new Error(`加载趋势数据失败: ${trendsData.message || trendsData.code}`)
      }

      if (overviewData.data) {
        stats.value = {
          totalUsers: overviewData.data.userStats?.totalUsers || 0,
          activeUsers: overviewData.data.userStats?.activeUsers || 0,
          bannedUsers: overviewData.data.userStats?.bannedUsers || 0,
          newUsersToday: overviewData.data.userStats?.newUsersToday || 0,
          totalProducts: overviewData.data.productStats?.totalProducts || 0,
          onSaleProducts: overviewData.data.productStats?.onSaleProducts || 0,
          pendingReviewProducts: overviewData.data.productStats?.pendingReviewProducts || 0,
          soldProducts: overviewData.data.productStats?.soldProducts || 0,
          productViews: overviewData.data.productStats?.productViews || 0,
          totalOrders: overviewData.data.orderStats?.totalOrders || 0,
          pendingPaymentOrders: overviewData.data.orderStats?.pendingPaymentOrders || 0,
          completedOrders: overviewData.data.orderStats?.completedOrders || 0,
          cancelledOrders: overviewData.data.orderStats?.cancelledOrders || 0,
          totalSales: overviewData.data.orderStats?.totalSales || 0,
          averageOrderAmount: overviewData.data.orderStats?.averageOrderAmount || 0,
          totalTransactions: overviewData.data.transactionStats?.totalTransactions || 0,
          transactionAmount: overviewData.data.transactionStats?.transactionAmount || 0,
          transactionSuccessRate: overviewData.data.transactionStats?.transactionSuccessRate || 0,
          disputeRate: overviewData.data.transactionStats?.disputeRate || 0,
          totalAfterSales: overviewData.data.afterSalesStats?.totalAfterSales || 0,
          pendingAfterSales: overviewData.data.afterSalesStats?.pendingAfterSales || 0,
          dailySales: overviewData.data.dailyStats?.dailySales || 0,
          weeklySales: trendsData.data?.weeklySales || [0, 0, 0, 0, 0, 0, 0],
          monthlySales: trendsData.data?.monthlySales || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          dailyOrders: overviewData.data.dailyStats?.dailyOrders || 0,
          weeklyOrders: trendsData.data?.weeklyOrders || [0, 0, 0, 0, 0, 0, 0]
        }
      }
    } catch (error) {
      console.error('加载仪表盘数据失败:', error)
      throw error
    } finally {
      statsLoading.value = false
    }
  }

  // 加载用户数据
  const loadUsers = async (params?: {
    isAdmin?: boolean
    canBuy?: boolean
    canSell?: boolean
    status?: string
    keyword?: string
    searchFields?: string[]
    page?: number
    pageSize?: number
  }) => {
    try {
      userLoading.value = true
      const token = localStorage.getItem('token')

      const queryParams = new URLSearchParams()
      if (params) {
        if (params.isAdmin !== undefined) queryParams.append('isAdmin', params.isAdmin.toString())
        if (params.canBuy !== undefined) queryParams.append('canBuy', params.canBuy.toString())
        if (params.canSell !== undefined) queryParams.append('canSell', params.canSell.toString())
        if (params.status) queryParams.append('status', params.status)
        if (params.keyword) queryParams.append('keyword', params.keyword)
        if (params.searchFields && params.searchFields.length > 0) {
          params.searchFields.forEach(field => queryParams.append('searchFields', field))
        }
        if (params.page) queryParams.append('page', params.page.toString())
        if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString())
      }

      const response = await fetch(`/api/admin/user/page${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`加载用户数据失败: HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(`加载用户数据失败: ${data.message || data.code}`)
      }

      if (data.data && data.data.list) {
        users.value = data.data.list || []
        totalUsers.value = data.data.total || 0
        currentUserPage.value = data.data.page || 1
        userPageSize.value = data.data.pageSize || 10
      } else if (data.data && data.data.records) {
        users.value = data.data.records || []
        totalUsers.value = data.data.total || 0
        currentUserPage.value = data.data.current || 1
        userPageSize.value = data.data.size || 10
      } else if (Array.isArray(data)) {
        users.value = data
        totalUsers.value = data.length
      } else if (data.data && Array.isArray(data.data)) {
        users.value = data.data
        totalUsers.value = data.data.length
      } else {
        console.error('无法识别的数据结构:', data)
        users.value = []
        totalUsers.value = 0
      }
    } catch (error) {
      console.error('加载用户数据失败:', error)
      loadMockData()
    } finally {
      userLoading.value = false
    }
  }

  // 加载商品数据
  const loadProducts = async (params?: {
    publishStatus?: string
    keyword?: string
    page?: number
    pageSize?: number
  }) => {
    try {
      productLoading.value = true
      const token = localStorage.getItem('token')

      const response = await fetch('/api/product/list', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current: params?.page || 1,
          size: params?.pageSize || 10,
          publishStatus: params?.publishStatus
        })
      })

      if (!response.ok) {
        throw new Error(`加载商品数据失败: HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(`加载商品数据失败: ${data.message || data.code}`)
      }

      if (data.data && data.data.records) {
        products.value = data.data.records || []
        totalProducts.value = data.data.total || 0
        currentProductPage.value = data.data.current || 1
        productPageSize.value = data.data.size || 10
      } else if (Array.isArray(data.data)) {
        products.value = data.data
        totalProducts.value = data.data.length
      }
    } catch (error) {
      console.error('加载商品数据失败:', error)
      throw error
    } finally {
      productLoading.value = false
    }
  }

  // 审核商品
  const auditProduct = async (productId: number, approved: boolean, rejectReason?: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/product/admin/audit/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approved,
          rejectReason
        })
      })

      if (!response.ok) {
        throw new Error(`审核商品失败: HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(`审核商品失败: ${data.message || data.code}`)
      }

      const product = products.value.find(p => p.id === productId)
      if (product) {
        product.publishStatus = approved ? 'on_sale' : 'off_shelf'
      }

      return true
    } catch (error) {
      console.error('审核商品失败:', error)
      return false
    }
  }

  // 加载商品详情
  const loadProductDetail = async (productId: number) => {
    try {
      productDetailLoading.value = true
      selectedProduct.value = null
      const token = localStorage.getItem('token')

      const response = await fetch(`/api/product/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`加载商品详情失败: HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(`加载商品详情失败: ${data.message || data.code}`)
      }

      selectedProduct.value = data.data
      return data.data
    } catch (error) {
      console.error('加载商品详情失败:', error)
      throw error
    } finally {
      productDetailLoading.value = false
    }
  }

  // 加载纠纷列表
  const loadDisputes = async (params?: {
    orderId?: number
    status?: string
    page?: number
    pageSize?: number
  }) => {
    try {
      disputeLoading.value = true
      const token = localStorage.getItem('token')

      // 构建查询参数
      const queryParams = new URLSearchParams()
      if (params?.orderId !== undefined) queryParams.append('orderId', params.orderId.toString())
      if (params?.status) queryParams.append('status', params.status)
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())

      const url = `/api/disputes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`加载纠纷列表失败: HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(`加载纠纷列表失败: ${data.message || data.code}`)
      }

      if (Array.isArray(data.data)) {
        disputes.value = data.data
        totalDisputes.value = data.data.length
      } else {
        // 处理分页数据
        if (data.data?.records) {
          disputes.value = data.data.records
          totalDisputes.value = data.data.total || data.data.records.length
        } else {
          disputes.value = []
          totalDisputes.value = 0
        }
      }
    } catch (error) {
      console.error('加载纠纷列表失败:', error)
      throw error
    } finally {
      disputeLoading.value = false
    }
  }

  // 加载纠纷详情
  const loadDisputeDetail = async (disputeId: number) => {
    try {
      disputeDetailLoading.value = true
      selectedDispute.value = null
      const token = localStorage.getItem('token')

      const response = await fetch(`/api/disputes/${disputeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`加载纠纷详情失败: HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(`加载纠纷详情失败: ${data.message || data.code}`)
      }

      selectedDispute.value = data.data
      return data.data
    } catch (error) {
      console.error('加载纠纷详情失败:', error)
      throw error
    } finally {
      disputeDetailLoading.value = false
    }
  }

  // 纠纷裁决
  const resolveDispute = async (disputeId: number, params: {
    responsibility?: string
    resolutionResult?: string
    resolutionAmount?: number
  }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/disputes/${disputeId}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        throw new Error(`纠纷裁决失败: HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(`纠纷裁决失败: ${data.message || data.code}`)
      }

      // 更新本地数据
      const dispute = disputes.value.find(d => d.id === disputeId)
      if (dispute) {
        dispute.status = 'resolved'
      }

      return true
    } catch (error) {
      console.error('纠纷裁决失败:', error)
      return false
    }
  }

  // 添加纠纷操作
  const addDisputeAction = async (disputeId: number, params: {
    actionType: string
    actionDesc: string
    nextStatus?: string
  }) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/disputes/${disputeId}/actions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })

      if (!response.ok) {
        throw new Error(`添加纠纷操作失败: HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.code !== 200) {
        throw new Error(`添加纠纷操作失败: ${data.message || data.code}`)
      }

      return true
    } catch (error) {
      console.error('添加纠纷操作失败:', error)
      return false
    }
  }

// 加载操作日志列表
const loadAdminLogs = async (params?: {
  page?: number
  size?: number
  adminId?: number
  targetType?: string
  action?: string
  startTime?: string
  endTime?: string
}) => {
  try {
    logsLoading.value = true
    const token = localStorage.getItem('token')
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('pageNum', params.page.toString())
    if (params?.size) queryParams.append('pageSize', params.size.toString())
    if (params?.adminId) queryParams.append('adminId', params.adminId.toString())
    if (params?.targetType) queryParams.append('targetType', params.targetType)
    if (params?.action) queryParams.append('action', params.action)
    if (params?.startTime) queryParams.append('startTime', params.startTime)
    if (params?.endTime) queryParams.append('endTime', params.endTime)

    const response = await fetch(`/api/admin/log/list?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`加载操作日志失败: HTTP ${response.status}`)
    }

    const data = await response.json()

    if (data.code !== 200) {
      throw new Error(`加载操作日志失败: ${data.message || data.code}`)
    }

    if (data.data?.list) {
      adminLogs.value = data.data.list
      totalLogs.value = data.data.total || data.data.list.length
    }

    return true
  } catch (error) {
    console.error('加载操作日志失败:', error)
    return false
  } finally {
    logsLoading.value = false
  }
}

// 加载日志详情
const loadLogDetail = async (logId: number) => {
  try {
    logDetailLoading.value = true
    selectedLog.value = null
    const token = localStorage.getItem('token')

    const response = await fetch(`/api/admin/log/${logId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`加载日志详情失败: HTTP ${response.status}`)
    }

    const data = await response.json()

    if (data.code !== 200) {
      throw new Error(`加载日志详情失败: ${data.message || data.code}`)
    }

    selectedLog.value = data.data
    return data.data
  } catch (error) {
    console.error('加载日志详情失败:', error)
    throw error
  } finally {
    logDetailLoading.value = false
  }
}

  // 加载通知列表
  const loadNotifications = async (params?: NoticeQueryDTO) => {
    try {
      notificationLoading.value = true
      const queryParams = {
        pageNum: params?.pageNum || currentNotificationPage.value,
        pageSize: params?.pageSize || notificationPageSize.value,
        noticeType: params?.noticeType || undefined,
        publishStatus: params?.publishStatus || undefined
      }
      console.log('[adminStore] loadNotifications 请求参数:', queryParams)
      const data = await getNoticeListApi(queryParams)
      console.log('[adminStore] loadNotifications 返回数据:', data)
      notifications.value = data || []
      totalNotifications.value = data?.length || 0
      if (params?.pageNum) currentNotificationPage.value = params.pageNum
    } catch (error) {
      console.error('加载通知列表失败:', error)
      notifications.value = []
      totalNotifications.value = 0
      throw error
    } finally {
      notificationLoading.value = false
    }
  }

  // 发布通知
  const publishNotice = async (params: PublishNoticeDTO) => {
    try {
      await publishNoticeApi(params)
      await loadNotifications()
      return true
    } catch (error) {
      console.error('发布通知失败:', error)
      return false
    }
  }

  // 撤回通知
  const revokeNotice = async (noticeId: number) => {
    try {
      await revokeNoticeApi(noticeId)
      // 更新本地数据
      const notice = notifications.value.find(n => n.id === noticeId)
      if (notice) {
        notice.publishStatus = 'revoked' as PublishStatus
      }
      return true
    } catch (error) {
      console.error('撤回通知失败:', error)
      return false
    }
  }

  // 加载通知详情
  const loadNotificationDetail = async (noticeId: number) => {
    try {
      notificationDetailLoading.value = true
      selectedNotification.value = null
      const data = await getNoticeDetailApi(noticeId)
      selectedNotification.value = data
      return data
    } catch (error) {
      console.error('加载通知详情失败:', error)
      throw error
    } finally {
      notificationDetailLoading.value = false
    }
  }

  return {
    // 用户管理
    users,
    currentUserPage,
    userPageSize,
    totalUsers,
    userLoading,

    // 商品审核
    products,
    currentProductPage,
    productPageSize,
    totalProducts,
    productLoading,
    selectedProduct,
    productDetailLoading,

    // 纠纷仲裁
    disputes,
    currentDisputePage,
    disputePageSize,
    totalDisputes,
    disputeLoading,
    selectedDispute,
    disputeDetailLoading,

    // 运营数据
    stats,
    statsLoading,

    // 操作日志管理
    adminLogs,
    logsLoading,
    currentLogPage,
    logPageSize,
    totalLogs,
    selectedLog,
    logDetailVisible,
    logDetailLoading,

    // 系统通知管理
    notifications,
    notificationLoading,
    currentNotificationPage,
    notificationPageSize,
    totalNotifications,
    selectedNotification,
    notificationDetailVisible,
    notificationDetailLoading,

    // 方法
    loadMockData,
    banUser,
    loadStats,
    loadUsers,
    loadProducts,
    auditProduct,
    loadProductDetail,
    loadDisputes,
    loadDisputeDetail,
    resolveDispute,
    addDisputeAction,
    loadAdminLogs,
    loadLogDetail,
    loadNotifications,
    publishNotice,
    revokeNotice,
    loadNotificationDetail
  }
})
