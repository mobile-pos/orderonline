<!-- 购物车 组件 -->

<template>
  <div class="shopcart">
    <!-- 购物车 -->
    <div class="content">
      <!-- 主要内容 -->
      <div class="main-content" @click="toggleList">
        <div class="left">
          <div class="logo-wrapper">
            <div class="logo" :class="{ logoLight: totalCount > 0 }">
              <i class="icon-shopping_cart"></i>
            </div>
            <div class="totalCount" v-show="totalCount > 0">{{ totalCount }}</div>
          </div>

          <div class="price" :class="{ priceLight: totalCount > 0 }">$ {{ totalPrice }}</div>
          <!-- <div class="desc">另需配送费 {{ deliveryPrice }} 元</div> -->
        </div>

        <div class="right" @click.stop="pay">
          <div class="pay" :class="{ payLight: newFoodCount > 0 }">{{ payDesc }}</div>
        </div>
      </div>

      <!-- 飞行小球 -->
      <div class="ball-content">
        <div v-for="ball in balls">
          <transition
            name="drop"
            @before-enter="beforeDrop"
            @enter="dropping"
            @after-enter="afterDrop"
          >
            <div class="ball" v-show="ball.show">
              <div class="inner inner-hook"></div>
            </div>
          </transition>
        </div>
      </div>

      <!-- 购物车列表 -->
      <transition name="fold">
        <div class="shopcart-list" v-show="listShow">
          <div class="list-header">
            <h1 class="title">{{ $t("message.shopcarts.shopcart") }}</h1>
            <span class="empty" @click="cleanShopcar">
              {{
              $t("message.shopcarts.empty")
              }}
            </span>
          </div>

          <div class="list-content" ref="listContentRef">
            <ul>
              <li class="food-item" v-for="food in selectFoods">
                <div class="food-item-detail">
                  <div class="food-item-name">{{ food.name }}</div>
                  <div class="food-item-flavor">
                    <template v-for="flavor in food.flavor">
                      <div>+ {{ flavor }}</div>
                    </template>
                  </div>

                  <div class="food-item-price">
                    <span>{{ $t("message.goods.currency") }}{{ food.price }}</span>
                  </div>

                  <template v-if="!food.reid">
                    <div class="food-item-control">
                      <cart-control :food="food" @change="foodChanged"></cart-control>
                    </div>
                  </template>
                  <template v-else>
                    <div class="food-item-control">{{ food.status }}</div>
                  </template>
                  <div style="clear:both" />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>

    <!-- 模糊背景 -->
    <transition name="fade">
      <div class="background" @click="hideList" v-show="listShow"></div>
    </transition>

    <!-- 需要确认身份 -->
    <dlg-modal :is-show="contactShow" :top-distance="10" @on-close="onContactClose">
      <div slot="header">
        <div class="title-food-name">{{ $t("message.shopcart.contact.confirmContact") }}</div>
      </div>
      <div style="width:100%;" slot="main">
        <div class="form">
          <mt-field
            v-bind:label="$t('message.shopcart.contact.phone')"
            v-bind:placeholder="$t('message.shopcart.contact.phoneTips')"
            type="tel"
            v-model="consumerInfo.phone"
            @blur.native.capture="canNotEmpty($event)"
          ></mt-field>
          <mt-field
            v-bind:label="$t('message.shopcart.contact.name')"
            v-bind:placeholder="$t('message.shopcart.contact.nameTips')"
            v-model="consumerInfo.name"
            @blur.native.capture="canNotEmpty($event)"
          ></mt-field>
          <mt-field
            v-bind:label="$t('message.shopcart.contact.address')"
            v-bind:placeholder="$t('message.shopcart.contact.addressTips')"
            v-model="consumerInfo.address"
            @blur.native.capture="canNotEmpty($event)"
          ></mt-field>
        </div>
        <div class="gratuity-info">
          <mt-field
            v-bind:label="$t('message.shopcart.contact.gratuity')"
            v-bind:placeholder="$t('message.shopcart.contact.gratuityTips')"
            type="number"
            v-model="consumerInfo.gratuity"
          >$</mt-field>
        </div>
        <div class="extend-info">
          <mt-field
            v-bind:label="$t('message.shopcart.contact.mark')"
            v-bind:placeholder="$t('message.shopcart.contact.markTips')"
            type="textarea"
            rows="4"
            v-model="consumerInfo.mark"
          ></mt-field>
        </div>

        <div class="pay-info-tips">
          <label>{{ this.$t("message.shopcart.contact.pay-tips") }}</label>
        </div>
      </div>
      <!-- <div class="addtion-by-write"></div> -->
      <div style="width:100%;height:0px" slot="footer">
        <!-- <div class="footer-controller">
          <div class="contact-submit" @click="submitContactConfirm">确定</div>
          <div class="contact-cancel" @click="cancelContact">取消</div>
        </div>-->
        <div style="text-align:center;">
          <mt-button
            type="default"
            style="width: 30%;margin-right: 10px;"
            @click="submitContactConfirm"
          >{{ $t("message.button.sure") }}</mt-button>
          <mt-button
            type="default"
            style="width: 30%; margin-left: 10px;"
            @click="cancelContact"
          >{{ $t("message.button.cancel") }}</mt-button>
        </div>
      </div>
    </dlg-modal>
  </div>
