import type { TMessageVariant } from "./message";

const ModalStyles = {
    cross: `
        size-fit 
        m-3 
        bg-primary-500/20 
        hover:bg-primary-500/40 
        active:bg-focus-500/30 
        rounded-full 
        absolute 
        right-[-10px] 
        top-[-10px] 
        text-main 
        text-xs 
        flex 
        justify-center 
        items-center 
        cursor-pointer 
        transition-colors
    `,
    card: `
        w-fit 
        h-fit 
        rounded-dx 
        bg-primary-950/45
        backdrop-blur-xl 
        px-5
        py-4
        xl:px-5 
        xl:pt-8 
        relative 
        shadow-2xl 
        shadow-black/80 
        z-9999999 
        border 
        border-main/10
        text-main
    `,
};


const MessageStyles = {
    variant: (type: TMessageVariant) => (
        `
        fixed 
        bottom-[20px] 
        left-[20px] 
        p-3 
        rounded-md 
        shadow-md 
        shadow-black/15 
        z-99999999
        border-1
        text-white
        flex 
        justify-between 
        items-center 
        ${MessageVariants[type]}
        `
    )
}

const MessageVariants: { [key in TMessageVariant]: string } = {
    INFO: "bg-primary-light/80 border-primary-light",
    ERROR: "bg-red-500/80 border-red-600",
    WARN: "bg-yellow-500/80  border-yellow-600",
    SUCCESS: "bg-green-500/80 border-green-600"
}


export type TCalendarVariants = 'form' | 'sidebar' | 'mobile' | 'compact' | 'header';
interface ICalendarStyles {
    cell: string;
    input: string;
    button: string;
    popover: string;
    group: string;
}

const CalendarStyles = (variant: TCalendarVariants): ICalendarStyles => {
    const commonCell = `
        data-[disabled=true]:cursor-not-allowed 
        data-[disabled=true]:opacity-30
        data-[disabled=true]:hover:bg-transparent 
        data-[selected=true]:bg-focus-500
        data-[selected=true]:text-variant
        data-[selected=true]:font-bold
        flex 
        cursor-pointer 
        py-1.5 
        justify-center 
        items-center 
        text-main 
        bg-primary-950/10 
        m-0.5 
        rounded-dx 
        hover:bg-primary-500/30 
        hover:text-focus-300
        transition-colors
    `;

    const commonPopover = 'bg-primary-900/75 to-primary-950/95 backdrop-blur-xl p-4 rounded-dx shadow-xl border border-main/10 text-main';

    const variants: Record<TCalendarVariants, ICalendarStyles> = {
        form: {
            cell: commonCell,
            input: 'bg-primary-950/80 border border-main/10 p-1 rounded-l-dx w-full text-main inset-shadow-xsl',
            button: 'py-2 px-3 shadow-xs bg-primary-500/30 border-y border-r border-main/10 cursor-pointer hover:bg-focus-500 hover:text-variant rounded-r-dx h-full transition-colors',
            popover: `${commonPopover} w-full`,
            group: 'flex items-center cursor-pointer text-main w-full h-[42px]',
        },
        sidebar: {
            cell: commonCell,
            input: 'bg-primary-950/20 border border-main/15 p-1 w-full rounded-l-dx focus:border-focus-300 focus:outline-none text-main shadow-xs flex justify-center',
            button: 'py-2 px-3 shadow-xs bg-primary-500/30 border-y border-r border-main/15 cursor-pointer hover:bg-focus-500 hover:text-variant rounded-r-dx h-full transition-colors',
            popover: commonPopover,
            group: 'flex items-center cursor-pointer text-main w-full h-[42px]',
        },
        mobile: {
            cell: commonCell,
            input: 'bg-transparent border-none p-1 w-full focus:outline-none text-main flex justify-center',
            button: 'p-2 shadow-xs bg-primary-500/30 border border-main/15 cursor-pointer hover:bg-focus-500 hover:text-variant rounded-dx h-full transition-colors',
            popover: commonPopover,
            group: 'flex items-center cursor-pointer text-main w-full h-[42px]',
        },
        compact: {
            cell: commonCell,
            input: 'w-full text-left px-2 text-main bg-transparent outline-none border-none flex group-data-[disabled]:opacity-40',
            button: 'outline-none bg-transparent border-none cursor-pointer flex justify-center items-center',
            popover: `${commonPopover} w-full`,
            group: 'w-full outline-none flex justify-between items-center cursor-pointer text-main transition-opacity data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed data-[disabled]:pointer-events-none',
        },
        header: {
            cell: commonCell,
            input: 'w-full text-left px-2 text-main bg-transparent outline-none border-none flex group-data-[disabled]:opacity-40',
            button: 'outline-none bg-transparent border-none cursor-pointer flex justify-center items-center',
            popover: `${commonPopover} w-full`,
            group: 'w-full outline-none flex justify-between items-center cursor-pointer text-main transition-opacity data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed data-[disabled]:pointer-events-none',
        }
    };
    return variants[variant];
};

export { ModalStyles, MessageStyles, CalendarStyles };