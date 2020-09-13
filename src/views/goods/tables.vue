<<template>
  <div>
    <ul class="restaurant-tables">
      <li
        class="tab-item"
        v-for="(tab, index) in tables"
        @click="selTable(tab.name, tab.satdown, $event)"
        :id="'T' + tab.name"
      >
        <div class="tab-title">
          {{ tab.name }}
        </div>
        <dev class="tab-info" v-if="tab.satdown == true">
          {{ tab.time.substr(11, 5) }}
        </dev>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from "axios";
import storage from "@/global/storage.js";
import api from "@/global/api.js";

import { Toast } from "mint-ui";

export default {
  data() {
    return {
      tables: [],
      selectedTab: 0,
      lastSelected: 0,
      restaurant: {}
    };
  },
  created() {
    this.restaurant = storage.getLocalstorage("user", "restaurantInfo", {});
  },
  mounted() {
    this.loadTables();
  },
  methods: {
    loadTables() {
      //
      let that = this;
      axios
        .get(
          api.tables.loadTables +
            "?rid=" +
            this.restaurant.rid +
            "&uuid=" +
            this.restaurant.uuid
        )
        .then(res => {
          if (res.data.code != 0) {
            //that.tables.push({ id: 1 });
            Toast(this.$t("message.errorTips.otherCode") + res.data.msg);
          } else {
            that.tables = res.data.data;
            console.log("tables: ", that.tables);
          }
        })
        .catch(error => {
          Toast(this.$t("message.errorTips.netError"));
        });
    },
    selTable(id, satdown, $event) {
      if (satdown == true) {
        //当前台桌已占用，请选择这其它台桌
        Toast("当前台桌已占用，请选择其它台桌");
        return;
      }
      this.selectedTab = id;

      let tab = document.getElementById("T" + id);
      if (!tab) {
        Toast(this.$t("message.table.unknownTable"));
        return;
      }
      tab.style.background = "#9c8383";

      let lastTab = document.getElementById("T" + this.lastSelected);
      if (lastTab && lastTab.style) {
        lastTab.style.background = "#ffffff";
      }
      this.lastSelected = id;
      Toast(this.$t("message.table.selTableID") + id);
      // this.$router.push({ path: "/pad", params: { sid: id } });
    }
  }
};
</script>

<style lang="scss" scoped>
.restaurant-tables {
  position: absolute;
  .tab-item {
    position: relative;
    height: 80px;
    text-align: center;
    background: #fff;
    border: 1px #d9d9d9 solid;
    width: 80px;
    float: left;
    padding: 10px 11px 0;
    margin: 0 15px 15px 0;
  }
  .tab-title {
    position: relative;
    top: 10px;
  }
  .tab-selected {
    background-color: #9c8383;
  }
  .tab-info {
    position: relative;
    top: 30px;
  }
}
</style>
