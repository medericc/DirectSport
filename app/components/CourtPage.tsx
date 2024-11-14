"use client";
import React, { useState} from 'react';
import useSocket from '../lib/useSocket';

interface Player {
  id: number;
  name: string;
}

const CourtPage: React.FC = () => {
  const [onCourtTeam1, setOnCourtTeam1] = useState<Player[]>([]);
  const [onCourtTeam2, setOnCourtTeam2] = useState<Player[]>([]);

  useSocket('updateOnCourt', ({ team1, team2 }: { team1: Player[]; team2: Player[] }) => {
    setOnCourtTeam1(team1);
    setOnCourtTeam2(team2);
  });

  return (
    <div>
      <h2>On Court</h2>
      <div>
        <h3>Team 1</h3>
        {onCourtTeam1.map((player) => (
          <p key={player.id}>{player.name}</p>
        ))}
      </div>
      <div>
        <h3>Team 2</h3>
        {onCourtTeam2.map((player) => (
          <p key={player.id}>{player.name}</p>
        ))}
      </div>
    </div>
  );
};

export default CourtPage;
