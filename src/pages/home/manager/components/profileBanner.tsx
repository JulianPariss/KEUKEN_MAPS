
import CustomSelect from "../../../../components/customSelect";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { changeEnterprise } from "../../../../store/slices/userSlice";
import { useModeRef, useNotifyRef } from "../../../../utils/hooks/map/useContextRef";
import type { ISelectOption } from "../../../../utils/types/general.types";
import { ConfigurationStyles as Styles } from "../styles";
import { ProfileIcon } from "@repo/icons";

const ProfileBanner = () => {
    const { profile, enterprise } = useAppSelector((state) => state.user);
    const { setMode } = useModeRef();
    const notify = useNotifyRef();
    const { enterprises } = useAppSelector((state) => state.auth.auth);
    const dispatch = useAppDispatch();

    const EnterprisesOptions: ISelectOption[] = enterprises.map((ent) => {
        return {
            label: ent.name,
            key: ent.enterprise_id,
            id: ent.enterprise_id,
        }
    });

    const handleChangeEnterprise = (newEnterprise: number) => {
        dispatch(changeEnterprise(enterprises.find((entr) => entr.enterprise_id === newEnterprise) ?? enterprise));
    };

    return (
        <div className="w-full flex flex-col gap-y-3 shrink-0">
            <div className={Styles.banner.container}>
                <div className="flex flex-row items-center">
                    <div className={Styles.banner.content}>
                        <ProfileIcon className="size-8 fill-main/40" />
                    </div>
                    <div>
                        <h2 className={Styles.banner.title}>{profile.username}</h2>
                        <div>
                            <p className={Styles.banner.text}>Tipo de usuario: {profile.type}</p>
                        </div>
                        <div>
                            <p className={Styles.banner.text}>
                                Empresa seleccionada: <span className="text-focus-300 font-semibold underline underline-offset-2">{enterprise.name}</span>
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setMode('sellerObserver');
                        notify('Cambio a Vendedores', 'INFO');
                    }}
                    className={Styles.banner.button}
                >
                    Volver a Mapas
                </button>
            </div>

            <div className="bg-primary-900/50 w-full max-w-md rounded-dx border border-main/10 shadow-xs p-2 px-3">
                <CustomSelect
                    placeholder="Seleccione la empresa"
                    options={EnterprisesOptions}
                    handleChange={(newEnterprise) => handleChangeEnterprise(newEnterprise)}
                    value={enterprise.enterprise_id ?? -1}
                    placement="bottom"
                />
            </div>
        </div>
    );
};

export default ProfileBanner;