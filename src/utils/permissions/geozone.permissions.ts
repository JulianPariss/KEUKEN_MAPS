type Action = keyof typeof PERMISSIONS_GEOZONE;
type Role = typeof PERMISSIONS_GEOZONE[Action][number];


export const PERMISSIONS_GEOZONE = {
    EDIT: ['EDIT_GEOZONE']
}

export const canDo = (roles: Role[], action: Action): boolean => {
    return roles.some(role =>
        PERMISSIONS_GEOZONE[action].includes(role)
    );
};