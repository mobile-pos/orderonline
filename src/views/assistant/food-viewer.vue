<template>
    <div class="food-viewer">
        <div class="mui-card">
            <!--内容区-->
            <div class="mui-card-content">
                <div >
                    <img v-lazy="food.image" width="100%" height="100%" :key="imgkey" >
                </div>
                <div>
                    {{showDesc}}
                </div>
                
                <flavors
                    :food="food"
                    ref="flavorRef"
                    />
            </div>
        </div>
    </div>
</template>

<script>
import flavors from "./flavors";
export default {
    name: "food-viewer",
    components: {
        flavors
    },
    props: {
        food: Object,
        default: null
    },
    mounted() {
        this.mui.init({

        })
    },
    computed: {
        showDesc() {
            if( "en_US" == this.$i18n.locale) {
                return this.food.enDescribe;
            } else {
                return this.food.description;
            }
        },
        imgkey() {
            return Math.random() + ":" + this.food.id + ":" + this.food.cid;
        }
    },
    methods: {
        changeFlavor(food, event) {
            console.log("change flavor", food);
            this.$parent.changeFlavor(food, event);
        },
        getFood() {
            return this.$refs.flavorRef.getFood();
        }
    }
}
</script>

<style scoped>
.desc-info {
    font-size: 12px;
}
.mui-card {
    margin: 2px;
}
.img[lazy="loading"]{
    display:block;
    width: 300px;
    height: 300px;
    margin: 0 auto;
}
</style>