// lib/useSocket.ts
import { useEffect } from 'react';
import socket from './sockets';  // Assure-toi que tu importes bien l'instance du socket

const useSocket = (event: string, callback: (data: any) => void) => {
  useEffect(() => {
    // Écoute l'événement et appelle le callback
    socket.on(event, callback);

    // Cleanup à la désinstallation du composant
    return () => {
      socket.off(event, callback);
    };
  }, [event, callback]);

  // Ici, si tu veux envoyer des événements via emit, 
  // tu n'as pas besoin d'exposer `socket` directement.
  // Mais si tu veux l'utiliser ailleurs, tu peux retourner le socket
  return socket;
};

export default useSocket;
