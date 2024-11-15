"use client";
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { addPlayerStat } from '../redux/matchSlice';
import useSocket from '../lib/useSocket';

interface StatAction {
  playerId: number;
  playerName: string;
  statType: string;
  minute: number;
  quarter: number;
}

const LiveStats = () => {
  const dispatch = useDispatch();

  // Récupération des stats depuis Redux avec typage explicite
  const statsFromRedux = useSelector((state: RootState) => state.match.stats as StatAction[]);

  // Hook WebSocket pour recevoir les nouvelles stats en temps réel
  useSocket('liveStats', (newStat: StatAction) => {
    dispatch(addPlayerStat(newStat)); // Ajout des stats reçues dans Redux
  });

  useEffect(() => {
    console.log('Stats actuelles depuis Redux:', statsFromRedux);
  }, [statsFromRedux]);

  if (statsFromRedux.length === 0) return <p>Aucune action enregistrée pour le moment.</p>;

  return (
    <div>
      <h2>Stats en temps réel</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {statsFromRedux.map((stat, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '10px',
              minWidth: '150px',
              textAlign: 'center',
              backgroundColor: '#f9f9f9',
            }}
          >
            <p style={{ fontWeight: 'bold' }}>Joueur : {stat.playerName}</p>
            <p>Action : {stat.statType}</p>
            <p>Minute : {stat.minute}m</p>
            <p>Quart-temps : {stat.quarter}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveStats;
