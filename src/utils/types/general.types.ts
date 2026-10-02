import type { FunctionComponent, SVGProps } from "react";

export interface IStandarState {
    loading: boolean;
    error: any;
}

export interface ICPDResponse {
    message: string;
    data?: number;
}

export interface ISelectOption {
    label: string;
    key: string | number;
    id: string | number;
}

export type TPlacement = 'bottom' | 'bottom left' | 'bottom right' | 'bottom start' | 'bottom end' |
    'top' | 'top left' | 'top right' | 'top start' | 'top end' |
    'left' | 'left top' | 'left bottom' | 'start' | 'start top' | 'start bottom' |
    'right' | 'right top' | 'right bottom' | 'end' | 'end top' | 'end bottom';

export interface IListBoxItem {
    label: string;
    key: string | number;
    id: string | number;
}

export interface PrittierDay {
    title: string;
    key: TDayKey;
}

export interface PrittierMode {
    title: string;
    icon: FunctionComponent<SVGProps<SVGSVGElement>>;
}

export type TDayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type TWeekCheck = Record<TDayKey, boolean>;