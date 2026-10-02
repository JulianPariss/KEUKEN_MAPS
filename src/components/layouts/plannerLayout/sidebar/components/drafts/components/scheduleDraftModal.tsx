import { parseDate } from "@internationalized/date";
import { useModalRef } from "../../../../../../../utils/hooks/map/useContextRef";
import CustomDatePicker from "../../../../../../customDatePicker";
import { useCallback, useState } from "react";
import moment from "moment";
import { momentToCalendarDate } from "../../../../../../../utils/helpers/formatters";
import { useAppDispatch } from "../../../../../../../store/hooks";
import { updateDraftThunk } from "../../../../../../../store/slices/planner/draftsSlice";


interface IProps {
    draft_id: number;
    name: string;
}


const ScheduleDraftModal = (props: IProps) => {
    const dispatch = useAppDispatch();
    const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
    const { CloseModal } = useModalRef();
    const { draft_id, name } = props;

    const onConfirm = () => {
        dispatch(updateDraftThunk({
            draft_id,
            data: { scheduled_date: date }
        }))
        CloseModal();
    }

    const handleDateChange = (inpDate: any) => {
        const { year, month, day } = inpDate;
        if (!inpDate) return;
        const momentDate = moment({
            year,
            month: month - 1,
            day: day
        }).format('YYYY-MM-DD')
        setDate(momentDate);
    }


    const dateToCalendarDate = useCallback(() => {
        return momentToCalendarDate(date)
    }, [date]);

    return (
        <div className="w-[360px] max-w-full flex flex-col">
            <h2 className="text-main text-sm font-semibold leading-relaxed">
                ¿Está seguro de que desea programar el borrador <span className="text-focus-300 underline font-bold">{name}</span>?
            </h2>

            <div className="w-full flex flex-col justify-between mt-4">
                <CustomDatePicker
                    value={dateToCalendarDate()}
                    minValue={parseDate(moment().format('YYYY-MM-DD'))}
                    isInvalid={false}
                    handleChange={(event) => handleDateChange(event)}
                    variant="sidebar"
                    showDate={true}
                />
                <div className="flex justify-end w-full mt-6">
                    <button
                        type="button"
                        onClick={CloseModal}
                        className="px-3 py-1.5 rounded-dx text-xs font-medium text-main bg-primary-900 border border-main/15 hover:bg-primary-500/30 shadow-xs mr-2 cursor-pointer transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-3 py-1.5 rounded-dx text-xs font-medium text-variant bg-focus-500 hover:bg-focus-300 border border-focus-300/50 shadow-xs cursor-pointer transition-all"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleDraftModal;