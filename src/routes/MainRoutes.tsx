import { useEffect, useMemo } from 'react';
import PrivateRoutes from './PrivateRoutes';
import PublicRoutes from './PublicRoutes';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { GetLocalAuth } from '../services/auth.service';
import { useAppDispatch } from '../store/hooks';
import { preLogin } from '../store/slices/authSlice';
import { useModeRef } from '../utils/hooks/map/useContextRef';
import { getMapModeProviders } from '../pages/home/strategy';
import { ModeProvider } from '../utils/contexts/mode.context';
import { ViewProvider } from '../utils/contexts/view.context';
import { MapCoreProvider, MapTimeProvider } from '@repo/map-core';

const ModeSwitcher = () => {
    const { mode } = useModeRef();
    const CurrentProvider = getMapModeProviders(mode);

    return (
        <CurrentProvider key={mode}>
            <PrivateRoutes />
        </CurrentProvider>
    );
};

export const MainRoutes = () => {
    const { auth } = useSelector((state: RootState) => state.auth);
    const dispatch = useAppDispatch();
    const { isAuthenticated } = auth;

    useEffect(() => {
        dispatch(preLogin(GetLocalAuth()));
    }, [dispatch]);

    const isAuth = useMemo(() => {
        return !!isAuthenticated;
    }, [isAuthenticated]);

    return isAuth ? (
        <MapCoreProvider config={{}}>
            <MapTimeProvider>
                <ModeProvider>
                    <ViewProvider>
                        <ModeSwitcher />
                    </ViewProvider>
                </ModeProvider>
            </MapTimeProvider>
        </MapCoreProvider>
    ) : (
        <PublicRoutes />
    );
};

