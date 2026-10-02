const LoginStyles = {
    section: 
    `
        bg-gradient-to-br
        from-primary-light
        to-primary-dark
        h-[100vh] 
        w-full 
        flex
        justify-center 
        items-center
    `,
    container: 
    `
        w-[380px]
        max-h-[550px] 
        h-[90%] 
        flex 
        justify-center 
        bg-secondary-main/25 
        shadow-2xl 
        shadow-black/50 
        rounded-xl 
        border-1 
        border-primary-light/30
    `,
    formContainer: "flex flex-col items-center w-full",
    button: 
    `
        border-none
        bg-gradient-to-t 
        from-focus 
        to-secondary-light 
        w-full 
        p-4 
        rounded-lg 
        cursor-pointer
        shadow-md 
        shadow-black/20
        text-white 
        active:shadow-none 
        active:from-focus/70 
        active:to-secondary-light/70 
        active:inset-shadow-xs 
        inset-shadow-black/25"
    `,
    title: 'mt-12 text-shadow-xl text-shadow-black/30 text-4xl text-center font-bold text-white',
    input: {
        field: 
        `
            px-4
            py-2.5
            rounded-md
            text-white 
            bg-primary-light-chalk/15 
            w-full 
            border-1 
            border-transparent 
            focus:outline-none 
            focus:border-secondary-light 
            focus:bg-primary-light-chalk/20 
            transition-colors 
            duration-300
        `,
        error: (failed: boolean) => `text-secondary-light text-xs ml-2.5 ${ !failed ? "invisible" : "visible"}`,
    },
    form: {
        form: 'w-full h-full py-5 flex flex-col justify-start lg:justify-between',
    }

}

export { LoginStyles };