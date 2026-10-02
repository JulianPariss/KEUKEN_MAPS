import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '..';


export const selectWatchList = (state: RootState) => state.drivers.watchList;


export const isFocussed = (id: number)  => 
    createSelector([selectWatchList], (watchList) : boolean =>
        watchList.length === 1 && watchList.includes(id)
);

export const isSomeFocussed = () => 
    createSelector([selectWatchList], (watchList) :boolean => 
        watchList.length === 1      
);

