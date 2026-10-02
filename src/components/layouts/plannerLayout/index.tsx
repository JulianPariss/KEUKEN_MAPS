import { useState, type ReactNode } from "react";
import { SidebarContext } from "../../../utils/contexts/sidebar.context";
import Header from "../components/header/header";
import Sidebar from "./sidebar";
import { ContextbarProvider } from "../../../utils/contexts/contextbar.context";

interface IProps {
    children: ReactNode;
};


const PlannerLayout = (props: IProps) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);


    const initialState = {
        isCollapsed,
        setIsCollapsed
    }

    return (
        <SidebarContext.Provider value={initialState}>
            <ContextbarProvider>
                <div className="h-screen w-screen flex flex-col">
                    <div className="w-full z-1000">
                        <Header />
                    </div>
                    <div className="w-full h-full flex">
                        {props.children}
                        <Sidebar />
                    </div>
                </div>
            </ContextbarProvider>
        </SidebarContext.Provider>
    )
}

export default PlannerLayout;