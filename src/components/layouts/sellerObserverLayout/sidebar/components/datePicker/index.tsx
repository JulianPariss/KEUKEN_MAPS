import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../../../store";
import moment from "moment";
import { changeDate } from "../../../../../../store/slices/sidebarSlice";

const DatePicker = () => {
    const { date } = useSelector((state: RootState) => state.sidebar);
    const dispatch = useDispatch();

    return (
        <input 
            className="bg-primary-500/20 border border-main/15 p-1.5 px-3 w-full rounded-dx mt-4 focus:border-focus-300 focus:outline-none text-main text-xs shadow-xs transition-colors" 
            type="date" 
            defaultValue={moment(date).format('YYYY-MM-DD')}
            onChange={(event) => dispatch(changeDate(moment(event.target.value).toString()))}
        />
    );
};

export default DatePicker;