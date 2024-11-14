"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';  // Importer useRouter de Next.js
import { setTeams } from '../redux/matchSlice';

interface Player {
  id: number;
  name: string;
  equipe: number;
}

const AddPlayers: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedTeam1, setSelectedTeam1] = useState<Player[]>([]);
  const [selectedTeam2, setSelectedTeam2] = useState<Player[]>([]);
  const [isReady, setIsReady] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter(); // Initialiser le router

  useEffect(() => {
    axios.get('http://localhost:5000/api/getPlayers')
      .then(response => {
        console.log("Données des joueurs:", response.data); // Affiche les données pour vérifier
        setPlayers(response.data); // Stocke les données dans le state
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des joueurs:', error);
      });
  }, []);

  const team1Players = players.filter(player => player.equipe === 1);
  const team2Players = players.filter(player => player.equipe === 2);

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
    dispatch(setTeams({ team1: selectedTeam1, team2: selectedTeam2 }));
    router.push('/match'); // Redirection vers la page de match
  };
  

  return (
    <div>
      <h2>Choisir les joueurs pour le match</h2>
      <div className="teams-selection">
        <div>
          <h3>Équipe 1</h3>
          {team1Players.map(player => (
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
          {team2Players.map(player => (
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
