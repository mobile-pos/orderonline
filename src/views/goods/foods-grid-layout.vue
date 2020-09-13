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

            <div class="content__section">
              <div
                class="content__section-inner nav-area"
                data-gradient="#00fff0, #5c9ff7 40%, #d322ff 80%"
                data-gradient-direction="right top"
              >
                <template v-for="(food, index) in item.foods">
                  <div class="nav-area__item foods-list" v-bind:key="index">
                    <div class="nav-area__item-title foods-item">
                      <div class="icon">
                        <img v-bind:src="food.icon" />
                      </div>

                      <div class="content">
                        <div class="name">
                          <h2 class="name">{{ showFoodName(food) }}</h2>
                        </div>
                        <div class="detail">
                          <div class="desc">{{ showFoodDesc(food) }}</div>

                          <div class="extra">
                            <span class="count"
                              >{{ $t("message.goods.selledInMonth") }}
                              {{ food.sellCount }}
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
                        </div>

                        <div v-if="food.rest != 0" class="control">
                          <template v-if="hasMustOption(food)">
                            <div
                              class="detail"
                              @click="selFlavors(food, $event)"
                            >
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
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </li>
        </ul>
      </div>


    </div>
    
  </div>
</template>

<script>
import Shopcart from "@/coms/shopcart/shopcart";
import CartControl from "@/coms/cart-control/cart-control";
import BScroll from "better-scroll";
import axios from "axios";
import { MessageBox } from "mint-ui";
import { Toast } from "mint-ui";

import storage from "@/global/storage.js";
import api from "@/global/api.js";

import dialog from "@/coms/dialog/dialog";


