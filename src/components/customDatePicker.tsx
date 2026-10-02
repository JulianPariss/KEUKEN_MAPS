import { Button, Calendar, CalendarCell, CalendarGrid, DateInput, DatePicker, DateSegment, Dialog, Group, Heading, Label, Popover, type DateValue } from 'react-aria-components';
import { CalendarDate, getLocalTimeZone, parseDate, today } from "@internationalized/date";
import { ArrowIcon } from '@repo/icons';
import { useState } from 'react';
import moment from 'moment';
import { CalendarStyles, type TCalendarVariants } from './styles';
import { motion } from 'motion/react';
import type { TPlacement } from "../utils/types/general.types";

interface IProps {
    title?: string | null;
    minValue?: any;
    maxValue?: any;
    handleChange: (value: CalendarDate | null) => void;
    isInvalid?: boolean;
    variant?: TCalendarVariants;
    value?: any;
    showDate?: boolean;
    triggerIcon?: React.ReactNode;
    isDisabled?: boolean;
    placement?: TPlacement;
    className?: string;
}

const CustomDatePicker = (props: IProps) => {
    const { title = null, minValue, handleChange, isInvalid = false, variant = 'form', maxValue, value = null, triggerIcon, isDisabled = false, placement = "bottom start", className = '' } = props;

    // Default showDate to true for compact/header, otherwise let prop override or default to false
    const showDate = props.showDate !== undefined ? props.showDate : (variant === 'compact' || variant === 'header');

    const [isOpen, setISisOpen] = useState<boolean>(false);


    const pickerProps = value
        ? { value: value as DateValue, onChange: (v: any) => handleChange(v as CalendarDate | null) }
        : { defaultValue: parseDate(moment().format("YYYY-MM-DD")) as unknown as DateValue, onChange: (v: any) => handleChange(v as CalendarDate | null) };

    return (
        <DatePicker
            {...pickerProps}
            isOpen={isOpen}
            onOpenChange={setISisOpen}
            className='w-full'
            minValue={minValue as DateValue | null | undefined}
            maxValue={maxValue as DateValue | null | undefined}
            isInvalid={isInvalid}
            defaultValue={parseDate(moment().format('YYYY-MM-DD')) as unknown as DateValue}
        >
            <div className="flex flex-col justify-center items-center w-full group" data-disabled={isDisabled}>
                <Label className={`text-main font-bold text-lg ${isDisabled ? "opacity-40" : ""}`}>{title}</Label>

                <Group className={`${CalendarStyles(variant).group} ${className}`} isDisabled={isDisabled}>
                    {showDate && (
                        <DateInput className={CalendarStyles(variant).input}>
                            {(segment) => (
                                <DateSegment className='focus:outline-1 outline-focus-300 rounded-dx p-1 text-main' segment={segment} />
                            )}
                        </DateInput>
                    )}
                    <Button isDisabled={isDisabled} className={CalendarStyles(variant).button}>
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            {triggerIcon || <ArrowIcon className={`size-4 ${isDisabled ? "fill-main/40" : "fill-main"}`} />}
                        </motion.div>
                    </Button>
                </Group>

                <Popover
                    placement={placement}
                    style={{ width: "var(--trigger-width)", minWidth: "300px" }}
                    className='!z-99999999'
                >
                    <motion.div
                        className={CalendarStyles(variant).popover}
                        initial={{ opacity: 0, scale: 0.95, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 4 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        <Dialog>
                            <Calendar className='w-full'>
                                <header className='flex justify-between items-center mb-3'>
                                    <Button
                                        slot="previous"
                                        className={`
                                            cursor-pointer
                                            p-1
                                            rounded-dx
                                            hover:bg-primary-500/20
                                            transition-opacity
                                            data-[disabled]:opacity-30
                                            data-[disabled]:cursor-not-allowed
                                        `}
                                    >
                                        <ArrowIcon className='size-4 fill-main rotate-90 data-[disabled]:fill-main/30' />
                                    </Button>
                                    <Heading className='capitalize text-main font-semibold text-sm' />
                                    <Button
                                        slot="next"
                                        className={`
                                            cursor-pointer
                                            p-1
                                            rounded-dx
                                            hover:bg-primary-500/20
                                            transition-opacity
                                            data-[disabled]:opacity-30
                                            data-[disabled]:cursor-not-allowed
                                        `}
                                    >
                                        <ArrowIcon className='size-4 fill-main -rotate-90 data-[disabled]:fill-main/30' />
                                    </Button>
                                </header>
                                <CalendarGrid className="w-full text-main">
                                    {(date) => (
                                        <CalendarCell
                                            className={CalendarStyles(variant).cell}
                                            date={date}
                                        />
                                    )}
                                </CalendarGrid>
                            </Calendar>
                        </Dialog>

                        <footer className="w-full flex justify-start mt-2 pt-2 border-t border-main/10">
                            <Button
                                onPress={() => {
                                    const t = today(getLocalTimeZone());
                                    handleChange(t);
                                    setISisOpen(false);
                                }}
                                className="
                                    px-3 py-1
                                    shadow-sm
                                    shadow-black/15
                                    rounded-dx
                                    text-variant text-xs font-medium
                                    bg-focus-500
                                    active:bg-focus-500/80
                                    active:shadow-none
                                    active:inset-shadow-xsl
                                    transition-all
                                    cursor-pointer
                                "
                            >
                                Hoy
                            </Button>
                        </footer>
                    </motion.div>
                </Popover>
            </div>
        </DatePicker>
    );
};

export default CustomDatePicker;
