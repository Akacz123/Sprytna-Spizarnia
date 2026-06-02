import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function MobileScanner() {
  const { sessionId } = useParams();
  const [scanned, setScanned] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: { width: 250, height: 150 },
      fps: 15,
      rememberLastUsedCamera: true,
      supportedScanTypes: [0],
    });

    scanner.render(
      async (decodedText) => {
        scanner.clear();
        setScanned(true);
        try {
          const pcIp = window.location.hostname;

          await fetch(`http://${pcIp}:5289/api/Scanner/${sessionId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ barcode: decodedText }),
          });
        } catch (err) {
          setErrorMsg("Błąd sieci. Sprawdź połączenie.");
        }
      },
      (err) => {},
    );

    return () => {
      scanner.clear().catch((e) => console.error(e));
    };
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white font-sans">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#00C853] mb-2">
          Skaner Aparatem
        </h1>
        <p className="text-slate-400 text-sm">
          Skieruj aparat na kod kreskowy produktu.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 bg-red-500 text-white p-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} /> {errorMsg}
        </div>
      )}

      {scanned && !errorMsg ? (
        <div className="flex flex-col items-center animate-in zoom-in duration-300">
          <CheckCircle size={64} className="text-[#00C853] mb-2" />
          <span className="font-bold text-xl">Kod przesłany!</span>
          <p className="text-slate-400 text-sm mt-2 text-center">
            Spójrz na ekran PC,
            <br />
            żeby zobaczyć jak uzupełnia dane.
          </p>
        </div>
      ) : (
        <div
          id="reader"
          className="w-full max-w-sm bg-white rounded-2xl overflow-hidden text-black shadow-[0_0_30px_rgba(0,200,83,0.3)] border-4 border-[#00C853] [&_a]:hidden [&_img]:hidden"
        ></div>
      )}
    </div>
  );
}
