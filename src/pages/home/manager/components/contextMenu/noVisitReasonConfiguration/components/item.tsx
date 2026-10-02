import { CheckIcon, CrossIcon, PencilIcon, TrashcanIcon } from '@repo/icons';
import ConfirmableButton from "../../../../../../../components/customConfirmableButton";
import { NO_SALE_ENABLED, ORDER_ENABLED, ORDER_JUSTIFIED } from "../../../../../../../utils/constants/label.constants";
import { useModalRef } from "../../../../../../../utils/hooks/map/useContextRef";
import type { INoVisitReason, INoVisitReasonCreation } from "../../../../../../../utils/types/novisitreason.types";
import EditionModal from "./editionModal";

interface IItemsProps {
    nvr: INoVisitReason;
    handleDelete: (value: number) => void;
    handleEdit: (value: number, data: INoVisitReasonCreation) => void;
    noVisitList: INoVisitReason[];
}

const Item = (props: IItemsProps) => {
    const {
        handleDelete,
        noVisitList,
        nvr,
        handleEdit
    } = props;

    const {
        order_enabled,
        order_justified,
        description,
        no_sale_enabled,
        id
    } = nvr

    const { OpenModal } = useModalRef();



    const BoolBox = ({ value, title }: { value: boolean, title: string }) => {
        return (
            <div className="flex flex-row items-center gap-x-2">
                <h3 className={`text-xs ${value ? 'text-main font-medium' : 'text-main/50'}`}>{title}</h3>
                <div className={`size-5 rounded-dx p-0.5 flex justify-center items-center ${value ? 'bg-focus-500 shadow-xs' : 'bg-primary-500/20 border border-main/10'}`}>
                    {value ? <CheckIcon className="stroke-variant size-3.5" strokeWidth={3} /> : <CrossIcon className="stroke-main/40 size-3.5" strokeWidth={3} />}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full bg-primary-900/60 hover:bg-primary-900/80 rounded-dx p-2.5 px-3.5 border border-main/10 transition-colors">
            <div className="flex justify-between items-center">
                <h2 className="text-main font-semibold text-xs tracking-wide">{description}</h2>
                <div className="flex items-center gap-x-2">
                    <button
                        className="p-1 rounded-dx hover:bg-primary-500/20 cursor-pointer transition-colors"
                        title="Editar motivo"
                        onClick={() => {
                            OpenModal({
                                Component: <EditionModal defaultValues={nvr} onModalSubmit={handleEdit} noVisitList={noVisitList} />,
                                isRequired: false
                            });
                        }}
                    >
                        <PencilIcon className="size-3.5 stroke-main/70 hover:stroke-main transition-colors" />
                    </button>
                    <ConfirmableButton
                        text="¿Está seguro de que desea eliminar el motivo de no visita?"
                        hasConfirmation
                        className="!bg-transparent !p-1 hover:!bg-primary-500/20 rounded-dx transition-colors"
                        onClick={() => handleDelete(id)}
                    >
                        <TrashcanIcon className="stroke-error size-3.5 cursor-pointer hover:opacity-80 transition-opacity" />
                    </ConfirmableButton>
                </div>
            </div>
            <hr className="w-full my-2 border-main/10" />
            <div className="flex items-center gap-x-6 w-full flex-wrap gap-y-1">
                <BoolBox title={ORDER_ENABLED} value={!!order_enabled} />
                <BoolBox title={NO_SALE_ENABLED} value={!!no_sale_enabled} />
                <BoolBox title={ORDER_JUSTIFIED} value={!!order_justified} />
            </div>
        </div>
    );
}

export default Item;
