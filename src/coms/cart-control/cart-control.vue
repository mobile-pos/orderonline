<!-- 购物车控制 ( - num + ) 组件 -->

<template>
  <div class="cart-control">
    <transition name="move">
      <div class="decrease" @click.stop.prevent="decrease($event)" v-show="food.count > 0">
        <i class="icon-remove_circle_outline"></i>
      </div>
    </transition>

    <div class="num" v-show="food.count > 0">{{ food.count }}</div>

    <div class="add" @click.stop.prevent="add($event)">
      <i class="icon-add_circle"></i>
    </div>
  </div>
</template>

<script>
import Vue from "vue";

export default {
  components: {},
  data() {
    return {};
  },
  props: {
    // 操作哪个商品
    food: {
      type: Object
    }
  },
  watch: {},
  methods: {
    decrease(event) {
      // 解决移动端响应两次点击事件的问题
      // if (!event._constructed) {
      //   return;
      // }

      if (this.food.count) {
        this.food.count--;
      }

      this.$emit("change", this.food);

      this.$forceUpdate();
    },
    add(event) {
      // 解决移动端响应两次点击事件的问题
      // if (!event._constructed) {
      //   return
      // }

      // 修改对象的一个不存在的属性时（this.food.count = 1），DOM 不会更新
      // 需要使用 Vue.set()
      if (!this.food.count) {
        // this.food.count = 1
        // Vue.set(this.food  , 'count', 1)
        Vue.set(this.food, "count", 1);
        //第一次加入时，需要放到购物车
        this.$emit("addFoodToShopcar", this.food);
      } else {
        this.food.count++;
      }
      // 将当前 dom 传递出去，用来做小球飞入效果
      this.$emit("drop", event.target);

      this.$emit("change", this.food);

      this.$forceUpdate();
    }
  },
  computed: {},
  created() {},
  mounted() {}
};
</script>

<style lang="scss" scoped>
@import "~@/assets/scss/const.scss";
@import "~@/assets/scss/mixin.scss";

.cart-control {
  font-size: 0;
  line-height: 14px;
  .decrease{
    display: inline-block;
    // padding: 6px;
    float:left;
    i {
      font-size: 24px;
      color: #5ed14f;
      display: inline-block;
    }
  }
  .add {
    display: inline-block;
    // padding: 6px;
    float:right;
    i {
      font-size: 24px;
      color: #5ed14f;
      display: inline-block;
    }
  }
  .num {
    display: inline-block;
    padding: 6px;
    font-size: 16px;
    text-align: center;
    color: rgb(147, 153, 159);
    vertical-align: top;
  }
}

.move-enter-active,
.move-leave-active {
  opacity: 1;
  transform: translate3d(0, 0, 0);
  transition: all 0.4s;
  i {
    transform: rotate(0);
    transition: all 0.4s;
  }
}
.move-enter,
.move-leave-to {
  opacity: 0;
  transform: translate3d(24px, 0, 0);
  transition: all 0.4s;
  i {
    transform: rotate(360deg);
    transition: all 0.4s;
  }
}
</style>
