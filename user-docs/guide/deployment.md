# 部署指南

## 构建

### 构建所有应用

```bash
npm run build:all
```

### 单独构建

```bash
npm run build:main    # 主应用
npm run build:vue3    # Vue3 子应用
npm run build:vue2    # Vue2 子应用
npm run build:iframe  # iframe 子应用
```

## Nginx 配置

### 主应用

```nginx
server {
    listen 80;
    server_name main.example.com;
    
    root /var/www/main-app;
    index index.html;
    
    # history 模式
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location /assets {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 子应用

```nginx
server {
    listen 80;
    server_name vue3.example.com;
    
    root /var/www/vue3-sub-app;
    index index.html;
    
    # CORS 配置
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
    
    # history 模式
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## CORS 配置

子应用必须配置 CORS 允许主应用访问：

```nginx
# 允许的源
add_header Access-Control-Allow-Origin "https://main.example.com";

# 或允许所有源（开发环境）
add_header Access-Control-Allow-Origin *;

# 允许的方法
add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';

# 允许的头
add_header Access-Control-Allow-Headers 'Content-Type, Authorization';

# 预检请求缓存时间
add_header Access-Control-Max-Age 86400;
```

## 静态资源路径

子应用打包时需要配置正确的公共路径：

### Vue3 子应用

```javascript
// vite.config.js
export default defineConfig({
  base: process.env.NODE_ENV === 'production' 
    ? '//vue3.example.com/' 
    : '/'
})
```

### Vue2 子应用

```javascript
// vue.config.js
module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '//vue2.example.com/'
    : '/'
}
```

## 生产环境微应用配置

```javascript
// config/microApps.js
const isProd = process.env.NODE_ENV === 'production'

export const microApps = [
  {
    id: 'vue3-sub-app',
    name: 'Vue3 子应用',
    entry: isProd 
      ? '//vue3.example.com' 
      : '//localhost:7080',
    // ...
  }
]
```

## Docker 部署

```dockerfile
# Dockerfile
FROM nginx:alpine

COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```
