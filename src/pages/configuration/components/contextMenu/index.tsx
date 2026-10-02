import { useEffect, useState, type JSX } from "react";
import { ContextMenuStyles as Styles } from './styles'
import Configurations from "./configurations";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { fetchProfile } from "../../../../store/slices/userSlice";

type TTabKey = 'PERMISSIONS';

type ITab = {
    [key in TTabKey]: () => JSX.Element;
};

const components: ITab = {
    PERMISSIONS: () => <Configurations />
};


const ContextMenu = () => {
    const [currentTab, setCurrentTab] = useState<TTabKey>('PERMISSIONS');
    let Component = components[currentTab];

    const dispatch = useAppDispatch();

    const { enterprise } = useAppSelector((state) => state.user);

    const TabItem = ({ tab }: { tab: TTabKey }) => {
        const isActiveTab = tab === currentTab;

        const tabName: { [key in TTabKey]: string } = {
            PERMISSIONS: "Permisos"
        }

        return <button className={Styles.tabButton(isActiveTab)} onClick={() => setCurrentTab(tab)}>{tabName[tab]}</button>
    }

    useEffect(() => {
        Component = components[currentTab];
    }, [currentTab])

    useEffect(() => {
        if (!(enterprise.enterprise_id === -1)) {
            dispatch(fetchProfile({ e_id: enterprise.enterprise_id }));
        }
    }, [dispatch, enterprise])

    return (
        <div className="flex h-full gap-4 overflow-hidden">
            <div className="flex flex-col w-60 shrink-0 pt-1">
                <TabItem tab='PERMISSIONS' />
            </div>
            <div className="flex-1 min-w-0 h-full">
                <div className="w-full h-full bg-primary-950/40 rounded-dx border border-main/10 shadow-inner overflow-hidden">
                    <Component />
                </div>
            </div>
        </div>
    )
}

export default ContextMenu;