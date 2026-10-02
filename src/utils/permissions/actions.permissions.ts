type Action = keyof typeof HISTORY_CLIENTS_ACTIONS;
type Role = typeof HISTORY_CLIENTS_ACTIONS[Action][number];


export const HISTORY_CLIENTS_ACTIONS = {
    CLICK: ['Administrador'],
}


export const canDo = (role: Role, action: Action) : boolean => {
    return HISTORY_CLIENTS_ACTIONS[action].includes(role);
}