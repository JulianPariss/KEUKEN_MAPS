import { Button, ListBox, ListBoxItem, Popover, Select, SelectValue, type Key } from 'react-aria-components';
import { ArrowIcon, CrossIcon } from '@repo/icons';
import { motion } from 'motion/react';
import type { ISelectOption } from '../../utils/types/general.types';

interface SelectInputProps {
    value: Key | null;
    onChange: (val: Key | null) => void;
    options: ISelectOption[];
    placeholder?: string;
    className?: string;
    variant?: 'input' | 'popover';
    disablePopover?: boolean;
}

const SelectInput = ({
    value,
    onChange,
    options,
    placeholder = 'Todos',
    className = '',
    variant = 'input',
    disablePopover = false,
}: SelectInputProps) => {
    const isInput = variant === 'input';

    return (
        <Select
            selectedKey={value}
            onSelectionChange={onChange}
            className={`w-full ${className}`}
            placeholder={placeholder}
            isDisabled={disablePopover}
        >
            {({ isOpen }) => (
                <div className="relative w-full">
                    <Button
                        onKeyDown={(e) => e.stopPropagation()}
                        className={`
                            w-full flex items-center justify-between gap-2 bg-transparent 
                            transition-all duration-300 ease-in-out group min-h-[25px] outline-none disabled:opacity-100 disabled:cursor-default
                            ${isInput
                                ? "border-b border-white/10 focus:border-primary-light pb-1 text-xs font-normal text-white"
                                : "px-2 py-1.5 rounded-md hover:bg-white/5 hover:bg-white/10 text-[11px] font-bold text-focus uppercase tracking-tight transition-colors border border-white/5"
                            }
                        `}
                    >
                        <SelectValue className={`truncate text-left flex-1 ${isInput ? "data-[placeholder]:text-white/20" : "data-[placeholder]:text-white/40"}`} />

                        {!disablePopover && (
                            <div className="flex items-center gap-1 shrink-0">
                                {value && isInput && (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onChange(null);
                                        }}
                                        className="p-0.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                                        aria-label="Limpiar selección"
                                    >
                                        <CrossIcon className="size-2 fill-white/40 hover:fill-white transition-colors" />
                                    </div>
                                )}

                                <div className="flex items-center">
                                    <ArrowIcon className={`
                                        transition-all duration-300 transform ${isOpen ? "rotate-180" : "rotate-0"}
                                        ${isInput
                                            ? "size-3 fill-white/40 group-focus-within:fill-primary-light"
                                            : "size-2.5 fill-focus/60 group-hover:fill-focus"
                                        }
                                    `} />
                                </div>
                            </div>
                        )}
                    </Button>

                    <Popover
                        placement="bottom start"
                        className="w-[var(--trigger-width)] bg-primary-dark/75 backdrop-blur-xl border border-white/10 rounded-md shadow-2xl shadow-black/50 overflow-hidden !z-[99999999]"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                        >
                            <ListBox
                                items={options}
                                className="p-1 outline-none text-xs max-h-60 overflow-y-auto sleek-scrollbar"
                            >
                                {(item) => (
                                    <ListBoxItem
                                        id={item.id}
                                        textValue={item.label}
                                        className="px-3 py-2 rounded-sm text-white/80 cursor-pointer transition-all outline-none
                                        hover:bg-primary-light/20 hover:text-white
                                        focus:bg-primary-light/30 focus:text-white
                                        data-[selected=true]:bg-primary-light/40 data-[selected=true]:text-white data-[selected=true]:font-medium
                                        flex items-center justify-between"
                                    >
                                        <span className="truncate" title={item.label}>{item.label}</span>
                                    </ListBoxItem>
                                )}
                            </ListBox>
                        </motion.div>
                    </Popover>
                </div>
            )}
        </Select>
    );
};

export default SelectInput;

