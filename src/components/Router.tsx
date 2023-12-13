import { Dialog } from '@headlessui/react';
import { Suspense, useState } from 'react';
import { Outlet, RouteObject, useRoutes, BrowserRouter } from 'react-router-dom';

const Loading = () => <p className="p-4 w-full h-full text-center">Loading...</p>;

import loadable from '@loadable/component'


const IndexScreen = loadable(() => import('~/screens/Index'));
const GameScreen = loadable(() => import('~/screens/Game'));
const Page404Screen = loadable(() => import('~/screens/404'));

// import IndexScreen from '~/screens/Index'
// import GameScreen from '~/screens/Game'
// import Page404Screen from '~/screens/404'


function Layout() {
  return (
    <Outlet />
    // <div>
    //   <nav className="p-4 flex items-center justify-between">
    //     <span>Header</span>
    //   </nav>
    //   <Outlet />
    // </div>
  );
}

export const Router = () => {
  return (
    <BrowserRouter>
      <InnerRouter />
    </BrowserRouter>
  );
};

const InnerRouter = () => {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          index: true,
          element: <IndexScreen />,
        },
        {
          path: '/game/:gameId?',
          element: <GameScreen />
        },
        {
          path: '*',
          element: <Page404Screen />,
        },
      ],
    },
  ];
  const element = useRoutes(routes);
  return (
    <div>
      <Suspense fallback={<Loading />}>{element}</Suspense>
    </div>
  );
};
