import type { IStandarState } from "../general.types";
import type { IOrder } from "./sellers.types";

export type TClientStatus = 'VISITED' | 'NOSALE' | 'NOVISITED' | 'PENDING' | 'UNJUSTIFIED' | 'UNKOWN';

export interface IVisits {
    start: string | Date;
    end: string | Date;
}

export interface IClient {
    name: string;
    location: {
        longitude: number | null;
        latitude: number | null;
    };
    code: string;
    address: string;
    visited: boolean;
    mobileUser: string;
    from_route: boolean;
    hasOrder: boolean;
    orderListInRadius: string[];
    orderListNotInRadius: string[];
    inRoute: boolean;
    totalMinutes: number;
    visits: IVisits[];
}

export interface IClientsState extends IStandarState {
    clients: IClient[];
    clientsBySeller: { [key: string]: IClient[] };
    clientsById: { [key: string]: number };
    clientsOrders: {
        orders: { [key: number]: IOrder[] };
        loading: boolean;
        error: any;
    }
    visible: boolean;
}


export interface IClientPortfolio {
    portfolio_id: number;
    client_id: number;
    id: number;
}

export const clientToOrder = (client: IClient): IOrder => {
    const visitStart = client.visits?.[0]?.start;

    return {
        clientData: {
            location: client.location,
            name: client.name,
            address: client.address,
            code: client.code,
            phone: '',
            inRoute: client.inRoute,
        },
        uuid: "",
        UID_mobile: "",
        total: 0,
        totalWithTaxes: 0,
        noSaleReason: "",
        noSaleReasonId: 0,
        closed_lat: "",
        closed_long: "",
        open_lat: "",
        open_long: "",
        t_created: visitStart ? String(visitStart) : "",
        t_closed: "",
        battery: null,
        notInRadiusId: null,
        notInRadiusReason: null,
        saving_energy_mode: null,
    };
};
