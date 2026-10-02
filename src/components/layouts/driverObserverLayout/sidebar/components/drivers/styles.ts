const SellersStyles = {
    item: {
        activeButton: (isActive: boolean) =>
             `
                cursor-pointer 
                bg-gradient-to-t 
                w-[85%] 
                text-sm 
                mr-2
                rounded-full 
                text-white
                ${isActive ? 'from-focus to-secondary-light' : 'from-focus/50 to-secondary-light/50' }
            ` 
    }

}


export { SellersStyles };