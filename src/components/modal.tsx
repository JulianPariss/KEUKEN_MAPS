import { CrossIcon } from '@repo/icons';
import { motion } from "motion/react";
import { ModalStyles as Styles } from './styles'; 
import { useModalRef } from "../utils/hooks/map/useContextRef";

const CustomModal = () => {
    const { isOpen, Component, CloseModal, isRequired } = useModalRef();

    const HandleCancel = () => (!isRequired ? CloseModal() : null);

    return (
        <>
            {isOpen ? (
                <div className="top-0 right-0 absolute w-full h-full flex justify-center items-center">
                    <div
                        onClick={HandleCancel}
                        className={`top-0 right-0 absolute w-full h-full flex items-center justify-center bg-black/50 backdrop-blur-xs z-9999999 ${!isRequired ? 'cursor-pointer' : 'cursor-auto'}`}
                    />
                    <motion.div
                        className={Styles.card}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        {!isRequired && (
                            <button
                                className={Styles.cross}
                                onClick={HandleCancel}
                            >
                                <CrossIcon className="size-6 stroke-main" />
                            </button>
                        )}
                        {Component}
                    </motion.div>
                </div>
            ) : null}
        </>
    );
};

export default CustomModal;
