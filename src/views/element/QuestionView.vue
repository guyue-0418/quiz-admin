<template>
  <section class="page-panel">
    <header class="page-heading">
      <div>
        <p class="eyebrow">Question Management</p>
        <h2>题目管理</h2>
        <p>维护题目内容、四个选项和正确答案。</p>
      </div>
      <el-tag :type="apiMode === 'live' ? 'success' : 'warning'" size="small" effect="dark">
        {{ apiModeText }}
      </el-tag>
    </header>

    <div class="toolbar">
      <el-input
        v-model.trim="keyword"
        class="search-input"
        placeholder="题目关键词"
        clearable
        prefix-icon="el-icon-search"
        @keyup.enter.native="handleSearch"
        @clear="handleSearch"
      />
      <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询题目</el-button>
      <el-button type="success" icon="el-icon-plus" @click="openAddDialog">添加题目</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="questions"
      class="data-table"
      stripe
      row-key="id"
    >
      <el-table-column type="index" label="序号" width="64" />
      <el-table-column prop="questionText" label="问题" min-width="240" show-overflow-tooltip />
      <el-table-column label="选项" min-width="360">
        <template slot-scope="{ row }">
          <span class="option-text">{{ row.options.join("，") }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="answer" label="答案" min-width="130" />
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
      width="540px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form
        ref="questionForm"
        :model="form"
        :rules="formRules"
        label-width="88px"
      >
        <el-form-item label="问题内容" prop="questionText">
          <el-input
            v-model.trim="form.questionText"
            type="textarea"
            :rows="3"
            placeholder="请输入题目内容"
          />
        </el-form-item>
        <el-form-item
          v-for="(label, index) in optionLabels"
          :key="label"
          :label="`选项 ${label}`"
          :prop="`options.${index}`"
        >
          <el-input v-model.trim="form.options[index]" :placeholder="`请输入选项 ${label}`" />
        </el-form-item>
        <el-form-item label="答案" prop="answerIndex">
          <el-select v-model="form.answerIndex" placeholder="请选择正确答案">
            <el-option
              v-for="(label, index) in optionLabels"
              :key="label"
              :label="`选项 ${label}`"
              :value="index"
            />
          </el-select>
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
  addQuestion,
  deleteQuestion,
  getApiMode,
  listQuestions,
  updateQuestion
} from "@/api/quizApi";

export default {
  name: "QuestionManagementView",
  data() {
    return {
      questions: [],
      keyword: "",
      page: 1,
      pageSize: 5,
      total: 0,
      loading: false,
      submitting: false,
      dialogVisible: false,
      editingQuestion: null,
      apiMode: "checking",
      optionLabels: ["A", "B", "C", "D"],
      form: {
        questionText: "",
        options: ["", "", "", ""],
        answerIndex: 0
      }
    };
  },
  computed: {
    dialogTitle() {
      return this.editingQuestion ? "编辑题目" : "添加题目";
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
      const optionRules = this.optionLabels.map((label) => ({
        required: true,
        message: `请输入选项 ${label}`,
        trigger: "blur"
      }));

      return {
        questionText: [
          { required: true, message: "请输入题目内容", trigger: "blur" }
        ],
        options: optionRules,
        answerIndex: [
          { required: true, message: "请选择正确答案", trigger: "change" }
        ]
      };
    }
  },
  created() {
    this.loadQuestions();
  },
  methods: {
    async loadQuestions() {
      this.loading = true;
      try {
        const result = await listQuestions({
          page: this.page,
          pageSize: this.pageSize,
          keyword: this.keyword
        });
        this.questions = result.rows;
        this.total = result.total;
        this.apiMode = getApiMode();
      } catch (error) {
        this.$message.error(error.message || "题目数据加载失败");
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      this.page = 1;
      this.loadQuestions();
    },
    handlePageChange(page) {
      this.page = page;
      this.loadQuestions();
    },
    openAddDialog() {
      this.editingQuestion = null;
      this.form = {
        questionText: "",
        options: ["", "", "", ""],
        answerIndex: 0
      };
      this.dialogVisible = true;
      this.$nextTick(() => this.$refs.questionForm?.clearValidate());
    },
    openEditDialog(question) {
      this.editingQuestion = question;
      this.form = {
        questionText: question.questionText,
        options: [...question.options],
        answerIndex: question.answerIndex
      };
      this.dialogVisible = true;
      this.$nextTick(() => this.$refs.questionForm?.clearValidate());
    },
    resetForm() {
      this.editingQuestion = null;
      this.form = {
        questionText: "",
        options: ["", "", "", ""],
        answerIndex: 0
      };
      this.$refs.questionForm?.resetFields();
    },
    async submitForm() {
      try {
        await this.$refs.questionForm.validate();
      } catch (error) {
        return;
      }

      this.submitting = true;
      const payload = {
        id: this.editingQuestion?.id,
        questionText: this.form.questionText,
        options: [...this.form.options],
        answerIndex: this.form.answerIndex
      };

      try {
        if (this.editingQuestion) {
          await updateQuestion(payload);
          this.$message.success("题目修改成功");
        } else {
          await addQuestion(payload);
          this.$message.success("题目添加成功");
        }

        this.dialogVisible = false;
        this.loadQuestions();
      } catch (error) {
        this.$message.error(error.message || "保存题目失败");
      } finally {
        this.submitting = false;
      }
    },
    async handleDelete(question) {
      try {
        await this.$confirm(`确定删除题目“${question.questionText}”吗？`, "删除确认", {
          type: "warning"
        });
      } catch (error) {
        return;
      }

      try {
        await deleteQuestion(question.id);
        this.$message.success("题目已删除");

        if (this.questions.length === 1 && this.page > 1) {
          this.page -= 1;
        }
        this.loadQuestions();
      } catch (error) {
        this.$message.error(error.message || "删除题目失败");
      }
    }
  }
};
</script>
