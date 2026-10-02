import { useAppDispatch, useAppSelector } from "../../../../../../store/hooks";
import Empty from "../../../../../../components/empty";
import type { IHistoryClient } from "../../../../../../utils/types/sellerObserver/history.types";
import { LoadingIcon, LockIcon } from '@repo/icons';
import { toggleExcludeClient } from "../../../../../../store/slices/sellerObserver/historySlice";
import { useEffect, useState } from "react";

interface IProps {

}



const Item = ({ client, isLoading, handleChange }: { client: IHistoryClient, isLoading: boolean, handleChange: (id: number) => void }) => {
    const {
        name,
        id,
    } = client;

    const [showLoader, setShowLoader] = useState<boolean>(false);

    useEffect(() => {
        if (isLoading) {
            const timer = setTimeout(() => {
                setShowLoader(true);
            }, 200);

            return () => clearTimeout(timer);
        } else {
            setShowLoader(false);
        }
    }, [isLoading]);

    return (
        <div className="bg-primary-900/60 hover:bg-primary-900/80 h-10 w-full rounded-dx p-2 px-3 border border-main/10 flex items-center justify-between transition-colors">
            <div className="flex items-center">
                <h2 className="text-main text-xs font-medium">
                    <span className="before:content-['#'] text-focus-300 font-semibold mr-1.5">{id}</span>
                    {name}
                </h2>
            </div>
            <button
                className="p-1.5 rounded-dx hover:bg-primary-500/20 cursor-pointer transition-colors"
                disabled={isLoading}
                title={'Incluir cliente'}
                onClick={(e) => {
                    e.stopPropagation();
                    handleChange(id);
                }}
            >
                {showLoader ?
                    <LoadingIcon className="animate-[spin_1s_linear_reverse_infinite] size-4 fill-focus-300" />
                    :
                    <LockIcon className="size-4 fill-main/70 hover:fill-main transition-colors" />
                }
            </button>
        </div>
    );
};

const ExcludedClients = (_: IProps) => {
    const { clients, excludeLoadingById } = useAppSelector((state) => state.history);

    const dispatch = useAppDispatch();

    const handleChange = (id: number) => {
        dispatch(toggleExcludeClient({ id }));
    };

    const excludedList = clients.filter((rs) => rs.excluded);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="w-full bg-primary-900/50 backdrop-blur-md border-b border-main/10 flex justify-between items-center p-4 px-4 shrink-0">
                <h2 className="text-main font-semibold text-sm">Listado de clientes excluidos</h2>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-y-2 p-3">
                {
                    excludedList.length === 0 ? (
                        <div className="flex-1 min-h-0 flex">
                            <Empty text="No posee ningún cliente excluido" />
                        </div>
                    ) : (
                        excludedList.map((res) => (
                            <Item key={res.id} client={res} isLoading={excludeLoadingById[res.id]} handleChange={handleChange} />
                        ))
                    )
                }
            </div>
        </div>
    );
};

export default ExcludedClients;