export default {
  components: {
    CartControl,
  },
  props: {
    restaurant: {
      type: Object,
      default: {}
    },
    seatId: {
      type: Number,
      default: 0
    },
    selectFoods: {
      type: Object,
      default: []
    },
    showFalvors: {
      type: Boolean,
      default: false
    },
    curFood: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      // 商品数据
      goods: [
        {
          id: 0,
          cid: 1,
          name: "aaa",
          rid: 1,
          foods: [
            {
              name: "123",
              description: "abc",
              icon: "http://123",
              oldPrice: -1,
              price: 4,
              rating: 100,
              sellCount: 10,
              rest: 0,
              cid: 1,
              flavors:
                '{"\u53e3\u5473":{"type":"multiple","require":false,"data":[{"\u5c11\u8fa3":0},{"\u5fae\u8fa3":0}]}}',
              type: -1
            }
          ]
        }
      ],
      classMap: ["decrease", "discount", "special", "invoice", "guarantee"],
      // 右侧每一大项的高度区间
      // (10) [0, 1172, 1343, 1478, 1828, 2070, 2334, 2685, 3251, 4035]
      listHeight: [],
      // 计算当前滚动的 Y 值
      scrollY: 0,
      
    };
  },
  methods: {
    // 初始化数据
    _initData() {
      let that = this;
      axios
        .get(
          api.foods +
            "?rid=" +
            this.restaurant.rid +
            "&uuid=" +
            this.restaurant.uuid
        )
        .then(res => {
          if (res.data.code != 0) {
            Toast(this.$t("message.errorTips.otherCode") + res.data.msg);
            return;
          }
          //判断是否有必选项
          that.goods = res.data.data;

          that._initSpecialFoods();
          // // DOM 渲染完成才能进行计算
          // setTimeout(() => {
          //   // 初始化 BScroll
          //   that._initScroll();
          //   // 计算右侧每一大项的高度
          //   that._calcHeight();
          // }, 20);
        })
        .catch(err => {
          console.log(err);
          Toast(this.$t("message.errorTips.netError"));
        });
    },

    _initSpecialFoods() {
      let that = this;
      axios
        .get(
          api.specialFoods +
            "?rid=" +
            this.restaurant.rid +
            "&uuid=" +
            this.restaurant.uuid
        )
        .then(res => {
          if (res.data.code != 0) {
            Toast(this.$t("message.errorTips.otherCode") + res.data.msg);
            return;
          }

          //判断是否有必选项
          that.goods = res.data.data.concat(that.goods);

          console.log("goods list: ", that.goods);
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
    
    // selFlavors(food, event) {
    //   console.log(food);
    //   console.log(event);

    //   var instance = Object.assign({}, food, {});
    //   this.curFood = instance;

    //   if (!this.curFood.count) {
    //     this.curFood.count = 1;
    //   }

    //   this.showFalvors = true;
    // },
    
    // 加入购物车
    // addFoodToShopcar(food, event) {
    //   this.curFood = food;

    //   //计算需求
    //   if (this.$refs.flavorRef) {
    //     this.curFood = this.$refs.flavorRef.getFood();
    //   }

    //   if (!this.curFood.flavor) {
    //     this.curFood.flavor = [];
    //   }
    //   if (!this.curFood.count) {
    //     this.curFood.count = 1;
    //   }

    //   if (Object.keys(this.curFood.flavor).length == 0) {
    //     this.curFood.flavor.push(this.$t("message.goods.normal"));
    //   }
      
    //   let k = this.curFood.name + JSON.stringify(this.curFood.flavor);
    //   if (this.curFood.reid) {
    //     k = k + this.curFood.reid;
    //   }

    //   let added = false;
    //   let keys = Object.keys(this.selectFoods);
    //   for (var i = 0; i < keys.length; i++) {
    //     let food = this.selectFoods[i];
    //     let _k = food.name + JSON.stringify(food.flavor);
    //     if (food.reid) {
    //       _k = _k + food.reid;
    //     }
    //     if (_k == k) {
    //       food.count = food.count * 1 + this.curFood.count * 1;
    //       this.selectFoods.splice(i, 1, food);
    //       added = true;
    //     }
    //   }
    //   if (false == added) {
    //     this.selectFoods.push(this.curFood);
    //   }
    // },

    // cleanShopcar(event) {
    //   this.selectFoods = [];
    // },
    
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
  },
  mounted() {
    // 初始化数据
    this.restaurant = storage.getLocalstorage("user", "restaurantInfo", {});

    this._initData();
  },
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
        background-color: #ffffff;
      }
      .foods-item {
        position: relative;
        display: flex;
        margin: 10px;
        height: 100%;
        // padding-bottom: 18px;
        @include onepx("bottom", true);
        .icon {
          flex: 0 0 60%;
          width: 60%;
          height: 200px;
          margin-right: 5px;
          img {
            width: 100%;
            height: 200px;
          }
        }
        .content {
          flex: 1;
          width: 60%;
          height: 100%;
          padding: 5px 5px;
          .name {
            font-size: 14px;
            margin: 2px 0 8px 0;
            height: 14px;
            line-height: 14px;
            color: rgb(7, 17, 27);
          }
          .desc {
            min-height: 20px;
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
            bottom: -50px;
            width: 100%;
            position: relative;
            height: 30px;
            text-align: right;
            .detail {
              width: 40%;
              min-width: 100px;
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
              //width: 60%;
              min-width: 80px;
              text-align: left;
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

@charset "utf-8";
body {
  font-family: "Roboto", sans-serif;
  color: #2c2c2c;
}
body a {
  color: inherit;
  text-decoration: none;
}

.btns {
  display: flex;
  justify-content: center;
}

.btn {
  transition-property: all;
  transition-duration: 0.2s;
  transition-timing-function: linear;
  transition-delay: 0s;
  padding: 10px 20px;
  margin-right: 10px;
  background-color: #fff;
  border: 1px solid #2c2c2c;
  border-radius: 3px;
  cursor: pointer;
  outline: none;
}
.btn:last-child {
  margin-right: 0;
}
.btn:hover,
.btn.js-active {
  color: #fff;
  background-color: #2c2c2c;
}

.header {
  max-width: 500px;
  margin: 50px auto;
  text-align: center;
}

.header__title {
  font-weight: 500;
}

.content {
  max-width: 300px;
  // margin: auto;
  text-align: left;
}

.content__section {
  margin-bottom: 20px;
  // max-width: 300px;
}

.content__title {
  font-weight: 500;
  text-align: center;
}

.grad-btn--top i {
  -webkit-transform: rotate(-90deg);
  transform: rotate(-90deg);
}

.grad-btn--bottom i {
  -webkit-transform: rotate(90deg);
  transform: rotate(90deg);
}

.grad-btn--left i {
  -webkit-transform: rotate(180deg);
  transform: rotate(180deg);
}

.grad-btn--top-left i {
  -webkit-transform: rotate(-135deg);
  transform: rotate(-135deg);
}

.grad-btn--top-right i {
  -webkit-transform: rotate(-45deg);
  transform: rotate(-45deg);
}

.grad-btn--bottom-left i {
  -webkit-transform: rotate(135deg);
  transform: rotate(135deg);
}

.grad-btn--bottom-right i {
  -webkit-transform: rotate(45deg);
  transform: rotate(45deg);
}

.nav-area {
  display: grid;
  grid-gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.nav-area__item {
  transition-property: all;
  transition-duration: 0.2s;
  transition-timing-function: linear;
  transition-delay: 0s;
  padding: 5px 5px;
  text-align: center;
  color: #fff;
  border-radius: 5px;
  background-repeat: no-repeat;
  cursor: pointer;
  background-color: #f0e5e589;
  min-width: 250px;
  min-height: 150px;
}
.nav-area__item:hover {
  box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12),
    0 2px 4px -1px rgba(0, 0, 0, 0.3);
}

.nav-area__item-icon {
  font-size: 25px;
}

.nav-area__item-title {
  min-height: 150px;
}
.nav-area__item-title > p {
  margin-bottom: 0;
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
