<template>
  <div class="mock-test-page">
    <el-card class="test-header">
      <h2>Mock 接口测试页面</h2>
      <p class="description">测试现有 Mock 接口的功能演示</p>
    </el-card>

    <!-- 微应用配置测试 -->
    <el-card class="test-section" shadow="hover">
      <template #header>
        <div class="card-header">
          <span><el-icon><Monitor /></el-icon> 微应用配置接口测试</span>
          <el-button type="primary" size="small" @click="loadMicroApps" :loading="loading">
            <el-icon><Refresh /></el-icon> 重新加载
          </el-button>
        </div>
      </template>

      <el-table :data="microApps" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="应用 ID" width="180" />
        <el-table-column prop="name" label="应用名称" width="150" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'online' ? 'success' : 'danger'">
              {{ row.status === 'online' ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="entry" label="入口地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="activeRule" label="激活规则" width="150" />
        <el-table-column prop="version" label="版本" width="100" />
        <el-table-column label="预加载" width="80">
          <template #default="{ row }">
            <el-tag :type="row.preload ? 'warning' : 'info'" size="small">
              {{ row.preload ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              size="small" 
              link
              @click="viewAppDetail(row)"
            >
              详情
            </el-button>
            <el-button 
              type="success" 
              size="small" 
              link
              @click="navigateToApp(row)"
            >
              访问
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 布局管理测试 -->
    <el-card class="test-section" shadow="hover">
      <template #header>
        <div class="card-header">
          <span><el-icon><Grid /></el-icon> 布局管理接口测试</span>
          <div>
            <el-button type="success" size="small" @click="saveLayout" :loading="saving">
              <el-icon><Download /></el-icon> 保存布局
            </el-button>
            <el-button type="warning" size="small" @click="loadLayout" :loading="loadingLayout">
              <el-icon><Upload /></el-icon> 加载布局
            </el-button>
            <el-button type="danger" size="small" @click="clearLayout">
              <el-icon><Delete /></el-icon> 清空布局
            </el-button>
          </div>
        </div>
      </template>

      <div class="layout-content">
        <el-descriptions title="当前布局配置" :column="2" border>
          <el-descriptions-item label="布局模式">
            <el-tag>{{ currentLayout?.layoutMode || '未设置' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="活动标签页">
            {{ currentLayout?.activeTabId || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="面板数量" :span="2">
            {{ currentLayout?.panels?.length || 0 }}
          </el-descriptions-item>
        </el-descriptions>

        <el-divider>布局面板详情</el-divider>

        <el-table 
          v-if="currentLayout?.panels && currentLayout.panels.length > 0"
          :data="currentLayout.panels" 
          stripe
          size="small"
        >
          <el-table-column prop="panelId" label="面板 ID" width="150" />
          <el-table-column prop="appId" label="应用 ID" width="180" />
          <el-table-column prop="name" label="名称" width="150" />
          <el-table-column prop="type" label="类型" width="100" />
          <el-table-column label="位置" width="150">
            <template #default="{ row }">
              ({{ row.x }}, {{ row.y }})
            </template>
          </el-table-column>
          <el-table-column label="尺寸" width="150">
            <template #default="{ row }">
              {{ row.w }} × {{ row.h }}
            </template>
          </el-table-column>
          <el-table-column prop="order" label="排序" width="80" />
        </el-table>
        <el-empty v-else description="暂无布局数据" />
      </div>
    </el-card>

    <!-- Mock 引擎状态 -->
    <el-card class="test-section" shadow="hover">
      <template #header>
        <span><el-icon><Setting /></el-icon> Mock 引擎状态</span>
      </template>

      <el-alert
        :title="isMockMode ? '当前处于 Mock 模式' : '当前处于 API 模式'"
        :type="isMockMode ? 'success' : 'info'"
        show-icon
        :closable="false"
        style="margin-bottom: 15px;"
      />

      <el-table :data="mockInterfaces" stripe size="small">
        <el-table-column prop="pattern" label="接口模式" min-width="200" />
        <el-table-column label="启用状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'danger'" size="small">
              {{ row.enabled ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="运行时覆盖" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.runtimeOverride !== undefined" :type="row.runtimeOverride ? 'warning' : 'info'" size="small">
              {{ row.runtimeOverride ? '强制 Mock' : '强制 API' }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 测试 API 演示 -->
    <el-card class="test-section" shadow="hover">
      <template #header>
        <div class="card-header">
          <span><el-icon><Document /></el-icon> 测试 API 演示 (GET /api/test/list)</span>
          <el-button type="primary" size="small" @click="loadTestList" :loading="testLoading">
            <el-icon><Refresh /></el-icon> 刷新数据
          </el-button>
        </div>
      </template>

      <div class="test-api-content">
        <el-form :inline="true" :model="testForm" class="test-form">
          <el-form-item label="页码">
            <el-input-number v-model="testForm.page" :min="1" :max="100" size="small" />
          </el-form-item>
          <el-form-item label="每页条数">
            <el-input-number v-model="testForm.pageSize" :min="1" :max="100" size="small" />
          </el-form-item>
          <el-form-item label="搜索">
            <el-input v-model="testForm.search" placeholder="搜索名称或描述" size="small" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="small" @click="handleTestSearch">查询</el-button>
          </el-form-item>
        </el-form>

        <el-table 
          v-loading="testLoading"
          :data="testListData" 
          stripe 
          style="width: 100%"
          empty-text="暂无数据"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="名称" width="150" />
          <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag 
                :type="row.status === 'active' ? 'success' : row.status === 'pending' ? 'warning' : 'danger'"
                size="small"
              >
                {{ row.status === 'active' ? '活跃' : row.status === 'pending' ? '待处理' : '未激活' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="tags" label="标签" width="200">
            <template #default="{ row }">
              <el-tag 
                v-for="tag in row.tags" 
                :key="tag" 
                size="small" 
                style="margin-right: 5px;"
              >
                {{ tag }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          v-model:current-page="testForm.page"
          v-model:page-size="testForm.pageSize"
          :total="testTotal"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadTestList"
          @current-change="loadTestList"
          style="margin-top: 20px; justify-content: flex-end;"
        />
      </div>
    </el-card>

    <!-- 应用详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="应用详情"
      width="800px"
    >
      <el-descriptions :column="1" border v-if="selectedApp">
        <el-descriptions-item label="应用 ID">{{ selectedApp.id }}</el-descriptions-item>
        <el-descriptions-item label="应用名称">{{ selectedApp.name }}</el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag :type="getTypeTagType(selectedApp.type)">{{ selectedApp.type }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="selectedApp.status === 'online' ? 'success' : 'danger'">
            {{ selectedApp.status === 'online' ? '在线' : '离线' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="入口地址">{{ selectedApp.entry }}</el-descriptions-item>
        <el-descriptions-item label="激活规则">{{ selectedApp.activeRule }}</el-descriptions-item>
        <el-descriptions-item label="容器">{{ selectedApp.container }}</el-descriptions-item>
        <el-descriptions-item label="版本">{{ selectedApp.version }}</el-descriptions-item>
        <el-descriptions-item label="预加载">
          <el-tag :type="selectedApp.preload ? 'warning' : 'info'" size="small">
            {{ selectedApp.preload ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="图标">
          <el-icon v-if="selectedApp.iconType === 'element-icon'" :size="24">
            <component :is="selectedApp.icon" />
          </el-icon>
        </el-descriptions-item>
        <el-descriptions-item label="布局类型">{{ selectedApp.layoutType }}</el-descriptions-item>
        <el-descriptions-item label="最后修改时间">
          {{ formatDate(selectedApp.lastModified) }}
        </el-descriptions-item>
        <el-descriptions-item label="布局选项" :span="2">
          <el-code v-if="selectedApp.layoutOptions">
            {{ JSON.stringify(selectedApp.layoutOptions, null, 2) }}
          </el-code>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Grid,
  Monitor,
  Refresh,
  Download,
  Upload,
  Delete,
  Setting,
  Document
} from '@element-plus/icons-vue'
import { loadMicroApps } from '@/config/microApps'
import API from '@/api'
import { mockEngine } from '@/utils/mockEngine'
import { USE_MOCK } from '@/config/app'
import router from '@/router'

// 状态
const microApps = ref([])
const loading = ref(false)
const loadingLayout = ref(false)
const saving = ref(false)
const currentLayout = ref(null)
const detailDialogVisible = ref(false)
const selectedApp = ref(null)

// 测试 API 相关状态
const testLoading = ref(false)
const testForm = ref({
  page: 1,
  pageSize: 10,
  search: ''
})
const testListData = ref([])
const testTotal = ref(0)

// 计算属性
const isMockMode = computed(() => USE_MOCK)

const mockInterfaces = computed(() => {
  return mockEngine.getAllInterfaces()
})

// 方法
const getTypeTagType = (type) => {
  const typeMap = {
    vue3: '',
    vue2: 'warning',
    iframe: 'success',
    link: 'danger'
  }
  return typeMap[type] || ''
}

const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN')
}

// 加载微应用配置
const loadMicroAppsData = async () => {
  loading.value = true
  try {
    const apps = await loadMicroApps()
    microApps.value = apps
    ElMessage.success(`成功加载 ${apps.length} 个微应用`)
  } catch (error) {
    console.error('加载微应用失败:', error)
    ElMessage.error('加载微应用失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 访问应用
const navigateToApp = (app) => {
  if (app.status === 'offline') {
    ElMessage.warning('该应用已离线，无法访问')
    return
  }

  // 根据类型跳转到对应路由
  const routeMap = {
    vue3: '/vue3',
    vue2: '/vue2',
    iframe: '/iframe',
    link: app.entry // 外链直接跳转
  }

  const targetRoute = routeMap[app.type]
  if (targetRoute && app.type !== 'link') {
    router.push(targetRoute)
  } else if (app.type === 'link') {
    window.open(app.entry, '_blank')
  }
}

// 查看详情
const viewAppDetail = (app) => {
  selectedApp.value = app
  detailDialogVisible.value = true
}

// 测试 API 相关方法
const loadTestList = async () => {
  testLoading.value = true
  try {
    const result = await API.test.getTestList(testForm.value)
    // 注意：request 拦截器已经解包了 res.data，所以直接访问 result.items
    testListData.value = result.items || []
    testTotal.value = result.total || 0
    ElMessage.success(`成功加载 ${testListData.value.length} 条数据`)
  } catch (error) {
    console.error('加载测试列表失败:', error)
    ElMessage.error('加载测试列表失败：' + error.message)
  } finally {
    testLoading.value = false
  }
}

const handleTestSearch = () => {
  testForm.value.page = 1
  loadTestList()
}

// 布局相关操作
const loadLayout = async () => {
  loadingLayout.value = true
  try {
    const layout = await API.layout.loadLayout()
    currentLayout.value = layout
    ElMessage.success('布局加载成功')
  } catch (error) {
    console.error('加载布局失败:', error)
    ElMessage.error('加载布局失败：' + error.message)
  } finally {
    loadingLayout.value = false
  }
}

const saveLayout = async () => {
  // 示例布局数据
  const layoutData = {
    layoutMode: 'grid-free',
    splitWidths: ['50%', '50%'],
    activeTabId: 'panel-1',
    panels: [
      {
        panelId: 'panel-1',
        appId: 'vue3-sub-app',
        name: 'Vue3 Demo',
        type: 'vue3',
        subPath: '',
        x: 0,
        y: 0,
        w: 6,
        h: 8,
        order: 1
      },
      {
        panelId: 'panel-2',
        appId: 'vue2-sub-app',
        name: 'Vue2 Demo',
        type: 'vue2',
        subPath: '',
        x: 6,
        y: 0,
        w: 6,
        h: 8,
        order: 2
      }
    ]
  }

  saving.value = true
  try {
    await API.layout.saveLayout(layoutData)
    ElMessage.success('布局保存成功')
    // 保存后重新加载
    await loadLayout()
  } catch (error) {
    console.error('保存布局失败:', error)
    ElMessage.error('保存布局失败：' + error.message)
  } finally {
    saving.value = false
  }
}

const clearLayout = async () => {
  try {
    await API.layout.clearLayout()
    currentLayout.value = null
    ElMessage.success('布局已清空')
  } catch (error) {
    console.error('清空布局失败:', error)
    ElMessage.error('清空布局失败：' + error.message)
  }
}

// 初始化
onMounted(() => {
  loadMicroAppsData()
  loadLayout()
  loadTestList()
})
</script>

<style scoped lang="scss">
.mock-test-page {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;

  .test-header {
    margin-bottom: 20px;

    h2 {
      margin: 0 0 10px 0;
      color: #303133;
    }

    .description {
      color: #909399;
      font-size: 14px;
    }
  }

  .test-section {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      span {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: bold;
        font-size: 16px;
      }
    }

    .layout-content {
      .el-descriptions {
        margin-bottom: 20px;
      }

      .el-divider {
        margin: 20px 0;
      }
    }

    .test-api-content {
      .test-form {
        margin-bottom: 15px;
      }

      .el-pagination {
        display: flex;
      }
    }
  }
}
</style>
