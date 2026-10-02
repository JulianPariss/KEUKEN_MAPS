type Action = keyof typeof PERMISSIONS_DRIVER_OBSERVER;
type Role = typeof PERMISSIONS_DRIVER_OBSERVER[Action][number];


export const PERMISSIONS_DRIVER_OBSERVER = {
    VIEW: ['VIEW_DELIVERIES'],
}

export const canDo = (roles: Role[], action: Action): boolean => {
    return roles?.some(role =>
        PERMISSIONS_DRIVER_OBSERVER[action].includes(role)
    ) ?? false;
};