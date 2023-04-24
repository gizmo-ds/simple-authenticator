import { createRouter, createWebHashHistory } from 'vue-router'
import Unlock from '@/views/Unlock.vue'
import Login from '@/views/Login.vue'
import { useAccountStore } from '@/stores/account'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
      meta: {
        require_unlock: true,
      },
    },
    {
      path: '/unlock',
      name: 'unlock',
      component: Unlock,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/Register.vue'),
      meta: {
        header_title: 'Create Account',
      },
    },
  ],
})

router.beforeResolve(async (to, from, next) => {
  const account = localStorage.getItem('account')
  if (to.meta.require_unlock && !account) return next({ name: 'login' })
  const account_store = useAccountStore()
  if (to.meta.require_unlock && !account_store.account)
    return next({ name: 'unlock' })
  next()
})

export default router
