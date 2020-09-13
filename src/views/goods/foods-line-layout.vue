<!-- 商家模块 点菜页面 -->

<template>
  <div>
    <!-- 左右联动 -->
    <div class="goods">
      <!-- 左侧菜单 -->
      <div class="menu-wrapper" ref="menuRef">
        <ul>
          <li
            class="menu-item"
            v-for="(item, index) in goods"
            :class="{ current: currentIndex === index }"
            @click="selectMenu(index, $event)"
            v-bind:key="index"
          >
            <span class="text">
              <span
                class="icon"
                v-show="item.type > 0"
                :class="classMap[item.type]"
              ></span>
              {{ showCategoryName(item) }}
            </span>
          </li>
        </ul>
      </div>

      <!-- 右侧食物列表 -->
      <div class="foods-wrapper" ref="foodsRef">
        <ul>
          <li
            class="foods-list foods-list-hook"
            v-for="(item, index) in goods"
            ref="foodList"
            v-bind:key="index"
          >
            <h1 class="title">{{ showCategoryName(item) }}</h1>

            <ul>
              <li
                class="foods-item"
                v-for="(food, index) in item.foods"
                v-bind:key="index"
              >
                <div class="icon">
                  <img v-bind:src="food.icon" />
                </div>

                <div class="content">
                  <h2 class="name">{{ showFoodName(food) }}</h2>
                  <p class="desc">{{ showFoodDesc(food) }}</p>

                  <div class="extra">
                    <span class="count"
                      >{{ $t("message.goods.selledInMonth")
                      }}{{ food.sellCount }}
                      {{ $t("message.goods.unit") }}</span
                    >
                    <span class="rating"
                      >{{ $t("message.goods.goodEvaluate") }}
                      {{ food.rating }}%</span
                    >
                  </div>

                  <div class="price">
                    <span class="now">$ {{ food.price }}</span>
                    <span
                      class="old"
                      v-show="food.oldPrice"
                      v-if="food.price < food.oldPrice"
                      >$ {{ food.oldPrice }}</span
                    >
                  </div>

                  <div v-if="food.rest != 0" class="control">
                    <template v-if="hasMustOption(food)">
                      <div class="detail" @click="selFlavors(food, $event)">
                        {{ $t("message.goods.selectFlavor") }}
                      </div>
                    </template>
                    <template v-else>
                      <cart-control
                        :food="food"
                        @addFoodToShopcar="addFoodToShopcar"
                        class="cart-control-item"
                      ></cart-control>
                      <img
                        src="/static/img/more.png"
                        @click="selFlavors(food, $event)"
                      />
                    </template>
                  </div>
                  <div v-else class="control loaded">
                    <div
                      class="stamp-en"
                      v-if="$t('message.lang') == 'en'"
                    ></div>
                    <div class="stamp-zh" v-else></div>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <!-- 购物车 -->
      <shopcart
        ref="shopcartRef"
        :selectFoods="selectFoods"
        :deliveryPrice="0"
        :minPrice="1.0"
        :seat="seatId"
        :rid="rid"
        :uuid="uuid"
        @cleanShopcar="cleanShopcar"
      ></shopcart>
    </div>

    <dlg-modal :is-show="showFalvors" :top-distance="10" @on-close="onClose">
      <div slot="header">
        <div class="title-food-name">{{ curFood.name }}</div>
        <div class="title-food-price">
          {{ $t("message.goods.currency") }} {{ curFood.price }}
        </div>
      </div>
      <div style="width:100%;height: 325px" slot="main">
        <flavors
          :food="curFood"
          @changeFlavor="changeFlavor"
          :rid="rid"
          :uuid="uuid"
          ref="flavorRef"
        />
      </div>
      <div class="addtion-by-write"></div>
      <div style="width:100%; background-color: black;" slot="footer">
        <div class="add-food-control" style="width:120px;float:left">
          <cart-control :food="curFood" @drop="drop"></cart-control>
        </div>
        <div
          class="add-food-to-shopcar"
          @click="addFoodToShopcar(curFood, $event)"
        >
          {{ $t("message.goods.inputShopCar") }}
        </div>
      </div>
    </dlg-modal>
  </div>
</template>

<script>
import Shopcart from "@/coms/shopcart/shopcart-for-app";
import CartControl from "@/coms/cart-control/cart-control";
import BScroll from "better-scroll";
import axios from "axios";
import { MessageBox } from "mint-ui";
import { Toast } from "mint-ui";


