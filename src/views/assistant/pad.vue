<!-- 商家模块 点菜页面 -->

<template>
  <div class="restaurant-pc-viewer">
    <div class="head" style="position: absolute; width:100%; height: 90px;" ref="headRef">
      <restaurant-header v-model="restaurant" 
              style="position: absolute; left: 20%; width: 60%" :rid="rid" :uuid="uuid" 
              :term="1"
              @change="isOnline"
              />

      <div class="language-aream">
        <a class="language" @click="onChangeLanguage('en_US')" title data-title>English(En)</a>
        <a class="language" @click="onChangeLanguage('zh_CN')" title data-title>简体(中文)</a>
      </div>

    </div>


    <div class="table-control">
      <div style="position:fixed;  left: 30px; bottom: 0px;text-align: center;" @click="showTables=true">
        <img src="/static/img/table-selected.png" style="width: 20px;height: 15px;">
        <div style="font-size:12px;color:rgb(114, 111, 111); text-align:center;">{{seatId == null ? "tables": "table(" + seatId + ")"}}</div>
      </div>
    </div>
    <!-- 左右联动 -->
    <div class="goods" ref="goodsRef">
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
                ></span>
                <span style="position: absolute;"
                  v-else >
                  <img class="icon" 
                  :src="item.icon" 
                  width="32px" 
                  height="32px" />
                </span>
                <div class="menu-category">
                  <span >{{ showCategoryName(item) }}</span>
                </div>
              </div>
          </li>
        </ul>
      </div>

      <!-- 右侧食物列表 -->
      <div class="foods-wrapper" ref="foodsRef">
        <ul>
          <li class="foods-list foods-list-hook" 
              v-for="(item,index) in goods" 
              ref="foodList"
              v-bind:key="'food:' +index">

            <h4 class="title">{{ showCategoryName(item) }}</h4>

            <div class="content__section">
              <div
                class="content__section-inner nav-area"
                data-gradient="#00fff0, #5c9ff7 40%, #d322ff 80%"
                data-gradient-direction="right top"
              >
                <template v-for="(food, index) in item.foods">
                  <div class="nav-area__item foods-list" v-bind:key="index">
                    <div class="nav-area__item-title foods-item">
                      <div class="icon" @click="onShowFoodViewer(food)">
                        <img v-lazy="food.image" :key="'food:' + food.id" />
                        <div class="seasonPrice" v-show="food.isSeasonPrice">Season Price</div>
                      </div>
                      <div class="content">
                        <div class="food-name">
                          {{ showFoodName(food) }}
                          <template v-for="id in showPeppers(food)">
                            <img src="/static/img/hot-peppers.png" v-if="id > 0" :key="id">
                          </template>
                        </div>
                        <span class="detail-area">
                          <span class="price">
                            <span class="now" >$ {{ food.price }}</span>
                            <span
                              class="old"
                              v-show="food.oldPrice"
                              v-if="food.price < food.oldPrice"
                              >$ {{ food.oldPrice }}</span
                            >
                          </span>
                        </span>
                        <template  v-if="restaurant.online">
                            <div v-if="food.rest != 0" class="control-area" >
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
                                      id="cart-control-item"
                                      @drop="drop"
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
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </li>
        </ul>


      </div>


      <!-- 购物车 -->
      <shop-cart-for-pc
        ref="shopcartRef"
        :selectFoods="selectFoods"
        :deliveryPrice="0"
        :minPrice="1.0"
        :seat="seatId"
        :rid="rid"
        :uuid="uuid"
        @cleanShopcar="cleanShopcar"
      ></shop-cart-for-pc>
    </div>

    <!-- 选桌台号 -->
    <dlg-modal :is-show="showTables" :top-distance="10" :leftSite="5" :widNum="90" @on-close="onCloseTables">
      <div slot="header">
        <div class="title-table-id">{{ seatId }}</div>
      </div>
      <div slot="main">
        <show-tables
          :food="curFood"
          @changeTable="changeTable"
          :rid="rid"
          :uuid="uuid"
          ref="flavorRef"
        />
      </div>
      <div slot="footer">
      </div>
    </dlg-modal> 


    <dlg-modal :is-show="showFoodViewer" :top-distance="5" @on-close="onClose" 
        :widNum="50"
        :leftSite="25">

      <div slot="header">
        <div class="title-food-name">{{ showFoodName(curFood) }}</div>
        <div class="title-food-price">
          {{ $t("message.goods.currency") }} {{ curFood.price }}
        </div>
      </div>
      <div style="width:100%;height: 325px" slot="main">
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
import CartControl from '@/coms/cart-control/cart-control'
import BScroll from 'better-scroll'

