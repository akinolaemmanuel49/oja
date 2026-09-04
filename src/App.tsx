import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import { Toaster } from "@oja/ui";
import { PermissionProvider } from "./contexts/PermissionContext";
import AppRoutes from "@/routes/routes";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PermissionProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster />
        </BrowserRouter>
      </PermissionProvider>
    </QueryClientProvider>
  );
}