import api from "@/global/api.js";

import dialog from "@/coms/dialog/dialog";
import flavors from "./flavors";

export default {
  components: {
    "cart-control": CartControl,
    Shopcart,
    flavors,
    "dlg-modal": dialog
  },
  data() {
    return {
      // 商品数据
      goods: [],
      classMap: ["decrease", "discount", "special", "invoice", "guarantee"],
      // 右侧每一大项的高度区间
      // (10) [0, 1172, 1343, 1478, 1828, 2070, 2334, 2685, 3251, 4035]
      listHeight: [],
      // 计算当前滚动的 Y 值
      scrollY: 0,
      //动态信息
      rid: this.$route.query.rid,
      uuid: this.$route.query.uuid,
      seatId: this.$route.query.sid,

      //
      showFalvors: false,

      selectFoods: [],
      //
      curFood: {
        name: ""
      }
    };
  },

  methods: {
    // 初始化数据
    _initData() {
      let that = this;
      axios
        .get(api.foods + "?rid=" + this.rid + "&uuid=" + this.uuid)
        .then(res => {
          if (res.data.code != 0) {
            Toast(this.$t("message.errorTips.otherCode") + res.data.msg);
            return;
          }

          //判断是否有必选项
          that.goods = res.data.data;

          that._initSpecialFoods();
        })
        .catch(err => {
          console.log(err);
          Toast(this.$t("message.errorTips.netError"));
        });
    },

    _initSpecialFoods() {
      let that = this;
      axios
        .get(api.specialFoods + "?rid=" + this.rid + "&uuid=" + this.uuid)
        .then(res => {
          if (res.data.code != 0) {
            Toast(this.$t("message.errorTips.otherCode") + res.data.msg);
            return;
          }

          //判断是否有必选项
          that.goods = res.data.data.concat(that.goods);

          // DOM 渲染完成才能进行计算
          setTimeout(() => {
            // 初始化 BScroll
            this._initScroll();
            // 计算右侧每一大项的高度
            this._calcHeight();
          }, 20);
        })
        .catch(err => {
          console.log(err);
          Toast(this.$t("message.errorTips.netError"));
        });
    },

    // 初始化 BScroll
    _initScroll() {
      this.menuScroll = new BScroll(this.$refs.menuRef, {
        click: true
      });
      this.foodsScroll = new BScroll(this.$refs.foodsRef, {
        click: true,
        probeType: 3
      });

      this.foodsScroll.on("scroll", pos => {
        this.scrollY = Math.abs(Math.floor(pos.y));
        // console.log(this.scrollY)
      });
    },
    // 计算右侧每一大项的高度
    _calcHeight() {
      let foodList = this.$refs.foodsRef.getElementsByClassName(
        "foods-list-hook"
      );
      let height = 0;
      this.listHeight.push(height);

      for (let i = 0; i < foodList.length; i++) {
        height += foodList[i].clientHeight;
        this.listHeight.push(height);
      }
      // (10) [0, 1172, 1343, 1478, 1828, 2070, 2334, 2685, 3251, 4035]
      // console.log(this.listHeight)
    },
    // better-scroll 默认会阻止浏览器的原生 click 事件。
    // 当设置为 true，better-scroll 会派发一个 click 事件
    // 我们会给派发的 event 参数加一个私有属性 _constructed，值为 true
    selectMenu(index, event) {
      // 防止pc端触发两次点击
      if (!event._constructed) {
        return;
      }

      let foodList = this.$refs.foodsRef.getElementsByClassName(
        "foods-list-hook"
      );
      let el = foodList[index];
      this.foodsScroll.scrollToElement(el, 100);
    },
    drop(target) {
      // 性能优化，异步异步执行下落动画
      this.$nextTick(() => {
        this.$refs.shopcartRef.drop(target);
      });
    },
    selFlavors(food, event) {
      console.log(food);
      console.log(event);

      var instance = Object.assign({}, food, {});
      this.curFood = instance;

      if (!this.curFood.count) {
        this.curFood.count = 1;
      }

      this.showFalvors = true;
    },
    changeFlavor(food, event) {
      if (!this.curFood.flavor) {
        this.curFood.flavor = [this.$t("message.goods.normal")];
      }

      this.curFood.flavor = food.flavor;
    },
    onClose() {
      this.showFalvors = false;
      //把绑定的弹窗数组 设为false即可关闭弹窗
    },
    // 加入购物车
    addFoodToShopcar(food, event) {
      this.curFood = food;

      //计算需求
      if (this.$refs.flavorRef) {
        this.curFood = this.$refs.flavorRef.getFood();
      }

      if (!this.curFood.flavor) {
        this.curFood.flavor = [];
      }
      if (!this.curFood.count) {
        this.curFood.count = 1;
      }

      if (Object.keys(this.curFood.flavor).length == 0) {
        this.curFood.flavor.push(this.$t("message.goods.normal"));
      }

      this.onClose();

      let k = this.curFood.name + JSON.stringify(this.curFood.flavor);
      if (this.curFood.reid) {
        k = k + this.curFood.reid;
      }

      let added = false;
      let keys = Object.keys(this.selectFoods);
      for (var i = 0; i < keys.length; i++) {
        let food = this.selectFoods[i];
        let _k = food.name + JSON.stringify(food.flavor);
        if (food.reid) {
          _k = _k + food.reid;
        }
        if (_k == k) {
          food.count = food.count * 1 + this.curFood.count * 1;
          this.selectFoods.splice(i, 1, food);
          added = true;
        }
      }
      if (false == added) {
        this.selectFoods.push(this.curFood);
      }
    },
    cleanShopcar(event) {
      this.selectFoods = [];
    },

    onOrder() {
      //已完成下单
      //   this.cleanShopcar();
    },
    hasMustOption(food) {
      try {
        var f = JSON.parse(food.flavors);
        if (typeof f == "string") {
          f = JSON.parse(f);
        }

        let keys = Object.keys(f);
        for (var i = 0; i < keys.length; i++) {
          var k = keys[i];
          if (f[k].require && f[k].require === true) {
            return true;
          }
        }

        return false;
      } catch (error) {
        return false;
      }
    }
  },
  filters: {},
  computed: {
    currentIndex() {
      for (let i = 0; i < this.listHeight.length; i++) {
        let h1 = this.listHeight[i];
        let h2 = this.listHeight[i + 1];

        // 落到这个区间 或者 最后一个(无 h2)
        if ((this.scrollY >= h1 && this.scrollY < h2) || !h2) {
          return i;
        }
      }
      return 0;
    },
    showFoodName() {
      return function(food) {
        if ("en_US" == this.$i18n.locale) {
          return food.enName;
        } else {
          return food.name;
        }
      };
    },
    showFoodDesc() {
      return function(food) {
        if ("en_US" == this.$i18n.locale) {
          return food.enDescribe;
        } else {
          return food.description;
        }
      };
    },
    showCategoryName() {
      return function(category) {
        if ("en_US" == this.$i18n.locale) {
          return category.enName;
        } else {
          return category.name;
        }
      };
    }
  },
  created() {
    // 初始化数据
    this._initData();
    console.log("seatId: ", this.seatId);
  },
  mounted() {},
  destroyed() {}
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/const.scss";
@import "~@/assets/scss/mixin.scss";

.goods {
  display: flex;
  position: absolute;
  top: 40px;
  bottom: 46px;
  width: 100%;
  background-color: #fff;
  overflow: hidden;
  .menu-wrapper {
    flex: 0 0 120px;
    width: 120px;
    background-color: #f3f5f7;
    .menu-item {
      display: table;
      // width: 56px;
      height: 54px;
      line-height: 14px;
      padding: 0 12px;
      @include onepx("bottom", true);
      &.current {
        position: relative;
        margin-top: -1px;
        background-color: #fff;
        font-weight: 700;
        z-index: 10;
      }
      .text {
        font-size: 12px;
        display: table-cell;
        vertical-align: middle;
        .icon {
          display: inline-block;
          width: 12px;
          height: 12px;
          margin-right: 2px;
          background-size: 12px 12px;
          background-repeat: no-repeat;
          vertical-align: top;
          &.decrease {
            @include bg-image("./img/decrease_3");
          }
          &.discount {
            @include bg-image("./img/discount_3");
          }
          &.guarantee {
            @include bg-image("./img/guarantee_3");
          }
          &.invoice {
            @include bg-image("./img/invoice_3");
          }
          &.special {
            @include bg-image("./img/special_3");
          }
        }
      }
    }
  }
  .foods-wrapper {
    flex: 1;
    .foods-list {
      .title {
        padding-left: 14px;
        height: 26px;
        line-height: 26px;
        border-left: 2px solid #d9dde1;
        font-size: 12px;
        color: rgb(147, 153, 159);
        background-color: #f3f5f7;
      }
      .foods-item {
        position: relative;
        display: flex;
        margin: 18px;
        padding-bottom: 18px;
        @include onepx("bottom", true);
        .icon {
          flex: 0 0 57px;
          width: 57px;
          height: 57px;
          margin-right: 10px;
          img {
            width: 57px;
            height: 57px;
          }
        }
        .content {
          flex: 1;
          .name {
            font-size: 14px;
            margin: 2px 0 8px 0;
            height: 14px;
            line-height: 14px;
            color: rgb(7, 17, 27);
          }
          .desc {
            margin-bottom: 8px;
            line-height: 14px;
            font-size: 10px;
            color: rgb(147, 153, 159);
          }
          .extra {
            margin-bottom: 8px;
            line-height: 12px;
            font-size: 0;
            color: rgb(147, 153, 159);
            .count {
              font-size: 10px;
              margin-right: 12px;
            }
            .rating {
              font-size: 10px;
            }
          }
          .price {
            font-weight: 700;
            line-height: 24px;
            .now {
              margin-right: 8px;
              font-size: 14px;
              color: rgb(240, 20, 20);
            }
            .old {
              font-size: 10px;
              color: rgb(147, 153, 159);
              text-decoration: line-through;
            }
          }
          .control {
            bottom: -10px;
            width: 100%;
            position: relative;
            height: 30px;
            text-align: right;
            .detail {
              width: 40%;
              text-align: center;
              float: right;
              line-height: 24px;
              padding: 0 12px;
              -webkit-box-sizing: border-box;
              box-sizing: border-box;
              font-size: 10px;
              border-radius: 12px;
              color: #333;
              background-color: #ffd161;
              z-index: 10;
              &.fade-enter-active,
              &.fade-leave-active {
                transition: all 0.4s linear;
              }
              &.fade-enter,
              &.fade-leave-to {
                opacity: 0;
              }
            }

            .cart-control-item {
              position: absolute;
              width: 60%;
              text-align: right;
            }
            .img {
              position: absolute;
              width: 40%;
              text-align: right;
            }
          }
        }
      }
    }
  }
}
.title-food-name {
  position: absolute;
}
.title-food-price {
  position: absolute;
  right: 10px;
}
.add-food-to-shopcar {
  //   position: absolute;
  float: right;
  width: 50%;
  //   right: 40px;
  bottom: 7px;
  height: 100%;
  max-width: 350px;
  line-height: 24px;
  padding: 0 12px;
  box-sizing: border-box;
  font-size: 10px;
  color: #333;
  background-color: #ffd161;
  text-align: center;
  z-index: 10;
  &.fade-enter-active,
  &.fade-leave-active {
    transition: all 0.4s linear;
  }
  &.fade-enter,
  &.fade-leave-to {
    opacity: 0;
  }
}

.stamp-zh {
  position: relative;

  &:after {
    border: 0.1em solid #d00;
    border-radius: 0.2em;
    color: #d00;
    content: "\5DF2\552E\5B8C";
    font-size: 10px;
    // font-weight: 700;
    /* line-height: 1; */
    // position: absolute;
    width: 30%;
    float: right;
    position: relative;
    /* padding: .1em .5em; */
    /* margin: 0 auto; */
    text-align: center;
    text-transform: uppercase;
    opacity: 0;
    transform-origin: 50% 50%;
    transform: rotate(-2deg) scale(5);
    transition: all 0.3s cubic-bezier(0.6, 0.04, 0.98, 0.335);
  }
}

.stamp-en {
  position: relative;

  &:after {
    border: 0.1em solid #d00;
    border-radius: 0.2em;
    color: #d00;
    content: "Sold out";
    font-size: 10px;
    // font-weight: 700;
    /* line-height: 1; */
    // position: absolute;
    width: 30%;
    float: right;
    position: relative;
    /* padding: .1em .5em; */
    /* margin: 0 auto; */
    text-align: center;
    text-transform: uppercase;
    opacity: 0;
    transform-origin: 50% 50%;
    transform: rotate(-2deg) scale(5);
    transition: all 0.3s cubic-bezier(0.6, 0.04, 0.98, 0.335);
  }
}

.loaded .stamp-zh:after {
  opacity: 0.75;
  // left: -100px;
  transform: rotate(-15deg) scale(1);
  z-index: 99;
  top: -30px;
}

.loaded .stamp-en:after {
  opacity: 0.75;
  // left: -100px;
  transform: rotate(-15deg) scale(1);
  z-index: 99;
  top: -30px;
}
</style>
