import { EarthDetailIcon, TableIcon } from '@repo/icons';
import type { TViews } from "../../pages/home/strategy";
import type { PrittierDay, PrittierMode, TDayKey } from "../types/general.types";

export const DaysOfWeek: TDayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export const PrittierWeek: PrittierDay[] = [
    {
        title: 'Lunes',
        key: "monday"
    },
    {
        title: 'Martes',
        key: "tuesday"
    },
    {
        title: 'Miércoles',
        key: "wednesday"
    },
    {
        title: 'Jueves',
        key: "thursday"
    },
    {
        title: 'Viernes',
        key: "friday"
    },
    {
        title: 'Sabado',
        key: "saturday"
    },
    {
        title: 'Domingo',
        key: "sunday"
    }
]

export const PrittierViews: Record<TViews, PrittierMode> = {
    default: {
        title: 'Mapa',
        icon: EarthDetailIcon
    },
    mapView: {
        title: 'Mapa',
        icon: EarthDetailIcon
    },
    listView: {
        title: 'Lista',
        icon: TableIcon
    },
}

