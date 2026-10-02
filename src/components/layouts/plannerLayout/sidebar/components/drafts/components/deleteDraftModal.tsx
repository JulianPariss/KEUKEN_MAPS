import { useAppDispatch } from "../../../../../../../store/hooks";
import { removeDraft } from "../../../../../../../store/slices/planner/draftsSlice";
import { useModalRef } from "../../../../../../../utils/hooks/map/useContextRef";


interface IProps {
    draft_id: number;
    name: string;
}


const DeleteDraftModal = (props: IProps) => {
    const { CloseModal } = useModalRef();
    const dispatch = useAppDispatch();
    const { draft_id, name } = props;

    const onConfirm = () => {
        dispatch(removeDraft({draft_id}));
        CloseModal();
    }
    return (
        <div className="w-[360px] max-w-full flex flex-col">
            <h2 className="text-main text-sm font-semibold leading-relaxed">
                ¿Está seguro de que desea eliminar el Borrador <span className="text-focus-300 underline font-bold">{name}</span>?
            </h2>
            <div className="flex justify-end w-full mt-6">
                <button
                    onClick={CloseModal}
                    className="px-3 py-1.5 rounded-dx text-xs font-medium text-main bg-primary-900 border border-main/15 hover:bg-primary-500/30 shadow-xs mr-2 cursor-pointer transition-all"
                >
                    Cancelar
                </button>
                <button
                    onClick={onConfirm}
                    className="px-3 py-1.5 rounded-dx text-xs font-medium shadow-xs transition-all bg-error text-white hover:bg-error/80 cursor-pointer shadow-error/20"
                >
                    Eliminar
                </button>
            </div>
        </div>
    );
};

export default DeleteDraftModal;