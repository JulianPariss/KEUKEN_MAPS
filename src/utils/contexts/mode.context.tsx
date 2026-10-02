import { createContext, useEffect, useState } from "react";
import type { TModes } from "../../pages/home/strategy";
import { cancelAllRequests } from "../../services";
import { useAppDispatch } from "../../store/hooks";
import { resetStrategyState } from "../../store";


interface IModeContext {
    mode: TModes;
    setMode: (value: TModes) => void;
    mapInteractions: boolean;
    setMapInteractions: (value: boolean) => void;
}

interface IModeProviderProps {
    children: React.ReactNode;
}

export const ModeContext = createContext<IModeContext>({
    mode: "default" as TModes,
    setMode: (_: TModes) => { },
    mapInteractions: true,
    setMapInteractions: (_:boolean) => { },
});

export const ModeProvider = ({ children }: IModeProviderProps) => {
    const [mode, setMode] = useState<TModes>('default');
    const [mapInteractions, setMapInteractions] = useState<boolean>(true);
    const dispatch = useAppDispatch();

    const contextValues = {
        mode,
        setMode,
        mapInteractions,
        setMapInteractions,
    };

    useEffect(() => {
        cancelAllRequests();
        setMapInteractions(true);
        dispatch(resetStrategyState(mode));
    }, [mode, dispatch])

    return (
        <ModeContext.Provider value={contextValues}>
            {children}
        </ModeContext.Provider>
    );
};
