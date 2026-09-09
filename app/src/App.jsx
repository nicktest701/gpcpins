import {
  QueryClientProvider,
  QueryClient,
  useQueryErrorResetBoundary,
} from "@tanstack/react-query";
import CustomProvider from "./context/providers/CustomProvider";
import ThemeProvider from "./theme";
import Shell from "./pages/layout/Shell";
import { ErrorBoundary } from "react-error-boundary";
import Error from "./pages/Error";
import { HelmetProvider } from "react-helmet-async";
import AuthProvider from "./context/providers/AuthProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SocketProvider } from "./context/providers/SocketProvider";


const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        networkMode: "always",
      },
      queries: {
        networkMode: "always",
      },
    },
  });

  const { reset } = useQueryErrorResetBoundary();

  return (
    <ThemeProvider>
      <HelmetProvider>
        <GoogleOAuthProvider clientId={CLIENT_ID}>
          <QueryClientProvider client={queryClient}>
            <ErrorBoundary FallbackComponent={Error} onReset={reset}>
              <AuthProvider>
                <SocketProvider>
                  <CustomProvider>
                    <Shell />
                  </CustomProvider>
                </SocketProvider>
              </AuthProvider>
            </ErrorBoundary>
          </QueryClientProvider>
        </GoogleOAuthProvider>
      </HelmetProvider>
    </ThemeProvider>
  );
}

export default App;
