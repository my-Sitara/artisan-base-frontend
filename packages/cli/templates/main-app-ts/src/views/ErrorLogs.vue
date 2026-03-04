<template>
  <div class="error-logs-page">
    <div class="page-header">
      <h3>错误日志</h3>
      <div class="header-actions">
        <el-badge :value="errorLogs.length" type="danger" style="margin-right: 15px;">
          <el-button>错误总数</el-button>
        </el-badge>
        <el-button type="danger" @click="handleClearErrors">
          <el-icon><Delete /></el-icon>
          清空错误日志
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>
    
    <!-- 统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-label">总错误数</div>
            <div class="stat-value total">{{ errorLogs.length }}</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-label">涉及应用数</div>
            <div class="stat-value apps">{{ uniqueAppsCount }}</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-label">最近错误</div>
            <div class="stat-value recent">{{ getRecentErrorTime() }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 错误日志表格 -->
    <el-card class="error-logs-card">
      <template #header>
        <div class="card-header">
          <span>错误列表</span>
          <el-input
            v-model="searchText"
            placeholder="搜索错误信息或应用 ID"
            style="width: 300px;"
            clearable
            prefix-icon="Search"
          />
        </div>
      </template>
      
      <el-table 
        :data="filteredErrorLogs" 
        style="width: 100%;" 
        max-height="600"
        empty-text="暂无错误日志"
      >
        <el-table-column prop="appId" label="应用 ID" width="150" />
        <el-table-column prop="message" label="错误信息" min-width="400" show-overflow-tooltip />
        <el-table-column label="时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="info" 
              link 
              size="small"
              @click="handleCopyError(row)"
            >
              复制
            </el-button>
            <el-button 
              type="danger" 
              link 
              size="small"
              @click="handleDeleteError(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="filteredErrorLogs.length === 0" description="暂无错误日志" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { microAppManager } from '@/core/microAppManager'
import { Delete, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const errorLogs = computed(() => microAppManager.errorLogs)
const searchText = ref('')

// 计算涉及的应用数量
const uniqueAppsCount = computed(() => {
  const appIds = new Set(errorLogs.value.map(log => log.appId))
  return appIds.size
})

// 过滤后的错误日志
const filteredErrorLogs = computed(() => {
  if (!searchText.value) return errorLogs.value
  
  const search = searchText.value.toLowerCase()
  return errorLogs.value.filter(log => 
    log.appId.toLowerCase().includes(search) ||
    log.message.toLowerCase().includes(search)
  )
})

function formatTime(timestamp) {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('zh-CN')
}

function getRecentErrorTime() {
  if (errorLogs.value.length === 0) return '无'
  
  const sortedLogs = [...errorLogs.value].sort((a, b) => b.time - a.time)
  const recentLog = sortedLogs[0]
  
  const now = new Date()
  const errorTime = new Date(recentLog.time)
  const diff = now - errorTime
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return formatTime(recentLog.time)
}

function handleRefresh() {
  // 刷新只是重新获取数据，实际上错误日志是响应式的
  ElMessage.success('已刷新')
}

function handleClearErrors() {
  if (errorLogs.value.length === 0) {
    ElMessage.info('已经没有错误日志了')
    return
  }
  
  ElMessageBox.confirm(
    `确定要清空所有 ${errorLogs.value.length} 条错误日志吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    microAppManager.clearErrorLogs()
    ElMessage.success('已清空所有错误日志')
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

function handleDeleteError(log) {
  ElMessageBox.confirm(
    '确定要删除这条错误日志吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    microAppManager.deleteError(log)
    ElMessage.success('已删除')
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

function handleCopyError(log) {
  const text = `[${log.appId}] ${formatTime(log.time)}\n${log.message}`
  
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

onMounted(() => {
  // 可以在这里添加一些初始化逻辑
})
</script>

<style lang="scss" scoped>
.error-logs-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    font-size: 18px;
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

.stat-card {
  text-align: center;
  padding: 10px 0;
  
  .stat-label {
    color: #909399;
    font-size: 14px;
    margin-bottom: 10px;
  }
  
  .stat-value {
    font-size: 32px;
    font-weight: bold;
    
    &.total {
      color: #F56C6C;
    }
    
    &.apps {
      color: #E6A23C;
    }
    
    &.recent {
      color: #409EFF;
      font-size: 20px;
    }
  }
}

.error-logs-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

:deep(.el-table__empty-block) {
  min-height: 200px;
}
</style>
