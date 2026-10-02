import type { IStandarState } from "../general.types";
import type { ITag } from "../tags.types";

export interface ISellerState extends IStandarState {
    sellers: ISeller[];
    sellerById: { [key: number]: ISeller };
}


export interface ISeller {
    id: number;
    supervisorId: number;
    name: string;
    role: string;
    phoneNumber: string;
    color: string;
    tags: ITag[]
}