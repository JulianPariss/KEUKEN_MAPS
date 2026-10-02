const ContextMenuStyles = {
    tabButton: (isActive: boolean) =>
        `w-full rounded-dx px-4 py-2.5 mb-2 text-left text-xs font-semibold tracking-wide transition-all ${
            isActive
                ? 'bg-focus-500 text-variant border-none cursor-default shadow-md shadow-black/20'
                : 'bg-primary-500/20 text-main/70 hover:bg-primary-500/35 hover:text-main cursor-pointer'
        }`
};

export { ContextMenuStyles };