import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone, Lock, Mail } from "lucide-react";
import api from "../api";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        const response = await api.post("/auth/login", { email, password });

        localStorage.setItem("userId", response.data.userId);
        localStorage.setItem("userEmail", response.data.email);
        if (response.data.avatarSeed) {
          localStorage.setItem("avatarSeed", response.data.avatarSeed);
        } else {
          localStorage.removeItem("avatarSeed");
        }

        navigate("/");

        window.dispatchEvent(new Event("avatarChanged"));
      } else {
        await api.post("/auth/register", { email, password });
        setIsLogin(true);
        alert("Konto utworzone! Możesz się teraz zalogować.");
      }
    } catch (err) {
      setError(err.response?.data || "Wystąpił błąd. Spróbuj ponownie.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="bg-white border-2 border-[#00C853] text-[#00C853] p-3 rounded-2xl">
            <Smartphone size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Sprytna Spiżarnia
          </h1>
          <p className="text-gray-400 font-medium text-sm">
            {isLogin ? "Zaloguj się do swojego konta" : "Utwórz nowe konto"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm font-semibold border border-red-100 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Adres Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                className="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-3 outline-none focus:border-[#00C853] focus:ring-1 focus:ring-[#00C853] transition"
                placeholder="jan@kowalski.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Hasło
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                className="w-full border border-gray-200 rounded-xl py-3 pl-10 pr-3 outline-none focus:border-[#00C853] focus:ring-1 focus:ring-[#00C853] transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 w-full bg-[#00C853] hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition shadow-sm"
          >
            {isLogin ? "Zaloguj się" : "Zarejestruj się"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-gray-500">
          {isLogin ? "Nie masz jeszcze konta? " : "Masz już konto? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-[#00C853] hover:text-green-600 transition"
          >
            {isLogin ? "Zarejestruj się" : "Zaloguj się"}
          </button>
        </div>
      </div>
    </div>
  );
}
