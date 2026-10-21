import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import sidebarReducer from './slices/sidebarSlice';
import sellersReducer from './slices/sellerObserver/sellersSlice';
import driversReducer from './slices/driverObserver/driversSlice';
import deliveriesReducer from './slices/driverObserver/deliveriesSlice';
import deliveryClientsReducer from './slices/driverObserver/clientsSlice';
import invoicesReducer from './slices/driverObserver/invoicesSlice';
import collectedPaymentsReducer from './slices/driverObserver/collectedPaymentsSlice';
import visitsReducer from './slices/driverObserver/visitsSlice';
import rejectedsReducer from './slices/driverObserver/rejectedsSlice';
import forwardsReducer from './slices/driverObserver/forwardsSlice';
import geoReducer from './slices/sellerObserver/geozonesSlice';
import clientsReducer from './slices/sellerObserver/clientsSlice'
import historyReducer from './slices/sellerObserver/historySlice';
import portfolioReducer from './slices/sellerObserver/portfolioSlice';
import tagsReducer from './slices/sellerObserver/tagsSlice';
import draftsReducer from './slices/planner/draftsSlice';
import statsReducer from './slices/sellerObserver/statsSlice';
import { ClearLocalAuth } from '../services/auth.service';


const appReducer = combineReducers({
    auth: authReducer,
    user: userReducer,
    sidebar: sidebarReducer,
    sellers: sellersReducer,
    drivers: driversReducer,
    deliveries: deliveriesReducer,
    deliveryClients: deliveryClientsReducer,
    invoices: invoicesReducer,
    collectedPayments: collectedPaymentsReducer,
    visits: visitsReducer,
    rejecteds: rejectedsReducer,
    forwards: forwardsReducer,
    geo: geoReducer,
    clients: clientsReducer,
    history: historyReducer,
    portfolio: portfolioReducer,
    tags: tagsReducer,
    drafts: draftsReducer,
    stats: statsReducer,
})

export const resetStrategyState = (strategy: 'planner' | 'sellerObserver' | 'manager' | 'default' | 'driverObserver') => ({
    type: 'CLEAR_STRATEGY_STATE',
    payload: strategy
});

const rootReducer = (state: any, action: any) => {
    if (action.type === 'RESET_STORE') {
        ClearLocalAuth();
        return appReducer(undefined, action);
    }
    
    if (action.type === 'CLEAR_STRATEGY_STATE') {
        const strategy = action.payload;
        let newState = { ...state };
        
        // Purgar slices de sellerObserver si no estamos en sellerObserver (o default)
        if (strategy !== 'sellerObserver' && strategy !== 'default') {
            newState = {
                ...newState,
                sellers: undefined,
                geo: undefined,
                clients: undefined,
                history: undefined,
                portfolio: undefined,
                tags: undefined,
                stats: undefined,
            }
        }
        
        // Purgar sidebar si no estamos ni en sellerObserver ni en driverObserver (ni default)
        if (strategy !== 'sellerObserver' && strategy !== 'driverObserver' && strategy !== 'default') {
            newState = {
                ...newState,
                sidebar: undefined,
            }
        }
        
        // Purgar slices de planner si no estamos en planner
        if (strategy !== 'planner') {
            newState = {
                ...newState,
                drafts: undefined,
            }
        }

        // Purgar slices de driverObserver si no estamos en driverObserver
        if (strategy !== 'driverObserver') {
            newState = {
                ...newState,
                drivers: undefined,
                deliveries: undefined,
                deliveryClients: undefined,
                invoices: undefined,
                collectedPayments: undefined,
                visits: undefined,
                rejecteds: undefined,
                forwards: undefined,
            }
        }
        
        return appReducer(newState, action);
    }
    
    return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;