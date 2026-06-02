import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, CheckCircle2 } from "lucide-react";
import api from "../api";

const AVATAR_OPTIONS = [
  "Felix",
  "Aneka",
  "Jasper",
  "Oliver",
  "Zoe",
  "Molly",
  "Coco",
  "Simba",
  "Loki",
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  const [email, setEmail] = useState("");
  const [avatarSeed, setAvatarSeed] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [theme, setTheme] = useState(
    localStorage.getItem("appTheme") || "light",
  );
  const [textSize, setTextSize] = useState(
    localStorage.getItem("appTextSize") || "default",
  );

  useEffect(() => {
    const savedEmail =
      localStorage.getItem("userEmail") || "jan.kowalski@student.uczelnia.pl";
    setEmail(savedEmail);
    setAvatarSeed(localStorage.getItem("avatarSeed") || savedEmail);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("avatarSeed");
    navigate("/login");
  };

  const handleSelectAvatar = async (seed) => {
    try {
      await api.put("/auth/avatar", { avatarSeed: seed });
      setAvatarSeed(seed);
      localStorage.setItem("avatarSeed", seed);
      setIsModalOpen(false);
      window.dispatchEvent(new Event("avatarChanged"));
    } catch (error) {
      console.error("Błąd podczas zapisywania awatara:", error);
      alert("Nie udało się zapisać awatara.");
    }
  };

  const handleSaveAppearance = () => {
    localStorage.setItem("appTheme", theme);
    localStorage.setItem("appTextSize", textSize);
    window.dispatchEvent(new Event("appearanceChanged"));
    alert("Preferencje wyglądu zostały zapisane!");
  };

  return (
    <div className="mt-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1 transition-colors">
          Ustawienia
        </h1>
        <p className="text-gray-400 dark:text-slate-400 font-medium transition-colors">
          Zarządzaj swoim kontem i preferencjami aplikacji
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-3 flex flex-col gap-1 transition-colors duration-300">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition ${
                activeTab === "profile"
                  ? "bg-green-50 dark:bg-[#00C853]/10 text-[#00C853]"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              Profil i Konto
            </button>
            <button
              onClick={() => setActiveTab("appearance")}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition ${
                activeTab === "appearance"
                  ? "bg-green-50 dark:bg-[#00C853]/10 text-[#00C853]"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              Wygląd
            </button>
            <div className="h-px bg-slate-100 dark:bg-slate-700 my-2 mx-2 transition-colors"></div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-bold text-sm transition"
            >
              Wyloguj się
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 transition-colors duration-300">
          {activeTab === "profile" && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-10">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
                  Zdjęcie profilowe
                </h3>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold px-5 py-2.5 rounded-lg text-sm transition"
                  >
                    Wybierz avatar
                  </button>
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-700 w-full mb-10 transition-colors"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="flex flex-col gap-6">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Dane osobowe
                  </h3>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Adres Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 outline-none text-slate-500 dark:text-slate-400 cursor-not-allowed transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Bezpieczeństwo
                  </h3>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Aktualne hasło
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 dark:text-white rounded-xl p-3 outline-none focus:border-[#00C853] dark:focus:border-[#00C853] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Nowe hasło
                    </label>
                    <input
                      type="password"
                      placeholder="Wpisz nowe hasło..."
                      className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 dark:text-white rounded-xl p-3 outline-none focus:border-[#00C853] dark:focus:border-[#00C853] transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <button className="bg-[#00C853] hover:bg-green-600 text-white font-bold px-6 py-3 rounded-lg transition shadow-sm">
                  Zapisz zmiany
                </button>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="animate-in fade-in duration-300 flex flex-col gap-10">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                  Motyw aplikacji
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                  Wybierz, jak ma wyglądać interfejs Twojej spiżarni.
                </p>

                <div className="flex gap-6">
                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={() => setTheme("light")}
                      className={`relative w-48 h-32 rounded-xl border-2 transition-all ${
                        theme === "light"
                          ? "border-[#00C853] ring-4 ring-green-50 dark:ring-[#00C853]/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      } bg-white overflow-hidden`}
                    >
                      <div className="p-4 flex flex-col gap-3">
                        <div className="w-1/3 h-2.5 bg-slate-200 rounded-full"></div>
                        <div className="w-2/3 h-2.5 bg-slate-100 rounded-full"></div>
                      </div>
                      {theme === "light" && (
                        <div className="absolute top-2 right-2 text-[#00C853]">
                          <CheckCircle2 size={24} className="fill-white" />
                        </div>
                      )}
                    </button>
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
                      Jasny
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={() => setTheme("dark")}
                      className={`relative w-48 h-32 rounded-xl border-2 transition-all ${
                        theme === "dark"
                          ? "border-[#00C853] ring-4 ring-green-50 dark:ring-[#00C853]/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-500"
                      } bg-[#1E2330] overflow-hidden`}
                    >
                      <div className="p-4 flex flex-col gap-3">
                        <div className="w-1/3 h-2.5 bg-slate-600 rounded-full"></div>
                        <div className="w-2/3 h-2.5 bg-slate-700 rounded-full"></div>
                      </div>
                      {theme === "dark" && (
                        <div className="absolute top-2 right-2 text-[#00C853]">
                          <CheckCircle2 size={24} className="fill-white" />
                        </div>
                      )}
                    </button>
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
                      Ciemny
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-100 dark:bg-slate-700 w-full transition-colors"></div>

              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                  Rozmiar tekstu
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                  Dostosuj wielkość czcionki, aby ułatwić sobie czytanie w
                  kuchni.
                </p>

                <div className="flex flex-wrap gap-4">
                  {["small", "default", "large"].map((size) => (
                    <button
                      key={size}
                      onClick={() => setTextSize(size)}
                      className={`px-6 py-2.5 rounded-lg border-2 font-bold text-sm transition-all ${
                        textSize === size
                          ? "border-[#00C853] text-[#00C853] bg-green-50 dark:bg-[#00C853]/10"
                          : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      {size === "small" && "A- Mała"}
                      {size === "default" && "A Domyślna"}
                      {size === "large" && "A+ Duża"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-2">
                <button
                  onClick={handleSaveAppearance}
                  className="bg-[#00C853] hover:bg-green-600 text-white font-bold px-6 py-3 rounded-lg transition shadow-sm"
                >
                  Zapisz zmiany
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Wybierz swój avatar
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition bg-slate-50 dark:bg-slate-700 rounded-full p-2"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {AVATAR_OPTIONS.map((seed) => (
                <button
                  key={seed}
                  onClick={() => handleSelectAvatar(seed)}
                  className={`relative p-2 rounded-2xl border-2 transition-all duration-200 hover:scale-105 ${
                    avatarSeed === seed
                      ? "border-[#00C853] bg-green-50 dark:bg-[#00C853]/10 shadow-md"
                      : "border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                    alt={seed}
                    className="w-full h-auto aspect-square"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
