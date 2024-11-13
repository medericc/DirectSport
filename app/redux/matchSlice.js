// redux/matchSlice.js
import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const matchSlice = createSlice({
  name: 'match',
  initialState: [],
  reducers: {
    finishMatch: (state, action) => {
      axios.post('/api/saveMatchStats', { stats: action.payload })
        .then((response) => console.log('Stats enregistrées:', response))
        .catch((error) => console.error('Erreur d\'enregistrement:', error));
    }
  }
});

export const { finishMatch } = matchSlice.actions;
export default matchSlice.reducer;
