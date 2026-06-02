import { useState, useEffect } from "react";
import { X, Camera } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react"; // Nowy import!
import api from "../api";

export default function AddProductModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    expirationDate: "",
    quantity: 1,
    unit: "szt.",
  });

  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [isScanned, setIsScanned] = useState(false);

  useEffect(() => {
    if (!isOpen || isScanned) return;

    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/scan/${sessionId}`);
        if (response.data.barcode) {
          setFormData((prev) => ({ ...prev, barcode: response.data.barcode }));
          setIsScanned(true);
        }
      } catch (error) {
        // 404
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen, sessionId, isScanned]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    setFormData({
      name: "",
      barcode: "",
      expirationDate: "",
      quantity: 1,
      unit: "szt.",
    });
    setIsScanned(false);
  };

  const connectionUrl = `${window.location.origin}/scan/${sessionId}`;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            Dodaj Nowy Produkt
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row p-6 gap-8">
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nazwa Produktu
              </label>
              <input
                type="text"
                placeholder="Np. Mleko, Jajka..."
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#00C853] focus:ring-1"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kod Kreskowy
              </label>
              <input
                type="text"
                placeholder="Wpisz lub zeskanuj telefonem..."
                className={`w-full border rounded-lg p-2.5 outline-none focus:ring-1 font-mono transition-colors
                  ${isScanned ? "bg-green-50 border-green-400 text-green-700 ring-green-400" : "border-gray-300 focus:border-[#00C853]"}`}
                value={formData.barcode}
                onChange={(e) =>
                  setFormData({ ...formData, barcode: e.target.value })
                }
              />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Ważności
                </label>
                <input
                  type="date"
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#00C853] focus:ring-1 text-gray-600"
                  value={formData.expirationDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expirationDate: e.target.value })
                  }
                />
              </div>
              <div className="w-24">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ilość
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#00C853] focus:ring-1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="w-24">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jdn.
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#00C853] focus:ring-1 bg-white"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                >
                  <option value="szt.">szt.</option>
                  <option value="l">l</option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 w-full bg-[#00C853] hover:bg-green-600 text-white font-bold py-3 rounded-lg shadow-sm"
            >
              Dodaj do kuchni
            </button>
          </form>

          {/* Dynamiczny Kod QR! */}
          <div className="hidden md:flex w-full md:w-64 bg-gray-50 rounded-xl border border-gray-100 flex-col items-center justify-center p-6 text-center">
            {isScanned ? (
              <div className="flex flex-col items-center">
                <div className="bg-green-100 p-4 rounded-xl shadow-sm border border-green-200 mb-4">
                  <Camera size={48} className="text-green-600" />
                </div>
                <h3 className="font-bold text-green-700 mb-1">Zeskanowano!</h3>
                <p className="text-xs text-gray-500">
                  Kod znajduje się już w formularzu.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 mb-4">
                  <QRCodeCanvas value={connectionUrl} size={120} />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">
                  Skanuj telefonem
                </h3>
                <p className="text-xs text-gray-500">
                  Zeskanuj ten kod QR zwykłym aparatem w telefonie. Telefon
                  stanie się bezprzewodowym czytnikiem kodów kreskowych.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
