import { LoadingIcon, LockIcon, UnlockIcon } from '@repo/icons';
import { useAppDispatch, useAppSelector } from "../../../../../../../store/hooks";
import { toggleExcludeClient } from "../../../../../../../store/slices/planner/draftsSlice";
import type { IHistoryClient } from "../../../../../../../utils/types/sellerObserver/history.types";

interface IClientItem extends IHistoryClient {
    onClick: () => void;
    visibleTags: boolean;
}

const Item = (props: IClientItem) => {
    const { id, tags, visibleTags, excluded } = props;
    const { excludeLoadingById } = useAppSelector((state) => state.drafts.history);


    const isLoading = excludeLoadingById[id];
    const dispatch = useAppDispatch();

    
    const Label = ({ name }: { name: string }) => {
        return (
            <div className="px-2.5 py-0.5 rounded-dx bg-focus-500 border border-focus-300/40 text-variant shadow-xs">
                <p className="text-center text-xs font-medium">{name}</p>
            </div>
        );
    };

    return (
        <div
            className="bg-linear-to-r from-primary-500/80 to-primary-900/80 backdrop-blur-xl p-3 rounded-dx my-2 border border-main/10 hover:border-focus-300/80 transition-all shadow-xs cursor-pointer group flex flex-col justify-start"
            onClick={props.onClick}
        >
            <h2 className="text-main font-semibold text-sm leading-tight group-hover:text-focus-300 transition-colors">
                {props.name} <span className="text-focus-300 text-xs font-mono ml-1 font-semibold">#{id ?? 'No Code'}</span>
            </h2>
            <hr className="w-full border-main/10 my-2" />
            <div>
                <div className="flex flex-col justify-start gap-y-0.5">
                    <p className="italic text-xs text-main/50 font-medium">Dirección</p>
                    <p className="text-main/90 text-xs font-medium">{props.address}</p>
                </div>
                {visibleTags && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {tags.map((tag) =>
                            tag.labels.map((key, index) => (
                                <Label key={`${key}-${index}`} name={key} />
                            ))
                        )}
                    </div>
                )}
                <hr className="w-full border-main/10 my-2" />
                <div className="w-full flex justify-end items-center">
                    <button
                        className="size-7 rounded-full p-1.5 bg-primary-900 border border-main/15 shadow-xs flex justify-center items-center transition-all cursor-pointer hover:bg-focus-500 hover:text-variant disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={isLoading}
                        title={!excluded ? "Excluir cliente" : 'Incluir cliente'}
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatch(toggleExcludeClient({ id }));
                        }}
                    >
                        {isLoading ? (
                            <LoadingIcon className="animate-[spin_1s_linear_reverse_infinite] size-3.5 fill-main" />
                        ) : !excluded ? (
                            <UnlockIcon className="size-3.5 fill-main" />
                        ) : (
                            <LockIcon className="size-3.5 fill-focus-300" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Item;    
