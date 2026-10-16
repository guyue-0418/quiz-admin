import axios from "axios";
import { mockQuestions, mockUsers } from "@/data/mock";

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || "http://localhost:8080";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 2500
});

let apiMode = "checking";
let backendAvailable = null;
let users = mockUsers.map((user) => ({ ...user }));
let questions = mockQuestions.map((question) => ({
  ...question,
  options: [...question.options]
}));

function nowText() {
  return new Date().toLocaleString("zh-CN", { hour12: false }).replaceAll("/", "-");
}

function paginate(rows, page, pageSize) {
  const start = (page - 1) * pageSize;
  return {
    total: rows.length,
    rows: rows.slice(start, start + pageSize)
  };
}

function formData(values) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    params.append(key, value ?? "");
  });
  return params;
}

async function canUseBackend() {
  if (backendAvailable !== null) {
    return backendAvailable;
  }

  const host = window.location.hostname;
  if (host !== "localhost" && host !== "127.0.0.1") {
    backendAvailable = false;
    apiMode = "demo";
    return backendAvailable;
  }

  try {
    const response = await client.get("/hello");
    backendAvailable = response.status === 200;
    apiMode = backendAvailable ? "live" : "demo";
  } catch (error) {
    backendAvailable = false;
    apiMode = "demo";
  }

  return backendAvailable;
}

export function getApiMode() {
  return apiMode;
}

export async function listUsers({ page = 1, pageSize = 5, keyword = "" } = {}) {
  if (await canUseBackend()) {
    if (keyword) {
      const response = await client.get("/findUser", { params: { keyword } });
      const rows = response.data.data || [];
      return paginate(rows, page, pageSize);
    }

    const response = await client.get("/users", {
      params: { page, pageSize }
    });
    const data = response.data.data || {};
    return {
      total: data.total || 0,
      rows: data.rows || []
    };
  }

  const normalizedKeyword = keyword.trim().toLowerCase();
  const filtered = users.filter((user) => {
    return !normalizedKeyword || user.userName.toLowerCase().includes(normalizedKeyword);
  });

  return {
    ...paginate(filtered, page, pageSize),
    rows: filtered.slice((page - 1) * pageSize, page * pageSize).map((user) => ({ ...user }))
  };
}

export async function addUser({ username, password, checkPassword }) {
  if (await canUseBackend()) {
    const response = await client.post(
      "/register",
      formData({
        username,
        password,
        checkpassword: checkPassword
      })
    );

    if (response.data.code !== 1) {
      throw new Error(response.data.msg || "新增用户失败");
    }

    return true;
  }

  if (users.some((user) => user.userName === username)) {
    throw new Error("用户名已存在");
  }

  users.unshift({
    id: Date.now(),
    userName: username,
    userPassword: password,
    userRole: 0,
    isDelete: 0,
    createTime: nowText(),
    updateTime: nowText()
  });
  return true;
}

export async function updateUser(user) {
  if (await canUseBackend()) {
    throw new Error("后端暂未提供编辑用户接口");
  }

  const target = users.find((item) => item.id === user.id);
  if (!target) {
    throw new Error("用户不存在");
  }

  Object.assign(target, {
    userName: user.userName,
    userPassword: user.userPassword,
    updateTime: nowText()
  });
  return true;
}

export async function deleteUser(id) {
  if (await canUseBackend()) {
    const response = await client.get("/deleteById", { params: { id } });
    if (response.data.code !== 1) {
      throw new Error(response.data.msg || "删除用户失败");
    }
    return true;
  }

  users = users.filter((user) => user.id !== id);
  return true;
}

function normalizeManagedQuestion(question, index) {
  const options = question.options || [];
  const answerIndex = Math.max(options.indexOf(question.answer), 0);

  return {
    id: question.id || `question-${index}-${question.questionText}`,
    questionText: question.questionText,
    options,
    answer: question.answer,
    answerIndex,
    createTime: question.createTime || "",
    updateTime: question.updateTime || ""
  };
}

export async function listQuestions({ page = 1, pageSize = 5, keyword = "" } = {}) {
  if (await canUseBackend()) {
    const url = keyword ? "/findQuestion" : "/questions";
    const params = keyword
      ? { keyword }
      : { page, pageSize };
    const response = await client.get(url, { params });

    if (keyword) {
      const rows = (response.data.data || []).map(normalizeManagedQuestion);
      return paginate(rows, page, pageSize);
    }

    const data = response.data.data || {};
    return {
      total: data.total || 0,
      rows: (data.qsBeanList || []).map(normalizeManagedQuestion)
    };
  }

  const normalizedKeyword = keyword.trim().toLowerCase();
  const filtered = questions.filter((question) => {
    return !normalizedKeyword || question.questionText.toLowerCase().includes(normalizedKeyword);
  });

  return {
    ...paginate(filtered, page, pageSize),
    rows: filtered.slice((page - 1) * pageSize, page * pageSize).map((question) => ({
      ...question,
      options: [...question.options]
    }))
  };
}

export async function addQuestion(question) {
  if (await canUseBackend()) {
    const response = await client.post(
      "/addQuestion",
      formData({
        question: question.questionText,
        optiona: question.options[0],
        optionb: question.options[1],
        optionc: question.options[2],
        optiond: question.options[3],
        answer: String.fromCharCode(97 + question.answerIndex)
      })
    );

    if (response.data.code !== 1) {
      throw new Error(response.data.msg || "新增题目失败");
    }

    return true;
  }

  questions.unshift({
    id: Date.now(),
    questionText: question.questionText,
    options: [...question.options],
    answer: question.options[question.answerIndex],
    answerIndex: question.answerIndex,
    isDelete: 0,
    createTime: nowText(),
    updateTime: nowText()
  });
  return true;
}

export async function updateQuestion(question) {
  if (await canUseBackend()) {
    throw new Error("后端暂未提供编辑题目接口");
  }

  const target = questions.find((item) => item.id === question.id);
  if (!target) {
    throw new Error("题目不存在");
  }

  Object.assign(target, {
    questionText: question.questionText,
    options: [...question.options],
    answer: question.options[question.answerIndex],
    answerIndex: question.answerIndex,
    updateTime: nowText()
  });
  return true;
}

export async function deleteQuestion(id) {
  if (await canUseBackend()) {
    if (typeof id !== "number") {
      throw new Error("后端返回的题目缺少 id，无法删除");
    }

    const response = await client.get("/delQuestion", { params: { id } });
    if (response.data.code !== 1) {
      throw new Error(response.data.msg || "删除题目失败");
    }
    return true;
  }

  questions = questions.filter((question) => question.id !== id);
  return true;
}
