import { createContext, useState } from "react";

export interface IRenderContext {
    TIMESTAMPS: boolean;
    ORDERS: boolean;
    CLIENTS: boolean;
    GEO_ZONES: boolean;
    ROUTES: boolean;
}


interface IRenderProviderProps {
    children: React.ReactNode;
}

export const RenderContext = createContext<IRenderContext | null>(null);

export const RenderProvider = ({ children }: IRenderProviderProps) => {
    const [timeStamps] = useState<boolean>(false);
    const [orders] = useState<boolean>(false);
    const [clients] = useState<boolean>(true);
    const [geozones] = useState<boolean>(true);
    const [routes] = useState<boolean>(true);


    const contextValues = {
        TIMESTAMPS: timeStamps,
        ORDERS: orders,
        CLIENTS: clients,
        GEO_ZONES: geozones,
        ROUTES: routes,
    };

    return (
        <RenderContext.Provider value={contextValues}>
            {children}
        </RenderContext.Provider>
    );
};
