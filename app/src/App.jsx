import {
  QueryClientProvider,
  QueryClient,
  useQueryErrorResetBoundary,
} from "@tanstack/react-query";
import { Chart, registerables } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import CustomProvider from "./context/providers/CustomProvider";
import ThemeProvider from "./theme";
import Shell from "./pages/layout/Shell";
import { ErrorBoundary } from "react-error-boundary";
import Error from "./pages/Error";
import ClientProvider from "./context/providers/ClientProvider";
import { HelmetProvider } from "react-helmet-async";
import AuthProvider from "./context/providers/AuthProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";

Chart.register(...registerables);
Chart.register(ChartDataLabels);

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
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ErrorBoundary FallbackComponent={Error} onReset={reset}>
            <AuthProvider>
              <GoogleOAuthProvider clientId={CLIENT_ID}>
                <CustomProvider>
                  <ClientProvider>
                    <Shell />
                  </ClientProvider>
                </CustomProvider>
              </GoogleOAuthProvider>
            </AuthProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
