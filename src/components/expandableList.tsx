import { ArrowIcon, NoWatchIcon, WatchIcon } from '@repo/icons';
import { useRef, useState, type JSX, type RefObject } from "react";
import SearchBar from "./searchBar";
import SpinnerPingPong from "./spinnerPingPong";

interface IProps {
    handleToggleVisibilities?: () => void;
    toggleView?: boolean;
    children?: React.ReactNode;
    ammountItems: number | string;
    ammountValue?: boolean;
    hasDobleAction?: boolean;
    ExtraAction?: JSX.Element;
    title?: string;
    subtitle?: JSX.Element;
    isSticky?: boolean;
    setSearchValue?: (value: string) => void;
    sidebarRef?: RefObject<HTMLDivElement | null>;
    isLoading?: boolean;
    ExtraComponent?: JSX.Element[];
}


const ExpandibleList = (props: IProps) => {
    const {
        title = 'Elementos',
        subtitle = <></>,
        ammountItems,
        ammountValue = true,
        handleToggleVisibilities,
        toggleView,
        hasDobleAction = !!ammountItems,
        isSticky = false,
        setSearchValue,
        sidebarRef,
        ExtraAction,
        ExtraComponent = [],
        isLoading = false,
    } = props;
    const [isCollapsed, setIsCollapsed] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const isDobleActions = handleToggleVisibilities && hasDobleAction;

    return (
        <div className="bg-primary-950/40 backdrop-blur-xl border border-main/10 my-2 rounded-dx shadow-sm">
            <div className={`
                flex flex-col justify-center
                items-end bg-linear-to-r from-primary-500/90 to-primary-500/90 
                p-2.5 px-4 rounded-dx gap-y-3
                ${isSticky ? 'sticky top-0 z-50 shadow-md shadow-black/25 bg-linear-to-r from-primary-500/90 to-primary-500/50 backdrop-blur-xl py-3.5 border-b border-main/10' : ''}
            `}>
                <div className="flex flex-row justify-between items-start w-full">
                    <div className="flex items-center justify-center">
                        <div className="absolute left-1 mt-1">
                            {isLoading && <SpinnerPingPong />}
                        </div>
                        <div className="flex flex-col w-full gap-y-1.5 justify-start">
                            <h3 className="text-main font-semibold text-lg">{`${title} ${ammountValue ? `: ${ammountItems}` : ''}`}</h3>
                            {subtitle}
                        </div>
                    </div>
                    <div className="flex flex-row justify-center items-center gap-x-0.5">
                        {ExtraAction && (
                            <div className="mr-2">{ExtraAction}</div>
                        )}
                        {handleToggleVisibilities ? (
                            <div
                                className={`bg-primary-900/80 hover:bg-focus-500/30 active:bg-focus-500/50 border border-main/10 size-7 flex justify-center items-center cursor-pointer transition-colors shadow-xs ${isDobleActions ? 'rounded-l-full border-r-0' : 'rounded-full'}`}
                                onClick={handleToggleVisibilities}
                            >
                                {toggleView ? (
                                    <WatchIcon className="size-4 stroke-main hover:stroke-focus-300 transition-colors duration-150" />
                                ) : (
                                    <NoWatchIcon className="size-4 stroke-main hover:stroke-focus-300 transition-colors duration-150" />
                                )}
                            </div>
                        ) : null}
                        {hasDobleAction ? (
                            <div
                                className={`bg-primary-900/80 hover:bg-focus-500/30 active:bg-focus-500/50 border border-main/10 size-7 flex justify-center items-center cursor-pointer transition-colors shadow-xs ${isDobleActions ? 'rounded-r-full' : 'rounded-full'}`}
                                onClick={() => setIsCollapsed(!isCollapsed)}
                            >
                                <ArrowIcon className={`size-4 fill-main ${isCollapsed ? 'rotate-180' : 'rotate-0'} transition-transform duration-200 hover:fill-focus-300`} />
                            </div>
                        ) : null}
                    </div>
                </div>
                {sidebarRef && isCollapsed && (
                    <div className="flex flex-col gap-y-2 w-full mt-1">
                        {setSearchValue && <SearchBar setSearchValue={setSearchValue} sidebarRef={sidebarRef} />}
                        {ExtraComponent.map((Component) => Component)}
                    </div>
                )}
            </div>
            <div className="overflow-hidden">
                <div className="flex flex-col mx-3">
                    {isCollapsed && (
                        <div
                            ref={ref}
                            style={{
                                overflow: 'visible',
                                pointerEvents: isCollapsed ? 'auto' : 'none',
                                height: isCollapsed ? 'auto' : '0',
                                padding: isCollapsed ? '8px 0px' : '0px 0px'
                            }}
                        >
                            <div>
                                {props.children}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ExpandableList = ExpandibleList;

export { ExpandibleList, ExpandableList };
export default ExpandableList;
