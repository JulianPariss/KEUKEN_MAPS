import { LoadingIcon } from '@repo/icons';

export interface IKpiItemProps {
    isLoading?: boolean;
    currentValue: number | string;
    totalValue?: number | string;
    unit?: string;
    primary?: boolean;
    subtitle: string;
    className?: string;
}

const KpiItem = ({
    isLoading = false,
    currentValue,
    totalValue,
    unit,
    primary = false,
    subtitle,
    className = '',
}: IKpiItemProps) => {
    return (
        <div className={`flex flex-col items-center p-1.5 rounded-dx bg-primary-500/20 border border-main/10 shadow-xs ${className}`}>
            {isLoading ? (
                <LoadingIcon className="animate-[spin_1s_linear_reverse_infinite] size-6 fill-main" />
            ) : (
                <div className="flex items-baseline gap-x-1">
                    <p className={`text-base font-bold ${primary ? 'text-focus-300' : 'text-main'}`}>{currentValue}</p>
                    {totalValue !== undefined && (
                        <p className="text-xs text-main/50">/ <span>{totalValue}</span></p>
                    )}
                    {unit && (
                        <span className="text-[10px] text-main/50 font-normal">{unit}</span>
                    )}
                </div>
            )}
            <p className="text-xs text-center text-main/80 font-normal">{subtitle}</p>
        </div>
    );
};

export default KpiItem;
