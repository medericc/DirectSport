// lib/db.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',      // Ton hôte MySQL
  user: 'root',           // Ton utilisateur MySQL
  password: 'password',   // Ton mot de passe MySQL
  database: 'nom_base',   // Le nom de ta base de données
});

export default pool;