</template>

<script>
import CartControl from "@/coms/cart-control/cart-control";
import BScroll from "better-scroll";
import { MessageBox } from "mint-ui";
import { Toast } from "mint-ui";
import { Field } from "mint-ui";
import { Button } from "mint-ui";

import axios from "axios";
import storage from "@/global/storage.js";
import api from "@/global/api.js";
import dialog from "@/coms/dialog/dialog";

export default {
  components: {
    CartControl,
    "dlg-modal": dialog
  },
  data() {
    return {
      // 每个小球当前的状态
      balls: [
        { show: false },
        { show: false },
        { show: false },
        { show: false },
        { show: false },
        { show: false },
        { show: false },
        { show: false },
        { show: false },
        { show: false }
      ],
      // 已经下落的小球（show = true）
      dropBalls: [],
      // 购物车列表是否折叠
      listShow: false,

      contactShow: false,
      consumerInfo: {
        phone: null,
        name: null,
        address: null,
        gratuity: 0.0,
        mark: ""
      },
      newFoodCount: 0
    };
  },
  props: {
    // 加入购物车的商品
    selectFoods: {
      type: Array,
      default() {
        return [];
      }
    },
    // 配送费
    deliveryPrice: {
      type: Number,
      default: 0
    },
    // 起送费
    minPrice: {
      type: Number,
      default: 0
    },
    rid: {
      type: Number,
      default: 0 //测试餐馆
    },
    uuid: {
      type: String,
      default: "00000000000"
    },
    seat: {
      type: String,
      default: "" //外卖，即不是堂吃
    }
  },
  watch: {
    selectFoods() {
      if (this.scroll) {
        this.scroll.refresh();
      }
    }
  },
  methods: {
    // 点击 + 派发的事件
    // 取一个未下落的小球执行接下来的下落动作
    drop(el) {
      for (let i = 0; i < this.balls.length; i++) {
        let ball = this.balls[i];
        if (!ball.show) {
          ball.show = true;
          ball.el = el;
          this.dropBalls.push(ball);
          return;
        }
      }
    },
    // 对 show = true 的小球设置动作
    beforeDrop(el) {
      let count = this.balls.length;

      while (count--) {
        let ball = this.balls[count];
        if (ball.show) {
          let rect = ball.el.getBoundingClientRect();
          let x = rect.left - 32;
          let y = -(window.innerHeight - rect.top - 22);

          el.style.display = "";
          el.style.webkitTransform = `translate3d(0,${y}px,0)`;
          el.style.transform = `translate3d(0,${y}px,0)`;

          let inner = el.getElementsByClassName("inner-hook")[0];
          inner.style.webkitTransform = `translate3d(${x}px,0,0)`;
          inner.style.transform = `translate3d(${x}px,0,0)`;
        }
      }
    },
    dropping(el, done) {
      /* eslint-disable no-unused-vars */
      let rf = el.offsetHeight; // 重绘，否则小球不会消失
      this.$nextTick(() => {
        el.style.webkitTransform = "translate3d(0,0,0)";
        el.style.transform = "translate3d(0,0,0)";

        let inner = el.getElementsByClassName("inner-hook")[0];
        inner.style.webkitTransform = "translate3d(0,0,0)";
        inner.style.transform = "translate3d(0,0,0)";

        el.addEventListener("transitionend", done);
      });
    },
    // 动作做完就把该小球 show=false
    afterDrop(el) {
      let ball = this.dropBalls.shift();
      if (ball) {
        ball.show = false;
        el.style.display = "none";
      }
    },
    toggleList() {
      if (!this.totalCount) {
        return;
      }

      this.listShow = !this.listShow;

      // 初始化 better-scroll
      if (this.listShow) {
        // setTimeout
        this.$nextTick(() => {
          if (!this.scroll) {
            this.scroll = new BScroll(this.$refs.listContentRef, {
              click: true
            });
          } else {
            this.scroll.refresh();
          }
        }, 20);
      }
    },
    // 支付
    pay() {
      if (this.totalPrice < this.minPrice) {
        return;
      }
      if (this.seat == "") {
        this.contactShow = true; //不管什么时候都需要消费者确认地址
      } else {
        this.order();
      }
    },

    getQueueNo() {
      let that = this;
      axios
        .get(api.orders.queueNo + "?rid=" + this.rid + "&uuid=" + this.uuid)
        .then(res => {
          if (0 != res.data.code) {
            Toast(this.$t("message.errorTips.otherCode") + res.data.msg);
            return;
          }

          that.queueNo = res.data.data.qno;
          that.beforeCount = res.data.data.count;

          that.order();
        })
        .catch(error => {
          // Toast("网络异常,请稍后重试");
          Toast(this.$t("message.errorTips.netError"));
        });
    },
    order() {
      var order = JSON.stringify(this.selectFoods);

      var apiUri = api.orders.newOrderOnline;

      let that = this;

      var sid = "";
      if (this.consumerInfo.phone) {
        sid = "AD-" + this.consumerInfo.phone.trim();
      }

      var addr = "";
      if (this.consumerInfo.address) {
        addr = this.consumerInfo.address.trim();
      }

      if (this.seat != "") {
        sid = "TC-" + this.seat;
        addr = "";
      }

      axios
        .get(
          apiUri +
            "?rid=" +
            this.rid +
            "&uuid=" +
            this.uuid +
            "&sid=" +
            sid +
            "&order=" +
            encodeURIComponent(order) +
            "&gratuity=" +
            this.consumerInfo.gratuity +
            "&mark=" +
            this.consumerInfo.mark +
            "&totalPrice=" +
            this.totalPrice +
            "&addr=" +
            addr
        )
        .then(res => {
          if (res.data.code === 0) {
            Toast(this.$t("message.shopcart.orderedTips"));
            //保存当前订单的信息，订单号，每个 菜名对应的号码
            that.orderId = res.data.data.oid;
            var receipts = res.data.data.reids;
            let foods = that.selectFoods;
            that.selectFoods = [];
            //直接这样修改，不会改变computed的值，对于 array的变量来说
            // that.selectFoods.forEach(food => {
            //   food.reid = receipts[food.name];
            //   food.status = "排队中";
            // });
            for (var i = 0; i < foods.length; i++) {
              let food = foods[i];
              food.reid = receipts[food.name];
              food.status = this.$t("message.shopcart.state.queueUp");

              that.selectFoods.push(food);
            }

            //调起支付接口
            var payOrderId = res.data.payOrder.payParams.prepayId;
            window.location.href = "https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?prepay_id=" + payOrderId + "&package=&redirect_url=https%3a%2f%2fpay.priusis.com%2fppay-demo"

            //订单下完后，清空购物车
            that.cleanShopcar();
          } else {
            Toast(this.$t("message.errorTips.otherCode") + res.data.msg);
          }
        })
        .catch(error => {
          Toast(this.$t("message.errorTips.netError"));
        });
    },

    // timer() {
    //   let that = this;
    //   return setTimeout(() => {
    //     //查询状态
    //     axios
    //       .get(
    //         api.orders.checkOrderStatus +
    //           "?rid=" +
    //           this.rid +
    //           "&uuid=" +
    //           this.uuid +
    //           "&sid=" +
    //           this.consumerInfo.phone.trim() +
    //           "&oid=" +
    //           that.orderId
    //       )
    //       .then(res => {
    //         if (res.data.code === 0) {
    //           //保存当前订单的信息，订单号，每个 菜名对应的号码
    //           var foods = res.data.data;
    //           that.selectFoods.forEach(food => {
    //             var status = foods[food.name].status;

    //             if (0 == status)
    //               food.status = this.$t("message.shopcart.state.queueUp");
    //             else if (1 == status)
    //               food.status = this.$t("message.shopcart.state.cooking");
    //             else if (2 == status)
    //               food.status = this.$t("message.shopcart.state.delivering");
    //             else if (3 == status)
    //               food.status = this.$t("message.shopcart.state.finish");
    //           });
    //           //如果页面没关闭，则定时查询当前订单中的上菜的状态

    //           that.timer();
    //         } else {
    //           // Toast(this.$t("message.errorTips.otherCode") + res.data.msg);
    //           console.log("返回非0值: ", res.data.code, res.data.msg);
    //         }
    //       })
    //       .catch(error => {
    //         console.log(error);
    //         Toast(this.$t("message.errorTips.netError"));
    //       });
    //   }, 5 * 1000);
    // },
    _saveContact() {
      let that = this;
      axios
        .get(
          api.consumers.update +
            "?rid=" +
            this.rid +
            "&uuid=" +
            this.uuid +
            "&contact=" +
            encodeURIComponent(JSON.stringify(this.consumerInfo))
        )
        .then(res => {
          if (0 != res.data.code) {
            Toast(this.$t("message.errorTips.otherCode") + res.data.msg);
            return;
          }
          //保存到本地缓存
          storage.setLocalstorage("user", "consumerInfo", that.consumerInfo);
          // that.$emit("updateContact", that.consumerInfo);
          that.$parent.updateContact(that.consumerInfo);
          //这个时候可以下单了

          let msgInfo =
            this.$t("message.shopcart.tips.orderAlarm1") +
            " " +
            this.totalPrice +
            " $，" +
            this.$t("message.shopcart.tips.orderAlarm2");
          // mint UI
          MessageBox.confirm(msgInfo, this.$t("message.shopcart.tips.order"))
            .then(action => {
              //提交更新信息
              that.getQueueNo();
            })
            .catch(error => {
              Toast(this.$t("message.abortOpt.abortOptions"));
              console.log(error);
            });
        })
        .catch(error => {
          Toast(this.$t("message.errorTips.netError"));
          console.log("网络异常，请稍后重试: " + error);
        });
    },
    // 清空
    cleanShopcar() {
      this.selectFoods.forEach(food => {
        food.count = 0;
      });

      this.listShow = false;

      this.selectFoods = [];

      this.$emit("cleanShopcar");
    },
    hideList() {
      this.listShow = false;
    },
    foodChanged(food) {
      var k = food.name + JSON.stringify(food.flavor);
      if (food.reid) {
        k = k + food.reid;
      }

      var that = this;
      var index = 0;
      Object.keys(this.selectFoods).forEach(key => {
        var f = that.selectFoods[key];

        var k_ = f.name + JSON.stringify(f.flavor);
        if (f.reid) {
          k_ = k_ + f.reid;
        }
        if (k === k_) {
          //触发视图更新
          if (food.count == 0) {
            that.selectFoods.splice(key, 1);
          } else {
            that.selectFoods.splice(key, 1, food);
          }
        }
      });
    },
    onContactClose() {
      console.log("consumer contact onclose");
      this.contactShow = false;
    },
    submitContactConfirm() {
      console.log("consumer contact confirm");

      if (
        !this.consumerInfo.name ||
        !this.consumerInfo.phone ||
        !this.consumerInfo.address
      ) {
        Toast(this.$t("message.shopcart.contact.incompleteInfor"));
        return;
      }

      this.contactShow = false;
      this._saveContact();
    },
    cancelContact() {
      console.log("consumer contact canceled");
      this.contactShow = false;
    },
    canNotEmpty(event) {
      console.log(event);
    }
  },
  filters: {},
  computed: {
    // 所选商品总价
    totalPrice() {
      let total = 0;
      this.selectFoods.forEach(food => {
        // if (food.reid) {
        //   return;
        // }
        total += food.price * food.count;
      });
      return total;
    },
    // 所选商品总数量
    totalCount() {
      let total = 0;
      this.selectFoods.forEach(food => {
        total += food.count;
      });
      return total;
    },
    // 20元起送 、 还差10元起送 、 去结算
    payDesc() {
      //如果已有点好菜品，则为追加菜单
      let bappend = false;
      this.newFoodCount = 0;

      for (var i = 0; i < this.selectFoods.length; i++) {
        let food = this.selectFoods[i];
        if (food.hasOwnProperty("reid") == true && food.reid > 0) {
          bappend = true;
        } else {
          this.newFoodCount += 1;
        }
      }
      if (bappend) {
        return this.$t("message.shopcart.button.payDesc2");
      } else {
        return this.$t("message.shopcart.button.payDesc1");
      }
    }
  },
  created() {},
  mounted() {
    this.consumerInfo = storage.getLocalstorage("user", "consumerInfo", {});
    console.log("seatId: ", this.seat);
  },
  destroyed() {}
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/const.scss";
@import "~@/assets/scss/mixin.scss";

.shopcart {
  .content {
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 48px;
    z-index: 50;
    .main-content {
      display: flex;
      width: 100%;
      height: 48px;
      max-width: 600px;
      font-size: 0;
      background-color: #141d27;
      .left {
        flex: 1;
        .logo-wrapper {
          display: inline-block;
          position: relative;
          top: -10px;
          box-sizing: border-box;
          margin: 0 12px;
          padding: 6px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          vertical-align: top;
          text-align: center;
          background-color: #141d27;
          .logo {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #2b343c;
            i {
              font-size: 24px;
              line-height: 44px;
              color: #80858a;
            }
          }
          .logoLight {
            background-color: #ffda61;
            & i {
              color: #333;
            }
          }
          .totalCount {
            position: absolute;
            right: 0;
            top: 0;
            width: 24px;
            height: 16px;
            line-height: 16px;
            border-radius: 12px 12px;
            font-size: 9px;
            font-weight: 700;
            color: #fff;
            background-color: rgb(240, 20, 20);
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.4);
          }
        }
        .price {
          display: inline-block;
          box-sizing: border-box;
          margin-top: 12px;
          padding-right: 12px;
          vertical-align: top;
          font-size: 16px;
          line-height: 24px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.4);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          &.priceLight {
            color: #fff;
          }
        }
        .desc {
          display: inline-block;
          vertical-align: top;
          line-height: 24px;
          margin: 12px 0 0 12px;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.4);
        }
      }
      .right {
        flex: 0 0 105px;
        width: 105px;
        text-align: center;
        .pay {
          height: 48px;
          line-height: 48px;
          font-size: 12px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.4);
          background-color: #2b333b;
          &.payLight {
            background-color: #ffda61;
            color: #333;
          }
        }
      }
      // 适配 iPhone 5
      @media screen and (max-width: 320px) {
        .right {
          flex: 0 0 80px;
          width: 80px;
          text-align: center;
        }
      }
    }
    // 飞行小球
    .ball-content {
      .ball {
        position: fixed;
        left: 32px;
        bottom: 22px;
        z-index: 200;
        // http://cubic-bezier.com
        transition: all 0.4s cubic-bezier(0.49, -0.29, 0.75, 0.41);
      }
      .inner {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: #ffd161;
        transition: all 0.4s linear;
      }
    }
    // 购物车列表
    .shopcart-list {
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      // max-width: 600px;
      width: 100%;
      max-width: 600px;
      transform: translate3d(0, -100%, 0);
      &.fold-enter-active,
      &.fold-leave-active {
        transition: all 0.5s;
      }
      &.fold-enter,
      &.fold-leave-active {
        transform: translate3d(0, 0, 0);
      }
      .list-header {
        height: 40px;
        line-height: 40px;
        padding: 0 18px;
        background-color: #f3f5f7;
        border-bottom: 1px solid rgba(7, 17, 27, 0.1);
        .title {
          float: left;
          font-size: 14px;
          color: rgb(7, 17, 27);
        }
        .empty {
          float: right;
          font-size: 12px;
          color: rgb(0, 160, 220);
        }
      }
      .list-content {
        max-height: 400px;
        padding: 0 18px;
        background-color: #fff;
        overflow: hidden;
        .food-item {
          position: relative;
          padding: 12px 0;
          box-sizing: border-box;
          border-bottom: 1px solid rgba(7, 17, 27, 0.1);
          padding: 10px;
          overflow: hidden;
          .food-item-detail {
            position: relative;
            padding: 10px;
            overflow: hidden;
            .food-item-name {
              line-height: 24px;
              font-size: 16px;
              color: rgb(58, 143, 228);
            }

            .food-item-flavor {
              font-size: smaller;
              position: relative;
              bottom: 0px;
              left: 80px;
            }
            .food-item-status {
              font-size: x-small;
              position: absolute;
              right: 120px;
              bottom: 12px;
            }

            .food-item-price {
              position: absolute;
              right: 95px;
              bottom: 12px;
              line-height: 24px;
              font-size: 14px;
              font-weight: 700;
              color: rgb(240, 20, 20);
            }
            .food-item-control {
              position: absolute;
              right: 0;
              bottom: -5px;
            }
          }
        }
      }
    }
  }
  // 模糊背景
  .background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 40;
    opacity: 1;
    backdrop-filter: blur(10px);
    background-color: rgba(7, 17, 27, 0.6);
    &.fold-enter-active,
    &.fold-leave-active {
      transition: all 0.5s;
    }
    &.fold-enter,
    &.fold-leave-active {
      opacity: 0;
      background: rgba(7, 17, 27, 0);
    }
  }
}

.footer-controller {
  width: 250px;
  background: #dfce7c;
  // position: absolute;
  // right: 100px;
  .contact-submit {
    position: absolute;
    text-align: center;
    color: blue;
    background: #dfd5a6;
    right: 150px;
    width: 100px;
    height: 50px;
    // margin-right: 20px;
  }
  .contact-cancel {
    position: absolute;
    text-align: center;
    color: blue;
    background: #e4dbae;
    right: 10px;
    width: 100px;
    height: 50px;
    // margin-right: 20px;
  }
}
</style>
