import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup"
import { useModalRef } from "../../../../../../../utils/hooks/map/useContextRef";

const schema = yup
    .object({
        filtername: yup.string().max(30, 'Ingrese un nombre más corto'),
    }).required();

interface IProps {
    onModalSubmit: (value: any) => void;
    defaultValue?: string;
}

const NewFilterModal = (props: IProps) => {
    const { onModalSubmit, defaultValue = '' } = props;

    const { CloseModal } = useModalRef();
    const {
        register,
        handleSubmit,
    } = useForm<any>(
        {
            resolver: yupResolver(schema),
        }
    )

    const onSubmit: SubmitHandler<any> = (data) => {
        onModalSubmit({ filtername: data.filtername });
        CloseModal();
    }

    const onCancel = () => {
        CloseModal();
    }

    return (
        <div className="flex flex-col h-fit w-[450px] max-w-full">
            <h4 className="text-main font-semibold text-sm mb-2">{defaultValue ? 'Editar un filtro existente' : 'Crear un nuevo filtro'}</h4>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                <div className="flex flex-col items-start w-full justify-between">
                    <div className="flex flex-col w-full gap-y-1.5">
                        <label className="text-main/70 text-xs font-medium">Nombre del filtro</label>
                        <input
                            {...register("filtername")}
                            placeholder="Ingrese el nombre del filtro"
                            type="text"
                            defaultValue={defaultValue}
                            autoFocus={true}
                            className="bg-primary-500/20 border border-main/15 focus:border-focus-300 p-2 rounded-dx w-full text-main placeholder:text-main/40 text-xs outline-none transition-colors shadow-xs"
                        />
                    </div>
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
                        className="px-3 py-1.5 rounded-dx text-xs font-medium text-variant bg-focus-500 hover:bg-focus-300 border border-focus-300/50 shadow-xs cursor-pointer transition-all"
                    >
                        Confirmar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewFilterModal; 