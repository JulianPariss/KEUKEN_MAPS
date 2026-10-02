import { Switch, Label, type SwitchProps } from 'react-aria-components';
import React from 'react';
import { motion } from 'motion/react';

interface IProps extends SwitchProps {
    children?: React.ReactNode;
}

const CustomSwitch = (props: IProps) => {
    const { children, ...rest } = props;

    return (
        <Switch
            {...rest}
            className="group flex items-center justify-between gap-2 cursor-pointer select-none w-full"
        >
            {({ isSelected, isDisabled }) => (
                <>
                    {children && (
                        <Label
                            className={`
                                text-white text-base transition-colors duration-200
                                ${isDisabled ? 'opacity-50' : 'group-hover:text-secondary-light'}
                            `}
                        >
                            {children}
                        </Label>
                    )}
                    <div
                        className={`
                            relative inline-flex h-6 w-11 items-center rounded-full p-0.5
                            transition-colors duration-200
                            ${isSelected ? 'bg-focus' : 'bg-primary-light/50'}
                            ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        <motion.span
                            className="h-5 w-5 rounded-full bg-white shadow-md"
                            layout
                            transition={{ type: "spring", stiffness: 700, damping: 30 }}
                            initial={false} // Prevent initial animation on mount
                            animate={{ x: isSelected ? "100%" : "0%" }}
                        />
                    </div>
                </>
            )}
        </Switch>
    );
};

export default CustomSwitch;