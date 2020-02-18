import router from "./index"
import store  from "@/store/index"

import { getToken , removeToKen , removeUsername} from "@/utils/app"

const whiteRouter = ['/login']
//路由守卫

/**
     * 1、直接进入index的时候，参数to被改变成了 "/index"，触发路由指向，就会跑beforeEach
     * 2、再一次 next 指向了login，再次发生路由指向，再跑beforeEach，参数的to被改变成了"/login"
     * 3、白名单判断存在，则直接执行next()，因为没有参数，所以不会再次beforeEach。
 */
router.beforeEach((to, from, next) => {
    if (getToken()) {
        if(to.path === '/login'){
            removeToKen()
            removeUsername()
            store.commit("app/REMOVE_TOKEN")
            store.commit("app/REMOVE_USERNAME")
            next()
        }else{
            next()
        } 
    } else {
        if (whiteRouter.indexOf(to.path) !== -1) {
            next()
        } else {
            next('/login')
        }
    }

})