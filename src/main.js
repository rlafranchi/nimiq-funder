import Vue from 'vue'
import NimiqFunder from './NimiqFunder.vue'

Vue.config.productionTip = false

const app = new Vue({
  render: h => h(NimiqFunder)
}).$mount('#nimiq-funder')
export default app
