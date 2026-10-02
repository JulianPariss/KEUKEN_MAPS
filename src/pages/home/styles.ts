const HomeStyles = {
    themeIcon: {
        background: (isDark: boolean) =>
            `
            position 
            absolute 
            z-1000
            size-5
            top-[20px] 
            left-[185px] 
            rounded-full
            flex
            justify-center
            items-center
            border-1 
            border-l-0.5
            border-primary-light/80
            ${isDark ? 'bg-secondary-light/35' : 'bg-tertiary-dark/35'}
            hover:shadow-sm
            hover:shadow-black/50
            cursor-pointer
        `,
        icon: (isDark: boolean) => `size-3 relative ${isDark ? 'fill-tertiary-dark' : 'fill-secondary-light'}`,
    },
    mapTypeIcon: {
        background:
            `  
            position 
            absolute 
            z-1000
            size-5
            top-[20px] 
            left-[165px] 
            rounded-l-full
            flex
            justify-center
            items-center
            border-1 
            border-r-0.5
            border-primary-light/80
            'bg-secondary-light/35'
            hover:shadow-sm
            hover:shadow-black/50
            cursor-pointer
        `,
        icon: `size-3 relative stroke-white`,
    }

}

const ComponentsStyles = {
    orderModal: {
        divider: 'col-span-3 h-[1px] border-none rounded-full bg-secondary-light/40',
    }

}


export { HomeStyles, ComponentsStyles };