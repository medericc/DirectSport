import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

interface PlayerStat {
  id: number;
  name: string;
  points: number;
  assists: number;
  rebounds: number;
  // Add more fields as needed
}

const SeasonPage: React.FC = () => {
  const router = useRouter();
  const [team1Stats, setTeam1Stats] = useState<PlayerStat[]>([]);
  const [team2Stats, setTeam2Stats] = useState<PlayerStat[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      if (router.query.team1 && router.query.team2) {
        const team1 = JSON.parse(router.query.team1 as string);
        const team2 = JSON.parse(router.query.team2 as string);

        const [team1Response, team2Response] = await Promise.all([
          axios.post('/api/getSeasonStats', { players: team1.map((p: PlayerStat) => p.id) }),
          axios.post('/api/getSeasonStats', { players: team2.map((p: PlayerStat) => p.id) })
        ]);

        setTeam1Stats(team1Response.data);
        setTeam2Stats(team2Response.data);
      }
    };

    fetchStats();
  }, [router.query]);

  return (
    <div>
      <h2>Statistiques de la saison</h2>
      <h3>Équipe 1</h3>
      {team1Stats.map((player) => (
        <p key={player.id}>
          {player.name}: {player.points} pts, {player.assists} passes, {player.rebounds} rebonds
        </p>
      ))}

      <h3>Équipe 2</h3>
      {team2Stats.map((player) => (
        <p key={player.id}>
          {player.name}: {player.points} pts, {player.assists} passes, {player.rebounds} rebonds
        </p>
      ))}
    </div>
  );
};

export default SeasonPage;
