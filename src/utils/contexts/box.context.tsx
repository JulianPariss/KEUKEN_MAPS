import React from 'react';
import { createContext, useState, type JSX } from 'react';

type BoxComponentProps<T = any> = {
    Component: React.ComponentType<T>;
    props?: T;
} | {
    Component: React.ReactElement,
    props?: T;
    isRequired?: boolean,
};

interface IBoxContext {
    isOpen: boolean;
    OpenBox: (props: BoxComponentProps) => void;
    Component: JSX.Element | null;
    CloseBox: () => void;
    ToggleBox: (props: BoxComponentProps) => void;
    UpdateBox: (node: JSX.Element | null) => void;
}

export const BoxContext = createContext<IBoxContext | undefined>(undefined);

export const BoxProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [Component, setComponent] = useState<JSX.Element | null>(null)

    const OpenBox = (Box: BoxComponentProps) => {
        setIsOpen(true);
        if (React.isValidElement(Box)) {
            setComponent(Box);
        } else {
            const { Component, props } = Box;
            if (typeof Component === 'function') {
                setComponent(<Component {...props} />);
            } else {
                setComponent(Component);
            }
        }
    }

    const CloseBox = () => {
        setIsOpen(false);
    }

    const ToggleBox = (Box: BoxComponentProps) => {
        if(isOpen) CloseBox();
        else OpenBox(Box);
    }

    const UpdateBox = (node: JSX.Element | null) => {
        if(isOpen) setComponent(node);
    };

    const contextValues = {
        isOpen,
        OpenBox,
        Component,
        CloseBox,
        ToggleBox,
        UpdateBox
    };

    return (
        <BoxContext.Provider value={contextValues}>
            {children}
        </BoxContext.Provider>
    );
};