import { MessageBox } from "mint-ui";
import { Toast } from "mint-ui";

import toolbar from "@/coms/tool-bar/tool-bar";
import dialog from "@/coms/dialog/dialog";

import axios from "axios";
import api from "@/global/api.js";
import storage from "@/global/storage.js";

import Shopcart from "./shopcart-for-pad";
import RestaurantHeader from "./restaurant-header"
import FoodViewer from "./food-viewer";
import tables from "./tables"

export default {
  components: {
    "shop-cart-for-pc": Shopcart,
    "cart-control": CartControl,
    "food-viewer": FoodViewer,
    "restaurant-header": RestaurantHeader,
    "tool-bar": toolbar,
    "dlg-modal": dialog,
    "show-tables": tables
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
      
      rid: 0,
      uuid: '',
      seatId: null,
      restaurantName: "优选美食",
      restaurant: {},
      //
      showFalvors: false,
      showFoodViewer: false,

      showTables: false,
      selectFoods: [],
      //
      curFood: {
        name: ""
      },
      consumerInfo: {},

      categoryBGColors: [
        'rgb(240, 238, 169)',
        'rgb(233, 234, 199)'
      ]
    };
  },
  
  watch: {},
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
          console.log("_initData: ", that.goods);
          console.log("_initData: ", res.data.data);
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

          console.log("_initSpecialFoods: ", that.goods);
          console.log("_initSpecialFoods: ", res.data.data);
          //判断是否有必选项
          that.goods = Object.values( res.data.data ).concat(that.goods);
          console.log("_initSpecialFoods 2: ", that.goods);

          // DOM 渲染完成才能进行计算
          setTimeout(() => {
            // 初始化 BScroll
            that._initScroll();
            // 计算右侧每一大项的高度
            that._calcHeight();
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
      this.listHeight = []

      let foodList = this.$refs.foodsRef.getElementsByClassName('foods-list-hook')
      let height = 0
      this.listHeight.push(height)

      for (let i = 0; i < foodList.length; i++) {
        height += foodList[i].clientHeight
        this.listHeight.push(height)
      }
      // (10) [0, 1172, 1343, 1478, 1828, 2070, 2334, 2685, 3251, 4035]
      // console.log(this.listHeight)
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
    selFlavors(food, event) {
      console.log(food);
      console.log(event);

      var instance = Object.assign({}, food, {});
      this.curFood = instance;

      if (!this.curFood.count) {
        this.curFood.count = 1;
      }

      //判断中英文环境
      this.showFalvors = true;
    },
    changeFlavor(food, event) {
      if (!this.curFood.flavor) {
        this.curFood.flavor = [this.$t("message.goods.normal")];
      }

      this.curFood.flavor = food.flavor;
    },
    changeTable(tableId) {
      console.log("changeTable: ", tableId);
      this.showTables = false;
      this.seatId = tableId;

      this.consumerInfo.phone = tableId;
      this.consumerInfo.type = "pad";
      storage.setLocalstorage("user", "consumerInfo", this.consumerInfo);
    },
    isOnline(restaurant) {
      this.restaurant = restaurant;
      console.log("status: ", this.restaurant);
    },
    onClose() {
      this.showFoodViewer = false;
      //把绑定的弹窗数组 设为false即可关闭弹窗
    },
    onCloseTables() {
      this.showTables = false;
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
    gotoOrders() {
      // this.$router.push({ path: "/term/app" });
      this.$router.push({
        path: "/term/orders",
        query: { rid: this.rid, uuid: this.uuid }
      });
    },
    gotoLocalOrders() {
    },
    onChangeLanguage(lan) {
      this.$i18n.locale = lan;
    }
  },
  filters: {},
  computed: {
    currentIndex () {
      this._calcHeight();

      for (let i = 0; i < this.listHeight.length; i++) {
        let h1 = this.listHeight[i]
        let h2 = this.listHeight[i + 1]

        if(this.scrollY <= 110) {
          this.$refs.headRef.style.visibility = "visible"

          this.$refs.goodsRef.style.top = (110 - this.scrollY) + "px";

          this.$refs.headRef.style.top = ( 0 - this.scrollY) + "px";

          // h1 = h1 - this.scrollY;
          // h2 = h2 - this.scrollY;

        } else {
          this.$refs.headRef.style.visibility = "hidden"
          this.$refs.goodsRef.style.top = "0px";

          // h1 = h1 - 110;
          // h2 = h2 - 110;

        }
        
        // 落到这个区间 或者 最后一个(无 h2)
        if ((this.scrollY >= h1 && this.scrollY < h2) || !h2) {
          return i
        }
      }
      
      return 0
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
        let desc = food.description;
        if ("en_US" == this.$i18n.locale) {
          desc = food.enDescribe;
        } 

        if ("en_US" == this.$i18n.locale) {
          if(desc && desc.length > 50) {
            return desc.substr(0,40) + " ... detail"
          } 
        } else {
          if(desc && desc.length > 25) {
            return desc.substr(0,20) + " ... detail"
          } 
        }

        return desc;
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
        if(item.foods) {
          return item.foods.length > 0
        } else {
          return false;
        }
      }
    }
  },
  created () {
    this.consumerInfo = storage.getLocalstorage("user", "consumerInfo", {type: "pad"});
    
    storage.setLocalstorage("user", "consumerInfo", this.consumerInfo);

    // this.getRestaurantName();
    
    this.selectFoods = storage.getLocalstorage("foods", "selectFoods", [])

    // 

    this.userInfo = storage.getLocalstorage("user", "userInfo", {});
    if(!this.userInfo.token) {
      //返回上页
      this.$router.push({
        path: "/login",
        query: { uri: "/term/pad" }
      });
    }
    let restaurant = storage.getLocalstorage("user", "restaurantInfo", {});
    this.rid = restaurant.rid;
    this.uuid = restaurant.uuid;

  },
  mounted () {
    // 初始化数据
    this._initData()

    if(this.seatId == null) {
      this.showTables = true;
    }
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
  bottom: 5px;
  width: 100%;
  // background-color: #fff;
  overflow: hidden;
  .menu-wrapper {
    flex: 0 0 250px;
    // width: 200px;
    // background-color: #fafaf8;
    margin-bottom: 50px;
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
        width: 240px;
        height: 44px;
        background-color: #35a208;
        -moz-box-shadow:6px 3px 9px #333333; 
        -webkit-box-shadow:6px 3px 9px #333333; 
        box-shadow:6px 3px 9px #333333;
        border-radius: 5px;
        .icon {
          display: inline-block;
          position: absolute;
          width: 32px;
          height: 32px;
          margin: 5px 5px 5px 5px;
          background-size: 12px 12px;
          background-repeat: no-repeat;
          vertical-align: top;
          &.decrease {
            @include bg-image('./img/decrease_3');
          }
          &.discount {
            @include bg-image('./img/discount_3');
          }
          &.guarantee {
            @include bg-image('./img/guarantee_3');
          }
          &.invoice {
            @include bg-image('./img/invoice_3');
          }
          &.special {
            @include bg-image('./img/special_3');
          }
        }
        .menu-category {
          // margin-left:5px;
          color: white;
          line-height: 44px;
          // text-align: center;
          overflow: hidden;
          float: right;
          display: block;
          width: 200px;
          
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
    .foods-list {
      .title {
        padding-left: 14px;
        height: 26px;
        line-height: 26px;
        border-left: 2px solid #d9dde1;
        font-size: 12px;
        color: rgb(8, 8, 8);
        background-color: #a3caf0;
        text-align: center;
      }
      .foods-item {
        position: relative;
        // display: flex;
        // margin: 18px;
        // padding-bottom: 18px;
        @include onepx('bottom', true);
        -moz-box-shadow:4px 2px 6px #333333; 
        -webkit-box-shadow:4px 2px 6px #333333; 
        box-shadow:4px 2px 6px #333333;
        border-top-right-radius: 12px;
        border-top-left-radius: 12px;
        border-bottom-left-radius: 12px;
        border-bottom-right-radius: 12px;
        height: 240px;
        .icon {
          flex: 0 0 57px;
          width: 100%;
          height: 150px;
          margin-right: 10px;
          img {
            width: 100%;
            height: 150px;
            // border-radius: 12px;
            border-top-left-radius: 12px;
            border-top-right-radius: 12px;
          }
          .seasonPrice {
            position: absolute;
            top: 50%;
            right: 0px;
            margin-right: 2px;
            font-size: 8px;
            color: rgb(238, 10, 188);
            background-color: rgba(190, 187, 187, 0.8);
          }
        }
        .content {
          flex: 1;
          margin-left: 5px;
          margin-top: 5px;
          // background-color:rgba(255, 255, 255, 0.5);
          // height: 120px;
          // position: relative;
          // bottom: 100px;
          // background-color: rgba(224, 215, 215, 0.9);
          .food-name {
            font-size: 12px;
          }
          .detail-area{
            width: 80px;
            position: absolute;
            .desc {
              // margin-bottom: 8px;
              line-height: 14px;
              font-size: 18px;
              color: rgb(147, 153, 159);
            }
            .extra {
              // margin-bottom: 8px;
              line-height: 12px;
              font-size: 0;
              color: rgb(147, 153, 159);
              .count {
                font-size: 18px;
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
              .now {
                margin-top: 8px;
                font-size: 18px;
                color: rgb(240, 20, 20);
              }
              // .seasonPrice {
              //   margin-right: 8px;
              //   font-size: 8px;
              //   color: rgb(13, 126, 73);
              //   position: absolute;
              //   top: 15px;
              //   left: 0px;
              // }
              .old {
                font-size: 8px;
                color: rgb(147, 153, 159);
                text-decoration: line-through;
                position: absolute;
                top: 20px;
                left: 0px;
              }
            }
          }

          .control-area {
            // bottom: 20px;
            // width: 100%;
            // height: 45%;
            margin-top: 10px;
            // position: relative;
            // height: 30px;
            // text-align: right;
            display: initial;
            .detail {
              width: 40%;
              text-align: center;
              float: right;
              // line-height: 14px;
              padding: 0 12px;
              -webkit-box-sizing: border-box;
              box-sizing: border-box;
              font-size: 16px;
              border-radius: 12px;
              color: #333;
              background-color: #ffd161;
              z-index: 20;
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
  grid-gap: 5px;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.nav-area__item {
  transition-property: all;
  transition-duration: 0.2s;
  transition-timing-function: linear;
  transition-delay: 0s;
  // padding: 5px 5px;
  text-align: center;
  // color: #fff;
  margin: 20px;
  background-repeat: no-repeat;
  cursor: pointer;
  background-color: #fdfdfc;
  min-width: 200px;
  max-width: 250px;
  min-height: 200px;

  box-sizing: border-box;
  border-radius: 12px;
  border: 2px solid #0be2ad;
}
// .nav-area__item:hover {
//   box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12),
//     0 2px 4px -1px rgba(0, 0, 0, 0.3);
// }

.nav-area__item-icon {
  font-size: 25px;
}

.nav-area__item-title {
  min-height: 225px;
}
.nav-area__item-title > p {
  margin-bottom: 0;
}


.title-food-name {
  position: absolute;
  top:10px;
  text-align:center;

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
  margin-left: 20px;
}

.restaurant-img {
  width: 30%;
  height: 80px;
}
.restaurant-info {
  width: 70%;
  height: 80px;
}

.table-control {
  position: fixed;
  // background-color: rgb(71, 118, 219);
  left: 0px;
  width: 245px;
  height: 45px;
  bottom: 0;
  z-index: 10;
  background-color: antiquewhite;
  border-top-right-radius: 12px;
  -moz-box-shadow:6px 4px 11px #333333; 
  -webkit-box-shadow:6px 4px 11px #333333; 
  box-shadow:6px 4px 11px #333333;
}


.language-aream {
  float: right;
  margin-top: 5px;
  .language {
    display: inline-block;
    margin: 0 10px 10px;
    font-size: 12px;
    color: #46494a;
    text-decoration: none;
    box-shadow: none!important;
  }
}
</style>
