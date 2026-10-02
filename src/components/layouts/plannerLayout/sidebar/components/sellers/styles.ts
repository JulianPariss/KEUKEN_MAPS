const SellersStyles = {
    item: {
        activeButton: (isActive: boolean) =>
            `
                cursor-pointer 
                w-[85%] 
                text-xs 
                font-semibold
                mr-2
                rounded-full 
                transition-all
                shadow-xs
                ${isActive ? 'bg-focus-500 text-variant border border-focus-300/50 shadow-focus-500/20' : 'bg-primary-900 border border-main/10 text-main/70 hover:text-main'}
            `
    }
};

export { SellersStyles };