// hooks/useFirebaseMessaging.ts

'use client';

import { getDatabase, ref, onValue, set } from 'firebase/database';
import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from '@/lib/firebase';

export const useFirebaseMessaging = () => {
  const [nivelGas, setNivelGas] = useState<number | null>(null);
  const [tokenFCM, setTokenFCM] = useState<string | null>(null);

  useEffect(() => {
    const messaging = getMessaging(app);
    const db = getDatabase(app);

    // Obtener token FCM
    getToken(messaging, {
      vapidKey: 'BIGJLAYnjebyDF7e9HQyCpTU17eADJV0vlxkHBzCvrFm8o9IWv0LdZwcBJPodR9Znn8EUD0g6zTRY1NLtYENy8g',
    })
      .then(async (currentToken) => {
        if (currentToken) {
          console.log('✅ Token FCM:', currentToken);
          setTokenFCM(currentToken);

        // 👉 Guardarlo en la base de datos
        const tokenRef = ref(db, `/tokens/${currentToken}`);
        await set(tokenRef, true);
      } else {
        console.warn('⚠️ No se pudo obtener el token FCM.');
      }
    })
    .catch((err) => {
      console.error('❌ Error al obtener token:', err);
    });

    // Escuchar notificaciones recibidas en foreground
    const unsubscribeMessage = onMessage(messaging, (payload) => {
      console.log('📩 Notificación recibida:', payload);
    });

    // Escuchar cambios en el nivel de gas
    const nivelRef = ref(db, '/nivel_gas');
    const unsubscribeValue = onValue(nivelRef, (snapshot) => {
      const valor = snapshot.val();
      console.log('🔥 Nivel de gas (escucha en tiempo real):', valor);
      setNivelGas(valor);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeValue();
    };
  }, []);

  return { nivelGas, tokenFCM };
};
