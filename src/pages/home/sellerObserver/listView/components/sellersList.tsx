import { useAppSelector } from "../../../../../store/hooks";
import BaseSellersList from "../../../components/BaseSellersList";

const SellersList = () => {
    const { sellers, loading: sellersLoading } = useAppSelector((state) => state.sellers);

    return (
        <BaseSellersList sellers={sellers} sellersLoading={sellersLoading} />
    )
}

export default SellersList;