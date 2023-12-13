import { useEffect, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Router } from "~/components/Router";
import { setupFirebase } from "./lib/firebase";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";


const queryClient = new QueryClient();

export const App = () => {
  // TODO: This is silly. I need a better context fb thing.
  const [onFire, setFire] = useState(false)
  useEffect(() => {
    const fb = setupFirebase();
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
