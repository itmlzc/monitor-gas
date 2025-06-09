"use client";

import { useEffect, useState } from "react";
import { useFirebaseMessaging } from "@/hooks/useFirebaseMessaging";

export default function HomePage() {
  useFirebaseMessaging();

  const [gasValue, setGasValue] = useState<number | null>(null);
  const [buzzerState, setBuzzerState] = useState<boolean>(false);
  const [status, setStatus] = useState("Cargando...");
  const [showModal, setShowModal] = useState(true);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [confirmado, setConfirmado] = useState(false);
  const MAX_GAS = 400;

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("✅ SW registrado:", registration);
        })
        .catch((error) => {
          console.error("❌ Error al registrar el SW:", error);
        });
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          "https://detector-gas-v2-default-rtdb.firebaseio.com/nivel_gas.json"
        );
        const data = await res.json();
        setGasValue(data);
        setStatus(
          data >= MAX_GAS
            ? "⚠️ Gas peligroso. Válvula cerrada."
            : "✅ Niveles normales de gas."
        );
        if (data < MAX_GAS) {
          setMostrarConfirmacion(true);
        } else {
          setMostrarConfirmacion(false);
          setConfirmado(false);
        }
      } catch {
        setStatus("❌ Error leyendo nivel de gas.");
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          "https://detector-gas-v2-default-rtdb.firebaseio.com/buzzer.json"
        );
        const data = await res.json();
        setBuzzerState(data);
      } catch {
        console.warn("❌ Error al leer estado del buzzer.");
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const abrirValvula = async () => {
    if (gasValue !== null && gasValue >= MAX_GAS) {
      alert("⚠️ No se puede abrir. Nivel de gas peligroso.");
      return;
    }

    try {
      await fetch(
        "https://detector-gas-v2-default-rtdb.firebaseio.com/buzzer.json",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(true),
        }
      );
      setBuzzerState(true);
    } catch {
      alert("❌ No se pudo abrir la válvula.");
    }
  };

  const formattedDate = new Date().toLocaleString("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 gap-6 bg-[#f3f4f6] text-gray-900">
      <h1 className="text-4xl font-bold tracking-tight">ITM | Monitor de Gas</h1>

      <div className="text-7xl font-mono">
        {gasValue !== null ? gasValue : "--"}
      </div>

      <p className="text-lg text-gray-600">{status}</p>

      {!buzzerState && mostrarConfirmacion && !confirmado && (
        <button
          onClick={() => {
            const confirmar = confirm("¿El área ya es segura para abrir la válvula?");
            if (confirmar) {
              const seguro = confirm(
                "⚠️ Estás confirmando que el área es 100% segura para ti y tus allegados. ¿Deseas continuar?"
              );
              if (seguro) setConfirmado(true);
            }
          }}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl text-lg font-semibold transition-all"
        >
          Confirmar seguridad
        </button>
      )}

      {!buzzerState && confirmado && (
        <button
          onClick={abrirValvula}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-lg font-semibold transition-all"
        >
          Abrir
        </button>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <h2 className="text-xl font-semibold mb-2">🔔 Notificación de seguridad</h2>
            <p className="text-sm text-gray-700 mb-1">{formattedDate}</p>
            <p className="text-sm text-gray-700 mb-4">
              Última lectura de gas: {gasValue !== null ? gasValue : "--"}
            </p>
            <ul className="text-sm text-left text-gray-600 mb-4 list-disc pl-5">
              <li>Evita usar flamas abiertas.</li>
              <li>Ventila el área inmediatamente.</li>
              <li>No enciendas interruptores eléctricos.</li>
              <li>Llama a emergencias si el nivel es alto.</li>
            </ul>
            <button
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
              onClick={() => setShowModal(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
