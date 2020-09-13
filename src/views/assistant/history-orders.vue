<template>
    <div class="order-page">
      <div class="orders">
        <!-- 电子小票打印区 -->
        <div class="right-order-item" v-for="(item,index) in orderData" :key="index">
          <!-- 打印小票记录 -->
          <div class="order">
            <div class="order-title">
              <span>Order's Status</span>
              <span>{{ status( item.status) }}</span>
            </div>
            <div :id="'order-page-' + index" class="order-page">
              <table border="0" cellspacing="0" style="font-size: 12px; width: 100%;">
                <thead>
                  <tr>
                    <td colspan="4">
                      <span style="float: left;">Table：{{item.sid}}</span>
                      <span style="float: right;">Time：{{item.time}}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="4">Order's ID：{{item.orderid}}</td>
                  </tr>
                  <tr>
                    <td
                      align="left"
                      style="width: 40%; font-weight: bolder; border-top: 1px dashed rgb(0, 0, 0);"
                    >Food</td>
                    <td
                      align="center"
                      style="width: 20%; font-weight: bolder; border-top: 1px dashed rgb(0, 0, 0);"
                    >Count</td>
                    <td
                      align="center"
                      style="width: 20%; font-weight: bolder; border-top: 1px dashed rgb(0, 0, 0);"
                    >Price</td>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="food in item.foods" :key="index">
                    <td align="left" style="width: 40%;">{{food.food_name}}</td>
                    <td align="center" style="width: 20%;">{{food.count}}</td>
                    <td align="center" style="width: 20%;">{{food.count * food.unit_price}}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colspan="4"
                      style="border-top: 1px dashed rgb(0, 0, 0); font-weight: bolder; font-size: 18px;"
                    >Total：${{item.totalPrice}}</td>
                  </tr>
                  <tr>
                    <td
                      colspan="4"
                      style="border-top: 1px dashed rgb(0, 0, 0); font-weight: bolder; font-size: 18px;"
                    >Tax：${{item.taxRate * item.totalPrice}} </td>
                  </tr>
                  <tr>
                    <td
                      colspan="4"
                      style="border-top: 1px dashed rgb(0, 0, 0); font-weight: bolder; font-size: 18px;"
                    >Amount：${{item.amount}}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div style="position:absolute;left:40%;">
	      <span>History Orders</span>
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
				api.orders.historyOrderedList + "?phone=" + this.consumerInfo.phone
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

</style>