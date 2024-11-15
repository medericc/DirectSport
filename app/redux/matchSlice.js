import { createSlice } from '@reduxjs/toolkit';

// État initial
const initialState = {
  team1: [], // Liste des joueurs de l'équipe 1
  team2: [], // Liste des joueurs de l'équipe 2
  stats: [], // Liste des statistiques des joueurs
};

// Création du slice Redux
const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    // Action pour définir les équipes
    setTeams: (state, action) => {
      state.team1 = action.payload.team1;
      state.team2 = action.payload.team2;
    },
    // Action pour ajouter une statistique pour un joueur
    addPlayerStat: (state, action) => {
      state.stats.push(action.payload);
    },
    // Action pour enregistrer ou réinitialiser toutes les statistiques à la fin du match
    finishMatch: (state, action) => {
      state.stats = action.payload;
    },
  },
});

// Export des actions et du reducer
export const { setTeams, addPlayerStat, finishMatch } = matchSlice.actions;
export default matchSlice.reducer;
