import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import moment from 'moment';
import type { ISidebarState } from '../../utils/types/sidebar.types';

const initialState: ISidebarState = {
    date: moment().toString(),
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    changeDate(state, action: PayloadAction<string>) {  
      state.date = action.payload;
    },
  },
});

export const { changeDate } = sidebarSlice.actions;
export default sidebarSlice.reducer;
