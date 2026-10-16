<template>
  <section class="page-panel">
    <header class="page-heading">
      <div>
        <p class="eyebrow">User Management</p>
        <h2>用户管理</h2>
        <p>查询、添加、编辑和删除 Quiz 用户数据。</p>
      </div>
      <el-tag :type="apiMode === 'live' ? 'success' : 'warning'" size="small" effect="dark">
        {{ apiModeText }}
      </el-tag>
    </header>

    <div class="toolbar">
      <el-input
        v-model.trim="keyword"
        class="search-input"
        placeholder="用户名"
        clearable
        prefix-icon="el-icon-search"
        @keyup.enter.native="handleSearch"
        @clear="handleSearch"
      />
      <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询用户</el-button>
      <el-button type="success" icon="el-icon-plus" @click="openAddDialog">添加用户</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="users"
      class="data-table"
      stripe
      row-key="id"
    >
      <el-table-column prop="createTime" label="日期" width="168" />
      <el-table-column label="用户名" min-width="150">
        <template slot-scope="{ row }">
          <el-tag size="mini" effect="plain">{{ row.userName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="userPassword" label="密码" min-width="140" />
      <el-table-column label="操作" width="176" align="right">
        <template slot-scope="{ row }">
          <el-button size="mini" icon="el-icon-edit" @click="openEditDialog(row)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-row">
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page="page"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
      />
    </div>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="460px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form
        ref="userForm"
        :model="form"
        :rules="formRules"
        label-width="88px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model.trim="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item v-if="!editingUser" label="确认密码" prop="checkPassword">
          <el-input
            v-model="form.checkPassword"
            type="password"
            show-password
            placeholder="请再次输入密码"
          />
        </el-form-item>
      </el-form>

      <template slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script>
import {
  addUser,
  deleteUser,
  getApiMode,
  listUsers,
  updateUser
} from "@/api/quizApi";

export default {
  name: "UserManagementView",
  data() {
    return {
      users: [],
      keyword: "",
      page: 1,
      pageSize: 5,
      total: 0,
      loading: false,
      submitting: false,
      dialogVisible: false,
      editingUser: null,
      apiMode: "checking",
      form: {
        username: "",
        password: "",
        checkPassword: ""
      }
    };
  },
  computed: {
    dialogTitle() {
      return this.editingUser ? "编辑用户" : "添加用户";
    },
    apiModeText() {
      if (this.apiMode === "live") {
        return "本地后端";
      }
      if (this.apiMode === "demo") {
        return "演示数据";
      }
      return "检查接口";
    },
    formRules() {
      const validatePassword = (rule, value, callback) => {
        if (!value) {
          callback(new Error("请输入密码"));
          return;
        }
        if (value.length < 8) {
          callback(new Error("密码不能少于 8 位"));
          return;
        }
        callback();
      };

      return {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { pattern: /^[a-zA-Z0-9\u4e00-\u9fa5]+$/, message: "用户名不能包含特殊字符", trigger: "blur" }
        ],
        password: [{ validator: validatePassword, trigger: "blur" }],
        checkPassword: [
          {
            validator: (rule, value, callback) => {
              if (this.editingUser) {
                callback();
                return;
              }
              if (!value) {
                callback(new Error("请再次输入密码"));
                return;
              }
              if (value !== this.form.password) {
                callback(new Error("两次输入的密码不一致"));
                return;
              }
              callback();
            },
            trigger: "blur"
          }
        ]
      };
    }
  },
  created() {
    this.loadUsers();
  },
  methods: {
    async loadUsers() {
      this.loading = true;
      try {
        const result = await listUsers({
          page: this.page,
          pageSize: this.pageSize,
          keyword: this.keyword
        });
        this.users = result.rows;
        this.total = result.total;
        this.apiMode = getApiMode();
      } catch (error) {
        this.$message.error(error.message || "用户数据加载失败");
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      this.page = 1;
      this.loadUsers();
    },
    handlePageChange(page) {
      this.page = page;
      this.loadUsers();
    },
    openAddDialog() {
      this.editingUser = null;
      this.form = {
        username: "",
        password: "",
        checkPassword: ""
      };
      this.dialogVisible = true;
      this.$nextTick(() => this.$refs.userForm?.clearValidate());
    },
    openEditDialog(user) {
      this.editingUser = user;
      this.form = {
        username: user.userName,
        password: user.userPassword,
        checkPassword: ""
      };
      this.dialogVisible = true;
      this.$nextTick(() => this.$refs.userForm?.clearValidate());
    },
    resetForm() {
      this.editingUser = null;
      this.form = {
        username: "",
        password: "",
        checkPassword: ""
      };
      this.$refs.userForm?.resetFields();
    },
    async submitForm() {
      try {
        await this.$refs.userForm.validate();
      } catch (error) {
        return;
      }

      this.submitting = true;
      try {
        if (this.editingUser) {
          await updateUser({
            id: this.editingUser.id,
            userName: this.form.username,
            userPassword: this.form.password
          });
          this.$message.success("用户修改成功");
        } else {
          await addUser({
            username: this.form.username,
            password: this.form.password,
            checkPassword: this.form.checkPassword
          });
          this.$message.success("用户添加成功");
        }

        this.dialogVisible = false;
        this.loadUsers();
      } catch (error) {
        this.$message.error(error.message || "保存用户失败");
      } finally {
        this.submitting = false;
      }
    },
    async handleDelete(user) {
      try {
        await this.$confirm(`确定删除用户“${user.userName}”吗？`, "删除确认", {
          type: "warning"
        });
      } catch (error) {
        return;
      }

      try {
        await deleteUser(user.id);
        this.$message.success("用户已删除");

        if (this.users.length === 1 && this.page > 1) {
          this.page -= 1;
        }
        this.loadUsers();
      } catch (error) {
        this.$message.error(error.message || "删除用户失败");
      }
    }
  }
};
</script>
