import { useState } from "react";
import { useModalRef } from "../../../../../../../utils/hooks/map/useContextRef";
import { useForm, type SubmitHandler } from "react-hook-form";
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup";
import CustomSelect from "../../../../../../customSelect";
import type { ISelectOption } from "../../../../../../../utils/types/general.types";
import { CheckIcon, CrossIcon } from '@repo/icons';
import { useAppSelector } from "../../../../../../../store/hooks";

interface IProps {
    onModalSubmit: (data: { draftname: string }) => void;
}

const schema = yup
    .object({
        draftname: yup.string().max(30, 'Ingrese un nombre más corto'),
    }).required();


const NewDraftModal = (props: IProps) => {

    const { drafts } = useAppSelector((state) => state.drafts)
    const [error, setError] = useState<boolean>(false);

    const [useDraftAsTemplate, setUseDraftAsTemplate] = useState<boolean>(false);
    const [draftSelected, setDraftSelected] = useState<number | null>(null)

    const { CloseModal } = useModalRef();
    const { onModalSubmit } = props;
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<any>(
        {
            resolver: yupResolver(schema),
        }
    )

    const validateName = (_: string): boolean => {
        return false;
    }

    const onSubmit: SubmitHandler<any> = (data: { draftname: string }) => {
        if (validateName(data.draftname)) {
            setError(true);
        } else {
            onModalSubmit({
                ...data,
                ...(useDraftAsTemplate && { draft_id: draftSelected }),
            });
            CloseModal();
        }
    }

    const onCancel = () => {
        CloseModal();
    }

    const Checkbox = ({ toggleCheck, isChecked }: { toggleCheck: () => void; isChecked: boolean }) => {
        return (
            <div
                onClick={toggleCheck}
                className={`
                    flex items-center justify-center
                    size-9 rounded-dx cursor-pointer select-none
                    transition-colors duration-150
                    ${isChecked ? 'bg-focus-500 text-variant border border-focus-300/50 shadow-xs' : 'bg-primary-500/20 border border-main/15 hover:bg-primary-500/40 text-main/60'}
                `}
            >
                {isChecked ? (
                    <CheckIcon className="size-4 stroke-variant" strokeWidth={3} />
                ) : (
                    <CrossIcon className="size-4 stroke-main/40" strokeWidth={3} />
                )}
            </div>
        );
    };

    const DraftSelectOptions: ISelectOption[] = drafts.map((drf) => {
        return {
            label: drf.name,
            key: drf.id,
            id: drf.id
        };
    });

    const handleCheck = (value: boolean) => {
        if (!value) setDraftSelected(null);
        setUseDraftAsTemplate(value);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="w-[480px] max-w-full">
            <div className="flex flex-col items-start w-full justify-between gap-y-4">
                <div className="flex flex-col w-full gap-y-1.5">
                    <h4 className="text-main font-semibold text-sm">Nombre del Borrador</h4>
                    <div className="w-full flex justify-between">
                        <input
                            {...register("draftname")}
                            placeholder="Ingrese un nombre para el borrador"
                            type="text"
                            autoFocus={true}
                            className="bg-primary-500/20 border border-main/15 focus:border-focus-300 p-2 rounded-dx w-full text-main placeholder:text-main/40 text-xs outline-none transition-colors shadow-xs"
                            defaultValue=""
                        />
                    </div>
                </div>
                <div className="flex flex-col w-full gap-y-1.5">
                    <h4 className="text-main font-semibold text-sm">Utilizar un borrador como plantilla</h4>
                    <div className="flex gap-x-2 w-full items-center">
                        <Checkbox toggleCheck={() => handleCheck(!useDraftAsTemplate)} isChecked={useDraftAsTemplate} />
                        <div className={`bg-primary-500/20 p-1.5 rounded-dx border border-main/15 w-full transition-opacity ${!useDraftAsTemplate ? 'opacity-40 pointer-events-none' : ''}`}>
                            <CustomSelect
                                disabled={!useDraftAsTemplate}
                                className=""
                                options={DraftSelectOptions}
                                handleChange={(value: number | null) => setDraftSelected(value)}
                                value={draftSelected ?? -1}
                            />
                        </div>
                    </div>
                </div>
                <p className={`${error ? 'visible' : 'invisible'} text-xs text-error font-medium`}>* El nombre elegido ya está siendo utilizado por otra geozona.</p>
                <span className={`text-error text-xs ${!errors.draftname ? "invisible" : "visible"}`}>{`*${errors.draftname?.message}`}</span>
                <div className="flex justify-end w-full mt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-3 py-1.5 rounded-dx text-xs font-medium text-main bg-primary-900 border border-main/15 hover:bg-primary-500/30 shadow-xs mr-2 cursor-pointer transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        disabled={useDraftAsTemplate && !draftSelected}
                        type="submit"
                        className="px-3 py-1.5 rounded-dx text-xs font-medium text-variant bg-focus-500 hover:bg-focus-300 border border-focus-300/50 shadow-xs cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </form>
    );
};

export default NewDraftModal; 
