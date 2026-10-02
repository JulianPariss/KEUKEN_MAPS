import moment from "moment";
import { BatteryFullIcon, BatteryLowIcon, BatteryMidIcon, BatteryUnknowIcon } from '@repo/icons';
import { CalendarDate } from "@internationalized/date";

export const formatMoney = (value: number): string => {
        return value
                .toFixed(2)
                .replace('.', ',')
                .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export const formatWeight = (value: number): string => {
        if (value === undefined || value === null || isNaN(value)) return '0,00';
        const reg = /^-?\d+(?:\.\d{0,2})?/;
        const match = value.toString().match(reg);
        const truncatedStr = match ? match[0] : value.toFixed(2);
        return parseFloat(truncatedStr).toFixed(2).replace('.', ',');
}

export const metersToKilometers = (value: number): string => {
        return (`${(value / 1000).toFixed(3)} Km`)
}


export const batteryToIcon = (value: string | null | undefined) => {
        if (!value) return BatteryUnknowIcon;

        const cleanValue = value.replace(/[^\d.]/g, '');
        const batteryCharge = parseFloat(cleanValue);

        if (batteryCharge <= 100 && batteryCharge > 65) {
                return BatteryFullIcon;
        } else if (batteryCharge <= 65 && batteryCharge > 30) {
                return BatteryMidIcon;
        } else {
                return BatteryLowIcon;
        }
};

type FormatType = 'grades' | 'time';

export const formatMinutes = (
        value: number,
        type: FormatType = 'grades'
): string => {
        if (!Number.isFinite(value) || value < 0) {
                return type === 'grades' ? `00'00"` : `00m 00s`;
        }

        const totalSeconds = Math.round(value * 60);

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const hh = hours.toString().padStart(2, "0");
        const mm = minutes.toString().padStart(2, "0");
        const ss = seconds.toString().padStart(2, "0");

        if (hours > 0) {
                return type === 'grades'
                        ? `${hh}:${mm}:${ss}`
                        : `${hh}h ${mm}m ${ss}s`;
        }

        return type === 'grades'
                ? `00:${mm}:${ss}`
                : `00h ${mm}m ${ss}s`;
};



export const capitalizeAllWords = (str: string | null) => {
        if (typeof str !== 'string' || str.trim().length === 0) {
                return str; // Maneja null, undefined, o strings vacíos
        }

        return str
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
};


export const momentToCalendarDate = (date: string | Date): CalendarDate => {
        const momentDate = moment(date);
        return new CalendarDate(momentDate.year(), momentDate.month() + 1, momentDate.date());

}
