import { useRef } from "react";
import { useBoxRef } from "../utils/hooks/map/useContextRef";
import { CrossOutlinedIcon } from '@repo/icons';
import { motion } from "motion/react";

const DraggableBox = () => {
    const { isOpen, Component, CloseBox } = useBoxRef();
    const constraintsRef = useRef(null);

    if (!isOpen) return null;

    return (
        <div
            ref={constraintsRef}
            className="absolute w-[350px] h-[calc(100vh-120px)] z-[999] left-[10px] top-[110px] pointer-events-none"
        >
            <motion.div
                drag
                dragConstraints={constraintsRef}
                dragElastic={0}
                whileDrag={{
                    scale: 1.02,
                    boxShadow: "0px 20px 30px rgba(0,0,0,0.3)"
                }}
                dragMomentum={false}
                className="
                    pointer-events-auto
                    fixed top-[110px] left-[10px]
                    bg-primary-950/90 backdrop-blur-xl
                    border border-main/10 rounded-dx shadow-2xl
                    p-3.5 w-64 cursor-grab active:cursor-grabbing z-[99999]
                "
            >
                <div className="flex flex-col justify-between">
                    <div className="flex justify-end items-center absolute right-2 top-2">
                        <button
                            onClick={() => CloseBox()}
                            className="size-5 rounded-full bg-primary-900 border border-main/15 shadow-xs flex justify-center items-center cursor-pointer transition-all hover:bg-error hover:border-error/50 group"
                        >
                            <CrossOutlinedIcon className="size-3.5 stroke-main group-hover:stroke-white transition-colors" />
                        </button>
                    </div>
                    {Component}
                </div>
            </motion.div>
        </div>
    );
};

export default DraggableBox;

