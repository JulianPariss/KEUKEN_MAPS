type Action = keyof typeof PERMISSIONS_ADMINISTRATION;
type Role = typeof PERMISSIONS_ADMINISTRATION[Action][number];


export const PERMISSIONS_ADMINISTRATION = {
    CHANGE: ['Administrador'],
    VIEW: ['Administrador']
}


export const canDo = (role: Role, action: Action) : boolean => {
    return PERMISSIONS_ADMINISTRATION[action].includes(role);
}