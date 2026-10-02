import { useSidebarContext } from "../../../../utils/contexts/sidebar.context";
import { type RefObject } from "react";
import { motion } from "motion/react";
import SidebarButton from "./sidebarButton";
import { useWindowSize } from "../../../../utils/hooks/layout/useWindowSize";

interface IProps {
    children: React.ReactNode;
    sidebarRef: RefObject<HTMLDivElement>;
}

const SidebarComponent = (props: IProps) => {
    const { isCollapsed } = useSidebarContext();
    const isMobile = useWindowSize().width <= 768;

    return (
        <div className={`absolute right-0 flex flex-row z-1002 h-[calc(100vh-60px)]`}>
            <SidebarButton />
            <motion.div
                className={`h-full bg-linear-to-b from-primary-900/85 to-primary-950/85 backdrop-blur-xl border-t border-main/10 flex flex-col`}
                initial={{ width: isMobile ? 'calc(100vw - 20px)' : '380px' }}
                animate={{ width: isCollapsed ? '0px' : isMobile ? 'calc(100vw - 20px)' : '380px' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
                <div ref={props.sidebarRef} className="flex flex-col overflow-y-scroll h-full w-full">
                    <div className="m-3">
                        {props.children}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SidebarComponent;
