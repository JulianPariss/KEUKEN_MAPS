import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, type SubmitHandler } from "react-hook-form"
import * as yup from "yup"
import { useModalRef } from "../../../../../../../utils/hooks/map/useContextRef";
import { useState } from "react";
import { useAppSelector } from "../../../../../../../store/hooks";
import { getRandomHexColor } from "@repo/map-core";
import type { IPlannerGeodata } from "../../../../../../../utils/types/geozones.types";
import LabelCreator from "../../../../../../labelCreator";

const schema = yup
    .object({
        geoname: yup.string().max(30, 'Ingrese un nombre más corto').required('Este campo es requerido.'),
        geocolor: yup.string().min(7).max(7).required('Este campo es requerido.'),
    }).required();

interface IProps {
    onModalSubmit: (value: IPlannerGeodata) => void;
    defaultValues?: IPlannerGeodata,
}

const GeoModal = (props: IProps) => {
    const [tags, setTags] = useState<string[]>([]);
    const [error, setError] = useState<boolean>(false);
    const currentDraft = useAppSelector((state) => state.drafts.currentDraft);
    const { geozones } = useAppSelector((state) => state.drafts.geozones);
    const { CloseModal } = useModalRef();
    const { onModalSubmit, defaultValues } = props;
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<any>(
        {
            resolver: yupResolver(schema),
        }
    )

    const validateName = (data: any): boolean => {
        return geozones.some((geo) => ((geo.name.toLowerCase().trim() === data.geoname.toLowerCase().trim()) && (geo.id !== defaultValues?.id)));
    }

    const onSubmit: SubmitHandler<any> = (data) => {
        if (validateName(data)) {
            setError(true);
        } else {
            onModalSubmit({ geoname: data.geoname, color: data.geocolor, draft_id: currentDraft, tags: [{ key: "geozone", labels: tags }] });
            CloseModal();
        }
    }

    const onCancel = () => {
        CloseModal();
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-[480px] max-w-full">
            <div className="flex flex-col items-start w-full justify-between">
                <h4 className="text-main font-semibold text-sm mb-2">Nombre de la Geo Zona</h4>
                <div className="w-full flex justify-between items-center gap-x-2">
                    <div className="bg-primary-500/20 border border-main/15 p-1 rounded-dx size-10 shrink-0 flex justify-center items-center shadow-xs">
                        <input
                            {...register("geocolor")}
                            type="color"
                            className="rounded-full outline-none size-7 border border-main/20 cursor-pointer bg-transparent"
                            defaultValue={defaultValues?.color ?? getRandomHexColor()}
                        />
                    </div>
                    <input
                        {...register("geoname")}
                        placeholder="Ingrese el nombre"
                        type="text"
                        autoFocus={true}
                        className="bg-primary-500/20 border border-main/15 focus:border-focus-300 p-2 rounded-dx w-full text-main placeholder:text-main/40 text-xs outline-none transition-colors shadow-xs"
                        defaultValue={defaultValues?.geoname ?? ''}
                    />
                </div>
                <div className="w-full h-fit mt-4">
                    <LabelCreator suggValues={watch("geoname") ?? ''} defaultValues={defaultValues?.tags?.[0] ? defaultValues.tags[0].labels : []} setParsedData={setTags} />
                </div>
                <p className={`${error ? 'visible' : 'invisible'} text-xs text-error mt-1 font-medium`}>* El nombre elegido ya está siendo utilizado por otra geozona.</p>
                <span className={`text-error text-xs ${!errors.geoname ? "invisible" : "visible"}`}>{`*${errors.geoname?.message}`}</span>
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
            </div>
        </form>
    );
};

export default GeoModal;