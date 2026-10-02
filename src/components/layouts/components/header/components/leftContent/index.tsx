import { useState } from "react";
import type { IUserInfo } from "../../../../../../utils/types/sellerObserver/user.types";
import { LeftContentStyles as Styles } from "./styles";
import PopUp from "./popUpMenu";
import { APPVERSION } from "../../../../../../utils/constants/config.constants";
import { useModalRef, useModeRef, useViewRef } from "../../../../../../utils/hooks/map/useContextRef";
import { HistoryIcon, EarthDetailIcon, TableIcon } from '@repo/icons';
import ChangesHistoryModal from "./changesHistoryModal";
import { ThemeSwitcher } from "@repo/ui/theme";

const LeftContent = (props: IUserInfo) => {
    const { mode } = useModeRef();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { OpenModal } = useModalRef();
    const { changeView, view } = useViewRef();

    const isMapActive = view !== 'listView';
    const isListActive = view === 'listView';

    return (
        <>
            <div className="flex flex-row gap-x-2 items-center">
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className={Styles.profile}
                >
                    <div className="size-8 bg-primary-900 border border-main/15 rounded-full mr-2.5 flex justify-center items-center shadow-xs">
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm text-focus-300 font-bold leading-tight">{props.profile.username}</p>
                        <p className="text-xs text-main/80 leading-tight">{props.enterprise.name}</p>
                    </div>
                </div>
                <ThemeSwitcher />
                <div className="flex bg-primary-950/40 border border-main/10 p-0.5 rounded-full shadow-inner items-center backdrop-blur-md gap-x-0.5">
                    <button
                        onClick={() => changeView(isMapActive ? 'listView' : 'mapView')}
                        className={`flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${isMapActive
                            ? 'bg-focus-500 text-variant shadow-xs'
                            : 'text-main/60 hover:text-main hover:bg-primary-500/20'
                            }`}
                    >
                        <EarthDetailIcon className="size-3.5 flex-shrink-0" />
                        <span className={`inline-block transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${isMapActive ? 'max-w-0 opacity-0' : 'max-w-[60px] opacity-100 ml-1.5'
                            }`}>
                            Mapa
                        </span>
                    </button>
                    <button
                        onClick={() => changeView(isListActive ? 'mapView' : 'listView')}
                        className={`flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer ${isListActive
                            ? 'bg-focus-500 text-variant shadow-xs'
                            : 'text-main/60 hover:text-main hover:bg-primary-500/20'
                            }`}
                    >
                        <TableIcon className="size-3.5 flex-shrink-0" />
                        <span className={`inline-block transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${isListActive ? 'max-w-0 opacity-0' : 'max-w-[60px] opacity-100 ml-1.5'
                            }`}>
                            Listado
                        </span>
                    </button>
                </div>
                <div className="flex items-center gap-x-2 w-fit">
                    {mode === 'planner' && (
                        <button
                            title="Historial de cambios"
                            onClick={() => OpenModal({ Component: <ChangesHistoryModal />, isRequired: false })}
                            className="rounded-full cursor-pointer p-1.5 bg-focus-500 hover:bg-focus-300 shadow-sm shadow-black/25 hover:shadow-md hover:scale-105 transition-all duration-100 flex items-center justify-center"
                        >
                            <HistoryIcon className="fill-variant stroke-variant size-3.5" />
                        </button>
                    )}
                    <span className="text-main/40 text-xs text-right text-nowrap font-mono">{APPVERSION}</span>
                </div>
            </div>
            <PopUp isOpen={isOpen} setIsOpen={setIsOpen} />
        </>
    );
};

export default LeftContent;
