import { useEffect, useState } from "react"
import { getAllUsers } from "../../../../services/user.services";
import { useNotifyRef } from "../../../../utils/hooks/map/useContextRef";
import { useAppSelector } from "../../../../store/hooks";
import CustomSelect from "../../../../components/customSelect";
import type { ISelectOption } from "../../../../utils/types/general.types";
import Empty from "../../../../components/empty";
import { getPermissions, getPermissionsOfUser, setPermissionsOfUser } from "../../../../services/permissions.service";
import { type IPermissionListed } from "../../../../utils/types/permission.types";
import { CheckIcon, CrossIcon } from '@repo/icons';

interface IPermissionInputProps {
    permission: IPermissionListed;
    areSelected: boolean;
    togglePermission: (value: number) => void;
}

const PermissionInput = (props: IPermissionInputProps) => {
    const { permission, areSelected, togglePermission } = props;

    return (
        <div className="w-full flex justify-between items-center bg-primary-900/50 hover:bg-primary-900/80 rounded-dx p-2 px-3 border border-main/5 hover:border-main/10 transition-colors">
            <p className="text-main text-xs font-medium">{permission.description}</p>
            <div
                onClick={() => togglePermission(permission.id)}
                className={`
                    flex items-center justify-center
                    size-5 rounded-dx cursor-pointer select-none
                    transition-all duration-150
                ${areSelected ? 'bg-focus-500 shadow-xs' : 'bg-primary-500/20 hover:bg-primary-500/40 border border-main/10'}`}>
                {areSelected ?
                    <CheckIcon
                        className="size-3.5 stroke-variant"
                        strokeWidth={3}
                    />
                    :
                    <CrossIcon
                        className="size-3.5 stroke-main/40"
                        strokeWidth={3}
                    />
                }
            </div>

        </div>
    )
}


const Configurations = () => {
    const { enterprises } = useAppSelector((state) => state.auth.auth);

    const [_, setIsLoading] = useState<boolean>(false);

    const [useList, setUserList] = useState<ISelectOption[]>([]);
    const [currentEnterpise, setCurrentEnterprise] = useState<number>(-1);
    const [currentUser, setCurrentUser] = useState<number>(-1);

    const [userPermissions, setUserPermissions] = useState<number[]>([]);
    const [listedPermissions, setListedPermissions] = useState<IPermissionListed[]>([]);

    const notify = useNotifyRef();

    const EnterprisesOptions: ISelectOption[] = enterprises.map((ent) => {
        return {
            label: ent.name,
            key: ent.enterprise_id,
            id: ent.enterprise_id,
        }
    })

    const resetStates = () => {
        setIsLoading(false);
        setUserList([]);
        setUserPermissions([]);
        setCurrentEnterprise(-1);
        setCurrentUser(-1);
    }

    const cancelPermissionEdit = () => {
        setIsLoading(false);
        setUserPermissions([]);
        setCurrentUser(-1);
    }

    const submitPermissionsChange = () => {
        const data = {
            user_id: currentUser,
            permission_ids: userPermissions,
        }

        setPermissionsOfUser(currentEnterpise, data).then(() => {
            notify('Permisos modificados éxitosamente', 'SUCCESS');
            resetStates();
        }).catch(() => {
            notify('Error al modificar los permisos', 'ERROR');
            resetStates();
        });
    }

    const refreshUserList = (enterprise_id: number) => {
        setIsLoading(true);
        getAllUsers(enterprise_id).then((res) => {
            setUserList(res.map((usr) => {
                return {
                    label: usr.name,
                    key: usr.id,
                    id: usr.id
                }
            }));
        }).catch(() => {
            notify('No se encontraron usuarios', 'ERROR');
        }).finally(() => {
            setIsLoading(false);
        });
    }

    const refreshUserPermissions = (enterprise_id: number, user_id: number) => {
        setIsLoading(true);
        getPermissionsOfUser(enterprise_id, user_id).then((permissionAssignment) => {
            setUserPermissions(permissionAssignment.permissions.map((perm) => perm.permission_id));
        }).catch(() => {
            notify('Ocurrio un error al buscar los permisos del usuario', 'ERROR');
            resetStates();
        }).finally(() => {
            setIsLoading(false);
        });
    }

    const togglePermission = (permission_id: number) => {
        const exists = userPermissions.includes(permission_id);

        if (exists) {
            setUserPermissions(prev =>
                prev.filter(id => id !== permission_id)
            );
        } else {
            setUserPermissions(prev => [...prev, permission_id]);
        }
    };


    useEffect(() => {
        if (currentEnterpise === -1) return;
        setCurrentUser(-1);
        refreshUserList(currentEnterpise);
    }, [currentEnterpise])

    useEffect(() => {
        if (currentUser === -1 || currentEnterpise === -1) return;
        refreshUserPermissions(currentEnterpise, currentUser);
    }, [currentUser])

    useEffect(() => {
        getPermissions().then((res) => setListedPermissions(res));
    }, [])


    return (
        <div className="flex flex-col justify-start items-center h-full p-4 gap-y-3 overflow-hidden">
            <div className="bg-primary-900/50 p-2 rounded-dx w-full border border-main/10 shadow-xs">
                <CustomSelect
                    placeholder="Seleccione la empresa"
                    options={EnterprisesOptions}
                    handleChange={setCurrentEnterprise}
                    value={currentEnterpise ?? -1}
                    placement="bottom"
                />
            </div>
            <div className="bg-primary-900/50 p-2 rounded-dx w-full border border-main/10 shadow-xs">
                <CustomSelect
                    placeholder="Seleccione al usuario"
                    options={useList}
                    disabled={currentEnterpise === -1}
                    handleChange={setCurrentUser}
                    value={currentUser ?? -1}
                    placement="bottom"
                />
            </div>
            {!(currentUser === null || currentUser === -1) && (listedPermissions.length > 0) ?
                <>
                    <div className="bg-primary-900/40 w-full flex-1 min-h-0 rounded-dx border border-main/10 p-3 flex flex-col overflow-hidden">
                        <p className="text-main font-semibold text-xs mb-2 px-1">Listado de permisos</p>
                        <div className="w-full flex-1 flex flex-col gap-y-1.5 overflow-y-auto pr-1">
                            {listedPermissions.map((listedPermission) => {
                                const areSelected = userPermissions.some(
                                    (u) => u === listedPermission.id
                                );
                                return (
                                    <PermissionInput key={listedPermission.id} permission={listedPermission} areSelected={areSelected} togglePermission={togglePermission} />
                                )
                            })}
                        </div>
                    </div>
                    <div className="w-full h-12 rounded-dx bg-primary-900/60 border border-main/10 flex justify-end items-center px-3 shrink-0">
                        <div className="flex items-center gap-x-2">
                            <button
                                className="px-4 py-1.5 rounded-dx bg-primary-500/20 hover:bg-primary-500/35 text-main/80 hover:text-main text-xs font-medium cursor-pointer transition-all active:scale-95"
                                onClick={cancelPermissionEdit}>
                                Cancelar
                            </button>
                            <button
                                className="px-4 py-1.5 rounded-dx bg-focus-500 hover:bg-focus-300 text-variant text-xs font-semibold cursor-pointer transition-all shadow-xs active:scale-95"
                                onClick={submitPermissionsChange}>
                                Aplicar
                            </button>
                        </div>
                    </div>
                </>
                : <Empty text="Para modificar los permisos, primero seleccione un usuario." />

            }

        </div>
    )
}

export default Configurations;
