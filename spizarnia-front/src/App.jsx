import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import DashboardPage from "./pages/DashboardPage";
import PantryPage from "./pages/PantryPage";
import LoginPage from "./pages/LoginPage";
import MobileScanner from "./components/MobileScanner";
import SettingsPage from "./pages/SettingsPage";
import AddProductPage from "./pages/AddProductPage";
import RecipesPage from "./pages/RecipesPage";
import RecipeDetailsPage from "./pages/RecipeDetailsPage";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("userId") !== null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  useEffect(() => {
    const applyAppearance = () => {
      const theme = localStorage.getItem("appTheme") || "light";
      const textSize = localStorage.getItem("appTextSize") || "default";
      const htmlElement = document.documentElement;

      if (theme === "dark") htmlElement.classList.add("dark");
      else htmlElement.classList.remove("dark");

      if (textSize === "small") htmlElement.style.fontSize = "14px";
      else if (textSize === "large") htmlElement.style.fontSize = "18px";
      else htmlElement.style.fontSize = "16px";
    };

    applyAppearance();
    window.addEventListener("appearanceChanged", applyAppearance);
    return () =>
      window.removeEventListener("appearanceChanged", applyAppearance);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/scan/:sessionId" element={<MobileScanner />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Navbar />
                <main className="w-full px-4 sm:px-6 lg:px-12 py-6">
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/ustawienia" element={<SettingsPage />} />
                    <Route path="/kuchnia" element={<PantryPage />} />
                    <Route path="/dodaj" element={<AddProductPage />} />
                    <Route path="/przepisy" element={<RecipesPage />} />
                    <Route path="/przepisy/:id" element={<RecipeDetailsPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
