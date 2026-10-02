const ConfigurationStyles = {
    section: 'w-full h-full bg-primary-950 flex flex-col overflow-hidden',
    container: 'w-full flex-1 min-h-0 bg-primary-900/60 backdrop-blur-xl shadow-2xl shadow-black/40 rounded-dx p-6 pt-18 border border-main/10 flex flex-col overflow-hidden',
    banner: {
        container: 'bg-linear-to-r from-primary-500/20 via-primary-900/40 to-focus-500/10 backdrop-blur-md w-full h-[110px] rounded-dx border border-main/10 shadow-md flex flex-row justify-between items-center px-6 shrink-0',
        content: 'size-16 rounded-full bg-primary-950 border border-main/15 shadow-inner mr-4 flex items-center justify-center shrink-0',
        text: 'text-xs text-main/70',
        title: 'text-main text-lg font-bold tracking-tight',
        button: 'bg-focus-500 hover:bg-focus-300 text-variant text-xs font-semibold px-6 py-2.5 rounded-dx shadow-md shadow-black/25 active:scale-95 transition-all cursor-pointer',
    }
};

export { ConfigurationStyles };