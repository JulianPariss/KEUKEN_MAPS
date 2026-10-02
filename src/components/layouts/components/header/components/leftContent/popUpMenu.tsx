import { motion } from "motion/react";
import { LeftContentStyles as Styles } from "./styles";
import { useEffect, useState } from "react";
import EnterpriseSelector from "./enterpriseSelector";
import { ArrowIcon } from '@repo/icons';
import { useAppDispatch, useAppSelector } from "../../../../../../store/hooks";
import { canDo } from "../../../../../../utils/permissions/administration.permissions";
import { useModeRef } from "../../../../../../utils/hooks/map/useContextRef";
import type { TModes } from "../../../../../../pages/home/strategy";


interface IProps {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
}

const PopUp = (props: IProps) => {
    const { isOpen, setIsOpen } = props;
    const [entSelector, setEntSelector] = useState<boolean>(false);
    const dispatch = useAppDispatch();

    const { setMode, mode } = useModeRef();
    const { profile } = useAppSelector((state) => state.user);

    const isActive = (key: TModes): boolean => {
        return key === mode
    }

    useEffect(() => {
        if (!isOpen) setEntSelector(false);
    }, [isOpen])

    return (
        <motion.div
            style={{
                overflow: 'hidden',
            }}
            initial={{
                height: '0px',
                padding: '0px'
            }}
            animate={{
                height: isOpen ? 'auto' : '0px',
                padding: isOpen ? '4px 0px' : '0px',
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={Styles.popUpMenu.container}>
            <button
                className={Styles.button('hover:bg-primary-light/40')}
                onClick={() => setEntSelector(!entSelector)}
            >
                Empresa
            </button>
            <EnterpriseSelector isOpen={entSelector} setIsOpen={setIsOpen} />
            {/*             {canDo(profile.type, "VIEW") &&
                <button
                    onClick={() => navigate('/configuration')}
                    className={Styles.button('hover:bg-primary-/40  disabled:opacity-35 disabled:cursor-not-allowed')}>
                    Configuración
                </button>
            } */}
            {canDo(profile.type, "VIEW") &&
                <button
                    className={Styles.button('hover:bg-primary-light/40')}
                    onClick={() => {
                        !(isActive('manager')) &&
                            setMode('manager');
                    }}
                >
                    Configuración
                </button>
            }
            <button onClick={() => dispatch({ type: 'RESET_STORE' })} className={Styles.button('hover:bg-status-error/40')}>
                Cerrar sesión
            </button>
            <div className="size-6 bg-primary-500/30 hover:bg-focus-500/30 cursor-pointer p-1.5 rounded-full my-1 border border-main/10 flex justify-center items-center transition-all shadow-xs" onClick={() => setIsOpen(false)}>
                <ArrowIcon className="size-3 fill-main rotate-180" />
            </div>
        </motion.div>
    );
};

export default PopUp;
