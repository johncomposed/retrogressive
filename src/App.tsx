import { useEffect, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Router } from "~/Router";
import { setupFirebase, useEmulator } from "./lib/firebase";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";


const queryClient = new QueryClient();

export const App = () => {
  // TODO: I should have a better way of initializing firebase
  const [onFire, setFire] = useState(false)
  useEffect(() => {
    const fb = setupFirebase();
    console.log('init firebase', useEmulator() ? 'emulator' : 'remote')
    if (fb) setFire(true);
  }, []);



  return (
    <HelmetProvider>
      {onFire && (
      <QueryClientProvider client={queryClient}>
        <Router />
        <ReactQueryDevtools position="bottom-right" panelPosition="right" />
      </QueryClientProvider>
      )}
    </HelmetProvider>
  )
};
