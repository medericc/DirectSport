"use client";
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { finishMatch, addPlayerStat } from '../redux/matchSlice';
import useSocket from '../lib/useSocket';
import { RootState } from '../redux/store';

interface Player {
  id: number;
  name: string;
}

interface StatAction {
  playerId: number;
  playerName: string;
  statType: string;
  minute: number;
  quarter: number;
}

const initialQuarterTime = 10 * 60 * 1000;

const MatchPage: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [currentQuarter, setCurrentQuarter] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(initialQuarterTime);
  const [isMatchStarted, setIsMatchStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState<StatAction[]>([]);
  const [onCourtTeam1, setOnCourtTeam1] = useState<Player[]>([]);
  const [onCourtTeam2, setOnCourtTeam2] = useState<Player[]>([]);

  const team1 = useSelector((state: RootState) => state.match.team1 as Player[]);
  const team2 = useSelector((state: RootState) => state.match.team2 as Player[]);

  // Connexion au WebSocket pour recevoir des stats sans envoyer automatiquement au chargement de la page
  const socket = useSocket('liveStats', (newStats: StatAction) => {
    setStats((prevStats) => [...prevStats, newStats]);
    console.log('Stats reçues via socket:', newStats);
  });

  useEffect(() => {
    if (isMatchStarted && !isPaused) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1000 : 0));
      }, 1000);

      if (timeLeft === 0 && currentQuarter < 4) {
        setCurrentQuarter(currentQuarter + 1);
        setTimeLeft(initialQuarterTime);
      }

      return () => clearInterval(timer);
    }
  }, [timeLeft, currentQuarter, isMatchStarted, isPaused]);

  const handleOnCourtToggle = (player: Player, team: 'team1' | 'team2') => {
    const onCourt = team === 'team1' ? onCourtTeam1 : onCourtTeam2;
    const setOnCourt = team === 'team1' ? setOnCourtTeam1 : setOnCourtTeam2;

    if (onCourt.some((p) => p.id === player.id)) {
      setOnCourt(onCourt.filter((p) => p.id !== player.id));
      setIsPaused(true);
      console.log(`Temps arrêté car le joueur ${player.name} a été retiré du terrain`);
    } else if (onCourt.length < 5) {
      setOnCourt([...onCourt, player]);
    }
  };
  const emitOnCourtPlayers = () => {
    if (onCourtTeam1.length === 5 && onCourtTeam2.length === 5) {
      socket.emit("updateOnCourt", { team1: onCourtTeam1, team2: onCourtTeam2 });
    }
  };
  const handleStartMatch = () => {
    if (onCourtTeam1.length === 5 && onCourtTeam2.length === 5) {
      setIsMatchStarted(true);
      emitOnCourtPlayers();
    } else {
      alert("Chaque équipe doit avoir 5 joueurs sur le terrain.");
    }
  };

  const handleAddStat = (player: Player, statType: string) => {
    setIsPaused(true);

    const minute = initialQuarterTime - timeLeft;
    const newStat: StatAction = {
      playerId: player.id,
      playerName: player.name,
      statType,
      minute: Math.floor(minute / 60000),
      quarter: currentQuarter
    };

    console.log('Stat enregistrée :', {
      Joueur: player.name,
      Action: statType,
      Minute: newStat.minute,
      QuartTemps: currentQuarter,
    });

    setStats((prevStats) => [...prevStats, newStat]);
    dispatch(addPlayerStat(newStat));

    // Émettre via WebSocket uniquement ici
    socket.emit('liveStats', newStat);
    console.log('Stat envoyée via WebSocket:', newStat);
  };

  const handleResumeMatch = () => {
    setIsPaused(false);
    emitOnCourtPlayers();
  };

  const handleFinishMatch = () => {
    dispatch(finishMatch(stats));
    alert('Match terminé et statistiques enregistrées !');
    router.push('/somepath');  // Remplacez '/somepath' par la route souhaitée
  };

  return (
    <div>
      <h2>Match en cours</h2>
      <h3>Quart-temps : {currentQuarter} / Temps restant : {Math.floor(timeLeft / 60000)}:{(timeLeft % 60000) / 1000 < 10 ? '0' : ''}{Math.floor((timeLeft % 60000) / 1000)}</h3>

      {!isMatchStarted && <button onClick={handleStartMatch}>Démarrer le Match</button>}
      {isPaused && <button onClick={handleResumeMatch}>Reprendre</button>}

      <div className="teams">
        {[{ team: team1, label: 'Équipe 1', onCourt: onCourtTeam1 }, { team: team2, label: 'Équipe 2', onCourt: onCourtTeam2 }]
          .map(({ team, label, onCourt }, index) => (
          <div key={index}>
            <h3>{label}</h3>
            {team.map((player) => (
              <div key={player.id} className="player-item">
                <p>{player.name}</p>
                <label>
                  <input
                    type="checkbox"
                    checked={onCourt.some((p) => p.id === player.id)}
                    onChange={() => handleOnCourtToggle(player, label === 'Équipe 1' ? 'team1' : 'team2')}
                  />
                  Sur le terrain
                </label>

                {/* Boutons pour ajouter des statistiques */}
                <button onClick={() => handleAddStat(player, '2pts')}>+2 Pts</button>
                <button onClick={() => handleAddStat(player, '3pts')}>+3 Pts</button>
                <button onClick={() => handleAddStat(player, 'Pass')}>Passe</button>
                <button onClick={() => handleAddStat(player, 'Rebound')}>Rebond</button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <button onClick={handleFinishMatch}>Terminer le Match</button>
    </div>
  );
};

export default MatchPage;
