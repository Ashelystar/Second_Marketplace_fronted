<template>
  <div class="dashboard-content">
    <div class="section-header">
      <h2>数据概览</h2>
      <p class="section-description">平台运营核心数据统计</p>
    </div>
    
    <!-- 错误状态显示 -->
    <div v-if="apiError && !isDev" class="error-container">
      <ElResult
        icon="warning"
        title="数据加载失败"
        sub-title="无法连接到服务器，请稍后重试"
      >
        <template #extra>
          <ElButton type="primary" @click="reloadData">重新加载</ElButton>
        </template>
      </ElResult>
    </div>

    <!-- 数据展示区域 -->
    <div v-else>
      <!-- 核心指标卡片 -->
      <ElRow :gutter="20" class="mb-4">
        <ElCol :span="6">
          <ElCard shadow="hover">
            <template #header>
              <div class="card-header">
                <span>用户数据</span>
              </div>
            </template>
            <ElRow>
              <ElCol :span="12">
                <ElStatistic 
                  :value="adminStore.stats.totalUsers" 
                  title="总用户数" 
                />
              </ElCol>
              <ElCol :span="12">
                <ElStatistic 
                  :value="adminStore.stats.activeUsers" 
                  title="活跃用户" 
                />
              </ElCol>
            </ElRow>
            <div class="mt-4">
              <div class="flex justify-between mb-1">
                <span>活跃率</span>
                <span>{{ Math.round((adminStore.stats.activeUsers / adminStore.stats.totalUsers) * 100) }}%</span>
              </div>
              <ElProgress 
                :percentage="Math.round((adminStore.stats.activeUsers / adminStore.stats.totalUsers) * 100)" 
                :stroke-width="10" 
                status="success" 
              />
            </div>
          </ElCard>
        </ElCol>
        <ElCol :span="6">
          <ElCard shadow="hover">
            <template #header>
              <div class="card-header">
                <span>商品数据</span>
              </div>
            </template>
            <ElRow>
              <ElCol :span="12">
                <ElStatistic 
                  :value="adminStore.stats.totalProducts" 
                  title="总商品数" 
                />
              </ElCol>
              <ElCol :span="12">
                <ElStatistic 
                  :value="adminStore.stats.onSaleProducts" 
                  title="上架商品" 
                />
              </ElCol>
            </ElRow>
            <div class="mt-4">
              <div class="flex justify-between mb-1">
                <span>上架率</span>
                <span>{{ Math.round((adminStore.stats.onSaleProducts / adminStore.stats.totalProducts) * 100) }}%</span>
              </div>
              <ElProgress 
                :percentage="Math.round((adminStore.stats.onSaleProducts / adminStore.stats.totalProducts) * 100)" 
                :stroke-width="10" 
                status="success" 
              />
            </div>
          </ElCard>
        </ElCol>
        <ElCol :span="6">
          <ElCard shadow="hover">
            <template #header>
              <div class="card-header">
                <span>订单数据</span>
              </div>
            </template>
            <ElRow>
              <ElCol :span="12">
                <ElStatistic 
                  :value="adminStore.stats.totalOrders" 
                  title="总订单数" 
                />
              </ElCol>
              <ElCol :span="12">
                <ElStatistic 
                  :value="adminStore.stats.dailyOrders" 
                  title="今日订单" 
                />
              </ElCol>
            </ElRow>
            <div class="mt-4">
              <div class="flex justify-between mb-1">
                <span>完成率</span>
                <span>{{ Math.round((adminStore.stats.completedOrders / adminStore.stats.totalOrders) * 100) }}%</span>
              </div>
              <ElProgress 
                :percentage="Math.round((adminStore.stats.completedOrders / adminStore.stats.totalOrders) * 100)" 
                :stroke-width="10" 
                status="warning" 
              />
            </div>
          </ElCard>
        </ElCol>
        <ElCol :span="6">
          <ElCard shadow="hover">
            <template #header>
              <div class="card-header">
                <span>销售数据</span>
              </div>
            </template>
            <ElRow>
              <ElCol :span="12">
                <ElStatistic 
                  :value="adminStore.stats.totalSales" 
                  title="总销售额" 
                  prefix="¥" 
                />
              </ElCol>
              <ElCol :span="12">
                <ElStatistic 
                  :value="adminStore.stats.dailySales" 
                  title="今日销售" 
                  prefix="¥" 
                />
              </ElCol>
            </ElRow>
            <div class="mt-4">
              <div class="flex justify-between mb-1">
                <span>今日占比</span>
                <span>{{ Math.round((adminStore.stats.dailySales / adminStore.stats.totalSales) * 100) }}%</span>
              </div>
              <ElProgress 
                :percentage="Math.min(100, Math.round((adminStore.stats.dailySales / adminStore.stats.totalSales) * 100))" 
                :stroke-width="10" 
                status="success" 
              />
            </div>
          </ElCard>
        </ElCol>
      </ElRow>

      <!-- 交易与售后数据 -->
      <ElRow :gutter="20" class="mb-4">
        <ElCol :span="12">
          <ElCard shadow="hover">
            <template #header>
              <div class="card-header">
                <span>交易数据</span>
              </div>
            </template>
            <ElRow>
              <ElCol :span="12">
                <ElStatistic 
                  :value="adminStore.stats.totalTransactions" 
                  title="总成交量" 
                />
              </ElCol>
              <ElCol :span="12">
                <ElStatistic 
                  :value="adminStore.stats.transactionSuccessRate" 
                  title="成功率" 
                  suffix="%" 
                />
              </ElCol>
            </ElRow>
            <div class="mt-4">
              <div class="flex justify-between mb-1">
                <span>纠纷率</span>
                <span>{{ adminStore.stats.disputeRate }}%</span>
              </div>
              <ElProgress 
                :percentage="Math.min(100, adminStore.stats.disputeRate)" 
                :stroke-width="10" 
                status="warning" 
              />
            </div>
          </ElCard>
        </ElCol>
        <ElCol :span="12">
          <ElCard shadow="hover">
            <template #header>
              <div class="card-header">
                <span>售后数据</span>
              </div>
            </template>
            <ElRow>
              <ElCol :span="12">
                <ElStatistic 
                  :value="adminStore.stats.totalAfterSales" 
                  title="售后申请" 
                />
              </ElCol>
              <ElCol :span="12">
                <ElStatistic 
                  :value="adminStore.stats.pendingAfterSales" 
                  title="待处理" 
                />
              </ElCol>
            </ElRow>
            <div class="mt-4">
              <div class="flex justify-between mb-1">
                <span>处理率</span>
                <span>{{ Math.round(((adminStore.stats.totalAfterSales - adminStore.stats.pendingAfterSales) / adminStore.stats.totalAfterSales) * 100) }}%</span>
              </div>
              <ElProgress 
                :percentage="Math.round(((adminStore.stats.totalAfterSales - adminStore.stats.pendingAfterSales) / adminStore.stats.totalAfterSales) * 100)" 
                :stroke-width="10" 
                status="success" 
              />
            </div>
          </ElCard>
        </ElCol>
      </ElRow>

      <!-- 趋势图表区域 -->
      <ElRow :gutter="20" class="mb-4">
        <ElCol :span="12">
          <ElCard shadow="hover">
            <template #header>
              <div class="card-header">
                <span>销售额趋势</span>
                <ElRadioGroup v-model="salesPeriod" size="small" @change="updateSalesChart">
                  <ElRadioButton value="weekly">本周</ElRadioButton>
                  <ElRadioButton value="monthly">本月</ElRadioButton>
                </ElRadioGroup>
              </div>
            </template>
            <div ref="salesChartRef" class="chart-container"></div>
          </ElCard>
        </ElCol>
        <ElCol :span="12">
          <ElCard shadow="hover">
            <template #header>
              <div class="card-header">
                <span>本周订单趋势</span>
              </div>
            </template>
            <div ref="ordersChartRef" class="chart-container"></div>
          </ElCard>
        </ElCol>
      </ElRow>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import * as echarts from 'echarts'
