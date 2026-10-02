import { LeftContentStyles as Styles } from "./styles";
import { motion } from "motion/react";
import { changeEnterprise } from "../../../../../../store/slices/userSlice";
import { useAppDispatch, useAppSelector } from "../../../../../../store/hooks";
import type { IEnterprise } from "../../../../../../utils/types/auth.types";
import { resetClients } from "../../../../../../store/slices/sellerObserver/clientsSlice";
import { resetGeozone } from "../../../../../../store/slices/sellerObserver/geozonesSlice";
import { resetSeller } from "../../../../../../store/slices/sellerObserver/sellersSlice";
import { resetPortfolio } from "../../../../../../store/slices/sellerObserver/portfolioSlice";
import { resetHistory } from "../../../../../../store/slices/sellerObserver/historySlice";
import { cancelAllRequests } from "../../../../../../services";
import {
    resetDrafts,
    resetGeozone as resetDraftGeozone,
    resetHistory as resetDraftHistory,
    resetSeller as resetDraftSeller
} from "../../../../../../store/slices/planner/draftsSlice";

interface IProps {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
}

const EnterpriseSelector = (props: IProps) => {
    const { isOpen, setIsOpen } = props;
    const { auth } = useAppSelector((state) => state.auth)
    const { enterprises } = auth;

    const dispatch = useAppDispatch();

    const enterpriseChange = (enterprise: IEnterprise) => {
        cancelAllRequests();

        dispatch(resetClients());
        dispatch(resetGeozone());
        dispatch(resetSeller());
        dispatch(resetPortfolio());
        dispatch(resetHistory());

        dispatch(resetDrafts());
        dispatch(resetDraftGeozone());
        dispatch(resetDraftHistory());
        dispatch(resetDraftSeller());

        dispatch(changeEnterprise(enterprise));

        setIsOpen(false);
    }

    return (
        <motion.div
            style={{
                overflow: 'hidden',
            }}
            animate={{
                height: isOpen ? 'auto' : '0px',
                maxHeight: isOpen ? '150px' : '0px',
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-[90%] rounded-b-dx relative flex flex-col items-center bg-primary-900/90 backdrop-blur-xl shadow-inner -top-1"
        >
            <div className="overflow-y-auto w-full h-full divide-y divide-main/5">
                {enterprises.map((enterprise, index) => (
                    <button
                        className={Styles.enterpriseButton(!!(index % 2))}
                        onClick={() => enterpriseChange(enterprise)}
                        key={enterprise.enterprise_id}
                    >
                        {enterprise.name}
                    </button>
                ))}
            </div>
        </motion.div>
    );
};

export default EnterpriseSelector;