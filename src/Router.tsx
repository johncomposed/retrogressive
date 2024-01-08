import { Suspense, useEffect, useState } from 'react';
import { createBrowserRouter, useLocation, createRoutesFromElements } from 'react-router-dom'
import {  RouterProvider, Route, Outlet, Navigate } from 'react-router-dom'
import HomePage from './screens/Home';
import GamePage from './screens/Game';
import LobbyPage from './screens/Lobby';
import SigninScreen from './screens/SignIn';

import LoggedInRoute from './components/Routes/LoggedInRoute';
import PlayerInGameRoute from './components/Routes/PlayerInGameRoute';


// todo: move to layout file
export function Layout() {
  // When location state comes in with a message, display the message. 
  return (
    <Outlet />
  );
}


// todo: create error boundaries
export const router = createBrowserRouter(createRoutesFromElements(
  <Route path="/" element={<Layout />}>
    <Route index element={<HomePage />}/>

    <Route element={<LoggedInRoute />}>
      <Route path="/game" element={<Navigate to="/" replace />}/>
      <Route element={<PlayerInGameRoute />}>
        <Route path="/game/:gameId" element={<GamePage />} />
      </Route>

      <Route path="/lobby/:gameId?" element={<LobbyPage />} />
    </Route>
    <Route path="/signin" element={<SigninScreen />} />
    <Route path="*" element={<Navigate to="/" replace state={{message: 'Page not found'}} />}/>
  </Route>
))





export function Router() {
  return (
    <RouterProvider router={router} />
  )
}
