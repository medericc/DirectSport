import express from 'express';
import http from 'http';
import { Server as socketIo } from 'socket.io';
import mysql from 'mysql2';

// Configuration du serveur
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connexion à la base de données MySQL
const db = mysql.createConnection({
  host: 'localhost', // ou l'adresse de ton serveur MySQL
  user: 'ton_utilisateur', // utilisateur MySQL
  password: 'ton_mot_de_passe', // mot de passe MySQL
  database: 'ta_base_de_donnees', // nom de ta base de données
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('Connecté à la base de données MySQL');
});

// Gestion des connexions Socket.io
io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté');

  // Envoie des stats en temps réel toutes les 10 secondes
  setInterval(() => {
    // Récupère les dernières stats depuis la base de données
    db.query('SELECT joueur, buts, passes FROM stats ORDER BY id DESC LIMIT 1', (error, results) => {
      if (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        return;
      }
      
      if (results.length > 0) {
        const { joueur, buts, passes } = results[0];
        socket.emit('liveStats', { joueur, buts, passes });
      }
    });
  }, 10000);

  socket.on('disconnect', () => {
    console.log('Un utilisateur est déconnecté');
  });
});

// Démarrer le serveur
server.listen(5000, () => {
  console.log('Serveur écoute sur le port 5000');
});
