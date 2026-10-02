import { formatMinutes, formatMoney } from "../../../../utils/helpers/formatters";
import { useAppSelector } from '../../../../store/hooks';

interface ITextBlockProps {
    title: string;
    text: string | number;
    isMono?: boolean;
    valueClassName?: string;
}

const TextBlock = ({ title, text, isMono, valueClassName }: ITextBlockProps) => {
    return (
        <div className="flex flex-col items-start w-full">
            <h2 className="text-main/50 text-[10px] uppercase font-bold tracking-wider mb-0.5">{title}</h2>
            <p
                className={`font-medium text-sm md:text-base ${valueClassName
                    ? valueClassName
                    : isMono
                        ? 'text-focus-300 font-mono font-semibold'
                        : 'text-main'
                    }`}
            >
                {text}
            </p>
        </div>
    );
};

interface IProps {
    order: any;
    distance: string;
}

const OrderPreview = (props: IProps) => {
    const { order, distance } = props;
    const { clientsById, clients } = useAppSelector((state) => state.clients);

    const hasExcuse: boolean = order.notInRadiusId !== -1 && !!order.notInRadiusReason;

    return (
        <div className="bg-primary-950/40 backdrop-blur-xl border border-main/10 p-5 rounded-dx shadow-xs mt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-x-10">
                <TextBlock title="Monto total" text={`$ ${formatMoney(order.total)}`} valueClassName="text-focus-300 font-mono font-semibold" />
                <TextBlock title="Número de contacto" text={order.clientData.phone || '-'} />
                <TextBlock title="Fecha del cierre" text={order.t_closed || '-'} />

                <hr className="col-span-full border-0 border-t border-main/10 my-1" />

                <TextBlock title="Monto total con impuestos" text={`$ ${formatMoney(order.totalWithTaxes)}`} valueClassName="text-focus-300 font-mono font-semibold" />
                <TextBlock title="Dirección" text={order.clientData.address || '-'} />
                <TextBlock title="Fecha de creación" text={order.t_created || '-'} />

                <hr className="col-span-full border-0 border-t border-main/10 my-1" />

                <TextBlock title="En ruta" text={order.clientData.inRoute ? 'Sí' : 'No'} />
                <TextBlock title="Tiempo total en PDV" text={formatMinutes(clients[clientsById[order.clientData.code]]?.totalMinutes ?? 0)} />
                <TextBlock title="Distancia al PDV" text={distance} />

                {hasExcuse && (
                    <>
                        <hr className="col-span-full border-0 border-t border-main/10 my-1" />
                        <TextBlock title="Motivo de no visita" text={order.notInRadiusReason} />
                    </>
                )}
                {!hasExcuse && order.noSaleReasonId !== -1 && (
                    <>
                        <hr className="col-span-full border-0 border-t border-main/10 my-1" />
                        <TextBlock title="Razón de no venta" text={order.noSaleReason} />
                    </>
                )}
            </div>
        </div>
    );
};

export default OrderPreview;