import { ElCard, ElRow, ElCol, ElStatistic, ElProgress, ElResult, ElButton, ElMessage, ElRadioGroup, ElRadioButton } from 'element-plus'

const adminStore = useAdminStore()

// 开发模式开关 - 默认false
const isDev = ref(false)

// API错误状态
const apiError = ref(false)

// 图表引用
const salesChartRef = ref<HTMLElement>()
const ordersChartRef = ref<HTMLElement>()

// 图表实例
let salesChart: echarts.ECharts | null = null
let ordersChart: echarts.ECharts | null = null

// 销售额图表显示周期
const salesPeriod = ref<'weekly' | 'monthly'>('weekly')

// 加载数据
const loadData = async () => {
  try {
    apiError.value = false
    if (isDev.value) {
      // 开发模式下直接使用模拟数据
      adminStore.loadMockData()
      console.log(`概览组件-开发模式`)
    } else {
      // 生产模式下请求真实API
      await adminStore.loadStats()
      console.log(`概览组件-生产环境`)
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    if (!isDev.value) {
      apiError.value = true
      ElMessage.error('数据加载失败，请检查网络连接')
    } else {
      // 开发模式下即使API失败也确保显示模拟数据
      adminStore.loadMockData()
    }
  }
}

// 重新加载数据
const reloadData = () => {
  loadData()
}

// 初始化销售额图表
const initSalesChart = () => {
  if (salesChartRef.value) {
    salesChart = echarts.init(salesChartRef.value)
    updateSalesChart()
  }
}

// 更新销售额图表
const updateSalesChart = () => {
  if (!salesChart) return
  
  let xAxisData: string[]
  let seriesData: number[]
  
  if (salesPeriod.value === 'weekly') {
    xAxisData = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    seriesData = adminStore.stats.weeklySales || []
  } else {
    xAxisData = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    seriesData = adminStore.stats.monthlySales || []
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        if (params && params[0]) {
          return `${params[0].name}: ¥${params[0].value.toFixed(2)}`
        }
        return ''
      }
    },
    xAxis: {
      type: 'category',
      data: xAxisData
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '¥{value}'
      }
    },
    series: [{
      data: seriesData,
      type: 'bar',
      itemStyle: {
        color: '#ff7f00'
      }
    }]
  }
  salesChart.setOption(option)
}

