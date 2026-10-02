import moment from "moment"
import CustomDatePicker from "../../../../../customDatePicker"
import { useAppDispatch, useAppSelector } from "../../../../../../store/hooks";
import { resetClients } from "../../../../../../store/slices/sellerObserver/clientsSlice";
import { resetSeller } from "../../../../../../store/slices/sellerObserver/sellersSlice";
import { cancelAllRequests } from "../../../../../../services";
import { changeDate } from "../../../../../../store/slices/sidebarSlice";
import { useCallback } from "react";
import { momentToCalendarDate } from "../../../../../../utils/helpers/formatters";
import { parseDate } from "@internationalized/date";
import { useWindowSize } from "../../../../../../utils/hooks/layout/useWindowSize";
import { CalendarIcon } from '@repo/icons';

const DateSelector = () => {
    const dispatch = useAppDispatch();
    const { date } = useAppSelector((state) => state.sidebar)

    const handleDateChange = (inpDate: any) => {
        const { year, month, day } = inpDate;
        if (!inpDate) return;
        const momentDate = moment({
            year,
            month: month - 1,
            day: day
        })
        if (momentDate.isSame(date, 'day')) return;

        dispatch(resetClients());
        dispatch(resetSeller());

        cancelAllRequests();
        dispatch(changeDate(momentDate.toString()));
    }

    const dateToCalendarDate = useCallback(() => {
        return momentToCalendarDate(date)
    }, [date]);


    const { width } = useWindowSize();
    const isMobile = width < 1024;

    const renderDatePicker = () => {
        if (width === 0) return null; // Avoid hydration mismatch or layout shift

        if (isMobile) {
            return (
                <CustomDatePicker
                    value={(dateToCalendarDate())}
                    maxValue={parseDate(moment().format('YYYY-MM-DD'))}
                    isInvalid={false}
                    handleChange={(event) => handleDateChange(event)}
                    variant="mobile"
                    showDate={false}
                    triggerIcon={<CalendarIcon className="size-5 stroke-white" />}
                />
            )
        }

        return (
            <CustomDatePicker
                value={(dateToCalendarDate())}
                maxValue={parseDate(moment().format('YYYY-MM-DD'))}
                isInvalid={false}
                showDate={true}
                handleChange={(event) => handleDateChange(event)}
                variant="sidebar"
            />
        )
    }

    return (
        <div className="flex justify-between items-center w-full xl:w-[340px] h-full">
            {renderDatePicker()}
        </div>
    )
}

export default DateSelector;
