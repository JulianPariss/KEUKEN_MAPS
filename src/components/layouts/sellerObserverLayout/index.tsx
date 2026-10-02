import { useState, type ReactNode } from "react";
import { SidebarContext } from "../../../utils/contexts/sidebar.context";
import { ContextbarProvider } from "../../../utils/contexts/contextbar.context";
import Header from "../components/header/header";
import Sidebar from "./sidebar";
import TimeOverlay from "../../timeOverlay";
import { useWindowSize } from "../../../utils/hooks/layout/useWindowSize";

interface IProps {
    children: ReactNode;
};


const SellerObserverLayout = (props: IProps) => {
    const isMobile = useWindowSize().width <= 1024;

    const [isCollapsed, setIsCollapsed] = useState<boolean>(isMobile);

    const initialSidebarState = {
        isCollapsed,
        setIsCollapsed
    }

    return (
        <SidebarContext.Provider value={initialSidebarState}>
            <ContextbarProvider>
                <div className="h-screen w-screen flex flex-col">
                    <div className="w-full z-1000">
                        <Header />
                    </div>
                    <div className="w-full h-full flex">
                        {props.children}
                        <Sidebar />
                    </div>
                    <TimeOverlay />
                </div>
            </ContextbarProvider>
        </SidebarContext.Provider>
    )
}

export default SellerObserverLayout;