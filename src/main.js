import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/fonts/iconfont.css'
import './assets/global.css'
Vue.config.productionTip = false
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/"
axios.interceptors.request.use(config => {
  // console.log(config)
  //为请求头对象，添加token验证的Authorization字段
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
})
Vue.prototype.$http = axios
Vue.component('tree-table', TreeTable)
// 将富文本编辑器注册为全局组件
Vue.use(VueQuillEditor)
Vue.filter("dataFormat", function (originVal) {
  const data = new Date(originVal)
  const y = data.getFullYear()
  const m = (data.getMonth() + 1 + '').padStart(2, "0")
  const d = (data.getDate() + '').padStart(2, "0")
  const h = (data.getHours() + '').padStart(2, "0")
  const mm = (data.getMinutes() + '').padStart(2, "0")
  const ss = (data.getSeconds() + '').padStart(2, "0")
  return `${y}-${m}-${d} ${h}:${mm}:${ss}`
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
