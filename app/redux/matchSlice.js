import { createSlice } from '@reduxjs/toolkit';

const matchSlice = createSlice({
  name: 'match',
  initialState: {
    team1: [],
    team2: [],
    stats: [], // Ajoutez un champ pour stocker les statistiques du match si nécessaire
  },
  reducers: {
    setTeams: (state, action) => {
      state.team1 = action.payload.team1;
      state.team2 = action.payload.team2;
    },
    finishMatch: (state, action) => {
      state.stats = action.payload; // Enregistrez les statistiques de fin de match
    },
  },
});

export const { setTeams, finishMatch } = matchSlice.actions;
export default matchSlice.reducer;
