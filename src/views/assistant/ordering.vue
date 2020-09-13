<template>
  <div class="ordering" id="ordering-page">
    <div class="ordering-title"><h3>{{$t('message.ordering.title')}}</h3></div>
    <div class="mui-content">
      <div class="mui-card">
        <form class="mui-input-group">
          <ul class="mui-table-view mui-table-view-chevron">
            <li class="mui-table-view-cell " v-if="!sid">
              <a class="mui-navigate-right order-item-title" href="#">{{
                $t('message.ordering.takeFoodType') + (foodPickup == 1 ? $t('message.ordering.deliver') : $t('message.ordering.pickup'))
              }}</a>
                <ul class="mui-table-view mui-table-view-radio">
                  <!-- <li class="mui-table-view-cell">
                    <a class="mui-navigate-right" @click="foodPickup = 1"
                      >{{$t('message.ordering.deliver')}}</a
                    >
                  </li> -->
                  <li class="mui-table-view-cell  mui-selected">
                    <a class="mui-navigate-right" @click="foodPickup = 2"
                      >Pick up only now</a
                    >
                  </li>
                </ul>
            </li>
            <li class="mui-table-view-cell">
              <a class="mui-navigate-right order-item-title" href="#">{{$t('message.ordering.contact')}}</a>
              <div class="mui-input-row">
                <label class="order-item-title" v-if="!sid">{{$t('message.ordering.phone')}}</label>
                <label class="order-item-title" v-if="sid">{{$t('message.ordering.table')}}</label>
                <template v-if="!sid">
                  <input
                    type="number"
                    class="mui-input-clear"
                    :placeholder="$t('message.ordering.phoneTips')"
                    v-model="consumerInfo.phone"
                  />
                </template>
                <template v-else>
                  <input
                    type="text"
                    class="mui-input-clear"
                    :placeholder="$t('message.ordering.phoneTips')"
                    v-model="consumerInfo.phone"
                    readonly
                  />
                </template>
              </div>

              <div class="mui-input-row" v-if="foodPickup == 1">
                <label class="order-item-title">{{$t('message.ordering.address')}}</label>
                <input
                  type="text"
                  class="mui-input-clear"
                  :placeholder="$t('message.ordering.addressTips')"
                  v-model="consumerInfo.address"
                />
              </div>
            </li>
            <li class="mui-table-view-cell">
              <a class="mui-navigate-right" href="#">{{
                $t('message.ordering.prePayType') + payTypeDesc
              }}</a>
              <ul class="mui-table-view mui-table-view-radio">
                <li class="mui-table-view-cell mui-selected">
                  <a class="mui-navigate-right" @click="selPayType(0)"
                    >Cash</a
                  >
                <li class="mui-table-view-cell">
                  <a class="mui-navigate-right" @click="selPayType(10)"
                    >{{$t('message.ordering.creditCard')}}</a
                  >
                </li>
                </li>
              </ul>


                <form class="mui-input-group" style="font-size:12px;" v-show="payType == 10">
                      <div class="mui-input-row">
                          <label style="font-size:12px;">Name on the Card</label>
                      <input type="text" class="mui-input-clear" placeholder="Name on the  Credit Card" v-model="consumerInfo.creditName">
                      </div>
                      <div class="mui-input-row">
                          <label style="font-size:12px;">Card's No.</label>
                      <input type="number" class="mui-input-clear" placeholder="Credit Card's Number" v-model="consumerInfo.creditID">
                      </div>
                      <div class="mui-input-row">
                          <label style="font-size:12px;">Expiration</label>
                          <input type="text" class="mui-input-clear" placeholder="MM/DD" v-model="consumerInfo.creditValidity">
                      </div>
                  </form>
            </li>
            <li class="mui-table-view-cell  order-item-cell">
              <a class="mui-navigate-right" href="#">{{$t('message.ordering.orderDetail')}}</a>

              <ul class="mui-table-view">
                <template 
                    v-for="(item, index) in order">
                  <li
                    class="mui-table-view-cell"
                    v-show="item.count > 0"
                    v-bind:key="index"
                  >
                    <span style="float: left;  width: 100%;">
                      <div class="mui-navigate-left order-item-name">
                        {{ showFoodName(item) }}
                      </div>
                      <div class="mui-navigate-left order-item-flavor">
                        {{ flavorDesc(item.flavor) }}
                      </div>
                    </span>
                    <span class="mui-btn-outlined order-item-count">{{
                      item.count
                    }}</span>
                    <span class="mui-btn-outlined order-item-price" >{{
                      foodItemTotalPrice(item)
                    }}</span>
                    <!-- <button
                      type="button"
                      class="mui-btn-outlined order-item-add"
                      @click="item.count += 1"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      class="mui-btn-outlined order-item-sub"
                      @click="subCount(item)"
                    >
                      -
                    </button> -->
                </li>

                </template>
              </ul>
              <div class="mui-input-row">
                <label>{{$t('message.ordering.total')}}</label>
                <input
                  type="text"
                  class="mui-input-clear"
                  placeholder="10.0"
                  v-model="totalPrice"
                  readonly="readonly"
                />
              </div>
              <div class="mui-input-row">
                <label>{{$t('message.ordering.tax')}}</label>
                <input
                  type="text"
                  class="mui-input-clear"
                  placeholder="0.0"
                  v-model="tax"
                  readonly="readonly"
                />
              </div>
              <!-- <div class="mui-input-row"> -->
              <!-- <ul class="mui-table-view mui-table-view-radio">
                <li class="mui-table-view-cell">
                  <a class="mui-navigate-right" @click="selTip(10)"
                    >小费: 10%</a
                  >
                </li>
                <li class="mui-table-view-cell mui-selected">
                  <a class="mui-navigate-right" @click="selTip(20)"
                    >小费: 20%</a
                  >
                </li>
                <li class="mui-table-view-cell">
                  <a class="mui-navigate-right" @click="selTip(30)"
                    >小费: 30%</a
                  >
                </li>
              </ul> -->
              <!-- </div> -->
              <div class="mui-input-row">
                <label>{{$t('message.ordering.amount')}}</label>
                <input
                  type="text"
                  class="mui-input-clear"
                  placeholder="10.0"
                  v-model="amountPay"
                  readonly="readonly"
                />
              </div>
            </li>
            <li class="mui-table-view-cell">
              <a class="mui-navigate-right order-item-title" href="#">{{$t('message.ordering.mark')}}</a>
              <div class="mui-input-row">
                <textarea
                  type="text"
                  class="mui-input-clear"
                  rows="3"
                  :placeholder="$t('message.ordering.markTips')"
                  v-model="mark"
                />
              </div>
            </li>
          </ul>
          <div class="mui-input-row">
            <button
              type="button"
              class="mui-btn mui-btn-primary ordering-cancel"
              style="width: 20%;"
              @click="toRestaurant(true)"
            >
              {{$t('message.ordering.cancel')}}
            </button>
            <button
              type="button"
              data-loading-icon="mui-spinner mui-spinner-custom"
              class="mui-btn mui-btn-primary ordering-submit"
              style="width: 20%;"
              @click="toOrder()"
            >
              {{$t('message.ordering.submit')}}
            </button>
          </div>
          <div class="order-tip">
            <span class="order-item-title">{{$t('message.ordering.orderTips')}}</span>
          </div>
        </form>
      </div>
    </div>


      <div style="position:absolute;left:20px;top: 5px;">
        	<img class="back-to-home" src="/static/img/back.png" @click="toRestaurant()" />
      </div>
  </div>
