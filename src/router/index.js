import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home
  }
]

const router = new VueRouter({
  routes
})
// 为路由挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to表示将要访问的路径
  // from表示从那个路径跳转而来
  // next是一个函数，表示放行，next('/home')表示强制跳转
  if (to.path === '/login') next();
  const a = window.sessionStorage.getItem('token');
  if (!a) next('/login');
  next()
})
export default router
