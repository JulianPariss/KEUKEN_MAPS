import moment from "moment";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { useModeRef, useNotifyRef } from "../../../../utils/hooks/map/useContextRef";
import LeftContent from "./components/leftContent";
import { useEffect, useMemo, useState } from "react";
import { fetchProfile } from "../../../../store/slices/userSlice";
import type { TModes } from "../../../../pages/home/strategy";
import { canDo as canDoDraft } from "../../../../utils/permissions/draft.permissions";
import { canDo as canDoSellerObserver } from "../../../../utils/permissions/sellerObserver.permissions";
import { canDo as canDoDriverObserver } from "../../../../utils/permissions/driverObserver.permissions";
import DateSelector from "./components/rightContent/dateSelector";

const NO_ACCESS_TOOLTIP = "Sin acceso a la sección";

type ModeNavItemProps = {
    label: string;
    active: boolean;
    enabled: boolean;
    onClick: () => void;
};

const ModeNavItem = ({ label, active, enabled, onClick }: ModeNavItemProps) => (
    <p
        className={
            enabled
                ? `cursor-pointer text-xs font-medium transition-colors ${active ? "text-focus-300 font-semibold" : "text-main/50 hover:text-main"}`
                : "cursor-not-allowed text-xs font-medium text-main/25 select-none"
        }
        title={enabled ? undefined : NO_ACCESS_TOOLTIP}
        onClick={enabled ? onClick : undefined}
        aria-disabled={!enabled}
    >
        {label}
    </p>
);

const Header = () => {
    const dispatch = useAppDispatch();

    const { enterprise, profile } = useAppSelector((state) => state.user);
    const { date } = useAppSelector((state) => state.sidebar);

    const user = useAppSelector((state) => state.user);
    const { setMode, mode } = useModeRef();
    const { auth } = useAppSelector((state) => state.auth);
    const notify = useNotifyRef();

    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!auth.expiration_date) return;
        const updateCountdown = () => {
            const now = moment();
            const expiration = moment(auth.expiration_date);
            const duration = moment.duration(expiration.diff(now));

            if (duration.asSeconds() <= 0) {
                setTimeLeft('La demo ha expirado');
                return;
            }

            const days = Math.floor(duration.asDays());
            const hours = duration.hours();
            const minutes = duration.minutes();
            const seconds = duration.seconds();

            setTimeLeft(`Quedan: ${days} dias / ${hours}:${minutes}:${seconds}  de Demo`);
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [auth.expiration_date]);

    useEffect(() => {
        if (!(enterprise.enterprise_id === -1)) {
            dispatch(fetchProfile({ e_id: enterprise.enterprise_id }));
        }
    }, [dispatch, enterprise, date]);

    const canViewSellers = canDoSellerObserver(profile.permissions, 'VIEW');
    const canViewDrivers = canDoDriverObserver(profile.permissions, 'VIEW');
    const canViewPlanner = canDoDraft(profile.permissions, 'VIEW');

    const defaultMode: TModes | null = useMemo(() => {
        if (canViewSellers) return 'sellerObserver';
        if (canViewDrivers) return 'driverObserver';
        if (canViewPlanner) return 'planner';
        return null;
    }, [canViewSellers, canViewDrivers, canViewPlanner]);

    const activeMode = mode === 'default' ? defaultMode : mode;

    const isActive = (key: TModes): boolean => {
        return key === activeMode;
    };

    useEffect(() => {
        const isProfileReady =
            enterprise.enterprise_id !== -1 &&
            !profile.loading &&
            (profile.username !== 'Unknow' || profile.error !== null);

        if (!isProfileReady) return;

        if (mode === 'default') {
            if (defaultMode) {
                setMode(defaultMode);
            }
            return;
        }

        if (mode === 'sellerObserver' && !canViewSellers) {
            setMode(defaultMode ?? 'default');
        } else if (mode === 'driverObserver' && !canViewDrivers) {
            setMode(defaultMode ?? 'default');
        } else if (mode === 'planner' && !canViewPlanner) {
            setMode(defaultMode ?? 'default');
        }
    }, [
        mode,
        defaultMode,
        canViewSellers,
        canViewDrivers,
        canViewPlanner,
        enterprise.enterprise_id,
        profile.loading,
        profile.username,
        profile.error,
        setMode,
    ]);

    return (
        <div className="flex flex-col">
            <div className="w-full h-[60px] bg-linear-to-r from-primary-500/95 to-primary-500/90 backdrop-blur-xl border-b border-main/10 shadow-md shadow-black/25 flex justify-between items-center z-1000 relative">
                <LeftContent {...user} />
                <div className="px-2 pr-6 flex items-center gap-x-2">
                    <div className="h-full flex justify-end items-center w-auto">
                        {auth.expiration_date ? (
                            <p className="py-1.5 px-4 bg-focus-500/20 border border-focus-300/30 rounded-dx text-focus-300 text-xs font-medium shadow-inner">
                                {timeLeft}
                            </p>
                        ) : null}
                    </div>
                    {(activeMode === 'sellerObserver' || activeMode === 'driverObserver') && (
                        <DateSelector />
                    )}
                </div>
            </div>
            <div className="w-full h-[40px] bg-linear-to-r from-primary-900/90 to-primary-950/90 backdrop-blur-xl absolute top-[60px] flex justify-between items-center z-998 border-y border-main/10">
                <div className="w-full flex justify-start items-center px-4 gap-x-10">
                    <ModeNavItem
                        label="Vendedores"
                        active={isActive('sellerObserver')}
                        enabled={canViewSellers}
                        onClick={() => {
                            if (!isActive('sellerObserver')) {
                                setMode('sellerObserver');
                                notify('Cambio a Vendedores', 'INFO');
                            }
                        }}
                    />
                    <ModeNavItem
                        label="Conductores"
                        active={isActive('driverObserver')}
                        enabled={canViewDrivers}
                        onClick={() => {
                            if (!isActive('driverObserver')) {
                                setMode('driverObserver');
                                notify('Cambio a Conductores', 'INFO');
                            }
                        }}
                    />
                    <ModeNavItem
                        label="Planificador"
                        active={isActive('planner')}
                        enabled={canViewPlanner}
                        onClick={() => {
                            if (!isActive('planner')) {
                                setMode('planner');
                                notify('Cambio a planificador', 'INFO');
                            }
                        }}
                    />
                </div>
                <div className="w-[400px]" />
            </div>
        </div>
    );
};

export default Header;
