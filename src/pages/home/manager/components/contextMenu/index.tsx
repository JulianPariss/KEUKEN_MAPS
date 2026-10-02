import { useState, type JSX } from "react";
import { ContextMenuStyles as Styles } from './styles'
import PermissionConfiguration from "./permissionConfiguration";
import NoVisitReasonConfiguration from "./noVisitReasonConfiguration";
import ExcludedClients from "./excludedClients";

type TTabKey = 'PERMISSIONS' | 'NOVISITREASON' | 'EXCLUDEDCLIENTS';

type ITab = {
    [key in TTabKey]: () => JSX.Element;
};

const components: ITab = {
    PERMISSIONS: () => <PermissionConfiguration />,
    NOVISITREASON: () => <NoVisitReasonConfiguration />,
    EXCLUDEDCLIENTS: () => <ExcludedClients />
};


const tabNames: Record<TTabKey, string> = {
    PERMISSIONS: "Permisos",
    NOVISITREASON: "Motivos de no visita",
    EXCLUDEDCLIENTS: "Clientes excluidos"
};

interface ITabItemProps {
    tab: TTabKey;
    currentTab: TTabKey;
    onSelect: (tab: TTabKey) => void;
}

const TabItem = ({ tab, currentTab, onSelect }: ITabItemProps) => {
    const isActiveTab = tab === currentTab;
    return (
        <button className={Styles.tabButton(isActiveTab)} onClick={() => onSelect(tab)}>
            {tabNames[tab]}
        </button>
    );
};

const ContextMenu = () => {
    const [currentTab, setCurrentTab] = useState<TTabKey>('PERMISSIONS');
    const Component = components[currentTab];

    return (
        <div className="flex h-full gap-4 overflow-hidden">
            <div className="flex flex-col w-60 shrink-0 pt-1">
                <TabItem tab='PERMISSIONS' currentTab={currentTab} onSelect={setCurrentTab} />
                <TabItem tab='NOVISITREASON' currentTab={currentTab} onSelect={setCurrentTab} />
                <TabItem tab='EXCLUDEDCLIENTS' currentTab={currentTab} onSelect={setCurrentTab} />
            </div>
            <div className="flex-1 min-w-0 h-full overflow-hidden">
                <div className="w-full h-full bg-primary-950/40 rounded-dx border border-main/10 shadow-inner overflow-hidden flex flex-col">
                    <Component />
                </div>
            </div>
        </div>
    );
};

export default ContextMenu;