import type { IHistoryClient, THistoryDayKey } from "../../../utils/types/sellerObserver/history.types";
import type { IPortfolio } from "../../../utils/types/sellerObserver/portfolios.types";
import { useTheme } from "@repo/ui/theme";

interface IProps {
    client: IHistoryClient;
    allPortfolio: IPortfolio[];
}

const daysOfWeek: THistoryDayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const ClientHistoryTooltip = (props: IProps) => {
    const { client, allPortfolio } = props;
    useTheme();

    const buttonLabel: Record<THistoryDayKey, { label: string }> = {
        monday: { label: 'Lu' },
        tuesday: { label: 'Ma' },
        wednesday: { label: 'Mi' },
        thursday: { label: 'Ju' },
        friday: { label: 'Vi' },
        saturday: { label: 'Sa' },
        sunday: { label: 'Do' },
        unknow: { label: '-' }
    }

    const DayButton = (props: { day: THistoryDayKey, hasVisit: boolean }) => {
        const { day, hasVisit } = props;
        return (
            <div className={`size-5 rounded-full flex justify-center items-center text-[9px] font-semibold transition-colors ${
                hasVisit
                    ? 'bg-focus-500 text-variant shadow-xs font-bold'
                    : 'bg-main/10 text-main/40'
            }`}>
                {buttonLabel[day].label}
            </div>
        )
    }

    return (
        <div className="flex flex-col items-start min-w-[340px] text-main font-sans">
            <div className="w-full">
                <p className="text-[10px] uppercase tracking-wider text-main/50 font-semibold">Cliente</p>
                <div className="flex justify-between items-baseline gap-x-2">
                    <p className="text-sm font-bold text-main truncate">{client.name}</p>
                    <span className="text-xs font-mono text-focus-300 font-semibold">#{client.id}</span>
                </div>
            </div>

            <hr className="w-full border-main/10 my-2" />

            <div className="flex flex-col gap-y-0.5 items-start w-full">
                <div className="w-full">
                    <p className="text-[10px] uppercase tracking-wider text-main/50 font-semibold">Dirección</p>
                    <p className="text-xs font-medium text-main/90 truncate">{client.address}</p>
                </div>

                <hr className="w-full border-main/10 my-2" />

                {allPortfolio.length > 0 ? (
                    <>
                        <p className="text-[10px] uppercase tracking-wider text-main/50 font-semibold mb-1">Carteras</p>
                        {client.portfoliolist.map((pr, index) => {
                            const prName = allPortfolio.filter((p) => p.id === pr.id)[0]?.name ?? 'Cartera';

                            return (
                                <div
                                    key={`${pr.id}-${index}`}
                                    className="flex flex-col bg-main/5 border border-main/10 rounded-dx px-2.5 py-1.5 border-l-4 border-l-focus-500 w-full mb-1.5 shadow-xs"
                                >
                                    <div className="flex justify-between items-center gap-x-4">
                                        <p className="text-xs font-semibold text-main/90">{prName}</p>
                                        <div className="flex items-center gap-x-1">
                                            <span className="text-[10px] text-main/50 uppercase font-bold">Vendedor</span>
                                            <span className="text-[11px] text-focus-300 font-mono bg-focus-500/15 border border-focus-500/20 px-1.5 py-0.5 rounded-dx">
                                                #{pr.mobile_user ?? '-'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex w-full justify-between items-center my-1 px-0.5">
                                        <div className="flex items-center gap-x-1">
                                            {daysOfWeek.map((day) => {
                                                return (
                                                    //@ts-ignore 
                                                    <DayButton key={day} day={day} hasVisit={pr[day] ?? false} />
                                                )
                                            })}
                                        </div>
                                        <p
                                            title="Frecuencia de visita"
                                            className="bg-primary-900 border border-main/15 text-main text-[10px] font-bold size-5 flex justify-center items-center rounded-full shadow-xs">
                                            {pr.frecuency}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </>
                ) : (
                    <div className="flex items-center gap-x-2 py-2 text-main/50">
                        <div className="size-2 rounded-full bg-status-error" />
                        <p className="text-xs italic">Sin carteras asignadas y sin días de visita</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ClientHistoryTooltip;