import type { TAuth } from "../types/auth.types";

export const URoles: Record<TAuth, TAuth> = {
    PUBLIC: "PUBLIC",
    CLIENT: "CLIENT",
    ADMIN: "ADMIN"
}