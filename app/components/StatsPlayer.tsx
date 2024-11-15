"use client";

import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

interface PlayerStat {
  id: number;
  name: string;
  jerseyNumber: number;
  points: number;
  assists: number;
  rebounds: number;
}

interface StatAction {
  playerId: number;
  playerName: string;
  statType: "2pts" | "3pts" | "Pass" | "Rebound";
  minute: number;
  quarter: number;
}

const StatsPlayer: React.FC = () => {
  const team1 = useSelector((state: RootState) => state.match.team1) as PlayerStat[];
  const team2 = useSelector((state: RootState) => state.match.team2) as PlayerStat[];
  const stats = useSelector((state: RootState) => state.match.stats) as StatAction[];

  // Fonction pour calculer les statistiques cumulées pour chaque joueur
  const calculateStats = (team: PlayerStat[]) => {
    return team.map((player) => {
      const playerStats = stats.filter((stat) => stat.playerId === player.id);

      const points =
        playerStats.filter((s) => s.statType === "2pts").length * 2 +
        playerStats.filter((s) => s.statType === "3pts").length * 3;
      const assists = playerStats.filter((s) => s.statType === "Pass").length;
      const rebounds = playerStats.filter((s) => s.statType === "Rebound").length;

      return {
        ...player,
        points,
        assists,
        rebounds,
      };
    });
  };

  const team1Stats = calculateStats(team1);
  const team2Stats = calculateStats(team2);

  return (
    <div>
      <h2>Statistiques des Joueurs</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Joueur</th>
            <th>Points</th>
            <th>Passes</th>
            <th>Rebonds</th>
          </tr>
        </thead>
        <tbody>
          {[...team1Stats, ...team2Stats].map((player) => (
            <tr
              key={player.id}
              style={{ borderBottom: "1px solid #ddd", textAlign: "center" }}
            >
              <td>{player.jerseyNumber || "-"}</td>
              <td>{player.name}</td>
              <td>{player.points}</td>
              <td>{player.assists}</td>
              <td>{player.rebounds}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StatsPlayer;
