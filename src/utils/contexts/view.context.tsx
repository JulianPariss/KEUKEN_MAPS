import { createContext, useState } from "react";
import type { TViews } from "../../pages/home/strategy";

interface IViewContext {
    view: TViews;
    setView: (value: TViews) => void;
    changeView: (view?: TViews) => void;
}

interface IViewProviderProps {
    children: React.ReactNode;
}

export const ViewContext = createContext<IViewContext>({
    view: "default" as TViews,
    setView: (_: TViews) => { },
    changeView: (_?: TViews) => { },
});

export const ViewProvider = ({ children }: IViewProviderProps) => {
    const [view, setView] = useState<TViews>('default');

    const changeView = (requestedView?: TViews | React.MouseEvent) => {
        if (typeof requestedView === 'string') {
            setView(requestedView);
            return;
        }

        if (view === 'listView') {
            setView('mapView');
        } else {
            setView('listView');
        }
    };

    const contextValues = {
        view,
        setView,
        changeView,
    };

    return (
        <ViewContext.Provider value={contextValues}>
            {children}
        </ViewContext.Provider>
    );
};
