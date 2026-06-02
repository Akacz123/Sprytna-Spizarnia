import { useState, useEffect } from "react";
import { Search, Box, X } from "lucide-react";
import api from "../api";

export default function PantryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/pantry");
      setProducts(response.data);
    } catch (error) {
      console.error("Błąd pobierania:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/pantry/${id}`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const openEditModal = (product) => {
    const formattedDate = product.expirationDate
      ? product.expirationDate.split("T")[0]
      : "";
    const isBarcodeMissing =
      !product.barcode || product.barcode.startsWith("BRAK-");

    setEditingProduct({
      ...product,
      expirationDate: formattedDate,
      barcode: isBarcodeMissing ? "" : product.barcode,
      isBarcodeEditable: isBarcodeMissing,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const finalBarcode =
        editingProduct.barcode.trim() === ""
          ? `BRAK-${Date.now()}`
          : editingProduct.barcode;
      await api.put(`/pantry/${editingProduct.id}`, {
        name: editingProduct.name,
        barcode: finalBarcode,
        expirationDate: editingProduct.expirationDate,
        quantity: parseFloat(editingProduct.quantity),
        unit: editingProduct.unit,
      });
      setIsEditModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Błąd aktualizacji:", error);
    }
  };

  const getProductStatus = (expirationDate) => {
    if (!expirationDate) return { type: "neutral" };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round(
      (expDate.getTime() - today.getTime()) / (1000 * 3600 * 24),
    );

    if (diffDays < 0) return { type: "expired" };
    if (diffDays <= 3) return { type: "soon" };
    return { type: "fresh" };
  };

  const formatLastUpdated = (dateString) => {
    if (!dateString) return "Brak danych";
    const date = new Date(dateString);
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
    const timeString = date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (isToday) return `dzisiaj, ${timeString}`;
    return `${date.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" })}, ${timeString}`;
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const status = getProductStatus(p.expirationDate).type;
    const matchesFilter =
      activeFilter === "ALL" || activeFilter === status.toUpperCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 w-full">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
          Moja Kuchnia
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Zarządzaj swoimi zapasami, sprawdzaj statusy i aktualizuj ilości.
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <div className="relative w-full xl:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Szukaj produktu lub skanuj kod..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-[#00C853] dark:text-white transition-colors"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full xl:w-auto pb-1 xl:pb-0">
          {["ALL", "FRESH", "SOON", "EXPIRED"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? filter === "ALL"
                    ? "border-2 border-[#00C853] text-[#00C853] bg-green-50 dark:bg-[#00C853]/10"
                    : filter === "FRESH"
                      ? "border-2 border-slate-400 text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700"
                      : filter === "SOON"
                        ? "border-2 border-yellow-400 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20"
                        : "border-2 border-red-400 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                  : "border-2 border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              {filter === "ALL"
                ? "Wszystkie"
                : filter === "FRESH"
                  ? "Świeże"
                  : filter === "SOON"
                    ? "Krótka data"
                    : "Przeterminowane"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors w-full">
        <div className="hidden lg:grid grid-cols-[1.5fr_1fr_1fr_1fr_100px] gap-4 p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          <div className="pl-4 text-left">Produkt</div>
          <div className="text-left">Kategoria</div>
          <div className="text-center">Data Ważności</div>
          <div className="text-right pr-6">Ilość</div>
          <div className="text-right pr-4">Akcja</div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500 font-medium">
            Ładowanie zapasów...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-full mb-4">
              <Box size={32} className="text-slate-300 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Brak wyników
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Spiżarnia świeci pustkami. Dodaj nowe produkty!
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredProducts.map((product, index) => {
              const status = getProductStatus(product.expirationDate);
              return (
                <div
                  key={product.id}
                  onClick={() => openEditModal(product)}
                  className={`grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr_1fr_100px] gap-4 p-4 items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors ${
                    index !== filteredProducts.length - 1
                      ? "border-b border-slate-100 dark:border-slate-700"
                      : ""
                  }`}
                >
                  <div className="font-bold text-[#00C853] text-lg lg:pl-4 text-left">
                    {product.name}
                  </div>

                  <div className="text-slate-500 dark:text-slate-400 text-sm hidden lg:block font-medium text-left">
                    Inne
                  </div>

                  <div className="text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        status.type === "expired"
                          ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                          : status.type === "soon"
                            ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
                            : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                      }`}
                    >
                      {product.expirationDate
                        ? new Date(product.expirationDate).toLocaleDateString(
                            "pl-PL",
                          )
                        : "Brak daty"}
                    </span>
                  </div>

                  <div className="flex flex-col text-right pr-6">
                    <span className="font-extrabold text-slate-900 dark:text-white text-lg">
                      {product.quantity} {product.unit}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                      Ostatnia zmiana: {formatLastUpdated(product.updatedAt)}
                    </span>
                  </div>

                  <div className="flex lg:justify-end pr-4 text-right">
                    <button
                      onClick={(e) => deleteProduct(product.id, e)}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-400 font-bold text-sm transition-colors"
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleUpdate}
            className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Edytuj Produkt
              </h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="bg-slate-100 dark:bg-slate-700 p-2 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Nazwa Produktu
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 outline-none focus:border-[#00C853] dark:text-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Kod Kreskowy
                </label>
                <input
                  type="text"
                  placeholder={
                    editingProduct.isBarcodeEditable
                      ? "Wpisz nowy kod kreskowy..."
                      : "Brak"
                  }
                  disabled={!editingProduct.isBarcodeEditable}
                  value={editingProduct.barcode}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      barcode: e.target.value,
                    })
                  }
                  className={`w-full rounded-2xl p-4 border transition-colors outline-none ${
                    editingProduct.isBarcodeEditable
                      ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:border-[#00C853] dark:text-white"
                      : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed"
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Data Ważności
                  </label>
                  <input
                    type="date"
                    value={editingProduct.expirationDate}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        expirationDate: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 outline-none focus:border-[#00C853] dark:text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Ilość
                  </label>
                  <input
                    type="number"
                    value={editingProduct.quantity}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        quantity: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 outline-none focus:border-[#00C853] dark:text-white font-bold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Jednostka
                  </label>
                  <input
                    type="text"
                    value={editingProduct.unit}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        unit: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 outline-none focus:border-[#00C853] dark:text-white transition-colors"
                  />
                </div>
              </div>

              <button className="mt-4 bg-[#00C853] hover:bg-green-600 text-white font-extrabold py-5 rounded-[1.5rem] text-xl transition shadow-lg shadow-green-200 dark:shadow-none">
                Zapisz zmiany
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
