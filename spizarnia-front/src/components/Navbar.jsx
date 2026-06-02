import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Smartphone } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const [avatarSeed, setAvatarSeed] = useState(
    localStorage.getItem("avatarSeed") ||
      localStorage.getItem("userEmail") ||
      "user",
  );

  useEffect(() => {
    const handleAvatarUpdate = () => {
      setAvatarSeed(
        localStorage.getItem("avatarSeed") ||
          localStorage.getItem("userEmail") ||
          "user",
      );
    };
    window.addEventListener("avatarChanged", handleAvatarUpdate);
    return () =>
      window.removeEventListener("avatarChanged", handleAvatarUpdate);
  }, []);

  const navLinks = [
    { path: "/", label: "Pulpit" },
    { path: "/kuchnia", label: "Moja Kuchnia" },
    { path: "/dodaj", label: "Dodaj Produkt" },
    { path: "/ustawienia", label: "Ustawienia" },
  ];

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 px-6 py-4 transition-colors duration-300">
      <div className="w-full mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 border-2 border-[#00C853] text-[#00C853] p-1 rounded-lg">
            <Smartphone size={24} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">
            Sprytna Spiżarnia
          </span>
        </div>

        {/* Linki */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`font-semibold transition-colors duration-200 ${
                  isActive
                    ? "text-[#00C853]"
                    : "text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <Link
          to="/ustawienia"
          className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm hover:ring-2 hover:ring-[#00C853] transition block shrink-0"
        >
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
            alt="Profil"
            className="w-full h-full object-cover"
          />
        </Link>
      </div>
    </nav>
  );
}
