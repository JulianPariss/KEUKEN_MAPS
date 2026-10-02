import { useMapTime } from "@repo/map-core";
import { useContextbarContext } from "../utils/contexts/contextbar.context";
import { useSidebarContext } from "../utils/contexts/sidebar.context";
import { useWindowSize } from "../utils/hooks/layout/useWindowSize";
import {  } from "../utils/hooks/map/useContextRef";
import moment from "moment";

const TimeOverlay = () => {
    const { isVisible, startTime, endTime, progressDot, currentProgress } = useMapTime()
    const isMobile = useWindowSize().width <= 768;
    const { isCollapsed } = useSidebarContext();
    const { isOpen } = useContextbarContext();

    const sidebarWidth = isCollapsed ? 0 : 260; // Adjust 260 to your sidebar width
    const contextWidth = isOpen ? 300 : 0;      // Adjust 300 to your context bar width
    const overlayWidth = isMobile ? 120 : 420;

    const middle = isMobile
        ? `calc(50% - ${contextWidth / 2}px - ${overlayWidth / 2}px)`
        : `calc(50% - ${(sidebarWidth + contextWidth) / 2}px - ${overlayWidth / 2}px)`;



    const startMoment = moment(startTime);
    const result = startMoment.add(currentProgress, 'seconds');


    const realTime = result.format("HH:mm:ss");

    return (
        <>
            {isVisible ? (
                <div className={`flex ${isMobile ? 'justify-center' : 'justify-between'} items-center h-fit absolute top-[110px] z-999`} style={{ left: middle, width: overlayWidth }}>
                    {isMobile ? (
                        <div className="flex flex-col items-center">
                            <p className="text-main text-sm bg-primary-950/85 backdrop-blur-xl px-2.5 py-1 rounded-dx font-bold shadow-md border border-main/15 transition-all">
                                {realTime}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div>
                                <p className="text-main/90 bg-primary-950/80 backdrop-blur-md text-xs px-2 py-1 rounded-dx border border-main/10 font-mono shadow-xs">
                                    {moment(startTime).format('HH:mm:ss')}
                                </p>
                            </div>
                            <div className="relative flex justify-center items-center">
                                <div ref={progressDot as any} className="size-4 rounded-full absolute top-[-6px] bg-focus-500 border-2 border-variant left-0 flex justify-center items-center shadow-md shadow-black/40">
                                    <div className="relative top-[25px] flex flex-col justify-center items-center">
                                        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-primary-950/90" />
                                        <p className="text-main text-xs bg-primary-950/90 backdrop-blur-md px-1.5 py-0.5 rounded-dx border border-main/15 font-mono font-bold shadow-md">
                                            {realTime}
                                        </p>
                                    </div>
                                </div>
                                <div className="w-[250px] h-[4px] rounded-full bg-primary-500/40 border border-main/10" />
                            </div>
                            <div>
                                <p className="text-main/90 bg-primary-950/80 backdrop-blur-md text-xs px-2 py-1 rounded-dx border border-main/10 font-mono shadow-xs">
                                    {moment(endTime).format('HH:mm:ss')}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            ) : null}
        </>
    );
};


export default TimeOverlay;