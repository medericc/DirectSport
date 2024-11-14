// app/components/LiveStats.tsx
"use client";
import React, { useState } from 'react';
import useSocket from '../lib/useSocket';

// Définition du type pour les actions de statistiques
interface StatAction {
  playerId: number;
  playerName: string;
  statType: string;
  minute: number;
  quarter: number;
}

const LiveStats = () => {
  const [stats, setStats] = useState<StatAction[]>([]);

  // Utilisation du hook pour écouter les événements en temps réel
  useSocket('liveStats', (newStat: StatAction) => {
    setStats((prevStats) => [...prevStats, newStat]); // Ajoute la nouvelle action aux stats existantes
  });

  if (stats.length === 0) return <p>Loading stats...</p>;

  return (
    <div>
      <h2>Stats en temps réel</h2>
      <ul>
        {stats.map((stat, index) => (
          <li key={index}>
            <p>Joueur: {stat.playerName}</p>
            <p>Minute: {stat.minute}</p>
            <p>Quart-temps: {stat.quarter}</p>
            <p>Action: {stat.statType}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LiveStats;
