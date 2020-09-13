<!-- 商家模块 点菜页面 -->

<template>
  <div >
    <div class="head" style="position: absolute; width:100%; height: 90px;">
      <restaurant-header :rid="rid" :uuid="uuid" v-model="restaurant" 
              :term="2"
              @change="isOnline" />
      <!-- <tool-bar style="margin-top:10px;background-color: azure;">
        <div slot="left">
          <span class="menu-fold" @click="menuFold(!isMenuFolded)"> 
            <img width="32px" height="32px" :src="isMenuFolded ? '/static/img/fold.png' : '/static/img/unfold.png'">
          </span>
          <span
            class="current-consumer-info"
            style="position: absolute;margin-top:0px; font-size=14px;"
          >
            {{ $t("message.app.pages.currentContact") }}:
            {{ consumerInfo.phone }}
          </span>
          <span
            style="position:absolute;right: 100px;  top: 3px;"
            @click="gotoOrders"
          >
            <img src="/static/img/order_selected.png" style="width: 20px;height: 20px;">
          </span>
        </div>
      </tool-bar> -->

      <div class="language-aream">
        <div class="language" @click="onChangeLanguage('en_US')" title data-title><img src="/static/img/us.png" width="15px" height="10px">(En)</div>
        <div class="language" @click="onChangeLanguage('zh_CN')" title data-title><img src="/static/img/china.png" width="15px" height="10px">(中文)</div>
      </div>

      <span
            class="current-consumer-info"
          >
            {{ $t("message.app.pages.currentContact") }}:
            {{ consumerInfo.phone }}
          </span>
    </div>
    <!-- 左右联动 -->
    <div class="goods">
      <!-- 左侧菜单 -->
      <div class="menu-wrapper" ref="menuRef">
        <ul>
          <li class="menu-item"
              v-for="(item, index) in goods"
              :class="{'current': currentIndex === index}"
              :key="'category:'+index"
              @click="selectMenu(index, $event)">
              <div class="text">
                <span
                  class="icon"
                  v-if="item.type > 0"
                  :class="classMap[item.type]"
                  width="24px" 
                  height="24px"
                  style="margin-top: 12px;"
                ></span>
                <span style="position: absolute;"
                  v-else >
                  <img class="icon" 
                  :src="item.icon" 
                  width="24px" 
                  height="24px"
                  style="margin-top: 12px;" />
                </span>
                <div class="menu-category">
                  <span >{{ showCategoryName(item) }}</span>
                </div>
              </div>
          </li>
        </ul>
      </div>

      <!-- 右侧食物列表 -->
      <div class="foods-wrapper" ref="foodsRef" >
        <ul>
          <li 
           class="foods-list foods-list-hook"
           v-for="(item,index) in goods"
           ref="foodList" 
           :key="'f0:' + index">
            
            <h4 class="title">{{ showCategoryName(item) }}</h4>

            <ul :style="'background-color: ' + categoryBGColors[index%2]">
              <li
                class="foods-item"
                v-for="(food, findex) in item.foods"
                v-bind:key="'f1:' + findex">

                <div class="icon" @click="onShowFoodViewer(food)">
                  <img v-lazy="food.icon" :key="food.id">
                  <div class="seasonPrice" v-show="food.isSeasonPrice">Season Price</div>
                </div>

                <div class="content">
                  <div class="name-area" @click="onShowFoodViewer(food)">
                    <span style="font-size:12px">{{ showFoodName(food) }} 
                        <template v-for="id in showPeppers(food)">
                          <img src="/static/img/hot-peppers.png" v-if="id > 0" :key="id">
                        </template>
                    </span>
                  </div>
                  <div class="detail-area" @click="onShowFoodViewer(food)">
                    <p class="desc"></p>

                    <!-- <div class="extra">
                      <span class="count">
                        {{ $t("message.goods.selledInMonth")
                        }}{{ food.sellCount }}
                        {{ $t("message.goods.unit") }}
                      </span>
                      <span class="rating">
                        {{ $t("message.goods.goodEvaluate") }}
                        {{ food.rating }}%
                      </span>
                    </div> -->

                      <span class="price">
                        <span class="now" >$ {{ food.price }}</span>
                        <span
                          class="old"
                          v-show="food.price < food.oldPrice"
                          >$ {{ food.oldPrice }}</span
                        >
                      </span>
                  </div>

                  <template  v-if="restaurant.online">
                      <div v-if="food.rest != 0" class="control-area">
                        <template v-if="hasMustOption(food)">
                          <div class="detail" @click="onShowFoodViewer(food, $event)">
                            {{ $t("message.goods.selectFlavor") }}
                          </div>
                        </template>
                        <template v-else>
                            <span class="modify-flavors" @click="onShowFoodViewer(food, $event)">
                                  modify
                            </span>
                            
                            <span style="float: right;">
                              <cart-control
                                  :food="food"
                                  @addFoodToShopcar="addFoodToShopcar"
                                  @drop="drop"
                                  id="cart-control-item"
                                ></cart-control>
                            </span>
                        </template>
                      </div>
                      <div v-else class="control loaded">
                        <div
                          class="stamp-en"
                          v-if="$t('message.lang') == 'en'"
                        ></div>
                        <div class="stamp-zh" v-else></div>
                      </div>
                  </template>
                  <template v-else>
                      <div v-if="food.rest != 0" class="control-area" >
                          <div class="detail">
                              Closed
                          </div>
                      </div>
                  </template>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>

      <!-- 购物车 -->
      <shop-cart-for-scan
        ref="shopcartRef"
        :selectFoods="selectFoods"
        :deliveryPrice="0"
        :minPrice="1.0"
        :seat="seatId"
        :rid="rid"
        :uuid="uuid"
        @cleanShopcar="cleanShopcar"
      ></shop-cart-for-scan>

    </div>

    <!-- <dlg-modal :is-show="showFalvors" :top-distance="10" @on-close="onClose">
      <div slot="header">
        <div class="title-food-name">{{ showFoodName(curFood) }}</div>
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
    </dlg-modal> -->

    <dlg-modal :is-show="showFoodViewer" :topDistance="5" 
          :leftSite="4" 
          :widNum="92"
          :pdt="0"
          :pdb="20" 
          @on-close="onClose" style="z-index:100;">

      <div slot="header">
        <div class="title-food-name">{{ showFoodName(curFood) }}</div>
        <div class="title-food-price">
          {{ $t("message.goods.currency") }} {{ curFood.price }}
        </div>
      </div>
      <div style="width:100%;height: 100%" slot="main">
        <food-viewer :food="curFood"
          @changeFlavor="changeFlavor"
          ref="flavorRef"
         >
        </food-viewer>
      </div>

      <div style="width:100%; background-color: black;" slot="footer">
        <span class="add-food-control" style="width:60%;float:left">
             <cart-control :food="curFood" @drop="drop"></cart-control>
        </span>
        <span
          class="add-food-to-shopcar"
          @click="addFoodToShopcar(curFood, $event)"
        >
          {{ $t("message.goods.inputShopCar") }}
        </span>
      </div>
    </dlg-modal>
    
  </div>
