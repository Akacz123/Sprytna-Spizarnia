import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChefHat, ArrowLeft, Loader2, List, CheckCircle } from "lucide-react";
import api from "../api";

export default function RecipeDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await api.get(`/recipes/${id}`);
        setRecipe(response.data);
      } catch (err) {
        setError("Nie udało się pobrać szczegółów przepisu.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-[#00C853]" size={48} />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
          Błąd
        </h2>
        <p className="text-red-500 mb-6">{error || "Przepis nie istnieje."}</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#00C853] hover:bg-green-600 text-white font-bold py-2 px-6 rounded-xl transition"
        >
          Wróć
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-300">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Wróć
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100 dark:border-slate-700">
          <div className="bg-green-50 dark:bg-[#00C853]/10 p-4 rounded-2xl">
            <ChefHat size={40} className="text-[#00C853]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            {recipe.title}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <List className="text-[#00C853]" /> Składniki
            </h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ing, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-slate-600 dark:text-slate-300 font-medium"
                >
                  <CheckCircle
                    size={18}
                    className="text-[#00C853] shrink-0 mt-0.5"
                  />
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Sposób przygotowania
            </h2>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {recipe.instructions}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
