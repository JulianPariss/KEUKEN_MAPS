import { useEffect, useState } from "react"
import { type IAudit } from "../../../../../../utils/types/sellerObserver/audit.types"
import { getClientScheduledTasks, revertChanges } from "../../../../../../services/audit.service";
import { useAppSelector } from "../../../../../../store/hooks";
import { useModalRef, useNotifyRef } from "../../../../../../utils/hooks/map/useContextRef";
import { AddBracketIcon, ArrowIcon, ContractCheckIcon, ContractPendingIcon, RemoveBracketIcon, RevertIcon } from '@repo/icons';
import Spinner from "../../../../../spinner";
import moment from "moment";
import Empty from "../../../../../empty";
import ConfirmableButton from "../../../../../customConfirmableButton";


const ChangeItem = ({ change, enterprise }: { change: IAudit, enterprise: number }) => {
    const notify = useNotifyRef();
    const { CloseModal } = useModalRef();
    const ContentBlock = ({ content, title }: { content: string, title: string }) => {
        return (
            <div className="p-2 flex justify-start w-1/3 bg-primary-950/60 border border-main/10 rounded-dx">
                <p className="font-bold text-sm text-main">{title}: <span className="font-normal text-main/80"> {content} </span></p>
            </div>
        )
    }

    const hanldeRevert = () => {
        revertChanges(change.correlation_id, enterprise).then(() => {
            notify('La acción fue revertida con éxito', 'SUCCESS');
            CloseModal();
        }).catch(() => notify('No se pudo revertir la acción', 'ERROR'));
    }

    const isRemoving = change.method === 'DELETE';
    const isReversible = !change.revert;
    const confirmationDialog = <>Está seguro de que quiere revertir los cambios.<br /><span className="font-bold"> Este proceso es irreversible </span></>;

    return (
        <div className={`rounded-dx mb-2 border bg-linear-to-r from-primary-500/80 to-primary-900/80 backdrop-blur-xl text-main ${isReversible ? 'border-focus-300/40' : 'border-main/10'}`}>
            <div className="p-5 flex justify-between items-start">
                <div className="flex items-center">
                    <div className="w-7 mr-2">
                        {isRemoving
                            ? <RemoveBracketIcon className="size-4 fill-focus-300" />
                            : <AddBracketIcon className="size-4 fill-focus-300" />
                        }
                    </div>
                    <div className="w-full">
                        <p className="wrap text-main" key={change.id}>
                            {change.message}
                        </p>
                    </div>
                </div>
                <div>

                </div>
                <div className="flex items-center">

                    <ConfirmableButton
                        onClick={isReversible ? hanldeRevert : () => notify('Esta acción ya fue revertida', 'INFO')}
                        hasConfirmation={isReversible}
                        text={confirmationDialog}
                        className={`
                        mx-3 !p-1.5 !px-3 !rounded-dx 
                        flex items-center cursor-pointer text-xs font-semibold
                        transition-all duration-200
                        active:inset-shadow-xs shadow-md shadow-black/15 
                        ${isReversible ?
                                'bg-focus-500 hover:bg-focus-300 text-variant'
                                :
                                'bg-primary-500/20 text-main/40 shadow-none cursor-not-allowed'
                            }
                        `}>
                        Revertir
                        <RevertIcon className={`size-4 ml-2 ${isReversible ? 'stroke-variant' : 'stroke-main/40'}`} />
                    </ConfirmableButton>
                    {!!change.processed_timestamp ?
                        <div title="Proceso finalizado">
                            <ContractCheckIcon className="size-6 fill-success rounded-full" />
                        </div>
                        :
                        <div title="Proceso pendiente">
                            <ContractPendingIcon className="size-6 fill-warning rounded-full" />
                        </div>
                    }
                </div>
            </div>
            <div className="h-fit w-full px-5 pb-5">
                <div className="w-full flex justify-evenly gap-x-2">
                    <ContentBlock content={change.user_name} title="Solicitante" />
                    <ContentBlock content={moment(change.scheduled_date ?? change.timestamp).format('DD-MM-YYYY')} title="Fecha de Ejecución" />
                    <ContentBlock content={moment(change.timestamp).format('DD-MM-YYYY')} title="Fecha de Solicitud" />
                </div>
            </div>

        </div>
    )
}


