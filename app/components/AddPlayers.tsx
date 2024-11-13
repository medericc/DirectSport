import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

interface Player {
  id: number;
  name: string;
}

const AddPlayers: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedTeam1, setSelectedTeam1] = useState<Player[]>([]);
  const [selectedTeam2, setSelectedTeam2] = useState<Player[]>([]);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    axios.get('/api/getPlayers')
      .then(response => {
        setPlayers(response.data);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des joueurs:', error);
      });
  }, []);

  const toggleSelection = (player: Player, team: 'team1' | 'team2') => {
    if (team === 'team1') {
      setSelectedTeam1(prevState =>
        prevState.includes(player)
          ? prevState.filter(p => p.id !== player.id)
          : [...prevState, player]
      );
    } else {
      setSelectedTeam2(prevState =>
        prevState.includes(player)
          ? prevState.filter(p => p.id !== player.id)
          : [...prevState, player]
      );
    }
  };

  useEffect(() => {
    setIsReady(selectedTeam1.length >= 5 && selectedTeam2.length >= 5);
  }, [selectedTeam1, selectedTeam2]);

  const startMatch = () => {
    const teams = {
      team1: JSON.stringify(selectedTeam1),
      team2: JSON.stringify(selectedTeam2),
    };

    router.push({
      pathname: '/match',
      query: teams,
    }).then(() => {
      router.push({
        pathname: '/season',
        query: teams,
      });
    });
  };
  return (
    <div>
      <h2>Choisir les joueurs pour le match</h2>
      <div className="teams-selection">
        <div>
          <h3>Équipe 1</h3>
          {players.map(player => (
            <div key={player.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedTeam1.includes(player)}
                  onChange={() => toggleSelection(player, 'team1')}
                />
                {player.name}
              </label>
            </div>
          ))}
        </div>

        <div>
          <h3>Équipe 2</h3>
          {players.map(player => (
            <div key={player.id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedTeam2.includes(player)}
                  onChange={() => toggleSelection(player, 'team2')}
                />
                {player.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <button onClick={startMatch} disabled={!isReady}>
        Commencer le match
      </button>
    </div>
  );
};

export default AddPlayers;
