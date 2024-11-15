import express from 'express';
import http from 'http';
import { Server as socketIo } from 'socket.io';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
app.use(cors({ origin: 'http://localhost:3000' })); 

const server = http.createServer(app);
const io = new socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

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
io.on("connection", (socket) => {
  console.log("Un utilisateur est connecté");

  socket.on("updateOnCourt", ({ team1, team2 }) => {
    console.log("Joueurs sur le terrain mis à jour :", { team1, team2 });
    io.emit("updateOnCourt", { team1, team2 }); // Diffuse les données à tous les clients
  });

  socket.on("disconnect", () => {
    console.log("Un utilisateur est déconnecté");
  });
});

io.on('connection', (socket) => {
  console.log('Un utilisateur est connecté');

  // Réception et rediffusion des statistiques spécifiques depuis MatchPage
  socket.on('liveStats', (data) => {
    console.log('Stat reçue et transmise:', data);
    io.emit('liveStats', data);  // Redistribue les données à tous les clients connectés
  });

  socket.on('disconnect', () => {
    console.log('Un utilisateur est déconnecté');
  });
});

server.listen(5000, () => {
  console.log('Serveur écoute sur le port 5000');
});
