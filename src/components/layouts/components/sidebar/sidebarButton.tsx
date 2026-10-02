import { motion } from "motion/react";
import { ArrowIcon } from '@repo/icons';
import { useSidebarContext } from "../../../../utils/contexts/sidebar.context";

const SidebarButton = () => {
    const { setIsCollapsed, isCollapsed } = useSidebarContext();

    return (
        <motion.button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            initial={{ scaleX: 1 }}
            whileHover={{
                scaleX: 1.25,
                transition: {
                    type: 'spring',
                    stiffness: 400,
                    damping: 40,
                },
            }}
            className={`
                z-10
                bg-linear-to-l
                from-85%
                from-primary-900
                to-primary-500/30
                backdrop-blur-xl
                border-t
                border-main/10
                right-[30px] 
                bottom-[1px] 
                cursor-pointer 
                h-full 
                flex 
                justify-center 
                items-center 
                transition-all 
                duration-300 
                ease-in-out 
                shadow-sm
                shadow-black/40
                w-5
            `}
            style={{ transformOrigin: isCollapsed ? 'right' : 'left' }}
        >
            <ArrowIcon className={`fill-main size-3 transition-transform duration-300 ease-in-out ${isCollapsed ? 'rotate-90' : 'rotate-[-90deg]'}`} />
        </motion.button>
    );
};

export default SidebarButton;
