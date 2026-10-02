import type { ITag } from "./tags.types";

export interface IMobileUser {
    id: number;
    supervisorId: number;
    name: string;
    phoneNumber: string;
    color: string;
    tags: ITag[];
}
