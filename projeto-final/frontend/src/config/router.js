import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '@/components/home/Home'
import AdminPages from '@/components/admin/AdminPages'
import ArticlesByCategory from '@/components/article/ArticlesByCategory'
import ArticleById from '@/components/article/ArticleById'
import Auth from '@/components/auth/Auth'
import axios from 'axios'
import { userKey, baseApiUrl} from '@/global'
Vue.use(VueRouter)

const routes = [{
    name: 'home',
    path: '/',
    component: Home
}, {
    name: 'adminPages',
    path: '/admin',
    component: AdminPages,
    meta: {
        requiresAdmin: true
    }
}, {
    name: 'ArticlesByCategory',
    path: '/categories/:id/articles',
    component: ArticlesByCategory
}, {
    name: 'ArticleById',
    path: '/articles/:id',
    component: ArticleById
},{
    name: 'Auth',
    path: '/auth',
    component: Auth
}
]
const router  =  new VueRouter({
    mode: 'history',
    routes
})

router.beforeEach(async (to, from, next) => {
    const json = localStorage.getItem(userKey)
    if(to.matched.some( record => record.meta.requiresAdmin)) {
        const user = JSON.parse(json)
        const admin = await axios.post(`${baseApiUrl}/validateAdmin`,user)
        user && admin.data ? next() : next({path: '/'})
    } else { 
        next()
    }
})
export default router


