// pages/api/getPlayers.js
import db from '../../lib/db';

const getPlayers = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const [rows] = await db.query('SELECT id, name FROM players');
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des joueurs' });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
};

export default getPlayers;
