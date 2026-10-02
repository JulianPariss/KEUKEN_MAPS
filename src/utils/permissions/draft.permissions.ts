type Action = keyof typeof PERMISSIONS_DRAFT;
type Role = typeof PERMISSIONS_DRAFT[Action][number];


export const PERMISSIONS_DRAFT = {
    VIEW: ['VIEW_DRAFTS'],
    EDIT: ['EDIT_DRAFTS']
}

export const canDo = (roles: Role[], action: Action): boolean => {
    return roles?.some(role =>
        PERMISSIONS_DRAFT[action].includes(role)
    ) ?? false;
};