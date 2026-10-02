import moment from "moment";
import { formatMinutes, formatMoney } from "../../../utils/helpers/formatters";
import type { IClient } from "../../../utils/types/sellerObserver/clients.types";
import type { IOrder, ISeller } from "../../../utils/types/sellerObserver/sellers.types";
import { useTheme } from "@repo/ui/theme";

interface IProps {
    client: IClient;
    orders: IOrder[];
    seller: ISeller | null;
}

const ClientTooltip = (props: IProps) => {
    const { client, orders, seller } = props;
    useTheme();

    const total = orders?.reduce((acc, order) => acc + order.total, 0) ?? 0;
    const noSaleReason = orders?.find((order) => order.noSaleReason) ?? null;

    return (
        <div className="flex flex-col min-w-[280px] max-w-[340px] text-main font-sans">
            <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-main/10">
                {seller ? (
                    <p className="text-xs font-bold text-main truncate mr-2">
                        {seller.sellerName} <span className="text-focus-300 font-mono font-semibold">#{seller.seller}</span>
                    </p>
                ) : (
                    <p className="text-xs text-main/50 italic mr-2">Sin vendedor asignado</p>
                )}
                <div className="flex items-center text-[11px] text-main/60 font-mono shrink-0">
                    {orders?.[0]?.t_created && (
                        <span>{moment(orders[0].t_created).format("HH:mm:ss")}</span>
                    )}
                    {orders?.[0]?.t_created && <span className="text-main/20 mx-1">|</span>}
                    <span className="font-semibold text-main/80">{formatMinutes(client.totalMinutes)}</span>
                </div>
            </div>

            <div className="flex items-center gap-1.5">
                <div className={`px-2 py-1 rounded-dx text-[11px] font-semibold text-variant shadow-xs shrink-0 ${
                    client.visited ? 'bg-status-success' : 'bg-status-error'
                }`}>
                    PDV: {client.code}
                </div>
                <div className={`px-2.5 py-1 rounded-dx text-[11px] font-semibold text-variant shadow-xs flex-1 truncate ${
                    total > 0
                        ? 'bg-status-success'
                        : noSaleReason
                        ? 'bg-status-warning'
                        : 'bg-status-error'
                }`}>
                    {client.name}
                </div>
            </div>

            <div className="flex flex-col mt-2 pt-1.5 border-t border-main/10">
                {total > 0 ? (
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-[10px] font-bold tracking-wider text-main/60 uppercase">PEDIDO</span>
                        <span className="font-bold font-mono text-status-success text-sm before:content-['$']">
                            {formatMoney(total)}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-xs text-main/60">
                        <div className={`size-1.5 rounded-full shrink-0 ${noSaleReason ? 'bg-status-warning' : 'bg-status-error'}`} />
                        <span className="truncate">{orders?.[0]?.noSaleReason ?? 'SIN VISITAR'}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientTooltip;