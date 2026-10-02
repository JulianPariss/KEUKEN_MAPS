import { useRef, type RefObject } from "react";
import type { ISeller } from "../../../../../../../utils/types/planner/sellers.types";
/* import StatusIcon from "./statusIcon"; */


interface ISellerItem extends ISeller {
    sidebarRef: RefObject<HTMLDivElement | null>;
}

const Item = (props: ISellerItem) => {
    const ref = useRef<HTMLDivElement>(null);

    const {
        name,
        id,
    } = props;

    return (
        <div
            ref={ref}
            className="p-3 rounded-dx my-2 shadow-xs border border-main/10 bg-linear-to-r from-primary-500/80 to-primary-900/80 backdrop-blur-xl hover:border-focus-300/60 transition-all"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-start w-full">
                    <div className="w-full flex flex-col">
                        <div className="w-full flex justify-between items-center">
                            <h4 className="mr-2 text-sm font-bold text-main">{name}</h4>
                            <span className="text-focus-300 text-xs font-mono font-semibold">#{id}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Item;    