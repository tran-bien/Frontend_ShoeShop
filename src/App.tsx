import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./hooks/useAuth";
import { CompareProvider } from "./contexts/CompareContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import AppRouter from "./routers/Router";
import CompareFloatingButton from "./components/Compare/CompareFloatingButton";
import { AIChatbot } from "./components/Chat";
import "./App.css";

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <CompareProvider>
            <div className="App">
              <AppRouter />
              <CompareFloatingButton />
              <AIChatbot />
              <Toaster
                position="top-center"
                reverseOrder={false}
                gutter={8}
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: "#fff",
                    color: "#171717",
                    border: "1px solid #E5E5E5",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: "#171717",
                      secondary: "#fff",
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: "#171717",
                      secondary: "#fff",
                    },
                  },
                }}
              />
            </div>
          </CompareProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
