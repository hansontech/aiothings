import Vue from 'vue'
import VueRouter from 'vue-router'
import Hello from '@/components/Hello'
import UserLogin from '@/components/UserLogin'
import Home from '@/components/Home'
import User from '@/components/User'
import MyThings from '@/components/MyThings'
import NewThing from '@/components/NewThing'
import EditThing from '@/components/EditThing'
import MyFavorites from '@/components/MyFavorites'
import MyApplications from '@/components/MyApplications'
import Recommended from '@/components/Recommended'
import Solution from '@/components/Solution'
import Solutions from '@/components/Solutions'
import Login from '@/components/Login'
// import Default from '@/components/Default'
import MyThingsList from '@/components/MyThingsList'
import Thing from '@/components/Thing'
import Callback from '@/components/Callback'
import ErrorMsg from '@/components/ErrorMsg'
import store from '../store'
// import { AuthRouter, AuthFilter } from '../amplify'

// vue-router reference
// https://router.vuejs.org/guide/essentials/named-routes.html

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/hello',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/user-login/:option',
      name: 'UserLogin',
      component: UserLogin
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
      meta: {
        title: 'Home',
        auth: false
      }
    },
    {
      path: '/',
      name: 'main',
      component: Home,
      meta: {
        title: 'home',
        auth: false
      }
    },
    {
      path: '/solutions',
      component: Solution,
      meta: {
        title: 'Solutions',
        auth: false
      },
      children: [
        {
          path: '',
          name: 'solutions',
          component: Solutions,
          meta: {
            title: 'solution default',
            auth: false
          }
        },
        {
          path: 'solutions',
          name: 'queriedSolutions',
          component: Solutions,
          meta: {
            title: 'solution list',
            auth: false
          }
        }
      ]
    },
    {
      path: '/user',
      component: User,
      meta: {
        title: 'User',
        auth: true
      },
      children: [
        {
          path: '',
          name: 'user',
          component: MyThings,
          meta: {
            title: 'User default',
            auth: true
          }
        },
        {
          path: 'mythings',
          component: MyThings,
          meta: {
            title: 'My Things',
            auth: true
          },
          children: [
            {
              path: '',
              name: 'mythings',
              component: MyThingsList,
              meta: {
                title: 'My Things List',
                auth: true
              }
            },
            {
              path: 'edit/:thingIndex',
              name: 'edit',
              component: EditThing,
              props: true,
              meta: {
                title: 'Edit Thing',
                auth: true
              }
            },
            {
              path: 'thing/:url',
              name: 'thing',
              component: Thing,
              props: true,
              meta: {
                title: 'thing',
                auth: true
              }
            }
          ]
        },
        { path: 'newthing', name: 'newthing', component: NewThing },
        {
          path: 'myapps',
          name: 'myapps',
          component: MyApplications,
          meta: {
            title: 'My Applications',
            auth: true
          }
        },
        {
          path: 'myfavorites',
          name: 'myfavorites',
          component: MyFavorites,
          meta: {
            title: 'My Favorites',
            auth: true
          }
        },
        {
          path: 'recommended',
          name: 'recommended',
          component: Recommended,
          meta: {
            title: 'Recommended',
            auth: true
          }
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        title: 'Login',
        auth: false
      }
    },
    {
      path: '/callback',
      name: 'callback',
      component: Callback,
      meta: {
        title: 'Authenticating...',
        auth: false
      }
    },
    {
      path: '/error',
      name: 'error',
      component: ErrorMsg,
      props: true,
      meta: {
        title: 'Error',
        auth: false
      }
    }
    //   AuthRouter
  ]
})

// router.beforeEach(AuthFilter)
router.beforeEach((to, from, next) => {
  // Use the page's router title to name the page
  if (to.meta && to.meta.title) {
    document.title = to.meta.title
  }
  // console.log('router: ', store.getters.isAuthenticated)

  // Redirect to the home page if not authenticated
  // for pages that have 'auth: true' set
  if (to.meta && to.meta.auth !== undefined) {
    if (to.meta.auth) { // if 'to' page needs authentication
      if (store.getters.isAuthenticated) { // and user has been authenticated
        next() // continue go to 'to' page
      } else {
        router.push({ name: 'home' })
      }
    } else { // if the 'to' page does not need the authentication
      next()
    }
  } else { // if 'to' page does not care about authorization
    /*
    if (store.getters.isAuthenticated) {
      router.push({ name: 'mythings' })
    } else {
      next()
    } */
    next()
  }
})

export default router
