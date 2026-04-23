import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
  images: string[]
  sellerId: number
  sellerName: string
  publishStatus: string
  createdAt: string
}

// 纠纷仲裁相关类型
export interface AdminDispute {
  id: number
  orderId: number
  buyerId: number
  buyerName: string
  sellerId: number
  sellerName: string
  disputeReason: string
  disputeStatus: string
  createdAt: string
  updatedAt: string
}

// 运营数据相关类型
export interface AdminStats {
  // 用户相关
  totalUsers: number // 总用户数
  activeUsers: number // 活跃用户数
  bannedUsers: number // 封禁用户数
  newUsersToday: number // 今日新用户
  
  // 商品相关
  totalProducts: number // 总商品数
  onSaleProducts: number // 上架商品数
  pendingReviewProducts: number // 待审核商品数
  soldProducts: number // 已售出商品数
  productViews: number // 商品总浏览量
  
  // 订单相关
  totalOrders: number // 总订单数
  pendingPaymentOrders: number // 待支付订单数
  completedOrders: number // 已完成订单数
  cancelledOrders: number // 已取消订单数
  totalSales: number // 总销售额
  averageOrderAmount: number // 平均订单金额
  
  // 交易相关
  totalTransactions: number // 总成交量
  transactionAmount: number // 成交金额
  transactionSuccessRate: number // 交易成功率
  disputeRate: number // 纠纷率
  
  // 社区相关
  totalForumPosts: number // 总帖子数
  approvedForumPosts: number // 已审核帖子数
  pendingForumPosts: number // 待审核帖子数
  forumPostViews: number // 帖子总浏览量
  totalComments: number // 总评论数
  totalLikes: number // 总点赞数
  
  // 售后相关
  totalAfterSales: number // 售后申请数
  pendingAfterSales: number // 待处理售后数
  
  // 趋势数据
  dailySales: number // 今日销售额
  weeklySales: number[] // 周销售额
  monthlySales: number[] // 月销售额
  dailyOrders: number // 今日订单数
  weeklyOrders: number[] // 周订单数
}

// 论坛板块相关类型
export interface AdminForumSection {
  id: number
  name: string
  description: string
  sortOrder: number
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

// 系统通知相关类型
export interface AdminNotification {
  id: number
  title: string
  content: string
  targetUsers: string
  publishTime: string
  status: string
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

  // 纠纷仲裁
  const disputes = ref<AdminDispute[]>([])
  const currentDisputePage = ref(1)
  const disputePageSize = ref(10)
  const totalDisputes = ref(0)
  const disputeLoading = ref(false)

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
    
    // 社区相关
    totalForumPosts: 0,
    approvedForumPosts: 0,
    pendingForumPosts: 0,
    forumPostViews: 0,
    totalComments: 0,
    totalLikes: 0,
    
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

  // 论坛管理
  const forumSections = ref<AdminForumSection[]>([])
  const forumPosts = ref<any[]>([])
  const forumLoading = ref(false)

