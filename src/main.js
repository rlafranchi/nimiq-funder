import Vue from 'vue'
import NimiqFunder from './NimiqFunder.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(NimiqFunder)
}).$mount('#nimiq-funder')
