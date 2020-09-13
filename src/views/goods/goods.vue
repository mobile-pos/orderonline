<!-- 商家模块 点菜页面 -->

<template>
  <div>
    <language-choose></language-choose>
    <!-- 商家模块头部 -->
    <seller-header :seller="seller"></seller-header>

    <div class="toolbar">
      <img class="table" src="./img/grid.png" @click="showTables()" />

      <img class="line" src="./img/line.png" @click="switchLine()" />
      <img class="grid" src="./img/grid.png" @click="switchGrid()" />
    </div>

    <template v-if="type == 'line'">
      <line-layout />
    </template>
    <template v-else>
      <grid-layout />
    </template>
  </div>
</template>

<script>
import SellerHeader from "./seller-header";
import LanguageChoose from "@/coms/languages/languages";

import FoodsLineLayout from "./foods-line-layout";
import FoodsGridLayout from "./foods-grid-layout";

export default {
  components: {
    "seller-header": SellerHeader,
    "language-choose": LanguageChoose,
    "line-layout": FoodsLineLayout,
    "grid-layout": FoodsGridLayout
  },
  data() {
    return {
      type: "line",
      rid: 0,
      sid: 0
    };
  },
  filters: {},
  computed: {},
  created() {
    // 初始化数据
  },
  mounted() {},
  destroyed() {},
  methods: {
    switchLine() {
      this.type = "line";
    },
    switchGrid() {
      this.type = "grid";
    },
    showTables() {
      //显示桌子列表，选择桌号

      this.$router.push({ path: "/tables" });
    }
  }
};
</script>

<style lang="scss" scoped>
.language {
  position: fixed;
  z-index: 9999;
  right: 10px;
  color: #f00;
  opacity: 0.6;
}

.toolbar {
  background-color: rgb(49, 47, 47);
  height: 20px;
  position: absolute;
  img {
    width: 20px;
    right: 10px;
    position: fixed;
    z-index: 999;
  }
  .line {
    right: 10px;
  }
  .grid {
    right: 35px;
  }
  .table {
    right: 60px;
  }
}
</style>

