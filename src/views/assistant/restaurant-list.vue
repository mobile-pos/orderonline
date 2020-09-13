<template>
  <div class="restaurants">
    <template v-for="item in restaurants">
        <div class="restaurant-item" 
                      :key="item.name"
                      @click="toRestaurant(item.id, item.uuid)"
                  >
          <div class="left">
              <img v-lazy="item.icon">
          </div>

          <div class="right">
              <div class="name">{{ item.name }}</div>
              <!-- <div class="status fee"><span>{{ statusDesc(item.status) }}</span></div> -->

              <div class="mid clearfix">
                <star class="fl" :size="24" :score="item.score"></star>
                <span class="count fl">{{ $t("message.goods.selledInMonth") }} 999 {{ $t("message.goods.unit") }}</span>
                <!-- <span class="distance fr" @click="reloadGPS">{{ showDistance(item) }}</span> -->
                <span class="time fr">40 Minutes</span>
              </div>
              
              <div class="mid ">
                <span class="address">Address：{{ item.address }}</span>
              
                <span class="worktime">{{ $t("message.app.pages.worktime") }}: {{ item.workTime }}</span>
                
                <span class="phoneno">{{ $t("message.app.pages.phone") }}: {{ item.phoneNumbers }}</span>
              </div>

              <div class="activity" v-for="(sup,index) in item.discounts2" v-bind:key="index">
                <p><img :src="sup.icon_url">{{sup.info}}</p>
              </div>
              
            </div>
        </div>
    </template>
  </div>
</template>

<script>
import { Toast } from "mint-ui";

import { Tabbar, TabItem } from "mint-ui";

import Star from '@/coms/star/star'
import toolbar from "@/coms/tool-bar/tool-bar";

import axios from "axios";
import api from "@/global/api.js";
import storage from "@/global/storage.js";

export default {
  compponents: {
        Star,
        Tabbar,
        TabItem,
        "tool-bar": toolbar
  },

  data() {
    return {
      restaurants: [
      ]
    };
  },

  created() {
  },
  
  mounted() {
    this.loadList();
  },
  computed: {
    statusDesc() {
      return function(status) {
        var desc = "准备中";
        if (1 == status) {
          desc = "洽谈中";
        } else if (2 == status) {
          desc = "测试中";
        } else if (3 == status) {
          desc = "营业中";
        } else if (4 == status) {
          desc = "暂停营业";
        }

        return desc;
      };
    }
  },
  methods: {
    toRestaurant(id, uuid) {
      this.$router.push({
        path: "/term/pc",
        query: { rid: id, uuid: uuid }
      });
    },

    loadList() {
      var that = this;

      let selfGPS = storage.getLocalstorage("gps", "position", {
            lat: 0.0,
            lng: 0.0
          });
          
      axios
        .get(api.restaurants.load + "?language=zh_CN").then(res => {
          if (res.data.code != 0) {
            Toast(this.$t("message.errorTips.otherCode") + res.data.msg);
            return;
          }
          let list = res.data.data;
          for(var i = 0; i < list.length; i++) {
            if(!list[i].discounts2) {
              list[i].discounts2 = [
                    {
                        "id": -3,
                        "type": 99,
                        "info": "由当店提供高品质送餐服务",
                        "icon_url": "/static/img/deliver.png",
                        "use_icon_from_server": 1,
                        "display_code": 1,
                        "sequence": 49
                    }
              ]
            }
          }
          that.restaurants = list;
        })
        .catch(error => {
          Toast(this.$t("message.errorTips.netError") + ":" + error);
        });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/const.scss";
@import "~@/assets/scss/mixin.scss";

#index {
  display: flex;
  justify-content: center;
  // margin-top: 100px;
}
.restaurants {
  flex: 1;
  .restaurant-item {
    margin-bottom: 5px;
    display: flex;
    flex-direction: row;
    padding: 10px 0;
    overflow: hidden;
    @include onepx('bottom')
    &:last-child {
      &:after {
        border-top: 0;
      }
    }
    .left {
      flex: 0 0 110px;
      width: 110px;
      img {
        display: block;
        width: 100px;
        margin: 0 auto;
      }
    }
    .right {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding-right: 15px;
      overflow: hidden;
      .name {
        font-size: 17px;
        color: #333;
        overflow: hidden;
        font-weight: bold;
        margin-right: 15px;
        overflow: hidden;
        @include ellipsis(1);
      }
      .mid {
        flex: 1;
        font-size: 10px;
        color: #666;
        margin-top: 2px;
        span {
          display: inline-block;
          color: #656565;
        }
        .star {}
        .count {
          margin-left: 10px;
        }
        .distance {
          margin-left: 5px;
          margin-top: 2px;
        }
        .time {
          @include right-bar();
        }
      }
      .fee {
        flex: 1;
        font-size: 13px;
        margin-top: 7px;
        span {
          display: inline-block;
          color: #656565;
        }
        .start {
          @include right-bar();
        }
        .deliver {
          @include right-bar();
        }
        .average {}
      }
      .activity {
        flex: 1;
        font-size: 13px;
        color: #b0b0b0;
        margin-top: 7px;
        p {
          @include ellipsis(1)
        }
        img {
          width: 16px;
          height: 16px;
          margin-right: 5px;
          vertical-align: top;
        }
      }
    }
  }
}
</style>
