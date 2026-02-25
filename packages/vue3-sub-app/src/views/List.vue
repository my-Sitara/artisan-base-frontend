<template>
  <div class="list-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Vue3 子应用 - 列表页</span>
          <el-button type="primary" size="small" @click="handleAdd">新增</el-button>
        </div>
      </template>
      
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="名称" width="150" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="description" label="描述" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(50)

const tableData = ref([
  { id: 1, name: '项目 A', status: 'active', createTime: '2024-01-01 10:00:00', description: 'Vue3 项目示例' },
  { id: 2, name: '项目 B', status: 'inactive', createTime: '2024-01-02 11:00:00', description: '微前端演示' },
  { id: 3, name: '项目 C', status: 'active', createTime: '2024-01-03 12:00:00', description: 'qiankun 集成' },
  { id: 4, name: '项目 D', status: 'active', createTime: '2024-01-04 13:00:00', description: '子应用示例' },
  { id: 5, name: '项目 E', status: 'inactive', createTime: '2024-01-05 14:00:00', description: '列表页演示' }
])

function handleAdd() {
  ElMessage.info('点击了新增按钮')
}

function handleEdit(row) {
  ElMessage.info(`编辑: ${row.name}`)
}

function handleDelete(row) {
  ElMessageBox.confirm(`确定删除 ${row.name} 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.list-page {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
