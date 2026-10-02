import moment from "moment";
import { SignalIcon, NoSignalIcon } from '@repo/icons';
import type { IGps } from "../../../../../../../../utils/types/sellerObserver/sellers.types";

const GpsItem = (props: { gps: IGps }) => {
    const { gps } = props;

    return (
        <div className="w-full h-[60px] flex items-center justify-between px-2 bg-primary-950/40 backdrop-blur-md rounded-dx border border-main/10 transition-all duration-150 shadow-xs">
            <div className="w-[45px] ml-1 flex flex-col items-center justify-center h-full">
                <p className="text-main text-xs font-bold">
                    {gps.timestamp ? moment(gps.timestamp).format('HH:mm:ss') : '--:--:--'}
                </p>
            </div>

            <div className="min-w-[40px] relative size-[40px] mx-2.5 shadow-sm shadow-black/60 rounded-full z-20">
                <div
                    className={`rounded-full size-full flex justify-center items-center outline-1 transition-colors ${gps.hasGps
                        ? 'bg-success/20 outline-success/50'
                        : 'bg-error/20 outline-error/50'
                        }`}
                >
                    {gps.hasGps ? (
                        <SignalIcon className="size-5 stroke-success" />
                    ) : (
                        <NoSignalIcon className="size-5 stroke-error" />
                    )}
                </div>
            </div>

            <div className="w-full flex flex-col justify-center min-w-0 h-full items-start">
                <p className="text-xs text-main font-medium max-w-full truncate">
                    {gps.hasGps ? 'Conexión GPS establecida' : 'Conexión GPS interrumpida'}
                </p>
                <span className="text-[11px] text-main/50 italic truncate">
                    {gps.hasGps ? 'Dispositivo con señal' : 'Dispositivo sin señal'}
                </span>
            </div>
        </div>
    );
};

export default GpsItem;


