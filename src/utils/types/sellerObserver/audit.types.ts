export interface IAudit {
    id: number;
    id_in_table: number;
    user_id: number;
    user_name: string;
    message: string;
    scheduled_date: string;
    timestamp: string;
    change_data: {
        client_id: number;
        portfolio_id: number;
    }
    method: 'DELETE' | 'CREATE' | 'UPDATE';
    processed_timestamp: null | string;
    correlation_id: string;
    name_table: string;
    previous_data: null;
    revert_id: number | null;
    revert?: boolean;
}
