import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

// 路由懒加载
import login from "@/views/login/login";

import Tables from "@/views/goods/tables";

import PC from "@/views/assistant/pc";
import List from "@/views/assistant/restaurant-list";
import Pad from "@/views/assistant/pad";
import Scan from "@/views/assistant/restaurant";


import Orders from "@/views/assistant/order";
import HistoryOrders from "@/views/assistant/history-orders"
import Ordering from "@/views/assistant/ordering"

export default new Router({
  routes: [
    // 根路径
    {
      path: "/",
      component: List
    },
    {
      path: "/term",
      redirect: "/term/pad",
      component: Pad
    },
    // 登录
    {
      path: "/login",
      component: login
    },
    {
      path: "/tables",
      component: Tables
    },

    //term
    {
      path: "/term/pad",
      component: Pad
    },
    //term
    {
      path: "/term/pc",
      component: PC
    },
    {
      path: "/term/restaurant",
      component: Scan
    },
    {
      path: "/term/orders",
      component: Orders
    },
    {
      path: "/term/historyorders",
      component: HistoryOrders
    }, {
      path: "/term/ordering",
      component: Ordering
    }
  ]
});
