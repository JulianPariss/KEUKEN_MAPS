import { useEffect } from "react";
import CustomModal from "../../../../components/modal";
import { useSidebarContext } from "../../../../utils/contexts/sidebar.context";
import { useListViewContentRef } from "../../../../utils/hooks/map/useContextRef";
import EmptyListView from "../../components/emptyListView";
import ClientsList from "./components/clientsList";

const ListView = () => {
    const { isCollapsed } = useSidebarContext();
    const { content, setViewContent } = useListViewContentRef();

    useEffect(() => {
        if (content) return;
        setViewContent(<ClientsList />, 'clients');
    }, []);

    return (
        <div className="w-full h-full max-h-screen overflow-hidden relative">
            <CustomModal />
            <section className="bg-linear-to-b from-primary-900/95 to-primary-950/95 overflow-y-auto h-full p-3 pr-0 pt-12 z-0 relative border-t border-main/10 shadow-2xl flex gap-6 items-start text-main">
                <div
                    style={{ width: isCollapsed ? 'calc(100% - 20px)' : 'calc(100% - 400px)' }}
                    className="
                    transition-[width] duration-300 ease-in-out
                    min-h-full h-full
                    rounded-l-dx rounded-r-none p-4 z-0 shadow-inner 
                    shadow-black/30 backdrop-blur-xl border-r-0
                    border-y border-l border-main/10"
                >
                    {content ?? <EmptyListView />}
                </div>
            </section>
        </div>
    );
};

export default ListView;
