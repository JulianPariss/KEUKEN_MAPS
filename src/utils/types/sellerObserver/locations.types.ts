export interface ILocation{
    id: number | string;
    coordinates: number[]
}

export interface IConnectionStatus {
    userId : number | string;
    status : "offline" | "online";
}