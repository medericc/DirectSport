import express from 'express';
import http from 'http';
import { Server as socketIo } from 'socket.io';
import mysql from 'mysql2';
import cors from 'cors'; // Importer CORS

// Configuration du serveur
const app = express();
app.use(cors({ origin: 'http://localhost:3000' })); // Autoriser uniquement l'origine de votre client

const server = http.createServer(app);
const io = new socketIo(server, {
  cors: {
    origin: 'http://localhost:3000', // Autoriser le client local
    methods: ['GET', 'POST'],
  },
});

// Connexion à la base de données MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'testtest',
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    return;
  }
  console.log('Connecté à la base de données MySQL');
});

// Route API
app.get('/api/getPlayers', (req, res) => {
  const query = 'SELECT player_id AS id, player_name AS name, team_id AS equipe FROM players';
  db.query(query, (error, results) => {
    if (error) {
      console.error('Erreur lors de la récupération des joueurs:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des joueurs' });
      return;
    }
    res.json(results);
  });
});

// Gestion des connexions Socket.io
io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté');

  // Envoie des stats en temps réel toutes les 10 secondes
  const statsInterval = setInterval(() => {
    const query = `
      SELECT players.player_name AS joueur, players.jersey_number AS numero, 
             players.points AS points, players.rebounds AS rebonds, players.assists AS assists, 
             teams.team_id AS equipe
      FROM players
      JOIN teams ON players.team_id = teams.team_id
      ORDER BY players.player_id DESC
    `;

    db.query(query, (error, results) => {
      if (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        return;
      }

      if (results.length > 0) {
        // Envoie les statistiques de tous les joueurs connectés via Socket.io
        socket.emit('liveStats', results);
      }
    });
  }, 10000);

  socket.on('disconnect', () => {
    console.log('Un utilisateur est déconnecté');
    clearInterval(statsInterval);
  });
});

// Démarrer le serveur
server.listen(5000, () => {
  console.log('Serveur écoute sur le port 5000');
});
