# API 接入状态总览

本文档记录了二手交易平台前端项目与后端API的对接情况。

## ✅ 已完成接入的API模块

### 1. 订单主流程 (order.ts)

| API端点 | 方法 | 功能 | 状态 | 使用页面 |
|---------|------|------|------|----------|
| `/api/orders` | POST | 创建订单 | ✅ | Checkout.vue |
| `/api/orders` | GET | 订单列表 | ✅ | List.vue |
| `/api/orders/{orderId}` | GET | 订单详情 | ✅ | Detail.vue, Payment.vue |
| `/api/orders/{orderId}/cancel` | POST | 取消订单 | ✅ | List.vue, Detail.vue |
| `/api/orders/{orderId}/confirm-receipt` | POST | 确认收货 | ✅ | List.vue, Detail.vue |
| `/api/orders/{orderId}/status-logs` | GET | 订单状态日志 | ✅ | - |
| `/api/orders/{orderId}/remind-ship` | POST | 提醒发货 | ✅ | Detail.vue |

### 2. 支付流程 (order.ts)

| API端点 | 方法 | 功能 | 状态 | 使用页面 |
|---------|------|------|------|----------|
| `/api/orders/{orderId}/payments` | POST | 创建支付单 | ✅ | Payment.vue |
| `/api/orders/{orderId}/payments/{paymentId}` | GET | 支付单详情 | ✅ | - |
| `/api/payments/{paymentId}/pay` | POST | 发起支付 | ✅ | Payment.vue (待完善) |
| `/api/payments/callback` | POST | 第三方支付回调 | ✅ | 后端处理 |
| `/api/payments/{paymentId}/transactions` | GET | 支付流水 | ✅ | - |

### 3. 发货物流流程 (order.ts)

| API端点 | 方法 | 功能 | 状态 | 使用页面 |
|---------|------|------|------|----------|
| `/api/orders/{orderId}/shipments` | POST | 创建发货记录 | ✅ | 卖家功能(待实现) |
| `/api/orders/{orderId}/shipments/{shipmentId}` | GET | 发货详情 | ✅ | - |
| `/api/orders/{orderId}/shipments/{shipmentId}/traces` | POST | 新增物流轨迹 | ✅ | 卖家功能(待实现) |
| `/api/orders/{orderId}/shipments/{shipmentId}/traces` | GET | 查询物流轨迹 | ✅ | 物流页面(待实现) |
| `/api/orders/{orderId}/shipments/{shipmentId}/sign` | POST | 签收(邮寄) | ✅ | - |
| `/api/orders/{orderId}/shipments/{shipmentId}/pickup-verify` | POST | 自提核销 | ✅ | - |

### 4. 评价模块 (review.ts) ⭐ 新增

| API端点 | 方法 | 功能 | 状态 | 使用页面 |
|---------|------|------|------|----------|
| `/api/reviews` | POST | 提交订单评价 | ✅ | 评价页面(待实现) |
| `/api/reviews` | GET | 评价列表 | ✅ | 评价页面(待实现) |
| `/api/reviews/{reviewId}` | GET | 评价详情 | ✅ | 评价页面(待实现) |
| `/api/reviews/{reviewId}/images` | POST | 上传评价图片 | ✅ | 评价页面(待实现) |
| `/api/reviews/{reviewId}/reply` | POST | 卖家回复评价 | ✅ | 评价页面(待实现) |

### 5. 售后申请模块 (review.ts) ⭐ 新增

| API端点 | 方法 | 功能 | 状态 | 使用页面 |
|---------|------|------|------|----------|
| `/api/after-sales` | POST | 发起售后申请 | ✅ | 售后页面(待实现) |
| `/api/after-sales` | GET | 售后列表 | ✅ | 售后页面(待实现) |
| `/api/after-sales/{afterSaleId}` | GET | 售后详情 | ✅ | 售后页面(待实现) |
| `/api/after-sales/{afterSaleId}/evidences` | POST | 上传售后凭证 | ✅ | 售后页面(待实现) |
| `/api/after-sales/{afterSaleId}/seller-response` | POST | 卖家处理意见 | ✅ | 售后页面(待实现) |
| `/api/after-sales/{afterSaleId}/cancel` | POST | 买家取消申请 | ✅ | 售后页面(待实现) |
| `/api/after-sales/{afterSaleId}/admin-decision` | POST | 管理员裁决 | ✅ | 管理后台 |

### 6. 交易纠纷模块 (dispute.ts) ⭐ 新增

| API端点 | 方法 | 功能 | 状态 | 使用页面 |
|---------|------|------|------|----------|
| `/api/disputes` | POST | 创建纠纷 | ✅ | 纠纷页面(待实现) |
| `/api/disputes` | GET | 纠纷列表 | ✅ | 纠纷页面(待实现) |
| `/api/disputes/{disputeId}` | GET | 纠纷详情 | ✅ | 纠纷页面(待实现) |
| `/api/disputes/{disputeId}/actions` | POST | 记录动作日志 | ✅ | 纠纷页面(待实现) |
| `/api/disputes/{disputeId}/resolve` | POST | 纠纷裁决并结案 | ✅ | 管理后台 |

