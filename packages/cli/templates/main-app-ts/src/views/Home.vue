<template>
  <div class="home-page">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" :size="40" color="#409EFF"><Grid /></el-icon>
            <div class="stat-info">
              <div class="stat-number">{{ totalApps }}</div>
              <div class="stat-label">子应用总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" :size="40" color="#67C23A"><CircleCheck /></el-icon>
            <div class="stat-info">
              <div class="stat-number">{{ onlineApps.length }}</div>
              <div class="stat-label">在线应用</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon class="stat-icon" :size="40" color="#E6A23C"><Warning /></el-icon>
            <div class="stat-info">
              <div class="stat-number">{{ offlineApps.length }}</div>
              <div class="stat-label">离线应用</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="apps-row">
      <el-col :span="16">
        <el-card class="apps-card">
          <template #header>
            <div class="card-header">
              <span>子应用列表</span>
              <el-button type="primary" size="small" @click="goToManagement">
                管理应用
              </el-button>
            </div>
          </template>
          
          <el-table :data="apps" style="width: 100%">
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
            <el-table-column prop="version" label="版本" width="100" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button 
                  type="primary" 
                  size="small" 
                  link
                  :disabled="row.status === 'offline'"
                  @click="goToApp(row.id)"
                >
                  访问
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="quick-nav-card">
          <template #header>
            <span>快速导航</span>
          </template>
          
          <div class="quick-nav-list">
            <div 
              v-for="app in onlineApps" 
              :key="app.id"
              class="quick-nav-item"
              @click="goToApp(app.id)"
            >
              <el-icon :size="24"><Monitor /></el-icon>
              <span>{{ app.name }}</span>
            </div>
            
            <div class="quick-nav-item" @click="goToMultiInstance">
              <el-icon :size="24"><CopyDocument /></el-icon>
              <span>多应用同屏</span>
            </div>
            
            <div class="quick-nav-item" @click="goToManagement">
              <el-icon :size="24"><Setting /></el-icon>
              <span>应用管理</span>
            </div>
          </div>
        </el-card>
        
        <el-card class="token-card" style="margin-top: 20px;">
          <template #header>
            <span>Token 管理</span>
          </template>
          
          <el-form label-position="top">
            <el-form-item label="当前 Token">
              <el-input 
                v-model="token" 
                placeholder="输入 Token"
                @change="handleTokenChange"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="syncTokenToAll">
                同步到所有子应用
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { bridge } from '@/core/bridge'
import {
  Grid,
  CircleCheck,
  Warning,
  Monitor,
  CopyDocument,
  Setting
} from '@element-plus/icons-vue'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

// 使用 storeToRefs 解构，确保拿到的是正确的 Ref 而非 ComputedRefImpl
// 直接用 computed 包裹 store 的 computed 属性会导致双层包装，
// 在模板序列化时触发 circular structure 错误
const { apps, onlineApps, offlineApps } = storeToRefs(appStore)
const totalApps = computed(() => apps.value.length)
const token = ref(userStore.token)

function getTypeTagType(type) {
  const typeMap = {
    vue3: 'success',
    vue2: 'warning',
    iframe: 'info',
    link: ''
  }
  return typeMap[type] || ''
}

function goToApp(appId) {
  router.push(`/app/${appId}`)
}

function goToMultiInstance() {
  router.push('/multi-instance')
}

function goToManagement() {
  router.push('/app-management')
}

function handleTokenChange(value) {
  userStore.setToken(value)
}

function syncTokenToAll() {
  bridge.syncToken(token.value)
}
</script>

<style lang="scss" scoped>
.home-page {
  padding: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  .stat-content {
    display: flex;
    align-items: center;
    gap: 15px;
    
    .stat-icon {
      flex-shrink: 0;
    }
    
    .stat-info {
      .stat-number {
        font-size: 28px;
        font-weight: bold;
        color: #303133;
      }
      
      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

.apps-row {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.quick-nav-card {
  .quick-nav-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    
    .quick-nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 15px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
      
      &:hover {
        background-color: #f0f2f5;
      }
    }
  }
}

.token-card {
  :deep(.el-form-item) {
    margin-bottom: 15px;
  }
}
</style>
