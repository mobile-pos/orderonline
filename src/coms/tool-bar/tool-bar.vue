<template>
  <div class="tool-bar">
    <div class="tool-bar-left">
      <slot name="left"></slot>
    </div>
    <div class="tool-bar-right">
      <slot name="right"></slot>
      <languages />
    </div>
  </div>
</template>

<script>
import languages from "@/coms/languages/languages";
export default {
  components: {
    languages
  }
};
</script>

<style lang="scss" scoped>
.tool-bar {
  position: relative;
  height: 30px;
  width: 100%;
  .tool-bar-left {
    position: relative;
    width: 100%;
  }
  .tool-bar-right {
    position: absolute;
    right: 20px;
    top: 10px;

    .languages {
      right: 5px;
      top: -5px;
    }
  }
}
</style>