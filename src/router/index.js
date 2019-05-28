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
import MyConsole from '@/components/MyConsole'
import MyApplications from '@/components/MyApplications'
import MyApplicationsList from '@/components/MyApplicationsList'
import NewService from '@/components/NewService'
import EditService from '@/components/EditService'
import MyApis from '@/components/MyApis'
import MyApisList from '@/components/MyApisList'
import NewApi from '@/components/NewApi'
import EditApi from '@/components/EditApi'
import Recommended from '@/components/Recommended'
import Solution from '@/components/Solution'
import Solutions from '@/components/Solutions'
import Login from '@/components/Login'
import Documents from '@/components/Documents'
// import DocIntroduction from '@/components/DocIntroduction'
import DocMain from '@/components/DocMain'
import AboutUs from '@/components/AboutUs'
// import Default from '@/components/Default'
import MyThingsList from '@/components/MyThingsList'
import Thing from '@/components/Thing'
import Profile from '@/components/Profile'
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
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: {
        title: 'User profile',
        auth: true
      }
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
        title: 'AIoT: Home',
        auth: false
      }
    },
    {
      path: '/docs',
      component: Documents,
      meta: {
        title: 'AIoT: Docs',
        auth: false
      },
      children: [
        {
          path: '',
          name: 'docs',
          component: DocMain,
          meta: {
            title: 'AIoT: Docs',
            auth: false
          }
        },
        {
          path: 'main',
          name: 'docMain',
          component: DocMain,
          meta: {
            title: 'AIoT: Documents',
            auth: false
          }
        }
      ]
    },
    {
      path: '/',
      name: 'main',
      component: Home,
      meta: {
        title: 'AIoT: Main',
        auth: false
      }
    },
    {
      path: '/aboutus',
      name: 'aboutUs',
      component: AboutUs,
      meta: {
        title: 'AIoT: About Us',
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
            title: 'Shared Solutions',
            auth: false
          }
        },
        {
          path: 'solutions',
          name: 'queriedSolutions',
          component: Solutions,
          meta: {
            title: 'Solution List',
            auth: false
          }
        },
        {
          path: 'newservice/:serviceIndex',
          name: 'copySharedService',
          component: NewService,
          props: true,
          meta: {
            title: 'Copied Microservice',
            auth: true
          }
        },
        {
          path: 'edit/:serviceIndex',
          name: 'editSharedService',
          component: EditService,
          props: true,
          meta: {
            title: 'Edit Shared Microservice',
            auth: true
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
          component: MyThingsList,
          meta: {
            title: 'User: My Things',
            auth: true
          }
        },
        {
          path: 'mythings',
          component: MyThings, // required, not change
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
              path: 'newthing',
              name: 'newthing',
              component: NewThing,
              meta: {
                title: 'New Thing',
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
        {
          path: 'myapps',
          component: MyApplications, // required, not change
          meta: {
            title: 'My Applications',
            auth: true
          },
          children: [
            {
              path: '',
              name: 'myapps',
              component: MyApplicationsList,
              meta: {
                title: 'My Applications List',
                auth: true
              }
            },
            {
              path: 'newservice',
              name: 'newService',
              component: NewService,
              props: true,
              meta: {
                title: 'New Service',
                auth: true
              }
            },
            {
              path: 'edit/:serviceIndex',
              name: 'editService',
              component: EditService,
              props: true,
              meta: {
                title: 'Edit Service',
                auth: true
              }
            }
          ]
        },
        {
          path: 'myapis',
          component: MyApis, // required, not change
          meta: {
            title: 'My APIs',
            auth: true
          },
          children: [
            {
              path: '',
              name: 'myapis',
              component: MyApisList,
              meta: {
                title: 'My API List',
                auth: true
              }
            },
            {
              path: 'newapi',
              name: 'newApi',
              component: NewApi,
              meta: {
                title: 'New Api',
                auth: true
              }
            },
            {
              path: 'edit/:apiIndex',
              name: 'editApi',
              component: EditApi,
              props: true,
              meta: {
                title: 'Edit Api',
                auth: true
              }
            }
          ]
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
          path: 'myconsole',
          name: 'myconsole',
          component: MyConsole,
          meta: {
            title: 'My Console',
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
