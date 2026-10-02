import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../../../store";
import moment from "moment";
import { changeDate } from "../../../../../../store/slices/sidebarSlice";

const DatePicker = () => {
    const { date } = useSelector((state: RootState) => state.sidebar);
    const dispatch = useDispatch();

    return(
        <>
            <input 
                className='bg-primary-light/20 border-1 border-primary-light/25 p-1 w-full rounded-md mt-4 focus:border-secondary-light focus:outline-none text-white shadow-xs shadow-black/20' 
                type='date' 
                defaultValue={moment(date).format('YYYY-MM-DD')}
                onChange={(event) => dispatch(changeDate(moment(event.target.value).toString()))}
            >

            </input>
        </>
    )
}

export default DatePicker;