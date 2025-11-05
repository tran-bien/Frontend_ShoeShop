import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./hooks/useAuth";
import { CompareProvider } from "./contexts/CompareContext";
import AppRouter from "./routers/Router";
import CompareFloatingButton from "./components/Compare/CompareFloatingButton";
import "./App.css";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompareProvider>
          <div className="App">
            <AppRouter />
            <CompareFloatingButton />
            <Toaster
              position="top-center"
              reverseOrder={false}
              gutter={8}
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#fff",
                  color: "#333",
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: "#10B981",
                    secondary: "#fff",
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: "#EF4444",
                    secondary: "#fff",
                  },
                },
              }}
            />
          </div>
        </CompareProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
