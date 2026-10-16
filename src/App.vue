<template>
  <el-container class="admin-shell">
    <el-header class="admin-header" height="64px">
      <div>
        <strong>Quiz 后台管理</strong>
        <span class="header-path">/ {{ $route.meta.title }}</span>
      </div>
      <span class="api-state">
        <i class="el-icon-data-line"></i>
        本地后端 / 演示数据自动切换
      </span>
    </el-header>

    <el-container class="admin-workspace">
      <el-aside class="admin-aside" width="224px">
        <div class="admin-brand">
          <span class="brand-dot" aria-hidden="true"></span>
          <div>
            <strong>Quiz Admin</strong>
            <small>内容管理后台</small>
          </div>
        </div>

        <el-menu
          class="admin-menu"
          :default-active="$route.path"
          :default-openeds="['system']"
        >
          <el-submenu index="system">
            <template slot="title">
              <i class="el-icon-s-operation"></i>
              <span>系统信息管理</span>
            </template>
            <el-menu-item index="/user">
              <router-link class="menu-link" to="/user">
                <i class="el-icon-user"></i>
                <span>用户管理</span>
              </router-link>
            </el-menu-item>
            <el-menu-item index="/question">
              <router-link class="menu-link" to="/question">
                <i class="el-icon-document"></i>
                <span>题目管理</span>
              </router-link>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "App"
};
</script>
