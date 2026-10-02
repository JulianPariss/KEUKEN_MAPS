import { useState, type ReactNode } from "react";
import { SidebarContext } from "../../../utils/contexts/sidebar.context";
import Header from "../components/header/header";

interface IProps {
    children: ReactNode;
}

const DefaultLayout = (props: IProps) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    const initialState = {
        isCollapsed,
        setIsCollapsed,
    };

    return (
        <SidebarContext.Provider value={initialState}>
            <div className="h-screen w-screen flex flex-col bg-primary-950 overflow-hidden">
                <div className="w-full z-1000">
                    <Header />
                </div>
                <div className="w-full h-full flex flex-1 overflow-hidden">
                    {props.children}
                </div>
            </div>
        </SidebarContext.Provider>
    );
};

export default DefaultLayout;
