<template>
  <div class="flavors">
    <div class="required-addtion">
      <template v-for="flavors in requireAddtions">
        <template v-for="(item, key) in flavors">
          <template v-if="item.type == 'single'">
            <div class="addition-title">
              <span>{{ key }}</span>
              <span>*</span>
            </div>
            <mt-radio
              v-bind:key="key"
              v-model="radioValue[key]"
              v-bind:title="$t('message.flavors.necessary')"
              :options="item.data"
              @change="radioChanged"
              @blur.native.capture="checkEmpty($event)"
            />
          </template>
          <template v-else>
            <div class="addition-title">
              <span>{{ key }}</span>
              <span>*</span>
            </div>

            <mt-checklist
              v-bind:key="key"
              v-model="checkBoxValue[key]"
              v-bind:title="$t('message.flavors.multipleOptions')"
              :options="item.data"
              @change="checkBoxChanged"
              @blur.native.capture="checkEmpty($event)"
            />
          </template>
        </template>
      </template>
    </div>
    <div class="option-addtion">
      <template v-for="flavors in optionAddtions">
        <template v-for="(item, key) in flavors">
          <template v-if="item.type == 'single'">
            <div class="addition-title">
              <span>{{ key }}</span>
            </div>

            <mt-radio
              v-bind:key="key"
              v-model="radioValue[key]"
              v-bind:title="$t('message.flavors.necessary')"
              :options="item.data"
              @change="radioChanged"
            />
          </template>
          <template v-else>
            <div class="addition-title">
              <span>{{ key }}</span>
            </div>

            <mt-checklist
              v-bind:key="key"
              v-model="checkBoxValue[key]"
              v-bind:title="$t('message.flavors.multipleOptions')"
              :options="item.data"
              @change="checkBoxChanged"
            />
          </template>
        </template>
      </template>
    </div>

    <div class="extension-addtion">
      <div style="height:5px"></div>
      <div>
        <mt-field
          v-bind:placeholder="$t('message.flavors.specialReq')"
          v-model="addition"
          type="textarea"
          rows="4"
          @blur.native.capture="checkEmpty($event)"
        ></mt-field>
      </div>
    </div>
    <div class="footer">
      <!-- 显示购物车 -->
    </div>
  </div>
</template>

<script>
import { MessageBox } from "mint-ui";
import { Toast } from "mint-ui";
import { Checklist } from "mint-ui";
import { Radio } from "mint-ui";

import axios from "axios";
import storage from "@/global/storage.js";
import api from "@/global/api.js";

