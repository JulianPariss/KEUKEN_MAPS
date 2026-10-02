import type { IStandarState } from "./general.types";
import type { IFilterPack } from "./sellerObserver/filters.types";

export interface ITagGroup {
    id: number,
    key: string;
    title: string;
    labels: string[];
}

export interface ITag {
    key: string;
    labels: string[];
}

export interface ITagState extends IStandarState {
    clientsTagList: ITagGroup[];
    sellersTagList: ITagGroup[];
    draftGeozonesTagList: ITagGroup[];
    geozonesTagList: ITagGroup[];
    clientsFilterList: IFilterPack[];
}