const ChangesHistoryModal = () => {
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [pageSize] = useState<number>(10);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [lastPage, setLastPage] = useState<number>(0);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { enterprise } = useAppSelector((state) => state.user);
    const [changes, setChanges] = useState<IAudit[]>([]);
    const notified = useNotifyRef();

    useEffect(() => {
        const pageAlreadyLoaded = changes.length >= (currentPage + 1) * pageSize;
        if (pageAlreadyLoaded) return;
        if (!hasMore) return;

        setIsLoading(true);
        getClientScheduledTasks(null, enterprise.enterprise_id, pageSize, currentPage)
            .then((res) => {
                setChanges((prev) => [...prev, ...res]);
                if (res.length < pageSize) {
                    setLastPage(currentPage);
                    setHasMore(false);
                }
            })
            .catch(() => {
                setLastPage(currentPage);
                setHasMore(false);
                notified('Ocurrió un error al rescatar el historial de cambios', 'ERROR');
            }).finally(() => {
                setIsLoading(false)
            });
    }, [currentPage, enterprise.enterprise_id, pageSize, hasMore]);

    const changePage = (forward: boolean) => {
        setCurrentPage((prev) => Math.max(0, prev + (forward ? 1 : -1)));
    };

    const disableLeft = currentPage === 0;
    const disableRight = !hasMore && currentPage == lastPage;

    return (
        <div className="flex flex-col h-[60dvh] w-[60dvw]">
            <div className="overflow-y-scroll h-full w-full p-5 rounded-dx">
                {!isLoading ?
                    changes.length > 0 ?
                        <div>
                            {changes
                                .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
                                .map((change, i, arr) => {
                                    const currentDate = moment(change.timestamp).format("DD-MM-YYYY");
                                    const prevDate =
                                        i > 0
                                            ? moment(arr[i - 1].timestamp).format("DD-MM-YYYY")
                                            : null;

                                    const showBanner = currentDate !== prevDate;
                                    return (
                                        <div key={i}>
                                            {showBanner && (
                                                <div className="my-2 text-center font-semibold text-variant bg-focus-500 py-1 rounded-dx shadow-xs text-xs">
                                                    {moment(change.timestamp).format("DD/MM/YYYY")}
                                                </div>
                                            )}

                                            <ChangeItem
                                                change={change}
                                                enterprise={enterprise.enterprise_id}
                                            />
                                        </div>
                                    );
                                })}
                            {disableRight && <Empty text="No hay más elementos" />}
                        </div>
                        : <Empty />
                    : <Spinner bgColor="bg-focus-500" />
                }
            </div>
            <div className="flex justify-center pt-5">
                <button
                    className={`
                    p-3 transition-all duration-75 mr-3 rounded-full shadow-sm flex justify-center items-center
                    ${!disableLeft
                        ? `bg-focus-500 hover:bg-focus-300 shadow-black/35 active:inset-shadow-xs cursor-pointer`
                        : `bg-primary-950/40 text-main/30 border border-main/10 cursor-not-allowed`}`}
                    disabled={disableLeft}
                    onClick={() => changePage(false)}
                >
                    <ArrowIcon className={`size-4 rotate-90 ${!disableLeft ? "fill-variant" : "fill-main/30"}`} />
                </button>

                <button
                    className={`
                    p-3 transition-all duration-75 ml-3 rounded-full shadow-sm flex justify-center items-center
                    ${!disableRight
                        ? `bg-focus-500 hover:bg-focus-300 shadow-black/35 active:inset-shadow-xs cursor-pointer`
                        : `bg-primary-950/40 text-main/30 border border-main/10 cursor-not-allowed`}`}
                    disabled={disableRight}
                    onClick={() => changePage(true)}
                >
                    <ArrowIcon className={`size-4 -rotate-90 ${!disableRight ? "fill-variant" : "fill-main/30"}`} />
                </button>
            </div>
        </div>
    );
};


export default ChangesHistoryModal; 
