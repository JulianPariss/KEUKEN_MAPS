import type { IStandarState } from "../general.types";
import type { IHistoryState } from "../sellerObserver/history.types";
import type { IGeoZonesState } from "./geozones.types";
import type { ISellerState } from "./sellers.types";

export type TStatusDraft = 'new' | 'delete' | 'modified' | 'production';

export interface IDraft {
    name: string;
    id: number;
    creation_user: number;
    create_at: string;
    update_at: string;
    scheduled_date: string;
    processed_timestamp: string;
    correlation_id: string;
}

export interface IDraftState extends IStandarState {
    currentDraft: number;
    drafts: IDraft[];
    geozones: IGeoZonesState;
    sellers: ISellerState;
    history: IHistoryState;
}