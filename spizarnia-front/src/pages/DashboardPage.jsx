import { useState, useEffect } from "react";
import {
  AlertCircle,
  Clock,
  Trash2,
  Check,
  ChefHat,
  ArrowRight,
  Database,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [urgentProducts, setUrgentProducts] = useState([]);
  const [expiringProducts, setExpiringProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/pantry");
      const allProducts = response.data;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const urgent = [];
      const expiring = [];

      allProducts.forEach((product) => {
        const expDateString = product.expirationDate;
        if (!expDateString) return;

        const expDate = new Date(expDateString);
        expDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round(
          (expDate.getTime() - today.getTime()) / (1000 * 3600 * 24),
        );

        if (diffDays < 0)
          urgent.push({ ...product, daysDiff: Math.abs(diffDays) });
        else if (diffDays >= 0 && diffDays <= 3)
          expiring.push({ ...product, daysDiff: diffDays });
      });

      setUrgentProducts(urgent);
      setExpiringProducts(expiring);

      const recipesResponse = await api.get("/recipes/suggestions");
      setSuggestedRecipes(recipesResponse.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/pantry/${id}`);
      fetchDashboardData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSeedDatabase = async () => {
    try {
      await api.post("/recipes/seed");
      fetchDashboardData();
    } catch (error) {}
  };

  const getRecipeImage = (recipeName) => {
    const name = recipeName.toLowerCase();

    if (
      name.includes("naleśniki") ||
      name.includes("pancake") ||
      name.includes("gofry")
    )
      return "https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=800&auto=format&fit=crop";

    if (
      name.includes("makaron") ||
      name.includes("spaghetti") ||
      name.includes("carbonara") ||
      name.includes("lazania")
    )
      return "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800&auto=format&fit=crop";

    if (
      name.includes("kurczak") ||
      name.includes("curry") ||
      name.includes("kaczka") ||
      name.includes("schab") ||
      name.includes("mięso")
    )
      return "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800&auto=format&fit=crop";

    if (
      name.includes("zupa") ||
      name.includes("krem") ||
      name.includes("chłodnik") ||
      name.includes("rosół")
    )
      return "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800&auto=format&fit=crop";

    if (
      name.includes("sałatka") ||
      name.includes("mizeria") ||
      name.includes("caprese")
    )
      return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop";

    if (
      name.includes("tosty") ||
      name.includes("kanapk") ||
      name.includes("burger")
    )
      return "https://images.unsplash.com/photo-1482049118208-abd12be3f538?q=80&w=800&auto=format&fit=crop";

    if (
      name.includes("jajk") ||
      name.includes("omlet") ||
      name.includes("szakszuka")
    )
      return "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800&auto=format&fit=crop";

    if (
      name.includes("ciasto") ||
      name.includes("szarlotka") ||
      name.includes("sernik") ||
      name.includes("muffinki")
    )
      return "https://images.unsplash.com/photo-1513135065346-a66987621f30?q=80&w=800&auto=format&fit=crop";

    if (
      name.includes("ryba") ||
      name.includes("tuńczyk") ||
      name.includes("pstrąg")
    )
      return "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800&auto=format&fit=crop";

    return "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop";
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 mt-6 animate-in fade-in duration-300 w-full">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 transition-colors">
              Zjedz mnie wkrótce!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">
              Produkty wymagające Twojej pilnej uwagi
            </p>
          </div>
          <button
            onClick={handleSeedDatabase}
            className="p-3 bg-slate-200 dark:bg-slate-800 rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300"
          >
            <Database size={20} />
          </button>
        </div>

        {loading ? (
          <div className="text-slate-400 font-medium">
            Skanowanie lodówki...
          </div>
        ) : urgentProducts.length === 0 && expiringProducts.length === 0 ? (
          <div className="border-2 border-green-100 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 text-center text-green-600 dark:text-green-400 font-bold transition-colors">
            Wszystko świeże! Nie masz produktów z krótką datą.
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {urgentProducts.map((product) => (
              <div
                key={product.id}
                className="border-2 border-red-200 dark:border-red-800/50 bg-red-50/40 dark:bg-red-900/10 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 shadow-sm transition-colors"
              >
                <div className="bg-white dark:bg-slate-800 border-2 border-red-400 dark:border-red-500 text-red-500 rounded-full w-14 h-14 flex items-center justify-center shrink-0 shadow-sm transition-colors">
                  <AlertCircle size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-red-500 dark:text-red-400 font-bold text-sm mb-4 transition-colors">
                    Przeterminowane {product.daysDiff}{" "}
                    {product.daysDiff === 1 ? "dzień" : "dni"} temu!
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="border-2 border-[#00C853] text-[#00C853] bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-900/20 font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                    >
                      <Check size={16} /> Zjedzone
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <Trash2 size={16} /> Wyrzucone
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {expiringProducts.map((product) => (
              <div
                key={product.id}
                className="border-2 border-yellow-300 dark:border-yellow-700/50 bg-yellow-50/40 dark:bg-yellow-900/10 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 shadow-sm transition-colors"
              >
                <div className="bg-white dark:bg-slate-800 border-2 border-yellow-400 dark:border-yellow-600 text-yellow-500 rounded-full w-14 h-14 flex items-center justify-center shrink-0 shadow-sm transition-colors">
                  <Clock size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-yellow-600 dark:text-yellow-500 font-bold text-sm mb-4 transition-colors">
                    {product.daysDiff === 0
                      ? "Kończy się dzisiaj!"
                      : `Kończy się za ${product.daysDiff} dni!`}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="border-2 border-[#00C853] text-[#00C853] bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-green-900/20 font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                    >
                      <Check size={16} /> Zjedzone
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={16} /> Zepsute
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex-[1.2]">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1 transition-colors">
          Uratuj to, co masz!
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 transition-colors">
          Propozycje dań idealnie dopasowane do psujących się składników.
        </p>

        {suggestedRecipes.length === 0 ? (
          <div className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-2xl p-10 text-center shadow-sm flex flex-col items-center justify-center h-64 transition-colors">
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-full mb-4 text-slate-400 dark:text-slate-500">
              <ChefHat size={32} />
            </div>
            <h3 className="text-slate-800 dark:text-slate-200 font-bold text-lg mb-1">
              Twoja lodówka jest bezpieczna!
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-6">
              Aktualnie nie grozi Ci wyrzucenie jedzenia, więc nie musimy
              generować przepisów ratunkowych.
            </p>
            <Link
              to="/dodaj"
              className="text-[#00C853] hover:text-green-600 dark:hover:text-green-400 font-bold flex items-center gap-2"
            >
              Dodaj składniki <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {suggestedRecipes.slice(0, 2).map((recipe) => (
              <div
                key={recipe.id}
                className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col sm:flex-row transition-colors group"
              >
                <div className="w-full sm:w-64 h-48 sm:h-auto bg-slate-200 dark:bg-slate-700 shrink-0 overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                  <img
                    src={getRecipeImage(recipe.name)}
                    alt={recipe.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex flex-col justify-center p-6 flex-1">
                  <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white leading-tight mb-4">
                    {recipe.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-bold block mb-2">
                      Dzięki temu daniu uratujesz:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {recipe.savedIngredients.map((ing, idx) => (
                        <span
                          key={idx}
                          className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-bold px-3 py-1.5 rounded-lg text-sm border border-orange-200 dark:border-orange-800/50"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <button onClick={() => navigate(`/przepisy/${recipe.id}`)} className="bg-[#00C853] hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-sm w-full sm:w-auto text-center">
                      Zobacz przepis
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
