<template>
    <div class="order-page" id="order-page">
      <div class="orders">
        <!-- 电子小票打印区 -->
        <div class="right-order-item" v-for="(item,index) in orderData" :key="index">
          <!-- 打印小票记录 -->
          <div class="order">
            <div class="order-title">
              <span>Order's Status：</span>
              <span>{{ status( item.status) }}</span>
            </div>
            <div :id="'order-page-' + index" class="order-page">
              <table border="0" cellspacing="0" style="font-size: 12px; width: 100%;">
                <thead>
                  <tr>
                    <td colspan="3">
                      <span style="float: left;">Table：{{item.sid}}</span>
                      <span style="float: right;">Time：{{item.time}}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="3">Order's ID：{{item.orderid}}</td>
                  </tr>
                  <tr>
                    <td
                      align="left"
                      style="width: 60%; font-weight: bolder; border-top: 1px dashed rgb(0, 0, 0);"
                    >Food</td>
                    <td
                      align="center"
                      style="width: 20%; font-weight: bolder; border-top: 1px dashed rgb(0, 0, 0);"
                    >Count</td>
                    <td
                      align="center"
                      style="width: 20%; font-weight: bolder; border-top: 1px dashed rgb(0, 0, 0);"
                    >Price</td>
                    <!-- <td
                      align="center"
                      style="width: 20%; font-weight: bolder; border-top: 1px dashed rgb(0, 0, 0);"
                    >金额</td> -->
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(food,index) in item.foods" :key="index">
                    <td align="left" style="width: 60%;">{{food.food_name}}</td>
                    <td align="center" style="width: 20%;">{{food.count}}</td>
                    <!-- <td align="center" style="width: 20%;">{{food.unit_price}}</td> -->
                    <td align="center" style="width: 20%;">{{food.count * food.unit_price}}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colspan="3"
                      style="border-top: 1px dashed rgb(0, 0, 0); font-weight: bolder; font-size: 18px;"
                    >Total：${{ showTotal(item) }}</td>
                  </tr>
                  <tr>
                    <td
                      colspan="3"
                      style="border-top: 1px dashed rgb(0, 0, 0); font-weight: bolder; font-size: 18px;"
                    >Tax：${{ showTax(item) }} </td>
                  </tr>
                  <tr>
                    <td
                      colspan="3"
                      style="border-top: 1px dashed rgb(0, 0, 0); font-weight: bolder; font-size: 18px;"
                    >Amount：${{ showAmount(item) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>


      <div style="position:absolute;left:40%;">
	      <span>Tody's Orders</span>
      </div>

      <div style="position:absolute;right:20px;">
	      <span @click="gotoHistoryOrders">History's>></span>
      </div>

      <div style="position:absolute;left:20px;">
        	<img class="back-to-home" src="/static/img/back.png" @click="backToHome" />
      </div>

    </div>
</template>

<script>
import axios from "axios";
import { MessageBox } from "mint-ui";
import { Toast } from "mint-ui";

import api from "@/global/api.js";
import storage from "@/global/storage.js";

export default {
  data() {
    return {
      receipts: null,

      consumerInfo: {
        phone: null,
        food_name:null,
        address: null,
        gratuity: 1.0,
        mark: null
      },

      rid: parseInt(this.$route.query.rid),
      uuid: this.$route.query.uuid,

      orderData: []
    };
  },
  methods: {
	  gotoHistoryOrders() {
      		this.$router.push({ path: "/term/historyorders", query: { rid: this.rid, uuid: this.uuid} });
	  },
    backToHome() {

      //返回上页
      let path = "/term/restaurant"
      if(this.consumerInfo.type) {
        path = "/term/" + this.consumerInfo.type
      }
      //返回上页
      this.$router.push({
        path: path,
        query: { rid: this.rid, uuid: this.uuid, sid: this.sid }
      });
      
    },

	_loadOrders() {
		let that = this;
		axios
			.get(
				api.orders.orderedList + "?phone=" + this.consumerInfo.phone
			)
			.then(res => {
				if (res.data.code != 0) {
					Toast(this.$t("message.errorTips.otherCode") + res.data.msg);
					return;
				}
				//判断是否有必选项
				that.orderData = res.data.data;

				})
			.catch(err => {
				console.log(err);
				Toast(this.$t("message.errorTips.netError"));
			});
	}
  },
  mounted() {
    	this.consumerInfo = storage.getLocalstorage("user", "consumerInfo", {});

      this._loadOrders();
      
      if( this.consumerInfo.type == "pc") {
        // ordering 增加一个类，不要全屏显示 订单
        let ordering = document.getElementById("order-page");
        ordering.className += " order-center"
      }
  },
  computed:{
	  status() {
      return function(status) {
        var _status = this.$t("message.shopcart.state.queueUp");
                  if (0 == status)
                    _status = this.$t("message.shopcart.state.queueUp");
                  else if (2 == status)
                    _status = this.$t("message.shopcart.state.cooking");
                  else if (10 == status)
                    _status = this.$t("message.shopcart.state.giveUp");
                  else if (15 <= status)
        _status = this.$t("message.shopcart.state.finish");
        
        return _status;
      }
	  },
    showTax() {
      return function(item) {
        let tax = item.taxRate * item.totalPrice;
        return tax.toFixed(2);
      }
    },
    showTotal() {
      return function(item) {
        return Number.parseFloat(item.totalPrice).toFixed(2);
      }
    },
    showAmount() {
      return function(item) {
        return Number.parseFloat(item.amount).toFixed(2);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/const.scss";
@import "~@/assets/scss/mixin.scss";

tr,
th {
  text-align: left;
}

.orders {
  position: absolute;
  left: 20px;
  top: 40px;
  width: 80%;
  margin: 20px auto;
  height: auto;
}
.right-order-item {
  background: #f8f8f8;
  color: #0e0e0e;
  text-align: left;
}
.order {
  position: relative;
  text-align: left;
  text-align: left;
  margin-left: 10px;
  margin-right: 10px;
  border-color: aqua;
  margin-bottom: 20px;
}
.order-title {
  position: relative;
  line-height: 35px;
  font-weight: 700 !important;
  font-size: 18px !important;
}

.order-center {
  position: absolute;
  width: 50%;
  left: 25%;
}
</style>