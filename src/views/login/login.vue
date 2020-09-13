<!-- 登录 组件 -->

<template>
  <div class="login">
    <header-bar text="登录注册页" @back="back"></header-bar>

    <mt-navbar v-model="selected">
      <mt-tab-item id="1">登录</mt-tab-item>
      <mt-tab-item id="2">注册</mt-tab-item>
    </mt-navbar>

    <mt-tab-container v-model="selected">
      <!-- 登录 -->
      <mt-tab-container-item id="1" class="login-wrapper">
        <mt-field label="用户名" placeholder="请输入用户名" v-model="login_username"></mt-field>
        <mt-field label="密码" placeholder="请输入密码" type="password" v-model="login_password"></mt-field>

        <mt-button type="primary" size="large" @click.native="login">登录</mt-button>
      </mt-tab-container-item>

      <!-- 注册 -->
      <mt-tab-container-item id="2" class="register-wrapper">
        <mt-field label="用户名" placeholder="请输入用户名" v-model="register_username"></mt-field>
        <mt-field label="邮箱" placeholder="请输入邮箱" type="email" v-model="register_email"></mt-field>
        <mt-field label="密码" placeholder="请输入密码" type="password" v-model="register_password1"></mt-field>
        <mt-field label="确认密码" placeholder="请确认密码" type="password" v-model="register_password2"></mt-field>

        <mt-button type="primary" size="large" @click.native="register">注册</mt-button>
      </mt-tab-container-item>
    </mt-tab-container>
  </div>
</template>

<script>
import HeaderBar from "@/coms/header-bar/header-bar";

import axios from "axios";
import storage from "@/global/storage.js";
import api from "@/global/api.js";

import md5 from "js-md5";
import { Toast } from "mint-ui";

export default {
  components: {
    HeaderBar
  },
  data() {
    return {
      selected: "1",
      login_username: "",
      login_password: "",
      register_username: "",
      register_email: "",
      register_password1: "",
      register_password2: ""
    };
  },
  props: {},
  watch: {},
  methods: {
    back() {
      //重定向
      let uri = this.$route.query.uri;
      console.log("uri: " + uri);
      if (uri) {
        this.$router.push({ path: uri });
      }
    },
    login() {
      let that = this;
      axios
        .get(
          api.login +
            "?account=" +
            this.login_username +
            "&md5=" +
            md5(this.login_username + this.login_password)
        )
        .then(res => {
          if (0 == res.data.code) {
            //vuex传参数据
            //先只支持一个人一个餐馆
            var restaurant = res.data.data[0];
            var token = res.data.token;

            var par = {};
            par.username = that.login_username;

            par.token = token;

            par.pass = "";

            that.loginSuccess(par, restaurant);
          } else {
            // this.$message.error('登录失败!用户名或密码错误!');
            this.fullscreenLoading = false;
            Toast("登录失败!用户名或密码错误!!");
            console.log("登录失败!用户名或密码错误!!");
            return false;
          }
        })
        .catch(err => {
          Toast("网络异常: " + err);
          console.log(err);
        });
    },
    register() {
      console.log("register");
    },

    loginSuccess(userInfo, restaurantInfo) {
      storage.setLocalstorage("user", "userInfo", {
        username: userInfo.username,
        token: userInfo.token
      });

      storage.setLocalstorage("user", "restaurantInfo", {
        rid: restaurantInfo.id,
        name: restaurantInfo.name,
        pic_url: restaurantInfo.pic_url,
        uuid: restaurantInfo.uuid
      });
      //重定向
      let uri = this.$route.query.uri;
      console.log("uri: " + uri);
      if (uri) {
        this.$router.push({ path: uri });
      }
    }
  },
  filters: {},
  computed: {},
  created() {},
  mounted() {}
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/const.scss";
@import "~@/assets/scss/mixin.scss";

.login {
  color: #333;
  margin-top: 40px;
  background-color: #fff;
  overflow: visible;
  .login-wrapper {
    margin-top: 20px;
    overflow: hidden;
    .mint-button {
      margin-top: 30px;
    }
  }
  .register-wrapper {
    margin-top: 20px;
    overflow: hidden;
    .mint-button {
      margin-top: 30px;
    }
  }
}
</style>
