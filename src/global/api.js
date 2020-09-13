// 'use strict';

// let apiUrl = 'http://124.156.202.219/index.php/pos'

//let apiUrl =  "http://120.24.66.234/index.php/pos";
let apiUrl =  "/index.php/pos";

let api = {
  login: apiUrl + "/projs.oauth/login", // 消费者登录
  regist: apiUrl + "/projs/oauth/regist", //消费者注册

  foods: apiUrl + "/term.foods/_list", // 餐馆 菜普清单
  specialFoods: apiUrl + "/term.foods/specialFoods", //特殊菜谱

  flavors: apiUrl + "/term.foods/flavors", // 当前菜普下的跟随项

  orders: {
    newOrder: apiUrl + "/term.orders/newOrder", //下单
    newOrderOnline: apiUrl + "/term.orders/newOrderOnline", //线上下单
    checkOrderStatus: apiUrl + "/term.orders/checkOrderStatus", //查看订单状态
    queueNo: apiUrl + "/term.orders/getQueueNo", //查询排队号
    updateOrderReceipts: apiUrl + "/term.orders/updateOrderReceipts", //追加订单
    orderedList: apiUrl + "/term.orders/orderedList", //已下的订单
    historyOrderedList: apiUrl + "/term.orders/historyOrderedList", //已结束的订单
  },
  tables: {
    loadTables: apiUrl + "/term.tables/loadTables", // 桌子数量
    satdown: apiUrl + "/term.tables/tabSatdown" //已就坐
  },
  restaurants: {
    load: apiUrl + "/term.restaurants/_list",
    loadRestaurant: apiUrl + "/term.restaurants/loadRestaurant"
  },
  consumers: {
    update: apiUrl + "/term.consumers/updateContact",
    receipts: apiUrl + "/term.consumers/getHistReceipts" // 自己的定单
  }, 

  wx: {
    appid: 'wx2b3c3c7f9360d1e7',
    getSignature: apiUrl + "/gzh.message/getsignature", //
    getOpenId: apiUrl + "/gzh.message/getOpenId"
  },
  ai: {
    detect: apiUrl + "/ai.foodai/detect"
  }
};

export default api;
