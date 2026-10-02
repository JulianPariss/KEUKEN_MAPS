import React from 'react';
import { createContext, useState, useEffect, type JSX } from 'react';

type ModalComponentProps<T = any> = {
    Component: React.ComponentType<T>;
    props?: T;
} | { 
    Component: React.ReactElement,
    props?: T;
    isRequired: boolean,
};

interface IModalContext {
    isOpen: boolean;
    OpenModal: (props: ModalComponentProps) => void;
    Component: JSX.Element | null;
    CloseModal: () => void;
    isRequired: boolean;
}

export const ModalContext = createContext<IModalContext | undefined>(undefined);


export const ModalProvider = ({ children }: { children: React.ReactNode }) =>  {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [Component, setComponent] = useState<JSX.Element |  null>(null)
    const [isRequired, setIsRequired] = useState<boolean>(false);

    const OpenModal = (modal: ModalComponentProps) => {
        setIsOpen(true);
        setIsRequired(isRequired ?? false);
        if (React.isValidElement(modal)) {
            setComponent(modal);
        } else {
            const { Component, props } = modal;
            if (typeof Component === 'function') {
                setComponent(<Component {...props} />);
            } else {
                setComponent(Component);
            }
        }
    }

    const CloseModal = () => {
        setIsOpen(false);
        setComponent(null);
    }

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen && !isRequired) {
                CloseModal();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isRequired]);

    const contextValues = {
        isOpen,
        OpenModal,
        Component,
        CloseModal,
        isRequired,
    };

    return (
        <ModalContext.Provider value={contextValues}>
            {children}
        </ModalContext.Provider>
    );
};