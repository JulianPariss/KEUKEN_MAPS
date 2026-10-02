import { useState, type ReactNode } from "react";
import { SidebarContext } from "../../../utils/contexts/sidebar.context";
import Header from "../components/header/header";

interface IProps {
  children: ReactNode;
};


const ManagerLayout = (props: IProps) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    const initialState = {
        isCollapsed,
        setIsCollapsed
    }

    return(
        <SidebarContext.Provider value={initialState}>
            <div className="h-screen w-screen flex flex-col bg-primary-950 overflow-hidden">
                <div className="w-full z-1000 shrink-0">
                    <Header/>   
                </div>
                <div className="w-full flex-1 min-h-0 flex overflow-hidden">
                    {props.children}
                </div>
            </div>
        </SidebarContext.Provider>
    )
}

export default ManagerLayout;