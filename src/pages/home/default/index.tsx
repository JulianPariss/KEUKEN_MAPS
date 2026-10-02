import { useAppSelector } from "../../../store/hooks";
import Spinner from "../../../components/spinner";
import { LockIcon } from "@repo/icons";

const DefaultHome = () => {
    const { profile, enterprise } = useAppSelector((state) => state.user);

    const isProfileLoading =
        enterprise.enterprise_id === -1 ||
        profile.loading ||
        (profile.username === 'Unknow' && profile.error === null);

    if (isProfileLoading) {
        return (
            <div className="w-full h-full flex justify-center items-center bg-primary-950">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6 text-center select-none bg-primary-950">
            <div className="size-20 rounded-full bg-primary-900/60 border border-main/15 flex items-center justify-center">
                <LockIcon className="size-9 fill-main/50" />
            </div>
            <div className="flex flex-col gap-2 max-w-md">
                <h2 className="text-xl font-bold text-main tracking-tight">
                    Sin secciones habilitadas
                </h2>
                <p className="text-xs text-main/40 leading-relaxed">
                    Contactese con un supervisor para solicitar acceso
                </p>
            </div>
        </div>
    );
};

export default DefaultHome;
