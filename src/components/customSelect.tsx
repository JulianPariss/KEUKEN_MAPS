import {
    ListBox, ListBoxItem, Button, Label, Popover, Select, SelectValue
} from "react-aria-components"
import { motion } from "motion/react";
import { ArrowIcon, LoadingIcon } from '@repo/icons';
import type { ISelectOption, TPlacement } from "../utils/types/general.types";
import { useEffect, useState } from "react";

interface IProps {
    title?: string;
    options: ISelectOption[];
    handleChange: (value: any[] | any) => void;
    placeholder?: string;
    value: any;
    placement?: TPlacement;
    className?: string;
    disabled?: boolean;
    isLoadingList?: boolean;
}

const CustomSelect = (props: IProps) => {
    const { title, options, handleChange, placeholder = 'Seleccione una opcion', value, placement = "bottom", className = '', disabled = false, isLoadingList = false } = props;

    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        if (isLoadingList) {
            const timer = setTimeout(() => {
                setShowLoader(true);
            }, 200);

            return () => clearTimeout(timer);
        } else {
            setShowLoader(false);
        }
    }, [isLoadingList]);

    return (
        <Select
            value={value}
            placeholder={placeholder}
            selectionMode="single"
            isDisabled={disabled}
            onChange={(e) => handleChange(e)}
            className="w-full"
        >
            {(state) => (
                <div className="flex flex-col justify-center items-start w-full">
                    {title && (
                        <Label className={`text-xs font-semibold text-main mb-1 ${disabled ? "opacity-40" : ""}`}>
                            {title}
                        </Label>
                    )}

                    <Button
                        isDisabled={disabled}
                        className={`
                        w-full outline-none flex justify-between items-center gap-3 text-main text-sm
                        px-3 py-1 min-h-[28px] cursor-pointer transition-colors select-none ${className}
                        ${disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}
                    `}
                    >
                        <SelectValue
                            className={`
                            flex-1 min-w-0 text-left truncate text-sm
                            data-[placeholder]:text-main/40
                            ${disabled ? "text-main/40" : "text-main"}
                        `}
                        />

                        <motion.div
                            className="shrink-0 flex items-center justify-center"
                            animate={{ rotate: state.isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {showLoader ?
                                <LoadingIcon className="animate-[spin_1s_linear_reverse_infinite] size-4.5 fill-main" />
                                :
                                <ArrowIcon className={`size-4 ${disabled ? "fill-main/40" : "fill-main"}`} />
                            }
                        </motion.div>
                    </Button>

                    {!disabled && (
                        <Popover
                            placement={placement}
                            shouldFlip={false}
                            className="mt-1.5 !z-[9999999999]"
                            style={{ width: "var(--trigger-width)" }}
                        >
                            <motion.div
                                className="bg-primary-950/95 backdrop-blur-xl border border-main/10 p-1.5 rounded-dx shadow-xl overflow-y-auto"
                                initial={{ opacity: 0, height: 0, y: 4 }}
                                animate={{ opacity: 1, height: 200, y: 0 }}
                                exit={{ opacity: 0, height: 0, y: 4 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                                <ListBox items={options} className='text-main outline-none w-full'>
                                    {(item) => (
                                        <ListBoxItem
                                            key={item.key}
                                            id={item.key}
                                            textValue={item.label}
                                            className='my-1 outline-none py-2 px-3 rounded-dx bg-primary-900/60 text-main text-sm cursor-pointer transition-colors
                                            data-[hovered]:bg-primary-500/30 data-[hovered]:text-focus-300
                                            data-[selected=true]:bg-focus-500 data-[selected=true]:text-variant data-[selected=true]:font-medium'
                                        >
                                            <p className="capitalize truncate">{item.label.toLowerCase()}</p>
                                        </ListBoxItem>
                                    )}
                                </ListBox>
                            </motion.div>
                        </Popover>
                    )}
                </div>
            )}
        </Select>
    );

};

export default CustomSelect;

