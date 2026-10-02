import moment from "moment";
import type { IRoute } from "../../../utils/types/sellerObserver/sellers.types";

const TimeStampModal = (props: IRoute) => {
    return(
        <div className="min-w-[250px] mt-4 flex flex-col justify-center items-center">   
            <h4 className="text-white text-xl">{`${moment.utc(props.timestamp).format('HH:mm:ss')} || #${props.id}`}</h4>
        </div>  
    )
}

export default TimeStampModal;