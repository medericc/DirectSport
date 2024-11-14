// lib/db.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost', // ou l'adresse de ton serveur MySQL
  user: 'root', // utilisateur MySQL
  password: '', // mot de passe MySQL
  database: 'testtest', // nom de ta base de données  // Le nom de ta base de données
});

export default pool;
