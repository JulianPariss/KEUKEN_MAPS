import { httpRequest } from "."
import type { IPermissionAssignment, IPermissionAssignmentCreation, IPermissionListed } from "../utils/types/permission.types"

export const getPermissionsOfUser = async (enterprise_id: number, user_id: number): Promise<IPermissionAssignment> => {
    return await httpRequest({
        url: `/permission_assignments/${user_id}`,
        method: 'GET',
        params: { enterprise_id },
        isAuth: true,
    })
}

export const getPermissions = async (): Promise<IPermissionListed[]> => {
    return await httpRequest({
        url: '/permissions/',
        method: 'GET',
        isAuth: true,
    })

}

export const setPermissionsOfUser = async (enterprise_id: number, data: IPermissionAssignmentCreation): Promise<IPermissionAssignment> => {
    return await httpRequest({
        url: `/permission_assignments/`,
        method: 'POST',
        params: { enterprise_id },
        data,
        isAuth: true,
    })
}