export default {
  component: {},
  props: {
    food: {
      type: Object
    },
    rid: {
      type: Number,
      default: 0
    },
    uuid: {
      type: String,
      default: "00000000000000"
    }
  },
  data() {
    return {
      miltiValues: [],
      restaurant: {},
      requireAddtions: [], // 必选附加项
      optionAddtions: [], // 可选附加项
      extAddtion: "", // 手写的额外附加项
      addition: "",

      radioValue: {},
      checkBoxValue: {}
    };
  },
  mounted() {
    console.log("---- flavors mounted -------");
    console.log(this.food);
    // if (typeof this.food.flavors == "string") {
    //   try {
    //     this.food.flavors = JSON.parse(this.food.flavors);
    //   } catch (error) {
    //     console.log("flavors parse faled: " + error);
    //   }
    // }

    // let that = this;
    try {
      var flavors = JSON.parse(this.food.flavors);
      if (typeof flavors == "string") {
        flavors = JSON.parse(flavors);
      }

      Object.keys(flavors).forEach(key => {
        var item = flavors[key];
        console.log(key, item);

        var a = {};
        a[key] = item;

        if (item.type == "single") {
          this.radioValue[key] = "";
        } else {
          this.checkBoxValue[key] = [];
        }

        if (item.require && item.require == "true") {
          this.requireAddtions.push(a);
        } else {
          this.optionAddtions.push(a);
        }

        this.$forceUpdate();
      });
    } catch (error) {}
  },
  created() {
    console.log("---- flavors created -------");
    if (!this.food.id) {
      return;
    }
    // // this.restaurant = storage.getLocalstorage("user", "restaurantInfo", {});

    // this.load();
  },
  destroyed() {
    console.log("---- flavors destroyed -------");
  },
  computed: {

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
  updated() {
    var labels = ["mint-radio-label", "mint-checkbox-label"];

    //需要手工修改节点格式
    labels.forEach(label => {
      var eles = document.getElementsByClassName(label);
      Object.keys(eles).forEach(key => {
        var data = eles[key].innerText;
        try {
          //可能是json，需要显示 名称和 额外价格
          var d = JSON.parse(data);
          var k = Object.keys(d)[0];
          eles[key].style.position = "absolute"; //("position:absolute;width:100%")
          eles[key].style.width = "100%";
          if (d[k] > 0) {
            eles[key].innerHTML =
              '<div style="width: 60%; position: absolute; margin-left: 10px;">' +
              k +
              '</div><div style="width: 80px;  position: absolute; right: 10px;">¥' +
              d[k] +
              "</div>";
          } else {
            eles[key].innerHTML =
              '<div style="width: 60%; position: absolute; margin-left: 10px;">' +
              k +
              "</div>";
          }
        } catch (error) {
          //文件，就直接显示
        }
      });
    });

    //修改多选项风格
    var checkboxes = document.getElementsByClassName("mint-checkbox-core");
    Object.keys(checkboxes).forEach(key => {
      delete checkboxes[key].style["borderRadius"];
    });
  },
  activated() {},
  methods: {
    load() {
      var that = this;

      axios
        .get(
          api.flavors +
            "?&rid=" +
            this.rid +
            "&uuid=" +
            this.uuid +
            "&fid=" +
            this.food.id
        )
        .then(res => {
          if (0 != res.data.code) {
            //需要处理必选和可选项
            try {
              var flavors = JSON.parse(res.data.data[0].flavors);
              if (typeof flavors == "string") {
                flavors = JSON.parse(flavors);
              }

              Object.keys(flavors).forEach(key => {
                var item = flavors[key];
                console.log(key, item);

                var a = {};
                a[key] = item;

                if (item.type == "single") {
                  that.radioValue[key] = "";
                } else {
                  that.checkBoxValue[key] = [];
                }

                if (item.require && item.require == "true") {
                  that.requireAddtions.push(a);
                } else {
                  that.optionAddtions.push(a);
                }

                that.$forceUpdate();
              });
            } catch (error) {}
          } else if (-1 == res.data.code) {
            //没有跟随项，只有标准做法
          } else if (255 == res.data.code) {
            //餐馆下线，无法正常动作
            Toast(this.$t("message.errorTips.255"));
          } else {
            Toast(
              this.$t("message.errorTips.otherCode") +
                ", " +
                res.data.code +
                ": " +
                res.data.msg
            );
          }
        })
        .catch(error => {
          console.log("网络异常，" + error);
          Toast(this.$t("message.errorTips.netError"));

          setTimeout(() => {
            that.load();
          }, 10 * 1000);
        });
    },

    radioChanged(event) {
      console.log("mt ration ....");
    },
    checkBoxChanged(event) {
      console.log("mt checklist ...");
    },
    getFood() {
      var food = Object.assign({}, this.food);

      if (!food.flavor) {
        food.flavor = [];
      }
      for (var key of Object.keys(this.radioValue)) {
        var item = this.radioValue[key];
        if ("" == item) {
          continue;
        }
        if (typeof item == "string") {
          food.flavor.push(item);
          continue;
        }

        try {
          var _k = Object.keys(item)[0];

          var addprice = item[_k];

          food.price = 1 * food.price + 1 * addprice;
          food.flavor.push(_k + "($" + addprice + ")");
        } catch (error) {}
      }
      for (var key of Object.keys(this.checkBoxValue)) {
        var items = this.checkBoxValue[key];
        if ("" == items || items.length == 0) {
          continue;
        }
        if (typeof items == "string") {
          food.flavor.push(items);
          continue;
        }

        var f = "";
        for (var item of items) {
          if (typeof item == "string") {
            f += " " + item;
            continue;
          }
          try {
            var _k = Object.keys(item)[0];

            var addprice = item[_k];

            food.price = 1 * food.price + 1 * addprice;
            f += " " + _k + "($" + addprice + ")";
          } catch (error) {
            f += " " + _k;
          }
        }
        food.flavor.push(f);
      }

      for (var k of food.flavor) {
        if (food.flavor[k] == "") {
          food.flavor.splice(k, 1);
        }
      }
      if (this.addition.length > 0) {
        food.flavor.push(this.addition);
      }

      return food;
    },
    checkEmpty(event) {
      console.log(event);
    }
  }
};
</script>

<style lang="scss" scoped>
.mint-radio-label {
  color: #2233ff;
}

.mint-checkbox-label {
  color: #9f9bc9af;
}
</style>
