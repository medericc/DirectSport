"use client";
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { finishMatch } from '../redux/matchSlice';
import useSocket from '../lib/useSocket';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
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
  const [stats, setStats] = useState<StatAction[]>([]);
  const [onCourtTeam1, setOnCourtTeam1] = useState<Player[]>([]);
  const [onCourtTeam2, setOnCourtTeam2] = useState<Player[]>([]);
  const [actions] = useState(['2pts', '3pts', 'Pass', 'Rebound']);

  // Récupérez les équipes depuis le store Redux
  const team1 = useSelector((state: RootState) => state.match.team1 as Player[]);
  const team2 = useSelector((state: RootState) => state.match.team2 as Player[]);
  
  const socket = useSocket('liveStats', (newStats: StatAction) => {
    setStats((prevStats) => [...prevStats, newStats]);
    console.log('Stats received via socket:', newStats);
  });
  
  useEffect(() => {
    if (isMatchStarted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1000 : 0));
      }, 1000);

      if (timeLeft === 0 && currentQuarter < 4) {
        setCurrentQuarter(currentQuarter + 1);
        setTimeLeft(initialQuarterTime);
      }

      return () => clearInterval(timer);
    }
  }, [timeLeft, currentQuarter, isMatchStarted]);

  const handleOnCourtToggle = (player: Player, team: 'team1' | 'team2') => {
    const onCourt = team === 'team1' ? onCourtTeam1 : onCourtTeam2;
    const setOnCourt = team === 'team1' ? setOnCourtTeam1 : setOnCourtTeam2;

    if (onCourt.some((p) => p.id === player.id)) {
      setOnCourt(onCourt.filter((p) => p.id !== player.id));
    } else if (onCourt.length < 5) {
      setOnCourt([...onCourt, player]);
    }

    // Vérifiez si les deux équipes ont 5 joueurs sur le terrain pour démarrer le match
    if (onCourtTeam1.length === 5 && onCourtTeam2.length === 5) {
      setIsMatchStarted(true);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    // Logique de mise à jour en cas de glisser-déposer
  };

  const handleFinishMatch = () => {
    dispatch(finishMatch(stats));
    alert('Match finished and stats saved!');
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div>
        <h2>Match in Progress</h2>
        <h3>Quarter: {currentQuarter} / Time Left: {Math.floor(timeLeft / 60000)}:{(timeLeft % 60000) / 1000 < 10 ? '0' : ''}{Math.floor((timeLeft % 60000) / 1000)}</h3>

        <Droppable droppableId="actions" direction="horizontal" isDropDisabled={false}>
  {(provided) => (
    <div ref={provided.innerRef} {...provided.droppableProps} className="actions">
      {actions.map((action, index) => (
        <Draggable key={action} draggableId={action} index={index}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="action-item"
            >
              {action}
            </div>
          )}
        </Draggable>
      ))}
      {provided.placeholder}
    </div>
  )}
</Droppable>


        <div className="teams">
          {[{ team: team1, label: 'Team 1', onCourt: onCourtTeam1 }, { team: team2, label: 'Team 2', onCourt: onCourtTeam2 }]
            .map(({ team, label, onCourt }, index) => (
            <div key={index}>
              <h3>{label}</h3>
              {team.map((player) => (
                <Droppable key={player.id} droppableId={`player-${player.id}`}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="player-item">
                      <p>{player.name}</p>
                      <label>
                        <input
                          type="checkbox"
                          checked={onCourt.some((p) => p.id === player.id)}
                          onChange={() => handleOnCourtToggle(player, label === 'Team 1' ? 'team1' : 'team2')}
                        />
                        On Court
                      </label>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          ))}
        </div>

        <button onClick={handleFinishMatch}>Finish Match</button>
      </div>
    </DragDropContext>
  );
};

export default MatchPage;
