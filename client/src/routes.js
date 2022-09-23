import React, {
  Fragment,
  lazy
} from 'react';
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthGuard from './layouts/AuthGuard';
import Dashboard from './pages/Dashboard';
import Testing from './pages/Testing';
import Review from './pages/Review';
import Login from './pages/Login'
import Home from './pages/Home';
import Question from './pages/Question';

export const renderRoutes = (routes) => (
  <BrowserRouter>
    <Routes>
      {routes.map((route, i) => {
        const Guard = route.guard || Fragment;
        const Layout = route.layout || Fragment;
        const Component = route.component;

        return (
          <Route
            key={i}
            path={route.path}
            exact={route.exact}
            element={
              <Guard>
                <Layout>
                  {route.routes
                    ? renderRoutes(route.routes)
                    : <Component />}
                </Layout>
              </Guard>
            }
          />
        );
      })}
    </Routes>
  </BrowserRouter>
);

const routes = [
  // {
  //   exact: true,
  //   path: '/404',
  //   component: lazy(() => import('src/pages/NotFound'))
  // },
  {
    exact: true,
    path: '/login',
    component: Login
  },
  // {
  //   exact: true,
  //   path: '/register',
  //   component: lazy(() => import('src/pages/Register'))
  // },
  {
    exact: true,
    path: '/',
    component: Home
  },
  {
    exact: true,
    layout: MainLayout,
    guard: AuthGuard,
    path: '/dashboard',
    component: Dashboard
  },
  {
    exact: true,
    layout: MainLayout,
    guard: AuthGuard,
    path: 'type/:type/question/:id',
    component: Question
  },
  {
    exact: true,
    layout: MainLayout,
    guard: AuthGuard,
    path: '/testing',
    component: Testing
  },
  {
    exact: true,
    layout: MainLayout,
    guard: AuthGuard,
    path: '/review/:examTestId',
    component: Review
  },
  {
    exact: true,
    path: '*',
    component: Home
  },
];

export default routes;
