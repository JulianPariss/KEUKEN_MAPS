import type { IClient } from "../../../../../../../../utils/types/sellerObserver/clients.types";


interface IClientItemProps {
    client: IClient;
    onClick: () => void;
}

const Item = (props: IClientItemProps) => {
    const { client, onClick } = props;
    return(
        <div className="bg-primary-dark/15 p-2 rounded-md my-2 flex flex-col justify-start border-1 border-secondary-light/30 cursor-pointer hover:bg-primary-light/15" onClick={onClick}>
            <h2 className="before:content-['#'] text-secondary-light font-bold">{client.code ?? 'No Code'}</h2>
            <p className="text-white">{client.address}</p>
        </div>
    )
}


export default Item;


