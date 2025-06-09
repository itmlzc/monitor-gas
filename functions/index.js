const { onValueWritten } = require("firebase-functions/v2/database");
const { initializeApp } = require("firebase-admin/app");
const { getMessaging } = require("firebase-admin/messaging");
const { getDatabase } = require("firebase-admin/database");

initializeApp();

exports.detectarGas = onValueWritten("/nivel_gas", async (event) => {
  const nuevoNivel = event.data.after.val();
  console.log("🚨 Nivel de gas actualizado:", nuevoNivel);

  if (nuevoNivel >= 400) {
    const db = getDatabase();
    const tokensRef = db.ref("/tokens");
    const snapshot = await tokensRef.once("value");
    const tokens = snapshot.val();

    if (!tokens) {
      console.log("⚠️ No hay tokens registrados.");
      return;
    }

    const mensajes = Object.keys(tokens).map((token) => ({
      notification: {
        title: "⚠️ ¡Alerta de Gas!",
        body: `Nivel detectado: ${nuevoNivel}. Revisa tu instalación.`,
      },
      token: token,
    }));

    for (const mensaje of mensajes) {
      try {
        const response = await getMessaging().send(mensaje);
        console.log("✅ Notificación enviada:", response);
      } catch (error) {
        console.error("❌ Error al enviar notificación:", error);
      }
    }
  } else {
    console.log("✅ Nivel normal, no se envía notificación.");
  }
});


