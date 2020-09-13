// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import router from "./router";

Vue.config.productionTip = false;

// vue-resource
// 在服务器通讯方面，在升级到 vue 2.0 后，官方已经取消对 vue-resource 的更新而是转推 Axios
// import VueResource from 'vue-resource'
// Vue.use(VueResource)

// 将全局样式文件写在 main.js
import "@/assets/scss/reset.scss";
import "@/assets/scss/iconfont.scss";
import "@/assets/ali-fonts/iconfont.css";

// Mint UI
import Mint from "mint-ui";
import "mint-ui/lib/style.css";
Vue.use(Mint);

import "@/assets/mui/css/mui.min.css";
import mui from "@/assets/mui/js/mui.min.js";
Vue.prototype.mui = mui;

import VueLazyload from 'vue-lazyload'  //引入这个懒加载插件
Vue.use(VueLazyload, {
  loading: require('./assets/img/wait.gif'),//加载中图片，一定要有，不然会一直重复加载占位图
  error: require('./assets/img/error.png') //加载失败图片
});

import VueI18n from "vue-i18n";
Vue.use(VueI18n);
const i18n = new VueI18n({
  locale: "en_US", // 语言标识, 通过切换locale的值来实现语言切换,this.$i18n.locale
  messages: {
    zh_CN: require("./assets/lang/zh"), // 中文语言包
    en_US: require("./assets/lang/en") // 英文语言包
  }
});
Vue.directive('title', {//??????
  inserted: function (el, binding) {
    document.title = el.dataset.title
  }
})
/* eslint-disable no-new */
new Vue({
  el: "#app",
  i18n,
  router,
  template: "<App/>",
  components: { App }
});
