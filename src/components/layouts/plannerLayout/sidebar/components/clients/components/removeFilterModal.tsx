import { useModalRef } from "../../../../../../../utils/hooks/map/useContextRef";

interface IProps {
    onModalSubmit: () => void;
    filterName: string;
}

const RemoveFilterModal = (props: IProps) => {
    const { onModalSubmit, filterName } = props;
    const { CloseModal } = useModalRef();


    const onSubmit = () => {
        onModalSubmit();
        CloseModal();
    }

    const onCancel = () => {
        CloseModal();
    }

    return (
        <div className="flex flex-col h-fit w-[360px] max-w-full">
            <form onSubmit={onSubmit} className="w-full">
                <div className="flex flex-col items-start w-full justify-between">
                    <h4 className="text-main font-semibold text-sm leading-relaxed">
                        ¿Está seguro que desea eliminar el filtro <span className="text-focus-300 underline font-bold">{filterName}</span>?
                    </h4>
                </div>
                <div className="flex justify-end w-full mt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-3 py-1.5 rounded-dx text-xs font-medium text-main bg-primary-900 border border-main/15 hover:bg-primary-500/30 shadow-xs mr-2 cursor-pointer transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-3 py-1.5 rounded-dx text-xs font-medium shadow-xs transition-all bg-error text-white hover:bg-error/80 cursor-pointer shadow-error/20"
                    >
                        Eliminar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RemoveFilterModal; 