// pages/api/saveMatchStats.js
import db from '../../lib/db';

const saveMatchStats = async (req, res) => {
  if (req.method === 'POST') {
    const { stats } = req.body;
    
    try {
      for (const stat of stats) {
        const { playerId, statType, quarter } = stat;
        await db.query(
          'INSERT INTO player_stats (player_id, stat_type, quarter) VALUES (?, ?, ?)',
          [playerId, statType, quarter]
        );
      }
      res.status(200).json({ message: 'Stats enregistrées avec succès' });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de l\'enregistrement des stats' });
    }
  } else {
    res.status(405).json({ error: 'Méthode non autorisée' });
  }
};

export default saveMatchStats;
