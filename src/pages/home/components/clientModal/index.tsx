import { useAppSelector } from "../../../../store/hooks";
import type { IClient } from "../../../../utils/types/sellerObserver/clients.types";

export interface IProps extends IClient {
    sellerId: string | number;
}

const ClientModal = (props: IProps) => {
    const {sellers} = useAppSelector((state) => state.sellers)

    return(
        <div className="w-[900px] mt-4 flex flex-col justify-center">   
            <div className="w-full flex justify-between mb-5 flex-col bg-primary-main/10 p-5 rounded-lg">
                <h2 className="text-white text-xl font-bold">{props.name} <span className="text-secondary-light before:content-['#']">{props.code}</span></h2>
                <h3 className="text-white/60 text-md">Vendedor a cargo: {sellers.find((sl) => sl.seller === props.sellerId)?.sellerName} <span className="text-secondary-light before:content-['#']">{props.sellerId}</span></h3>
            </div>
            <div className="w-full flex justify-between mb-5 flex-row bg-primary-main/10 p-5 rounded-lg mt-2">
                <p className="text-white">Direccion: {props.address}</p>
                <p className="text-white/70 text-sm">{props.inRoute ? 'En Ruta' : 'Fuera de Ruta'} | {props.visited ? 'Viistado' : 'No Visitado'}</p>
            </div>
        </div>
    )
}

export default ClientModal;