</template>

<script>
import BScroll from 'better-scroll'

import { MessageBox } from "mint-ui";
import { Toast } from "mint-ui";

import axios from "axios";
import api from "@/global/api.js";
import storage from "@/global/storage.js";

import toolbar from "@/coms/tool-bar/tool-bar";
import dialog from "@/coms/dialog/dialog";

import flavors from "./flavors";
import Shopcart from "./shopcart-for-scan";
import RestaurantHeader from "./restaurant-header";
import FoodViewer from "./food-viewer";

import CartControl from '@/coms/cart-control/cart-control'

export default {
  components: {
    "food-viewer": FoodViewer,
    "restaurant-header": RestaurantHeader,
    "tool-bar": toolbar,
    "shop-cart-for-scan": Shopcart,
    CartControl,
    flavors,
    "dlg-modal": dialog
  },
  data () {
    return {
      // 商品数据
      goods: [],
      classMap: ['decrease', 'discount', 'special', 'invoice', 'guarantee'],
      // 右侧每一大项的高度区间
      // (10) [0, 1172, 1343, 1478, 1828, 2070, 2334, 2685, 3251, 4035]
      listHeight: [],
      // 计算当前滚动的 Y 值
      scrollY: 0,
      
      //动态信息
      rid: parseInt(this.$route.query.rid),
      uuid: this.$route.query.uuid,
      seatId: this.$route.query.sid,
      restaurantName: "优选美食",
      restaurant: {},
      tax: 0.0,
      //
      showFalvors: false,
      showFoodViewer: false,

      selectFoods: [],
      //
      curFood: {
        name: ""
      },

      consumerInfo: {
        phone: null,
        name: null,
        address: null,
        gratuity: 1.0,
        mark: null
      },

      categoryBGColors: [
        'rgb(240, 238, 169)',
        'rgb(233, 234, 199)'
      ],

      isMenuFolded: false
    }
  },
  props: {
    // 全部数据
    seller: {
      type: Object
    }
  },
  watch: {},
  methods: {
    // 初始化数据
    _initData() {
      var that = this;
      axios
        .get(api.foods + "?rid=" + this.rid + "&uuid=" + this.uuid)
        .then(res => {
          if (res.data.code != 0) {
            Toast(this.$t("message.errorTips.otherCode") + res.data.msg);
            return;
          }
          //判断是否有必选项
          that.goods = Object.values( res.data.data );

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
          that.goods = Object.values( res.data.data ).concat(that.goods);

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
    _initScroll () {
      this.menuScroll = new BScroll(this.$refs.menuRef, {
        click: true,
        mouseWheel: true
      })
      this.foodsScroll = new BScroll(this.$refs.foodsRef, {
        click: true,
        probeType: 3,
        mouseWheel: true
      })

      this.foodsScroll.on('scroll', pos => {
        this.scrollY = Math.abs(Math.floor(pos.y))
        // console.log(this.scrollY)
      })
    },
    // 计算右侧每一大项的高度
    _calcHeight () {
      let foodList = this.$refs.foodsRef.getElementsByClassName('foods-list-hook')
      let height = 0
      this.listHeight.push(height)

      for (let i = 0; i < foodList.length; i++) {
        height += foodList[i].clientHeight
        this.listHeight.push(height)
      }
      // (10) [0, 1172, 1343, 1478, 1828, 2070, 2334, 2685, 3251, 4035]
      console.log(this.listHeight)
    },
    // better-scroll 默认会阻止浏览器的原生 click 事件。
    // 当设置为 true，better-scroll 会派发一个 click 事件
    // 我们会给派发的 event 参数加一个私有属性 _constructed，值为 true
    selectMenu (index, event) {
      // 防止pc端触发两次点击
      if (!event._constructed) {
        return
      }

      let foodList = this.$refs.foodsRef.getElementsByClassName('foods-list-hook')
      let el = foodList[index]
      this.foodsScroll.scrollToElement(el, 100)
    },
    drop (target) {
      // 性能优化，异步异步执行下落动画
      this.$nextTick(() => {
        this.$refs.shopcartRef.drop(target)
      })
    },
    // 点击进入商品详情页
    toFoodDetail (food, event) {
      // 防止pc端触发两次点击
      if (!event._constructed) {
        return
      }
      this.selectedFood = food
      this.$refs.goodsDetailRef.show()
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
    isOnline(restaurant) {
      this.restaurant = restaurant;
      console.log("status: ", this.restaurant);
    },
    onClose() {
      this.showFalvors = false;
      this.showFoodViewer = false;
      //把绑定的弹窗数组 设为false即可关闭弹窗
    },
    // 加入购物车
    addFoodToShopcar(food, event) {
      //计算需求
      if (this.$refs.flavorRef) {
        var food2 = this.$refs.flavorRef.getFood();
        if(!food2) {
          Toast(this.$t("message.flavor.required.warn"));
          return;
        }

        this.curFood = food2;
      } else {
        this.curFood = food;
      }

      if (!this.curFood.flavor) {
        this.curFood.flavor = [];
      }
      if (!this.curFood.count) {
        this.curFood.count = 1;
      }

      // if (Object.keys(this.curFood.flavor).length == 0) {
      //   this.curFood.flavor.push(this.$t("message.goods.normal"));
      // }

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
    onShowFoodViewer(food, event) {
      if(this.restaurant.online != true) {
        return;
      }
      
      var instance = Object.assign({}, food, {});
      this.curFood = instance;

      this.curFood.count = 1;

        this.showFoodViewer = true;
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
    },
    updateContact(contact) {
      console.log("===>: " + contact);
      this.consumerInfo = contact;
    },
    gotoHome() {
      this.$router.push({ path: "/term/restaurant" ,
        query: { rid: this.rid, uuid: this.uuid }});
    },
    gotoOrders() {
      // this.$router.push({ path: "/term/app" });
      this.$router.push({
        path: "/term/orders",
        query: { rid: this.rid, uuid: this.uuid }
      });
    },
    menuFold(fold) {
      this.isMenuFolded = fold;

      if(this.isMenuFolded) {
        this.$refs.menuRef.style.width = "0px";
        this.$refs.menuRef.style.visibility = "hidden";

        this.$refs.foodsRef.style.left = "0px"
        this.$refs.foodsRef.style.width = "100%"

      } else {
        this.$refs.menuRef.style.width = "33%";
        this.$refs.menuRef.style.visibility = "visible";

        this.$refs.foodsRef.style.left = "33%"
        this.$refs.foodsRef.style.width = "67%"
      }
      // this.$forceUpdate();
    },
    onChangeLanguage(lan) {
      this.$i18n.locale = lan;
    }
  },
  filters: {},
  computed: {
    currentIndex () {
      for (let i = 0; i < this.listHeight.length; i++) {
        let h1 = this.listHeight[i]
        let h2 = this.listHeight[i + 1]

        // 落到这个区间 或者 最后一个(无 h2)
        if ((this.scrollY >= h1 && this.scrollY < h2) || !h2) {
          return i
        }
      }
      return 0
    },
    // selectedFoods () {
    //   let select = []
    //   // 之前一直错，可能是 this 指向问题，不用箭头函数
    //   this.goods.forEach((good) => {
    //     good.foods.forEach((food) => {
    //       if (food.count) {
    //         select.push(food)
    //       }
    //     })
    //   })
    //   return select
    // },
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
        let desc = food.description;
        if ("en_US" == this.$i18n.locale) {
          desc = food.enDescribe;
        }

        if ("en_US" == this.$i18n.locale) {
          if( desc && desc.length > 50) {
            return desc.substr(0,40) + " ... detail"
          } 
        } else {
          if( desc &&  desc.length > 25) {
            return desc.substr(0,20) + " ... detail"
          } 
        }

        return desc;
      };
    },
    showCategoryName() {
      return function(category) {
        if ("en_US" == this.$i18n.locale) {
          return "  " + category.enName;
        } else {
          return "  " +  category.name;
        }
      };
    },
    showTitle() {
      return this.restaurantName;
    },
    
    showPeppers() {
        //如果有辣味，则在菜名旁显示辣味程度
        return function(food){
            var pepper = 0
            try {
                let flavors = JSON.parse( food.flavors )
                // console.log("food name: ", food.name)
                if( flavors && flavors.hasOwnProperty('辣味')) {
                        var data = flavors["辣味"].data
                    for(var i = 0 ; i < data.length; i++) {
                            if( data[i].hasOwnProperty("微辣")) {
                                pepper = 1
                            } else if( data[i].hasOwnProperty("中辣")) {
                                pepper = 2
                            } else if(data[i].hasOwnProperty("超辣")) {
                                pepper = 3
                            }
                        }
                }
            }catch(error) {

            }

            return pepper;
        }
    },
    hasFoodsInCategory() {
      return function(item) {
        // console.log("category item", item);
        return item.foods.length > 0
      }
    }
  },
  created () {
    // 初始化数据
    this._initData()
  },
  mounted () {
    this.consumerInfo = storage.getLocalstorage("user", "consumerInfo", {});
    console.log("seatid: ", this.seatId);

    if(this.seatId) {
      this.consumerInfo = {
        phone: this.seatId
      }
    }
    this.consumerInfo.type = "restaurant";
    storage.setLocalstorage("user", "consumerInfo", this.consumerInfo);
    
    this.selectFoods = storage.getLocalstorage("foods", "selectFoods", [])

  },
  destroyed () {}
}
</script>

<style lang="scss" scoped>
@import '~@/assets/scss/const.scss';
@import '~@/assets/scss/mixin.scss';

.goods {
  display: flex;
  position: absolute;
  top: 90px;
  bottom: 46px;
  width: 100%;
  // background-color: #fff;
  overflow: hidden;
  .menu-wrapper {
    flex: 0 0 33%;
    // width: 200px;
    // background-color: #fafaf8;
    // margin-bottom: 50px;
    .menu-item {
      display: table;
      width: 100%;
      height: 55px;
      line-height: 14px;
      padding: 5px 5px;
      // border-bottom: 2px solid rgb(38, 93, 241);
      @include onepx('bottom', true);
      &.current {
        position: relative;
        margin-top: -1px;
        font-weight: 700;
        // z-index: 10;
        width: 100%;
        .text {
          background-color: #c94028;
        }
      }
      .text {
        font-size: 16px;
        display: table-cell;
        position: relative;
        width: 100%;
        height: 44px;
        background-color: #35a208;
        -moz-box-shadow:6px 3px 9px #333333; 
        -webkit-box-shadow:6px 3px 9px #333333; 
        box-shadow:6px 3px 9px #333333;
        border-radius: 5px;
        // .icon {
        //   display: inline-block;
        //   width: 32px;
        //   height: 32px;
        //   margin: 5px 5px 5px 5px;
        //   background-size: 12px 12px;
        //   background-repeat: no-repeat;
        //   vertical-align: top;
        //   &.decrease {
        //     @include bg-image('./img/decrease_3');
        //   }
        //   &.discount {
        //     @include bg-image('./img/discount_3');
        //   }
        //   &.guarantee {
        //     @include bg-image('./img/guarantee_3');
        //   }
        //   &.invoice {
        //     @include bg-image('./img/invoice_3');
        //   }
        //   &.special {
        //     @include bg-image('./img/special_3');
        //   }
        // }
        .menu-category {
          // margin-left:5px;
          color: #fff;
          line-height: 44px;
          overflow: hidden;
          /* float: right; */
          display: block;
          // width: 30%;
          margin-left: 26px;
          span {
            display: inline-block;
            width: 100%;
            text-align: left;
            line-height: 22px;
          }
        }
      }
    }
  }
  .foods-wrapper {
    flex: 1;
    // position: fixed;
    left: 33%;
    width: 67%;
    .foods-list {
      background-color: aliceblue;
      .title {
        padding-left: 14px;
        height: 26px;
        line-height: 26px;
        border-left: 2px solid #d9dde1;
        font-size: 14px;
        width:100%;
        color: rgb(0, 0, 0);
        background-color: #0c7dee;
      }
      .foods-item {
        position: relative;
        display: flex;
        margin: 8px;
        padding-bottom: 8px;
        @include onepx('bottom', true);
        .icon {
          flex: 0 0 90px;
          // width: 57px;
          // height: 57px;
          margin-right: 10px;
          img {
            width: 100%;
            height: 100%;
          }
          .seasonPrice {
            position: absolute;
            top: 70%;
            margin-right: 2px;
            font-size: 8px;
            color: rgb(238, 10, 188);
            background-color: rgba(190, 187, 187, 0.8);
          }
        }
        .content {
          flex: 1;
          .name-area {
            width: 100%;
            font-size: 14px;
            // margin: 2px 0 2px 0;
            height: 15%;
            line-height: 14px;
            color: rgb(7, 17, 27);
          }
          .detail-area{
            width: 100%;
            height: 40%;
            .desc {
              // margin-bottom: 8px;
              line-height: 14px;
              font-size: 10px;
              color: rgb(147, 153, 159);
            }
            .extra {
              // margin-bottom: 8px;
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
              margin-top: 10px;
              position: relative;
              .now {
                margin-top: 8px;
                font-size: 18px;
                color: rgb(240, 20, 20);
              }
              .old {
                font-size: 8px;
                color: rgb(147, 153, 159);
                text-decoration: line-through;
                // position: absolute;
                // top: 30px;
                // left: 0px;
              }
            }
          }
          .control-area {
            // bottom: 20px;
            width: 100%;
            height: 45%;
            // position: relative;
            // height: 30px;
            // text-align: right;

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
          }
          .cart-control-item {
            position: absolute;
            width: 120px;
            left: 60%;
            bottom: 0px;
          }
          .img {
            position: absolute;
            width: 20%;
            text-align: right;
          }
        }
      }
    }
  }
}


.modify-flavors {
  // width: 60px;
  left: 50%;
  text-align: center;
  float: right;
  // position: absolute;
  line-height: 18px;
  padding: 0 5px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  font-size: 14px;
  border-radius: 12px;
  color: #333;
  background-color: #ffd161;
  z-index: 10;
  margin-left: 10px;
  padding: 6px;
  float: right;
  &.fade-enter-active,
  &.fade-leave-active {
    transition: all 0.4s linear;
  }
  &.fade-enter,
  &.fade-leave-to {
    opacity: 0;
  }
}

.title-food-name {
  position: absolute;
  top:10px;
}
.title-food-price {
  position: absolute;
  right: 10px;
  top:10px;
}
.add-food-to-shopcar {
  //   position: absolute;
  float: right;
  width: 30%;
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

.current-consumer-info {
  position: absolute;
  margin: 10px;
  top: 50px;
  right: 0px;
  font-size: 12px;
}

.language-aream {
  margin-top: 5px;
  position: absolute;
  right: 0px;
  top: 0px;
  .language {
    // display: inline-block;
    margin: 0 5px 5px;
    font-size: 12px;
    color: #46494a;
    text-decoration: none;
    box-shadow: none!important;
  }
}
</style>
