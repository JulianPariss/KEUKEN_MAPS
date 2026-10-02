import React from 'react';
import { createContext, useState, type JSX } from 'react';

type MenuComponentProps<T = any> = {
    Component: React.ComponentType<T>;
    props?: T;
} | {
    Component: React.ReactElement,
    props?: T;
    isRequired?: boolean,
};

interface IMenuContext {
    isOpen: boolean;
    OpenMenu: (props: MenuComponentProps) => void;
    Component: JSX.Element | null;
    CloseMenu: () => void;
}

export const MenuContext = createContext<IMenuContext | undefined>(undefined);

export const MenuProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [Component, setComponent] = useState<JSX.Element | null>(null)

    const OpenMenu = (Menu: MenuComponentProps) => {
        
        setIsOpen(true);
        if (React.isValidElement(Menu)) {
            setComponent(Menu);
        } else {
            const { Component, props } = Menu;
            if (typeof Component === 'function') {
                setComponent(<Component {...props} />);
            } else {
                setComponent(Component);
            }
        }
    }

    const CloseMenu = () => {
        setIsOpen(false);
    }

    const contextValues = {
        isOpen,
        OpenMenu,
        Component,
        CloseMenu,
    };

    return (
        <MenuContext.Provider value={contextValues}>
            {children}
        </MenuContext.Provider>
    );
};