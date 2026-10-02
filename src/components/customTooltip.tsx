import { Tooltip, TooltipTrigger, OverlayArrow, Button } from 'react-aria-components';
import { useTheme } from '@repo/ui/theme';

export const CustomTooltip = ({ message }: { message: string }) => {
    useTheme();

    return (
        <TooltipTrigger
            delay={500}
            closeDelay={100}
        >
            <Button
                aria-label="Información"
                className="rounded-full bg-focus-500/10 hover:bg-focus-500 border border-focus-300/40 size-4 flex items-center justify-center cursor-help transition-all outline-none focus:ring-2 focus:ring-focus-300/50"
                onClick={() => { }}
            >
                <span className="text-variant text-[11px] font-bold select-none leading-none">?</span>
            </Button>
            <Tooltip
                offset={8}
                className="
                relative z-[9999999]!
                backdrop-blur-xl border text-xs font-medium rounded-dx py-1.5 px-3 shadow-2xl outline-none flex items-center gap-x-2
                transition-all animate-in fade-in duration-150
                "
                style={{
                    backgroundColor: 'color-mix(in srgb, var(--tooltip-bg) 95%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--tooltip-border) 15%, transparent)',
                    color: 'var(--tooltip-text)',
                }}
            >
                <p className="select-none leading-tight max-w-[260px]" style={{ color: 'var(--tooltip-text)' }}>{message}</p>
                <OverlayArrow>
                    <svg width={8} height={8} viewBox="0 0 8 8" className="stroke-1 rotate-180" style={{ fill: 'color-mix(in srgb, var(--tooltip-bg) 95%, transparent)', stroke: 'color-mix(in srgb, var(--tooltip-border) 15%, transparent)' }}>
                        <path d="M0 8 L4 0 L8 8" />
                    </svg>
                </OverlayArrow>
            </Tooltip>
        </TooltipTrigger>
    );
};