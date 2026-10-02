import { useCallback, useEffect, useState } from "react";
import { useAppSelector } from "../../../../../../store/hooks";
import { createNoVisitReason, deleteNotVisitReason, getNotVisitReasons, updateNoVisitReason } from "../../../../../../services/novisitreason.service";
import { type INoVisitReason, type INoVisitReasonCreation } from "../../../../../../utils/types/novisitreason.types";
import Empty from "../../../../../../components/empty";
import Spinner from "../../../../../../components/spinner";
import Item from "./components/item";
import { useModalRef, useNotifyRef } from "../../../../../../utils/hooks/map/useContextRef";
import CreationModal from "./components/creationModal";



interface IProps {

}



const NoVisitReasonConfiguration = (_: IProps) => {
    const { enterprise_id } = useAppSelector((state) => state.user.enterprise);
    const [noVisitList, setNoVisitList] = useState<INoVisitReason[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const notify = useNotifyRef();
    const { OpenModal } = useModalRef();

    const refreshNotVisitReasons = useCallback(() => {
        setLoading(true);
        getNotVisitReasons(enterprise_id)
            .then(setNoVisitList)
            .finally(() => setLoading(false));
    }, [enterprise_id]);


    const handleSubmit = useCallback(
        (value: INoVisitReasonCreation) => {
            createNoVisitReason(enterprise_id, value)
                .then(() => {
                    notify('Se creó con éxito el motivo de no visita', 'SUCCESS');
                })
                .catch(() => {
                    notify('Ocurrió un error al intentar crear el motivo de no visita', 'ERROR');
                })
                .finally(() => {
                    refreshNotVisitReasons();
                });
        },
        [enterprise_id, notify, refreshNotVisitReasons]
    );

    const handleDelete = useCallback(
        (no_visit_reason_id: number) => {
            deleteNotVisitReason(enterprise_id, no_visit_reason_id)
                .then(() => {
                    notify('Se eliminó con éxito', 'WARN');
                    refreshNotVisitReasons();
                }).catch(() => {
                    notify('No se pudo eliminar con éxito', 'ERROR');
                });
        },
        [enterprise_id, notify, refreshNotVisitReasons]
    );

    const handleEdit = useCallback((no_visit_reason_id: number, data: INoVisitReasonCreation,) => {
        updateNoVisitReason(enterprise_id, no_visit_reason_id, data).then(() => {
            notify('Se modifico con éxito', 'SUCCESS');
            refreshNotVisitReasons();
        }).catch(() => {
            notify('No se pudo modificar con éxito', 'ERROR');
        })
    }, [notify, refreshNotVisitReasons])

    useEffect(() => {
        refreshNotVisitReasons()
    }, [enterprise_id])

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="w-full bg-primary-900/50 backdrop-blur-md border-b border-main/10 flex justify-between items-center p-3 px-4 shrink-0">
                <h2 className="text-main font-semibold text-sm">Listado de motivos de no visita</h2>
                <button
                    className="bg-focus-500 hover:bg-focus-300 cursor-pointer px-4 py-1.5 rounded-dx text-variant text-xs font-semibold shadow-xs active:scale-95 transition-all"
                    onClick={() => {
                        OpenModal({
                            Component: <CreationModal onModalSubmit={handleSubmit} noVisitList={noVisitList} />,
                            isRequired: false
                        })
                    }}>
                    Crear nuevo
                </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-y-2 p-3">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Spinner />
                    </div>
                ) : noVisitList.length === 0 ? (
                    <div className="flex-1 min-h-0 flex">
                        <Empty text="No posee ningún motivo de no visita cargado" />
                    </div>
                ) : (
                    noVisitList.map((res) => (
                        <Item nvr={res} key={res.id} handleDelete={handleDelete} handleEdit={handleEdit} noVisitList={noVisitList} />
                    ))
                )}
            </div>
        </div>
    );
}

export default NoVisitReasonConfiguration;
