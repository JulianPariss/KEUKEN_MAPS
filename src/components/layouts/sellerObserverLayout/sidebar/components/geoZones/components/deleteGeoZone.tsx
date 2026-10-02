
import { useState } from "react";
import { deleteGeozone as delteGreozoneDraft } from "../../../../../../../store/slices/planner/draftsSlice";
import { deleteGeozone } from "../../../../../../../store/slices/sellerObserver/geozonesSlice";
import { useAppDispatch } from "../../../../../../../store/hooks";
import { useModalRef } from "../../../../../../../utils/hooks/map/useContextRef";
import type { IGeneralGeoZone } from "../../../../../../../utils/types/geozones.types";
import type { IGeoZone as IDraftGeoZone } from "../../../../../../../utils/types/planner/geozones.types";


interface IProps {
    geo: IGeneralGeoZone | IDraftGeoZone;
    enterprise_id: number;
}


const DeleteGeoZone = (props: IProps) => {
    const { CloseModal } = useModalRef();
    const dispatch = useAppDispatch();
    const { geo, enterprise_id } = props;
    const [confirmName, setConfirmName] = useState("");

    const onConfirm = () => {
        if ("draft_id" in geo) {
            dispatch(delteGreozoneDraft({draft_geozone_id: geo.id, enterprise_id}));
        } else {
            dispatch(deleteGeozone({ geozone_id: geo.id, enterprise_id }));
        }
        
        CloseModal();
        
    }

    const isMatch = confirmName.trim() === geo.name.trim();

    return (
        <div className="w-[360px] max-w-full flex flex-col">
            <h2 className="text-main text-sm font-semibold leading-relaxed">
                ¿Está seguro de que desea eliminar la Geo Zona <span className="text-focus-300 underline font-bold">{geo.name}</span>?
            </h2>
            <div className="mt-4 flex flex-col gap-y-1.5">
                <p className="text-main/70 text-xs">Escriba el nombre de la zona para confirmar:</p>
                <input
                    type="text"
                    value={confirmName}
                    onChange={(e) => setConfirmName(e.target.value)}
                    placeholder={geo.name}
                    className="bg-primary-500/20 border border-main/15 focus:border-focus-300 p-2 rounded-dx w-full text-main placeholder:text-main/40 text-xs outline-none transition-colors shadow-xs"
                />
            </div>
            <div className="flex justify-end w-full mt-6">
                <button
                    onClick={CloseModal}
                    className="px-3 py-1.5 rounded-dx text-xs font-medium text-main bg-primary-900 border border-main/15 hover:bg-primary-500/30 shadow-xs mr-2 cursor-pointer transition-all"
                >
                    Cancelar
                </button>
                <button
                    onClick={onConfirm}
                    disabled={!isMatch}
                    className={`px-3 py-1.5 rounded-dx text-xs font-medium shadow-xs transition-all ${
                        isMatch
                            ? 'bg-error text-white hover:bg-error/80 cursor-pointer shadow-error/20'
                            : 'bg-primary-500/20 text-main/40 border border-main/10 cursor-not-allowed'
                    }`}
                >
                    Eliminar
                </button>
            </div>
        </div>
    );
};

export default DeleteGeoZone;