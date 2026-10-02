import { Button, Checkbox, CheckboxGroup, DialogTrigger, Popover, Label } from 'react-aria-components';
import { ArrowIcon, CrossIcon, TrashcanIcon } from '@repo/icons';
import { motion } from 'motion/react';
import type { ISelectOption } from '../../utils/types/general.types';
import { useState } from 'react';

interface CheckboxInputProps {
    value: string[];
    onChange: (values: string[]) => void;
    options: ISelectOption[];
    placeholder?: string;
    className?: string;
    variant?: 'input' | 'popover';
}

const CheckboxInput = ({
    value,
    onChange,
    options,
    placeholder = 'Todos',
    className = '',
    variant = 'input'
}: CheckboxInputProps) => {
    const isInput = variant === 'input';
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Texto de visualización basado en la selección
    const displayValue = value.length > 0
        ? `${placeholder}: (${value.length})`
        : placeholder;

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <div className={`relative w-full ${className}`}>
                <Button
                    onKeyDown={(e) => e.stopPropagation()}
                    className={`
                        w-full flex items-center justify-between gap-2 bg-transparent 
                        transition-all duration-300 ease-in-out group min-h-[25px] outline-none
                        ${isInput
                            ? "border-b border-white/10 focus:border-primary-light pb-1 text-xs font-normal text-white"
                            : "px-2 py-1.5 rounded-md hover:bg-white/5 hover:bg-white/10 text-[11px] font-bold text-focus uppercase tracking-tight transition-colors border border-white/5"
                        }
                    `}
                >
                    <span className={`truncate text-left flex-1 ${isInput ? (value.length > 0 ? "text-white" : "text-white/20") : (value.length > 0 ? "text-focus" : "text-white/40")}`}>
                        {displayValue}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                        {value.length > 0 && isInput && (
                            <div
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange([]);
                                }}
                                className="p-0.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                                aria-label="Limpiar selección"
                            >
                                <CrossIcon className="size-2 fill-white/40 hover:fill-white transition-colors" />
                            </div>
                        )}

                        <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center"
                        >
                            <ArrowIcon className={`
                                transition-colors duration-300 
                                ${isInput
                                    ? "size-3 fill-white/40 group-focus-within:fill-primary-light"
                                    : "size-2.5 fill-focus/60 group-hover:fill-focus"
                                }
                            `} />
                        </motion.div>
                    </div>
                </Button>

                <Popover
                    placement="bottom start"
                    onOpenChange={(open) => !open && setSearchQuery('')}
                    className="w-[var(--trigger-width)] bg-primary-dark/75 backdrop-blur-xl border border-white/10 rounded-md shadow-2xl shadow-black/50 overflow-hidden !z-[99999999]"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="flex flex-col"
                    >
                        {/* Buscador interno */}
                        <div className="p-2 border-b border-white/5 flex items-center gap-2">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Filtrar opciones..."
                                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-primary-light transition-colors placeholder:text-white/20"
                                autoFocus
                            />
                            {value.length > 0 && (
                                <button
                                    onClick={() => onChange([])}
                                    className="text-[10px] text-primary-light hover:text-white transition-colors font-bold uppercase whitespace-nowrap"
                                >
                                    <TrashcanIcon className='size-4 stroke-white' />
                                </button>
                            )}
                        </div>

                        <CheckboxGroup
                            value={value}
                            onChange={onChange}
                            className="p-1 flex flex-col gap-1 outline-none"
                        >
                            <Label className="sr-only">{placeholder}</Label>
                            <div className="max-h-60 overflow-y-auto sleek-scrollbar flex flex-col gap-0.5">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((option) => (
                                        <Checkbox
                                            key={option.id}
                                            value={String(option.id)}
                                            className="
                                                group px-2.5 py-1.5 rounded-sm cursor-pointer transition-all outline-none
                                                hover:bg-primary-light/20 focus-visible:bg-primary-light/30
                                                data-[selected]:bg-primary-light/10
                                                flex items-center gap-2.5 text-[11px] text-white/80 data-[selected]:text-white
                                            "
                                        >
                                            {({ isSelected }) => (
                                                <>
                                                    <div className={`
                                                        size-3 rounded-sm border flex items-center justify-center transition-all
                                                        ${isSelected
                                                            ? "bg-primary-light border-primary-light"
                                                            : "border-white/20 group-hover:border-white/40"}
                                                    `}>
                                                        {isSelected && (
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                className="size-1.5 bg-white rounded-[1px]"
                                                            />
                                                        )}
                                                    </div>
                                                    <span className="truncate" title={option.label}>{option.label}</span>
                                                </>
                                            )}
                                        </Checkbox>
                                    ))
                                ) : (
                                    <div className="px-3 py-4 text-center text-white/20 text-[10px] italic">
                                        No se encontraron resultados
                                    </div>
                                )}
                            </div>
                        </CheckboxGroup>
                    </motion.div>
                </Popover>
            </div>
        </DialogTrigger>
    );
};

export default CheckboxInput;

