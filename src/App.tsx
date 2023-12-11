import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Router } from "~/components/Router";
import { setupFirebase } from "./lib/firebase";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

const queryClient = new QueryClient();

export const App = () => {
  useEffect(() => {
    setupFirebase();
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router />
        <ReactQueryDevtools initialIsOpen />
      </QueryClientProvider>
    </HelmetProvider>
  )
};
