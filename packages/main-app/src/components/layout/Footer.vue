<template>
  <el-footer class="layout-footer">
    <div class="footer-content">
      <div class="footer-left">
        <span class="copyright">© 2026 Artisan Base Frontend. All rights reserved.</span>
      </div>
      
      <div class="footer-right">
        <el-link 
          v-for="(link, index) in footerLinks" 
          :key="index"
          :href="link.href"
          target="_blank"
          type="info"
          :underline="false"
        >
          {{ link.text }}
        </el-link>
      </div>
    </div>
  </el-footer>
</template>

<script setup>
import { ref } from 'vue'

const footerLinks = ref([
  { text: '使用文档', href: '/user-docs/' },
  { text: 'GitHub', href: 'https://github.com/your-repo' },
  { text: '关于我们', href: '#' }
])
</script>

<style lang="scss" scoped>
.layout-footer {
  height: 50px;
  background-color: #fff;
  border-top: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  padding: 0 20px;
  
  .footer-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .footer-left {
      .copyright {
        font-size: 13px;
        color: #909399;
      }
    }
    
    .footer-right {
      display: flex;
      gap: 20px;
      
      .el-link {
        font-size: 13px;
        color: #606266;
        
        &:hover {
          color: #409EFF;
        }
      }
    }
  }
}
</style>
