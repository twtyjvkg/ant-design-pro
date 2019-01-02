export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './User/Login' },
      { path: '/user/register', component: './User/Register' },
      {
        path: '/user/reset-password',
        component: './User/Reset',
      },
      { path: '/user/register-result', component: './User/RegisterResult' },
    ],
  },
  {
    path: '/',
    routes: [
      { path: '/', redirect: '/blog/home' },
      // console
      {
        path: '/console',
        component: '../layouts/BasicLayout',
        Routes: ['src/pages/Authorized'],
        authority: ['superuser'],
        routes: [
          // dashboard
          { path: '/console', redirect: '/console/dashboard/analysis' },
          {
            path: '/console/dashboard',
            name: 'dashboard',
            icon: 'dashboard',
            routes: [
              {
                path: '/console/dashboard/analysis',
                name: 'analysis',
                component: './Dashboard/Analysis',
              },
              {
                path: '/console/dashboard/monitor',
                name: 'monitor',
                component: './Dashboard/Monitor',
              },
              {
                path: '/console/dashboard/workplace',
                name: 'workplace',
                component: './Dashboard/Workplace',
              },
            ],
          },
          // forms
          {
            path: '/console/form',
            icon: 'form',
            name: 'form',
            routes: [
              {
                path: '/console/form/basic-form',
                name: 'basicform',
                component: './Forms/BasicForm',
              },
              {
                path: '/console/form/step-form',
                name: 'stepform',
                component: './Forms/StepForm',
                hideChildrenInMenu: true,
                routes: [
                  {
                    path: '/console/form/step-form',
                    redirect: '/console/form/step-form/info',
                  },
                  {
                    path: '/console/form/step-form/info',
                    name: 'info',
                    component: './Forms/StepForm/Step1',
                  },
                  {
                    path: '/console/form/step-form/confirm',
                    name: 'confirm',
                    component: './Forms/StepForm/Step2',
                  },
                  {
                    path: '/console/form/step-form/result',
                    name: 'result',
                    component: './Forms/StepForm/Step3',
                  },
                ],
              },
              {
                path: '/console/form/advanced-form',
                name: 'advancedform',
                authority: ['admin'],
                component: './Forms/AdvancedForm',
              },
            ],
          },
          // list
          {
            path: '/console/list',
            icon: 'table',
            name: 'list',
            routes: [
              {
                path: '/console/list/table-list',
                name: 'searchtable',
                component: './List/TableList',
              },
              {
                path: '/console/list/basic-list',
                name: 'basiclist',
                component: './List/BasicList',
              },
              {
                path: '/console/list/card-list',
                name: 'cardlist',
                component: './List/CardList',
              },
              {
                path: '/console/list/search',
                name: 'searchlist',
                component: './List/List',
                routes: [
                  {
                    path: '/console/list/search',
                    redirect: '/console/list/search/articles',
                  },
                  {
                    path: '/console/list/search/articles',
                    name: 'articles',
                    component: './List/Articles',
                  },
                  {
                    path: '/console/list/search/projects',
                    name: 'projects',
                    component: './List/Projects',
                  },
                  {
                    path: '/console/list/search/applications',
                    name: 'applications',
                    component: './List/Applications',
                  },
                ],
              },
            ],
          },
          {
            path: '/console/profile',
            name: 'profile',
            icon: 'profile',
            routes: [
              // profile
              {
                path: '/console/profile/basic',
                name: 'basic',
                component: './Profile/BasicProfile',
              },
              {
                path: '/console/profile/advanced',
                name: 'advanced',
                authority: ['admin'],
                component: './Profile/AdvancedProfile',
              },
            ],
          },
          {
            name: 'result',
            icon: 'check-circle-o',
            path: '/console/result',
            routes: [
              // result
              {
                path: '/console/result/success',
                name: 'success',
                component: './Result/Success',
              },
              { path: '/console/result/fail', name: 'fail', component: './Result/Error' },
            ],
          },
          {
            name: 'exception',
            icon: 'warning',
            path: '/console/exception',
            routes: [
              // exception
              {
                path: '/console/exception/403',
                name: 'not-permission',
                component: './Exception/403',
              },
              {
                path: '/console/exception/404',
                name: 'not-find',
                component: './Exception/404',
              },
              {
                path: '/console/exception/500',
                name: 'server-error',
                component: './Exception/500',
              },
              {
                path: '/console/exception/trigger',
                name: 'trigger',
                hideInMenu: true,
                component: './Exception/TriggerException',
              },
            ],
          },
          {
            name: 'account',
            icon: 'user',
            path: '/console/account',
            routes: [
              {
                path: '/console/account/center',
                name: 'center',
                component: './Account/Center/Center',
                routes: [
                  {
                    path: '/console/account/center',
                    redirect: '/console/account/center/articles',
                  },
                  {
                    path: '/console/account/center/articles',
                    component: './Account/Center/Articles',
                  },
                  {
                    path: '/console/account/center/applications',
                    component: './Account/Center/Applications',
                  },
                  {
                    path: '/console/account/center/projects',
                    component: './Account/Center/Projects',
                  },
                ],
              },
              {
                path: '/console/account/settings',
                name: 'settings',
                component: './Account/Settings/Info',
                routes: [
                  {
                    path: '/console/account/settings',
                    redirect: '/console/account/settings/base',
                  },
                  {
                    path: '/console/account/settings/base',
                    component: './Account/Settings/BaseView',
                  },
                  {
                    path: '/console/account/settings/security',
                    component: './Account/Settings/SecurityView',
                  },
                  {
                    path: '/console/account/settings/notification',
                    component: './Account/Settings/NotificationView',
                  },
                ],
              },
            ],
          },
          // system
          {
            name: 'system',
            icon: 'setting',
            path: '/console/system',
            routes: [
              {
                name: 'account',
                path: '/console/system/account',
                component: './System/Account/Account',
                routes: [
                  {
                    path: '/console/system/account',
                    redirect: '/console/system/account/users',
                  },
                  {
                    path: '/console/system/account/users',
                    component: './System/Account/User/UserList',
                  },
                  {
                    path: '/console/system/account/groups',
                    component: './System/Account/Group/GroupList',
                  },
                  {
                    path: '/console/system/account/permissions',
                    component: './System/Account/Permission/PermissionList',
                  },
                  {
                    path: '/console/system/account/roles',
                    component: './System/Account/Role/RoleList',
                  },
                ],
              },
            ],
          },
          {
            component: '404',
          },
        ],
      },
      // blog
      {
        path: '/blog',
        component: '../layouts/Blog/BlogLayout',
        Routes: ['src/pages/Authorized'],
        routes: [
          { path: '/blog', redirect: '/blog/home' },
          {
            path: '/blog/home',
            name: 'blog',
            component: './Blog/Home/BlogHome',
          },
        ],
      },
    ],
  },
];
