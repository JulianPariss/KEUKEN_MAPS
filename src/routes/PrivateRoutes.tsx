import { Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import { GetRoutes } from './RoutesList';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { changeEnterprise } from '../store/slices/userSlice';
import { getDefaultEnterprise } from '../services/user.services';
import Spinner from '../components/spinner';
import { useModeRef } from '../utils/hooks/map/useContextRef';
import { getMapModeLayout } from '../pages/home/strategy';

const PrivateRoutes = () => {
    const mode = useModeRef();
    const Layout = getMapModeLayout(mode.mode);
    const { auth } = useAppSelector((state) => state.auth)
    const { isAuthenticated, role } = auth;
    const dispatch = useAppDispatch();
    const location = useLocation();
    const routes = GetRoutes(role);

    const currentRoute = routes.find(route => route.path === location.pathname);
    const showLayout = currentRoute?.withLayout !== false;

    useEffect(() => {
        dispatch(changeEnterprise(getDefaultEnterprise() ?? auth.enterprises[0]))
    }, [dispatch])

    const renderedRoutes = (
        <Suspense fallback={<div className="w-full h-full flex justify-center items-center bg-primary-main"><Spinner /></div>}>
            <Routes>
                {routes.map((route, i) => (
                    <Route
                        key={i}
                        path={route.path}
                        element={<route.page />}

                    />
                ))}
            </Routes>
        </Suspense>
    )

    return (
        <section className="min-h-screen flex flex-col">
            {!isAuthenticated ? (
                <Navigate to='/login' replace />
            ) : (
                <section className="flex-1 flex">
                    {showLayout ? <Layout>{renderedRoutes}</Layout> : renderedRoutes}
                </section>
            )}
        </section>
    );
};

export default PrivateRoutes;