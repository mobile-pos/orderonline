<template>
    <div class="restaurant-info">
      <span class="restaurant-img"><img :src="restaurant.icon"></span>
      <span class="restaurant-detail">

        <span class="restaurant-status">
          <span v-show="!restaurant.online" class="offline">Closed</span>
        </span>

        <template v-if="term == 0">
          <div class="restaurant-name">
            <h4>{{restaurant.name}}</h4>
          </div>
          <div class="restaurant-desc">
            <div class="restaurant-addr"><h5>{{restaurant.address}}</h5> </div>
            <div class="restaurant-phone"> <h5>{{restaurant.phoneNumbers}}</h5> </div>
            <div class="restaurant-tax" > <h5>{{restaurant.workTime}}</h5> </div>
          </div>
        </template>
        <template v-else>
          <div class="restaurant-name">
            <h5 style="color:red">{{restaurant.name}}</h5>
          </div>
          <div class="restaurant-desc-phone">
            <div class="restaurant-addr shop-extend-info" ><span >{{restaurant.address}}</span> </div>
            <div class="restaurant-phone shop-extend-info" > <span >{{restaurant.phoneNumbers}}</span> </div>
            <div class="restaurant-tax shop-extend-info"  > <span >{{restaurant.workTime}}</span> </div>
          </div>
        </template>
      </span>
    </div>
</template>


<script>
import { Toast } from "mint-ui";

import axios from "axios";
import api from "@/global/api.js";
import storage from "@/global/storage.js";

export default {
  props: {
    rid: {
      type: Number,
      default: 0
    },
    uuid: {
      type: String,
      default: '0'
    },
    term: {
      type: Number,
      default: 0 //0 pc, 1 pad, 2 phone
    }
  },
  data() {
    return {
        restaurant: {}
    }
  },
  mounted() {
      this.getRestaurantName()
      console.log("restaurant head init ok");


  },
  methods: {
    isOnline() {
      this.$parent.isOnline(this.restaurant);
    },
    updateTitle() {
        document.title = this.restaurant.name
        // document.body.style.backgroundImage = "/images/default.jpg";
        if( this.restaurant.bgImg) {
          document.querySelector('body').setAttribute("style", 'background-image:url("' + this.restaurant.bgImg + '");background-size: cover;')
        }
    },

    getRestaurantName() {
        var that = this;
        axios.get(api.restaurants.loadRestaurant + "?rid=" + this.rid + "&uuid=" + this.uuid)
            .then(res => {
              if (res.data.code != 0) {
                Toast(that.$t("message.errorTips.otherCode") + res.data.msg);
                return;
              }
            //   that.restaurantName = res.data.data.name;
            //   that.taxRate = res.data.data.taxRate;
              that.restaurant = res.data.data

              storage.setLocalstorage("sys", "restaurantInfo", res.data.data);
              that.updateTitle()
              
              that.isOnline();
          }).catch(error => {
            console.log(error);
            Toast(that.$t("message.errorTips.netError") + ": " + error);
          })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/const.scss";
@import "~@/assets/scss/mixin.scss";


.restaurant-info {
  width: 100%;
  height: 80px;
  margin-bottom: 3px;
  padding-bottom: 5px;
}
.restaurant-name {
  color: red;
}
.restaurant-img {
  width: 100px;
  height: 100px;
}
.restaurant-detail {
  float: right;
  width: -webkit-calc(100% - 110px);
  height: 100%;
  text-align: left;
}

img {
  width: 100px;
  height: 100px;
}

.restaurant-status {
  position: absolute;
  left: 55px;
  top: 55px;
  font-size: 12px;
  background-color: rgba(220, 206, 206, 0.5);
  .online {
    color: blue;
  }
  .offline {
    color: red;
  }
}

.shop-extend-info {
  line-height: 10px;
  font-size: 10px;
  margin: 3px;
  color:rgba(107, 105, 105, 0.5)
}

</style>