// 初始化订单图表
const initOrdersChart = () => {
  if (ordersChartRef.value) {
    ordersChart = echarts.init(ordersChartRef.value)
    const option = {
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}单'
      },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        data: adminStore.stats.weeklyOrders,
        type: 'line',
        smooth: true,
        itemStyle: {
          color: '#2196f3'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(33, 150, 243, 0.3)' },
            { offset: 1, color: 'rgba(33, 150, 243, 0.1)' }
          ])
        }
      }]
    }
    ordersChart.setOption(option)
  }
}

// 初始化所有图表
const initCharts = () => {
  nextTick(() => {
    initSalesChart()
    initOrdersChart()
  })
}

// 监听窗口 resize 事件
const handleResize = () => {
  salesChart?.resize()
  ordersChart?.resize()
}

// 监听apiError变化，当没有错误时重新初始化图表
watch(() => apiError.value, (newVal) => {
  if (!newVal) {
    initCharts()
  }
})

// 监听数据变化更新图表
watch(() => [adminStore.stats.weeklySales, adminStore.stats.monthlySales, adminStore.stats.weeklyOrders], () => {
  if (!apiError.value) {
    updateSalesChart()
    if (ordersChart) {
      initOrdersChart()
    }
  }
})

onMounted(() => {
  loadData()
  initCharts()
  window.addEventListener('resize', handleResize)
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 300px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mb-4 {
  margin-bottom: 16px;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.mt-4 {
  margin-top: 16px;
}

.mb-1 {
  margin-bottom: 4px;
}

.section-header {
  margin-bottom: 30px;
}

.section-header h2 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.section-description {
  margin: 0;
  color: #666;
  font-size: 1rem;
}
</style>
