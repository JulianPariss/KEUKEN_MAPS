import { useEffect } from "react";
import { StatusIcon } from '@repo/icons';
import { useContextbarContext } from "../../../../utils/contexts/contextbar.context";
import type { ITag } from "../../../../utils/types/tags.types";
import ClientsStatus from ".";

export type TKPISKeys = 'zero' | 'one' | 'two' | 'lot';

interface IStatusBannerProps {
    activeFilter: number | null;
    tagsFiltered: ITag[];
}

const StatusBanner = (props: IStatusBannerProps) => {
    const { toggle, update, isOpen, openKey } = useContextbarContext();
    const MY_KEY = 'client-status';

    useEffect(() => {
        if (isOpen && openKey === MY_KEY) {
            update(
                <ClientsStatus {...props} />,
                MY_KEY
            );
        }
    }, [props.tagsFiltered, props.activeFilter, isOpen, openKey]);

    const isActive = isOpen && openKey === MY_KEY;

    return (
        <div
            onClick={() =>
                toggle(
                    <ClientsStatus {...props} />,
                    <p className="text-focus-300 px-2 font-semibold text-sm">Estado de los Clientes</p>,
                    MY_KEY
                )
            }
            className={`
                flex flex-col justify-center bg-linear-to-r from-primary-500/80 to-primary-900/80
                backdrop-blur-xl rounded-dx shadow-xs border transition-all duration-200 cursor-pointer mt-2 group
                ${isActive ? 'border-focus-300 shadow-md shadow-focus-300/10' : 'border-main/10 hover:border-focus-300/50'}
            `}
        >
            <div className="flex items-center justify-between p-2.5 px-3">
                <p className={`select-none text-sm font-semibold transition-colors ${isActive ? 'text-focus-300' : 'text-main/90 group-hover:text-main'}`}>
                    Estado de clientes
                </p>
                <StatusIcon className={`size-5 transition-colors ${isActive ? 'fill-focus-300' : 'fill-main/80 group-hover:fill-main'}`} />
            </div>
        </div>
    );
};

export default StatusBanner;
