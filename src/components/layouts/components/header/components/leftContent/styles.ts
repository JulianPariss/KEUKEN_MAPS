const LeftContentStyles = {
    button: (customStyles: string) => `w-[90%] border-main/10 border  bg-primary-500/20 p-2 cursor-pointer text-main text-xs mx-2 my-1 rounded-dx hover:bg-focus-500/30 transition-all ${customStyles}`,
    profile: "bg-primary-950/40 backdrop-blur-md p-1.5 rounded-r-full min-w-[210px] w-auto m-2 flex flex-row items-center border border-focus-300/40 cursor-pointer hover:bg-primary-500/20 transition-all shadow-xs",
    enterpriseButton: (alternator: boolean) => `w-full text-main/80 text-xs text-center py-2 px-1 cursor-pointer ${alternator ? 'bg-primary-500/40' : 'bg-primary-300/40'} hover:bg-focus-500/30 transition-all`,
    popUpMenu: {
        container: 'w-[180px] bg-primary-950/95 backdrop-blur-xl absolute top-[60px] left-2 z-50 rounded-b-dx border-b border-x border-main/10 shadow-xl flex flex-col items-center justify-evenly py-1',
    }
};

export { LeftContentStyles };
