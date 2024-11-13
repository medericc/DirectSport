// MatchPage.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { finishMatch } from '../redux/matchSlice';
import useSocket from '../lib/useSocket';

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
  const [stats, setStats] = useState<StatAction[]>([]);
  const [team1, setTeam1] = useState<Player[]>([]);
  const [team2, setTeam2] = useState<Player[]>([]);
  const [onCourtTeam1, setOnCourtTeam1] = useState<Player[]>([]);
  const [onCourtTeam2, setOnCourtTeam2] = useState<Player[]>([]);

  // Utilisation du hook pour écouter les événements en temps réel
  const socket = useSocket('liveStats', (newStats: StatAction) => {
    console.log('Stats received via socket:', newStats);
  });

  useEffect(() => {
    if (router.query.team1 && router.query.team2) {
      setTeam1(JSON.parse(router.query.team1 as string));
      setTeam2(JSON.parse(router.query.team2 as string));
    }
  }, [router.query]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1000 : 0));
    }, 1000);

    if (timeLeft === 0 && currentQuarter < 4) {
      setCurrentQuarter(currentQuarter + 1);
      setTimeLeft(initialQuarterTime);
    }

    return () => clearInterval(timer);
  }, [timeLeft, currentQuarter]);

  const handleOnCourtToggle = (player: Player, team: 'team1' | 'team2') => {
    const updateOnCourt = (currentOnCourt: Player[], setOnCourt: React.Dispatch<React.SetStateAction<Player[]>>) => {
      const isPlayerOnCourt = currentOnCourt.some((p) => p.id === player.id);
      if (isPlayerOnCourt) {
        setOnCourt(currentOnCourt.filter((p) => p.id !== player.id));
      } else if (currentOnCourt.length < 5) {
        setOnCourt([...currentOnCourt, player]);
      } else {
        alert('Only 5 players can be on the court per team');
      }
    };

    if (team === 'team1') {
      updateOnCourt(onCourtTeam1, setOnCourtTeam1);
    } else {
      updateOnCourt(onCourtTeam2, setOnCourtTeam2);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.emit('updateOnCourt', { team1: onCourtTeam1, team2: onCourtTeam2 });
    }
  }, [onCourtTeam1, onCourtTeam2, socket]);

  const handleDrag = (statType: string, playerId: number, playerName: string) => {
    const action: StatAction = {
      playerId,
      playerName,
      statType,
      minute: Math.floor((initialQuarterTime - timeLeft) / 60000),
      quarter: currentQuarter,
    };
    setStats((prevStats) => [...prevStats, action]);

    if (socket) {
      socket.emit('liveStats', action); // Utilisation de emit ici
    }
  };

  const handleFinishMatch = () => {
    dispatch(finishMatch(stats));
    alert('Match finished and stats saved!');
  };

  return (
    <div>
      <h2>Match in Progress</h2>
      <h3>Quarter: {currentQuarter} / Time Left: {Math.floor(timeLeft / 60000)}:{(timeLeft % 60000) / 1000 < 10 ? '0' : ''}{Math.floor((timeLeft % 60000) / 1000)}</h3>
      <div className="teams">
        {[{ team: team1, label: 'Team 1', onCourt: onCourtTeam1 }, { team: team2, label: 'Team 2', onCourt: onCourtTeam2 }]
          .map(({ team, label, onCourt }, index) => (
          <div key={index}>
            <h3>{label}</h3>
            {team.map((player) => (
              <div key={player.id}>
                <p>{player.name}</p>
                <label>
                  <input
                    type="checkbox"
                    checked={onCourt.some((p) => p.id === player.id)}
                    onChange={() => handleOnCourtToggle(player, label === 'Team 1' ? 'team1' : 'team2')}
                  />
                  On Court
                </label>
                <button onClick={() => handleDrag('2pts', player.id, player.name)}>+2 pts</button>
                <button onClick={() => handleDrag('3pts', player.id, player.name)}>+3 pts</button>
                <button onClick={() => handleDrag('pass', player.id, player.name)}>+Pass</button>
                <button onClick={() => handleDrag('rebound', player.id, player.name)}>+Rebound</button>
              </div>
            ))}
          </div>
        ))}
      </div>
      <button onClick={handleFinishMatch}>Finish Match</button>
    </div>
  );
};

export default MatchPage;