### 7. 资金账户模块 (wallet.ts) ⭐ 新增

| API端点 | 方法 | 功能 | 状态 | 使用页面 |
|---------|------|------|------|----------|
| `/api/wallet/account` | GET | 查询钱包账户 | ✅ | 钱包页面(待实现) |
| `/api/wallet/ledger` | GET | 查询钱包流水 | ✅ | 钱包页面(待实现) |
| `/api/wallet/manual-adjust` | POST | 管理员手工调账 | ✅ | 管理后台 |
| `/api/wallet/withdrawals` | POST | 发起提现申请 | ✅ | 提现页面(待实现) |
| `/api/wallet/withdrawals` | GET | 提现列表 | ✅ | 提现页面(待实现) |
| `/api/wallet/withdrawals/{withdrawalId}` | GET | 提现详情 | ✅ | 提现页面(待实现) |
| `/api/wallet/withdrawals/{withdrawalId}/approve` | POST | 审核通过 | ✅ | 管理后台 |
| `/api/wallet/withdrawals/{withdrawalId}/reject` | POST | 驳回提现 | ✅ | 管理后台 |
| `/api/wallet/withdrawals/{withdrawalId}/pay` | POST | 执行打款 | ✅ | 管理后台 |

## 📊 统计信息

### 已实现的API总数
- **订单主流程**: 7个接口
- **支付流程**: 5个接口
- **发货物流**: 6个接口
- **评价模块**: 5个接口 ⭐ 新增
- **售后申请**: 7个接口 ⭐ 新增
- **交易纠纷**: 5个接口 ⭐ 新增
- **资金账户**: 9个接口 ⭐ 新增

**总计: 44个API接口已全部接入！**

## 🎯 下一步工作建议

虽然API已经全部接入，但以下页面还需要开发：

### 高优先级
1. **物流轨迹页面** - 显示详细的物流信息
   - 使用 `getShipmentTraces()` API
   
2. **评价页面** - 对已完成订单进行评价
   - 使用 `createReview()`, `uploadReviewImage()` 等API
   
3. **售后申请页面** - 买家发起售后
   - 使用 `createAfterSale()`, `uploadEvidence()` 等API

### 中优先级
4. **钱包页面** - 查看余额和流水
   - 使用 `getWalletAccount()`, `getWalletLedger()` API
   
5. **提现页面** - 卖家申请提现
   - 使用 `createWithdrawal()`, `getWithdrawalList()` API

### 低优先级（管理后台）
6. **纠纷管理页面** - 管理员处理纠纷
   - 使用 `getDisputeList()`, `resolveDispute()` API
   
7. **提现审核页面** - 管理员审核提现
   - 使用 `approveWithdrawal()`, `rejectWithdrawal()` API

8. **手工调账页面** - 管理员调整钱包余额
   - 使用 `manualAdjust()` API

## 🔧 技术说明

### API文件组织
```
src/api/
├── order.ts      # 订单、支付、物流相关API
├── review.ts     # 评价、售后相关API (新增)
├── dispute.ts    # 纠纷相关API (新增)
├── wallet.ts     # 钱包相关API (新增)
├── goods.ts      # 商品相关API
├── user.ts       # 用户相关API
├── forum.ts      # 论坛相关API
└── chat.ts       # 聊天相关API
```

### 通用响应格式
所有API都遵循统一的响应格式：
```typescript
{
  code: 200,        // 业务状态码，200表示成功
  message: "success", // 响应说明
  data: {...}       // 业务数据
}
```

### 错误处理
- `400`: 参数错误/参数校验失败
- `401`: 未登录或token无效
- `403`: 无权限
- `404`: 资源不存在
- `500`: 业务异常

### 认证方式
除登录/注册等开放接口外，所有API都需要在请求头中添加：
```
Authorization: Bearer <token>
```

## 📝 注意事项

1. **订单状态流转**: 
   - `pending_payment` → `paid_pending_ship` → `shipped` → `delivered` → `completed`
   - 可能中途进入: `cancelled`, `refund_in_progress`, `closed`

2. **支付流程**:
   - 余额支付可以同步完成
   - 微信/支付宝需要等待第三方回调

3. **发货方式**:
   - `shipping`: 快递配送，需要物流公司和物流单号
   - `pickup`: 自提，需要自提码（可自动生成）

4. **售后类型**:
   - `return_refund`: 退货退款
   - `refund_only`: 仅退款
   - `exchange`: 换货
   - `complaint`: 投诉

5. **钱包业务类型**:
   - `order_income`: 订单入账
   - `refund_out`: 退款出账
   - `withdraw_freeze`: 提现冻结
   - `withdraw_success`: 提现成功
   - `withdraw_reject`: 提现驳回
   - `manual_adjust`: 手工调账

---

最后更新时间: 2026-06-09