</template>

<script>
import { MessageBox } from "mint-ui";
import { Toast } from "mint-ui";

import axios from "axios";
import storage from "@/global/storage.js";
import api from "@/global/api.js";

export default {
  data() {
    return {
      rid: this.$route.query.rid,
      uuid: this.$route.query.uuid,
      order: null,

      foodPickup: 2, // 1 送餐，2，自取
      consumerInfo: {
        phone: "",
        name: "",
        address: "",
        //信用卡
        creditName: '',
        creditID: '',
        creditValidity: '',
      },
      payType: 0, // 0 cash,  2 WeiXinPay, 3 AliPay
      amount: {
        total: 0.0,
        tax: 0.0,
        tip: 0.0
      },
      mark: "",
      payOrder: {},
      signature: {},
      sid: null, //桌号，扫桌台二维码进来的

    };
  },
  created() {
  },
  mounted() {
    this.consumerInfo = storage.getLocalstorage("user", "consumerInfo", {});
    //格式化json
    if (
      undefined == this.$route.query.order ||
      undefined == this.$route.query.total ||
      undefined == this.$route.query.rid ||
      undefined == this.$route.query.uuid
    ) {
      console.log("no order to pay");
      MessageBox.confirm( this.$t('message.ordering.warning.orderWarn') , 
          this.$t('message.ordering.warning.tipsTitle'));

      this.toRestaurant()
    }

    if( !this.$route.query.sid  ) {
    }else {
      this.sid = this.$route.query.sid;
    }

    try {
      this.order = JSON.parse(this.$route.query.order);
      //计算订单费用
      this.amount.total = Number.parseFloat( this.$route.query.total );
    } catch (error) {
      console.log("parse order failed: ", error);
      MessageBox.confirm($t('message.ordering.warning.orderWarn'), $t('message.ordering.warning.tipsTitle'));
      this.toRestaurant();
    }

    let sys = storage.getLocalstorage("sys", "restaurantInfo", {"taxRate": 0.0});
    this.amount.tax = sys.taxRate ;

    if( this.consumerInfo.type == "pc") {
      // ordering 增加一个类，不要全屏显示 订单
      let ordering = document.getElementById("ordering-page");
      ordering.className += " ordering-center"
    }
  },

  computed: {
    amountPay() {
      return this._amountPay();
    },
    totalPrice() {
      return this.amount.total.toFixed(2);
    },
    tax() {
      let taxRate = this.amount.tax.toFixed(4);

      let tax = this.amount.total * taxRate;

      return tax.toFixed(2);
    },

    payTypeDesc() {
      if (2 == this.payType) {
        return "微信支付";
      } else if (3 == this.payType) {
        return "支付宝支付";
      } else if( 10 == this.payType) {
        return "Credit Card";
      } else {
        // payType = 0
          return  "Cash"
      }
    },
    flavorDesc() {
      return function(flavor) {
        var sflavor = JSON.stringify(flavor);

        if (sflavor.length == 2 && sflavor == "[]") {
          return "";
        } else {
          return sflavor.substring(1, sflavor.length - 1);
        }
      };
    },
    foodItemTotalPrice() {
      return function(item) {
        let total = item.price * item.count;
        return total.toFixed(2)
      }
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
  },
  methods: {
    
    _amountPay() {
      let amount = this.amount.total * (1 + this.amount.tax) + this.amount.tip * this.amount.total ;

      return amount.toFixed(2)
    },

    selPayType(payType) {
      this.payType = payType;

      console.log("payType: ", this.payType);
    },
    selTip(tip) {
      this.amount.tip = tip / 100;
    },
    toRestaurant(bclean) {
      //返回上页
      let path = "/term/restaurant"
      if(this.consumerInfo.type) {
        path = "/term/" + this.consumerInfo.type
      }
      if(bclean && true == bclean) {
        storage.setLocalstorage("foods", "selectFoods", [])
      }
      //返回上页
      this.$router.push({
        path: path,
        query: { rid: this.rid, uuid: this.uuid, sid: this.sid }
      });
      
    },
    toOrder() {
      //下单后需要支付
      console.log("order ok");
      
      MessageBox.confirm('',{
        title: this.$t('message.ordering.dialog.tipsTitle'),
        message: this.$t('message.ordering.dialog.confirmMessage'),
        confirmButtonText: this.$t('message.ordering.dialog.confirmOK'),
        cancelButtonText: this.$t('message.ordering.dialog.confirmCancel')
      }).then(action => {
        console.log(23);
        if (action == 'confirm') {
            this._newOrder();
        }
      }).catch(error =>{
        if(error == 'cancel'){
          console.log('点击取消');
        }
      })
    },

    _newOrder() {
      var apiUri = api.orders.newOrderOnline;

      let that = this;

      if( !this.consumerInfo.phone 
          || (!this.sid && this.consumerInfo.phone.length < 5 )
          || (!this.sid && this.consumerInfo.phone.length > 15 )) {
        MessageBox.confirm( this.$t("message.ordering.warning.phonewarn") );
        return;
      }

      var sid = "AD-" + this.consumerInfo.phone.trim();
      if( this.foodPickup == 2) {
        sid = "AP-" + this.consumerInfo.phone.trim();
      }
      //选择了桌台，那肯定是堂吃了
      if(this.sid) {
        sid = "TC-" + this.consumerInfo.phone.trim();
      }

      var addr = "";
      if(!this.consumerInfo.address && this.foodPickup == 1) {
        //送餐一定需要地址的
        MessageBox.confirm( this.$t("message.ordering.warning.addrwarn") );
        return;
      }
      
      if( this.payType == 10 && (
          !this.consumerInfo.creditID ||
          !this.consumerInfo.creditName ||
          !this.consumerInfo.creditValidity )) {
        //选择了信用卡，ID就不能为空
        MessageBox.confirm( this.$t("message.ordering.warning.creditwarn") );
        return;
      }

      if (this.consumerInfo.address && this.foodPickup == 1) {
        addr = this.consumerInfo.address.trim();
      }
      

      if ("en_US" == this.$i18n.locale) {
        for(var i = 0; i < this.order.length; i++ ) {
          this.order[i].name = this.order[i].enName;
        }
      } 
        
      var order = JSON.stringify(this.order);

      var openId = storage.getLocalstorage("user", "openid", "");

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
            "&mark=" +
            this.mark +
            "&totalPrice=" +
            this.amount.total +
            "&gratuity=" +
            this.amount.tip +
            "&amount=" +
            this._amountPay() +
            "&payType=" +
            this.payType +
            "&addr=" +
            addr +
            "&openId=" + openId +
            (this.payType == 10 ? 
            "&creditID=" + this.consumerInfo.creditID +
            "&creditValidity=" + this.consumerInfo.creditValidity
            : "")
        )
        .then(res => {
          if (res.data.code === 0) {

            console.log("res.data", res.data);

            if( that.payType == 2) {
              //调起支付接口
              Toast("暂不支持微信支付");

            } else if(that.payType == 10) {
              // Toast(that.$t("message.ordering.creditOrderdTips"))
            }
            this._saveContact();

            // let msg = "Your order number " + res.data.data.oid + ", Total $" 
            //             + this._amountPay()
            //             + ". It takes 25 minutes to done. Thank you!"

            let msg = "Your order Total Amount is: $" 
                        + this._amountPay()
                        + ". It takes 25 minutes to done. Thank you!"
                        
            MessageBox({
                title: "Order submitted successfully",
                message: msg, 
                showCancelButton: false,
                confirmButtonText: "OK"
            }).then( () => {
              that.toRestaurant(true)
            })

          } else {
            Toast(that.$t("message.errorTips.otherCode") + res.data.msg);
          }
        })
        .catch(error => {
          Toast(that.$t("message.errorTips.netError"));
        });
    },
    _saveContact() {
      let that = this;

      if(this.sid) {
        return;
      }

      this.consumerInfo.name = this.consumerInfo.phone;
      
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
        })
        .catch(error => {
          Toast(this.$t("message.errorTips.netError"));
          console.log("网络异常，请稍后重试: " + error);
        });
    },
    subCount(item) {
      item.count -= 1;
      var that = this;
      if (item.count <= 0) {
        var ret = this.mui.confirm("确定要删除吗", "提醒", function(e) {
          if (e.index == 1) {
            var id = that.order.indexOf(item);

            that.order.splice(id, 1);
          } else {
            item.count = 1;
          }
          console.log("confirm: ", e);
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/const.scss";
@import "~@/assets/scss/mixin.scss";

.ordering-title {
  text-align: center;
}
.order-item-cell {
  padding-right: 20px;
}
.ordering-submit {
  margin-right: 50px;
  margin-bottom: 10px;
  width: 100px;
}
.ordering-cancel {
  margin-right: 50px;
  margin-bottom: 10px;
  width: 100px;
}

.order-item-name {
  width: 60%;
}
.order-item-flavor {
  font-size: smaller;
  color: #7e7979;
}
.order-item-price {
  right: 60px;
  position: absolute;
}
.order-item-count {
  right: 100px;
  position: absolute;
}
.order-item-add {
  right: 30px;
  position: absolute;
  width: 20px;
  // height: 10px;
}
.order-item-sub {
  right: 0px;
  position: absolute;
  width: 20px;
  // height: 10px;
}
.order-item-title {
  color: blue;
  font-size: smaller;
}

.ordering-center {
  position: absolute;
  width: 50%;
  left: 25%;
}
</style>
