const SellersStyles = {
    item: {
        activeButton: (isActive: boolean) =>
            `
                cursor-pointer 
                bg-linear-to-t 
                w-[85%] 
                text-xs 
                font-medium
                mr-2
                rounded-dx 
                text-variant
                transition-all
                shadow-xs
                ${isActive ? 'from-focus-500 to-focus-300 shadow-focus-500/20' : 'from-focus-500/40 to-focus-300/40 opacity-70'}
            `
    }
};

export { SellersStyles };