import { createContext, useState, type ReactNode } from 'react';


type TViewKey = 'sellers' | 'clients' | 'drivers' | null;

interface IListViewContext {
    content: ReactNode | null;
    viewKey: TViewKey;
    setViewContent: (component: ReactNode, key?: TViewKey) => void;
}

export const ListViewContext = createContext<IListViewContext | undefined>(undefined);

export const ListViewProvider = ({ children }: { children: ReactNode }) => {
    const [content, setContent] = useState<ReactNode | null>(null);
    const [viewKey, setViewKey] = useState<TViewKey>(null);

    const setViewContent = (component: ReactNode, key?: TViewKey) => {
        setContent(component);
        setViewKey(key ?? null);
    };


    return (
        <ListViewContext.Provider value={{ content, viewKey, setViewContent }}>
            {children}
        </ListViewContext.Provider>
    );
};
