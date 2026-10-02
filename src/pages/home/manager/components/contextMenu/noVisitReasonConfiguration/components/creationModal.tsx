import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup"
import { CheckIcon, CrossIcon } from '@repo/icons';
import { NO_SALE_ENABLED, ORDER_ENABLED, ORDER_JUSTIFIED } from "../../../../../../../utils/constants/label.constants";
import { useModalRef } from "../../../../../../../utils/hooks/map/useContextRef";
import type { INoVisitReason, INoVisitReasonCreation } from "../../../../../../../utils/types/novisitreason.types";
import { capitalizeAllWords } from "../../../../../../../utils/helpers/formatters";

interface CreationModalProps {
    onModalSubmit: (value: INoVisitReasonCreation) => void;
    onModalCancel?: () => void;
    noVisitList: INoVisitReason[];
}

interface CheckboxProps {
    value: boolean;
    handleClick: (value: boolean) => void;
    title: string;
}

const Checkbox = ({ value, handleClick, title }: CheckboxProps) => {
    return (
        <div
            className="flex items-center justify-between gap-x-2 cursor-pointer bg-primary-900/60 hover:bg-primary-900/90 rounded-dx p-2.5 px-3 border border-main/10 transition-colors"
            onClick={() => handleClick(!value)}>
            <h2 className="text-main text-xs font-medium">{title}</h2>
            <div className={`size-5 flex justify-center items-center rounded-dx ${value ? "bg-focus-500 shadow-xs" : "bg-primary-500/20 border border-main/10"}`}>
                {value ? <CheckIcon className="stroke-variant size-3.5" strokeWidth={3} /> : <CrossIcon className="stroke-main/40 size-3.5" strokeWidth={3} />}
            </div>
        </div>
    );
};

const schema = yup
    .object({
        description: yup.string().max(30, 'Ingrese un nombre más corto').required('Este campo es obligatorio'),
    }).required();


const CreationModal = (props: CreationModalProps) => {
    const { onModalSubmit, noVisitList } = props;

    const [alreadyExist, setAlreadyExist] = useState<boolean>(false);
    const [ordEnabled, setOrdEnabled] = useState(false);
    const [requireJustify, setrequireJustify] = useState(false);
    const [noSaleEnabled, setNoSaleEnabled] = useState(false);

    const { CloseModal } = useModalRef();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<any>(
        {
            resolver: yupResolver(schema),
        }
    )

    const checkIfExist = (description: string) => {
        const exist = noVisitList.some((el) => el.description === description);
        setAlreadyExist(exist) 
        return exist
    }

    const onSubmit: SubmitHandler<any> = (data) => {
        const descriptionFormatted = capitalizeAllWords(data.description) ?? '';

        if (checkIfExist(descriptionFormatted)) return;

        const parsedData: INoVisitReasonCreation = {
            description:descriptionFormatted,
            order_enabled: Number(ordEnabled),
            order_justified: Number(requireJustify),
            no_sale_enabled: Number(noSaleEnabled),
            no_sale_justified: Number(requireJustify),
        }
        onModalSubmit(parsedData);
        CloseModal();
    }


    const handleCancel = () => {
        CloseModal();
    }

    return (
        <div className="w-[470px]">
            <form
                className="flex flex-col gap-3 w-full"
                onSubmit={handleSubmit(onSubmit)}>

                <h2 className="text-main font-bold text-base">Crear un nuevo motivo de no visita</h2>

                <div className="w-full flex flex-col gap-y-1.5">
                    <h2 className="text-main/70 text-xs font-medium">Título</h2>
                    <input
                        {...register("description")}
                        placeholder={'Ingrese el campo'}
                        type='text'
                        autoFocus={true}
                        className="bg-primary-950/60 p-2.5 rounded-dx w-full text-main placeholder:text-main/40 border border-main/10 focus:border-focus-300 outline-none text-xs transition-colors"
                    />
                    {alreadyExist ?
                        <span className="text-focus-300 text-xs">*El nombre elegido ya se encuentra en uso</span>
                        : 
                        <span className={`text-error text-xs ${!errors.description ? "invisible" : "visible"}`}>{`*${errors.description?.message}`}</span>
                    }
                </div>

                <div className="flex flex-col gap-y-2">
                    <Checkbox title={ORDER_ENABLED} value={ordEnabled} handleClick={setOrdEnabled} />
                    <Checkbox title={NO_SALE_ENABLED} value={noSaleEnabled} handleClick={setNoSaleEnabled} />
                    <Checkbox title={ORDER_JUSTIFIED} value={requireJustify} handleClick={setrequireJustify} />
                </div>
                <div className="flex gap-2 mt-4 w-full justify-end">
                    <button
                        className="px-4 py-2 rounded-dx bg-primary-500/20 hover:bg-primary-500/35 text-main/80 hover:text-main text-xs font-medium cursor-pointer transition-all active:scale-95"
                        type="button"
                        onClick={handleCancel}>Cancelar</button>
                    <button
                        className="px-4 py-2 rounded-dx bg-focus-500 hover:bg-focus-300 text-variant text-xs font-semibold cursor-pointer transition-all shadow-xs active:scale-95"
                        type="submit">Confirmar</button>
                </div>
            </form>
        </div>
    );
};

export default CreationModal;

