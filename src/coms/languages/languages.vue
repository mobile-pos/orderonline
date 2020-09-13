<template>
  <div class="languages">
    <img class="lang " src="/static/img/china.png" @click="chooseZH($event)" />
    <img class="lang active" src="/static/img/us.png" @click="chooseEN($event)" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      lang: "zh",
      image: "zh.jpg",
      desc: "中文"
    };
  },
  mounted() {
  },
  methods: {
    inActive() {
      var items = document.getElementsByClassName("lang");
      if (!items) {
        return;
      }

      Object.keys(items).forEach(key => {
        let item = items[key];
        item.className = "lang";
      });
    },
    chooseEN(event) {
      console.log("==== en =====");
      this.desc = "English";
      this.lang = "en";
      this.$i18n.locale = "en_US"; //关键语句

      this.inActive();
      event.target.classList.add("active");
    },
    chooseZH(event) {
      console.log("==== zh =====");
      this.desc = "中文";
      this.lang = "zh";
      this.$i18n.locale = "zh_CN"; //关键语句

      this.inActive();
      event.target.classList.add("active");
    }
  }
};
</script>


<style lang="scss" scoped>
.languages {
  position: relative;
  .lang {
    width: 20px;
    height: 15px;
  }

  .active {
    width: 25px;
    height: 20px;
  }
}
</style>
