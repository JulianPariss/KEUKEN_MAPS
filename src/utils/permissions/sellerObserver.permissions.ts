type Action = keyof typeof PERMISSIONS_SELLER_OBSERVER;
type Role = typeof PERMISSIONS_SELLER_OBSERVER[Action][number];


export const PERMISSIONS_SELLER_OBSERVER = {
    VIEW: ['VIEW_SELLERS'],
}

export const canDo = (roles: Role[], action: Action): boolean => {
    return roles?.some(role =>
        PERMISSIONS_SELLER_OBSERVER[action].includes(role)
    ) ?? false;
};