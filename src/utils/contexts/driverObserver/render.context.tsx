import { createContext, useState } from "react";

export interface IRenderContext {
    TIMESTAMPS: boolean;
    ROUTES: boolean;
}


interface IRenderProviderProps {
    children: React.ReactNode;
}

export const RenderContext = createContext<IRenderContext | null>(null);

export const RenderProvider = ({ children }: IRenderProviderProps) => {
    const [timeStamps] = useState<boolean>(false);
    const [routes] = useState<boolean>(true);


    const contextValues = {
        TIMESTAMPS: timeStamps,
        ROUTES: routes,
    };

    return (
        <RenderContext.Provider value={contextValues}>
            {children}
        </RenderContext.Provider>
    );
};
