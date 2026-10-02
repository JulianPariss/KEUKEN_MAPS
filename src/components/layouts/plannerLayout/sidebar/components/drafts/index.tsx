import { useState, type RefObject } from "react";
import type { IListBoxItem } from "../../../../../../utils/types/general.types";
import CustomSelect from "../../../../../customSelect";
import { AddOutlinedIcon, CalendarIcon, CrossIcon, LoadingIcon, SubsOutilinedIcon } from '@repo/icons';
import { useModalRef, useNotifyRef } from "../../../../../../utils/hooks/map/useContextRef";
import NewDraftModal from "./components/newDraftModal";
import { createDraft, duplicateDraft } from "../../../../../../services/plannerServices/draft.service";
import { useAppDispatch, useAppSelector } from "../../../../../../store/hooks";
import { addNewDraft, updateDraftThunk } from "../../../../../../store/slices/planner/draftsSlice";
import Skeleton from "../../../../../skeleton";
import DeleteDraftModal from "./components/deleteDraftModal";
import ConfirmableButton from "../../../../../customConfirmableButton";
import ScheduleDraftModal from "./components/scheduleDraftModal";
import moment from "moment";

interface IProps {
    sidebarRef: RefObject<HTMLDivElement | null>;
    currentDraft: number;
    setCurrentDraft: (value: number) => void;
}