  // 系统通知
  const notifications = ref<AdminNotification[]>([])
  const notificationLoading = ref(false)

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
        images: ['https://picsum.photos/seed/iphone13/640/480'],
        sellerId: 1,
        sellerName: '测试用户1',
        publishStatus: 'pending',
        createdAt: new Date().toISOString()
      }
    ]
    totalProducts.value = 1

    // 模拟纠纷数据
    disputes.value = [
      {
        id: 1,
        orderId: 1001,
        buyerId: 1,
        buyerName: '测试用户1',
        sellerId: 2,
        sellerName: '测试用户2',
        disputeReason: '商品与描述不符',
        disputeStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    totalDisputes.value = 1

    // 基于SQL数据的模拟运营数据
    stats.value = {
      // 用户相关
      totalUsers: 12, // 从user_account表计算
      activeUsers: 11, // 从user_account表计算
      bannedUsers: 1, // 从user_account表计算
      newUsersToday: 0,
      
      // 商品相关
      totalProducts: 3, // 从product表计算
      onSaleProducts: 3, // 从product表计算
      pendingReviewProducts: 0, // 从product表计算
      soldProducts: 0, // 从product表计算
      productViews: 0, // 从product表计算
      
      // 订单相关
      totalOrders: 9, // 从trade_order表计算
      pendingPaymentOrders: 4, // 从trade_order表计算
      completedOrders: 1, // 从trade_order表计算
      cancelledOrders: 4, // 从trade_order表计算
      totalSales: 3626, // 从payment_order表计算
      averageOrderAmount: 1813, // 从payment_order表计算
      
      // 交易相关
      totalTransactions: 2, // 从payment_transaction表计算
      transactionAmount: 3626, // 从payment_transaction表计算
      transactionSuccessRate: 100, // 从payment_transaction表计算
      disputeRate: 11.1, // 从dispute_case表计算
      
      // 社区相关
      totalForumPosts: 10, // 从forum_post表计算
      approvedForumPosts: 9, // 从forum_post表计算
      pendingForumPosts: 1, // 从forum_post表计算
      forumPostViews: 12170, // 从forum_post表计算
      totalComments: 15, // 从forum_comment表计算
      totalLikes: 14, // 从forum_reaction表计算
      
      // 售后相关
      totalAfterSales: 2, // 从after_sale_request表计算
      pendingAfterSales: 0, // 从after_sale_request表计算
      
      // 趋势数据
      dailySales: 3626, // 从payment_order表计算
      weeklySales: [0, 0, 0, 0, 0, 3626, 0], // 模拟一周数据
      monthlySales: [0, 0, 0, 3626, 0, 0, 0, 0, 0, 0, 0, 0], // 模拟一月数据
      dailyOrders: 2, // 从payment_order表计算
      weeklyOrders: [0, 0, 0, 0, 0, 2, 0] // 模拟一周数据
    }

    // 模拟论坛板块数据
    forumSections.value = [
      {
        id: 1,
        name: '二手交易',
        description: '买卖二手商品的板块',
        sortOrder: 1,
        isEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        name: '验机交流',
        description: '讨论验机技巧和经验',
        sortOrder: 2,
        isEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 3,
        name: '避坑指南',
        description: '分享交易避坑经验',
        sortOrder: 3,
        isEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    // 模拟系统通知数据
    notifications.value = [
      {
        id: 1,
        title: '平台规则更新',
        content: '平台将于下周更新交易规则，请各位用户注意查看',
        targetUsers: 'all',
        publishTime: new Date().toISOString(),
        status: 'published'
      }
    ]

    // 模拟论坛帖子数据
    forumPosts.value = [
      {
        id: 1,
        title: '如何鉴别二手手机的好坏',
        authorId: 1,
        sectionId: 2,
        status: 'approved',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: '出售iPhone 12 Pro',
        authorId: 2,
        sectionId: 1,
        status: 'approved',
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        title: '分享我的验机经验',
        authorId: 1,
        sectionId: 2,
        status: 'approved',
        createdAt: new Date().toISOString()
      },
      {
        id: 4,
        title: '警惕二手交易骗局',
        authorId: 3,
        sectionId: 3,
        status: 'approved',
        createdAt: new Date().toISOString()
      }
    ]
  }

  // 初始化加载数据
  loadMockData()

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

    // 纠纷仲裁
    disputes,
    currentDisputePage,
    disputePageSize,
    totalDisputes,
    disputeLoading,

    // 运营数据
    stats,
    statsLoading,

    // 论坛管理
  forumSections,
  forumPosts,
  forumLoading,

    // 系统通知
    notifications,
    notificationLoading,

    // 封禁/解封用户
  async banUser(userId: number, ban: boolean, reason?: string, notify?: boolean) {
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
  },

  // 方法
  loadMockData,
  loadStats: loadMockData,
  loadUsers: loadMockData,
  loadProducts: loadMockData,
  loadDisputes: loadMockData,
  loadForumSections: loadMockData,
  loadForumPosts: loadMockData,
  loadNotifications: loadMockData
  }
})
