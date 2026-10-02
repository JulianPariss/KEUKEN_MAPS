import type { ITag } from "../tags.types";

export interface IFilter {
    name?: string;
    tag: ITag[]
}

export interface IRemovedFilter {
    name: string;
    id: number;
    create_at: string;
    update_at: string;
}

export interface IFilterPack {
    filter_id: number;
    filter: string;
    tag: ITag[];
}
