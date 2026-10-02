import { useEffect, useState, type RefObject } from "react";
import { useAppSelector } from "../../../../../../store/hooks";
import { Virtuoso } from "react-virtuoso";
import Item from "./components/item";
import ExpandibleList from "../../../../../expandableList";
import Empty from "../../../../../empty";

interface IProps {
    sidebarRef: RefObject<HTMLDivElement | null>;
}

const ClientSection = (props: IProps) => {
    const [searchValue, setSearchValue] = useState<string>('');
    const { clients, loading } = useAppSelector((state) => state.deliveryClients);

    const getRelevance = (client: any) => {
        const search = searchValue.toLowerCase();
        let score = 0;

        if (client.id?.toString().toLowerCase().startsWith(search)) score += 2;
        else if (client.id?.toString().toLowerCase().includes(search)) score += 1;

        if (client.name?.toLowerCase().startsWith(search)) score += 2;
        else if (client.name?.toLowerCase().includes(search)) score += 1;

        if (client.address?.toLowerCase().includes(search)) score += 1;

        return score;
    };

    useEffect(() => {
        console.log(clients);
    }, [])


    const filteredClients = [...clients]
        .filter((a) => getRelevance(a) > 0)
        .sort((a, b) => getRelevance(b) - getRelevance(a));

    return (
        <ExpandibleList
            ammountItems={`${filteredClients.length}/${clients.length}`}
            title="Clientes"
            isSticky
            setSearchValue={setSearchValue}
            sidebarRef={props.sidebarRef}
            isLoading={loading}
        >
            <div>
                {filteredClients.length > 0 ? (
                    <Virtuoso
                        style={{ height: '350px', width: '100%' }}
                        data={filteredClients}
                        itemContent={(_, client) => (
                            <Item
                                key={client.id}
                                sidebarRef={props.sidebarRef}
                                {...client}
                            />
                        )}
                    />
                ) : (
                    <Empty text="No hay clientes que coincidan con la búsqueda." />
                )}
            </div>
        </ExpandibleList>
    )
}

export default ClientSection;
