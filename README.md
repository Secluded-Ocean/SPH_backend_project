# 尚品汇后台管理系统

### **项目背景**

前台项目当中的数据来源于卖家（公司），但是需要注意的是，卖家不会数据库操作。对于卖家而言，需要把产品的信息上传于服务器，写入数据库。卖家并非程序员，不会数据库操作（增删改查）。需要开发一个产品，可以让卖家进行可视化操作数据库（增删改查）。

后台管理系统：可以让用户通过一个可视化工具，可以实现对于数据库进行增删改查的操作。
而且根据不同的角色（老板、员工），看到的、操作内容是不同的。

### 项目部署与上线

项目部署于http://43.138.173.87:8080/

用户名：admin

密码：111111

### **技术选型**

1. 后台数据处理/交互/组件化：vue，vue-router，vuex，vue-lazyload，element-ui，vue-admin-template
2. 前后台交互（后台数据来源于尚硅谷服务器）：
   - ajax请求：axios，async/await
   - mock数据：mockjs
   - 接口测试：postman
3. 模块化：ES6，Babel
4. 项目构建/工程化：webpack，vue-cli3，eslint



## 项目依赖安装

```
npm install
```

### 运行项目

```
npm run dev
```

### 打包构建项目

```
//构建生产环境npm run build:prod
//构成测试环境npm run build:stagenpm run build
```

