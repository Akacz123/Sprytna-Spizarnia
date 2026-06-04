import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PackageOpen, AlertCircle, Smartphone, Loader2 } from "lucide-react";
import api from "../api";

export default function AddProductPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [sessionId, setSessionId] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [isWaitingForScan, setIsWaitingForScan] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    expirationDate: "",
    quantity: 1,
    unit: "szt.",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const startMobileScan = () => {
    const newSession = Math.random().toString(36).substring(2, 7).toUpperCase();
    setSessionId(newSession);
    const currentHost = window.location.host;
    const scanLink = `http://${currentHost}/scan/${newSession}`;
    setQrUrl(
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(scanLink)}`,
    );
    setIsWaitingForScan(true);
  };

  useEffect(() => {
    let interval;
    if (isWaitingForScan && sessionId) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/Scanner/${sessionId}`);
          if (res.status === 200 && res.data.barcode) {
            setIsWaitingForScan(false);
            fetchProductDataFromGlobalDatabase(res.data.barcode);
          }
        } catch (err) {}
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isWaitingForScan, sessionId]);

  const fetchProductDataFromGlobalDatabase = async (scannedBarcode) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${scannedBarcode}.json`,
      );
      const data = await response.json();

      if (data.status === 1) {
        setFormData((prev) => ({
          ...prev,
          barcode: scannedBarcode,
          name:
            data.product.product_name ||
            "Znaleziono produkt (Brak nazwy w bazie)",
        }));
      } else {
        setFormData((prev) => ({ ...prev, barcode: scannedBarcode, name: "" }));
        alert(
          "Kod zeskanowany, ale produktu nie ma w globalnej bazie. Wpisz nazwę ręcznie.",
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const finalBarcode =
        formData.barcode.trim() === ""
          ? `BRAK-${Date.now()}`
          : formData.barcode;
      await api.post("/pantry", {
        name: formData.name,
        barcode: finalBarcode,
        expirationDate: formData.expirationDate,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
      });
      navigate("/kuchnia");
    } catch (err) {
      setError("Wystąpił błąd podczas dodawania.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 max-w-2xl mx-auto mt-4">
      <div className="text-center mb-4">
        <div className="bg-green-50 dark:bg-[#00C853]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <PackageOpen size={32} className="text-[#00C853]" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 transition-colors">
          Dodaj Nowy Produkt
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">
          Wpisz ręcznie lub użyj skanera w telefonie.
        </p>
      </div>

      <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00C853] rounded-full blur-[80px] opacity-20"></div>

        <div className="flex-1 text-center sm:text-left z-10">
          <h3 className="text-xl font-bold mb-2 flex items-center justify-center sm:justify-start gap-2">
            <Smartphone className="text-[#00C853]" /> Automatyczne dodawanie
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            Zeskanuj kod QR, aby połączyć telefon i użyć go jako bezprzewodowego
            skanera.
          </p>

          {!isWaitingForScan ? (
            <button
              onClick={startMobileScan}
              className="bg-[#00C853] hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition"
            >
              Uruchom skaner w telefonie
            </button>
          ) : (
            <div className="flex items-center gap-3 justify-center sm:justify-start text-yellow-400 font-bold bg-yellow-400/10 py-3 px-6 rounded-xl border border-yellow-400/20">
              <Loader2 className="animate-spin" size={20} /> Oczekiwanie na skan
              z telefonu...
            </div>
          )}
        </div>

        {isWaitingForScan && (
          <div className="bg-white p-3 rounded-2xl z-10 shrink-0">
            <img
              src={qrUrl}
              alt="Zeskanuj aby otworzyć skaner"
              className="w-32 h-32 rounded-lg"
            />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors"
      >
        {error && (
          <div className="mb-6 bg-red-50 text-red-500 p-4 rounded-2xl flex items-center gap-3 font-semibold text-sm border border-red-100">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Nazwa Produktu
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="np. Mleko Łaciate 3.2%"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 outline-none focus:border-[#00C853] dark:text-white transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Kod Kreskowy (Opcjonalny)
            </label>
            <input
              type="text"
              name="barcode"
              placeholder="np. 5900234567891"
              value={formData.barcode}
              onChange={handleChange}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 outline-none focus:border-[#00C853] dark:text-white transition-colors"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Data Ważności
              </label>
              <input
                type="date"
                name="expirationDate"
                required
                value={formData.expirationDate}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 outline-none focus:border-[#00C853] dark:text-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Ilość
              </label>
              <input
                type="number"
                name="quantity"
                required
                min="0.1"
                step="0.1"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 outline-none focus:border-[#00C853] dark:text-white font-bold transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Jednostka
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 outline-none focus:border-[#00C853] dark:text-white transition-colors appearance-none"
              >
                <option value="szt.">szt.</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="l">l</option>
                <option value="ml">ml</option>
                <option value="opak.">opak.</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 bg-[#00C853] hover:bg-green-600 disabled:bg-green-400 text-white font-extrabold py-5 rounded-[1.5rem] text-lg transition shadow-lg flex justify-center items-center gap-2"
          >
            {loading ? "Zapisywanie..." : "Dodaj do Spiżarni"}
          </button>
        </div>
      </form>
    </div>
  );
}
