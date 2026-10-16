import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/user"
  },
  {
    path: "/user",
    name: "user",
    component: () => import("../views/element/UserView.vue"),
    meta: {
      title: "用户管理"
    }
  },
  {
    path: "/question",
    name: "question",
    component: () => import("../views/element/QuestionView.vue"),
    meta: {
      title: "题目管理"
    }
  }
];

const router = new VueRouter({
  routes
});

router.afterEach((route) => {
  document.title = `${route.meta.title || "管理"} | Quiz 后台管理`;
});

export default router;