const DraftSection = (props: IProps) => {
    const dispatch = useAppDispatch();
    const notify = useNotifyRef();
    const { drafts, loading, error } = useAppSelector((state) => state.drafts);
    const { enterprise } = useAppSelector((state) => state.user);
    const { OpenModal } = useModalRef();
    const { currentDraft, setCurrentDraft } = props;

    const [addLoading, setAddLoading] = useState<boolean>(false);

    const Options: IListBoxItem[] = drafts?.map((drf) => {
        return {
            label: drf.name,
            key: drf.id,
            id: drf.id
        }
    }) ?? [];

    const hanldeCreateDraft = (data: { draftname: string, draft_id?: number }) => {
        setAddLoading(true);
        const draftname = data.draftname.toUpperCase();

        if (data.draft_id) {
            duplicateDraft(enterprise.enterprise_id, data.draft_id, { draftname }).then((res) => {
                dispatch(addNewDraft(res));
                setCurrentDraft(res.id);
            }).catch((e) => {
                notify(e.detail ?? 'No se pudo crear el borrador', 'ERROR');
            }).finally(() => setAddLoading(false));
        } else {
            createDraft(enterprise.enterprise_id, { draftname }).then((res) => {
                dispatch(addNewDraft(res));
                setCurrentDraft(res.id);
            }).catch((e) => {
                notify(e.detail ?? 'No se pudo crear el borrador', 'ERROR');
            }).finally(() => setAddLoading(false));
        }
    }

    const HAVESELECTED = currentDraft !== -1;
    const DRAFTSELECTED = HAVESELECTED ? drafts.find((dr) => dr.id === currentDraft) : null;

    return (
        <div className="w-full">
            <h2 className="text-sm font-semibold text-main my-1">Borradores</h2>
            <div className="flex items-center gap-x-2 w-full">
                {!loading && drafts && enterprise.enterprise_id !== -1 && !error ? (
                    drafts.length > 0 ? (
                        <>
                            <div className="bg-primary-950/40 backdrop-blur-xl border border-main/10 p-1 rounded-dx w-full shadow-xs">
                                <CustomSelect
                                    placement="bottom"
                                    options={Options}
                                    handleChange={setCurrentDraft}
                                    value={HAVESELECTED ? currentDraft : -1}
                                />
                            </div>
                            <div className="w-fit flex items-center gap-x-1.5">
                                <div
                                    className="bg-focus-500 hover:bg-focus-300 p-2 rounded-dx shadow-xs flex justify-center items-center cursor-pointer transition-all border border-focus-300/50 text-variant"
                                    onClick={() =>
                                        OpenModal({
                                            Component: <NewDraftModal onModalSubmit={hanldeCreateDraft} />,
                                            isRequired: false,
                                        })
                                    }
                                >
                                    {!addLoading ? (
                                        <AddOutlinedIcon className="size-4.5 stroke-variant" />
                                    ) : (
                                        <LoadingIcon className="animate-[spin_1s_linear_reverse_infinite] size-4.5 fill-variant" />
                                    )}
                                </div>
                                <div
                                    className={`
                                        p-2 rounded-dx flex justify-center items-center transition-all border shadow-xs
                                        ${HAVESELECTED ? 'bg-error hover:bg-error/80 border-error/50 text-white cursor-pointer' : 'bg-primary-500/20 border-main/10 text-main/30 cursor-not-allowed'}
                                    `}
                                    onClick={() =>
                                        HAVESELECTED
                                            ? OpenModal({
                                                  Component: <DeleteDraftModal name={DRAFTSELECTED?.name ?? ''} draft_id={currentDraft} />,
                                                  isRequired: false,
                                              })
                                            : notify('Primero debe seleccionar un borrador.', 'INFO')
                                    }
                                >
                                    <SubsOutilinedIcon className={`size-4.5 ${HAVESELECTED ? 'stroke-white' : 'stroke-main/30'}`} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div
                            className="bg-focus-500 hover:bg-focus-300 p-2.5 rounded-dx shadow-xs flex justify-between items-center cursor-pointer w-full text-variant transition-all border border-focus-300/50"
                            onClick={() =>
                                OpenModal({
                                    Component: <NewDraftModal onModalSubmit={hanldeCreateDraft} />,
                                    isRequired: false,
                                })
                            }
                        >
                            <div className="w-full justify-between items-center flex">
                                <p className="text-variant text-xs font-semibold">Cree su primer borrador</p>
                                <AddOutlinedIcon className="size-4.5 stroke-variant" />
                            </div>
                        </div>
                    )
                ) : (
                    <Skeleton className="!h-10 !rounded-dx" />
                )}
            </div>
            {HAVESELECTED && (
                <>
                    {!DRAFTSELECTED?.scheduled_date ? (
                        <div className="mt-2">
                            <ConfirmableButton
                                className="w-full bg-focus-500 hover:bg-focus-300 text-variant rounded-dx shadow-xs p-2 text-xs font-medium border border-focus-300/50 transition-all cursor-pointer"
                                onClick={() =>
                                    !loading &&
                                    OpenModal({
                                        Component: <ScheduleDraftModal draft_id={currentDraft} name={DRAFTSELECTED?.name ?? ''} />,
                                        isRequired: false,
                                    })
                                }
                            >
                                <div className="flex justify-between items-center w-full">
                                    <p className="text-variant text-xs font-medium">Programar aplicación</p>
                                    {!loading ? (
                                        <CalendarIcon className="size-4.5 stroke-variant" />
                                    ) : (
                                        <LoadingIcon className="animate-[spin_1s_linear_reverse_infinite] size-4.5 fill-variant" />
                                    )}
                                </div>
                            </ConfirmableButton>
                        </div>
                    ) : !DRAFTSELECTED?.processed_timestamp ? (
                        <div className="mt-2 flex flex-col gap-y-1.5">
                            <ConfirmableButton
                                className="w-full bg-error hover:bg-error/80 text-white rounded-dx shadow-xs p-2 text-xs font-medium border border-error/50 transition-all cursor-pointer"
                                onClick={() =>
                                    !loading && dispatch(updateDraftThunk({ draft_id: currentDraft, data: { scheduled_date: null } }))
                                }
                            >
                                <div className="flex justify-between items-center w-full">
                                    <p className="text-white text-xs font-medium">Cancelar la programación</p>
                                    {!loading ? (
                                        <CrossIcon className="size-4.5 stroke-white" />
                                    ) : (
                                        <LoadingIcon className="animate-[spin_1s_linear_reverse_infinite] size-4.5 fill-white" />
                                    )}
                                </div>
                            </ConfirmableButton>
                            <p className="text-main/50 text-xs italic ml-1">
                                Programado para el {moment(DRAFTSELECTED.scheduled_date).format('DD/MM/YYYY')}
                            </p>
                        </div>
                    ) : (
                        <div className="mt-2 flex flex-col gap-y-1 bg-primary-950/60 backdrop-blur-xl border border-main/10 p-2.5 rounded-dx shadow-xs text-xs">
                            <p className="text-main/80">
                                El borrador ya fue procesado el{' '}
                                <span className="underline text-focus-300 font-semibold">
                                    {moment(DRAFTSELECTED?.processed_timestamp).format('DD/MM/YYYY')}
                                </span>
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DraftSection;
