import { NoSignalIcon, SignalIcon } from '@repo/icons';
import type { TConnectionStatus } from "../../../../../../../utils/types/sellerObserver/sellers.types";
import type { ReactNode } from "react";

const StatusIcon = (props: { status: TConnectionStatus }) => {
    const { status } = props;

    const connectionStatus: { [key in TConnectionStatus]: { icon: ReactNode } } = {
        online: {
            icon: <SignalIcon className="size-4 stroke-success" />
        },
        offline: {
            icon: <NoSignalIcon className="size-4 stroke-error" />
        },
        unknow: {
            icon: null
        }
    };

    const current = connectionStatus[status];

    return (
        <div
            className={`bg-primary-950/40 border border-main/10 rounded-full p-1 flex justify-center items-center shadow-xs ${!!current?.icon ? 'visible' : 'invisible'}`}
        >
            {current?.icon ?? null}
        </div>
    );
};

export default StatusIcon;
