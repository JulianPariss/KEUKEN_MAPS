import { httpRequest } from "."
import type { IAudit } from "../utils/types/sellerObserver/audit.types";


const AUDIT_PATH = '/audit/';

export const getClientScheduledTasks = async (
    client_id: number | null, 
    enterprise_id: number, 
    pageSize: number = 100, 
    currentPage: number = 0, 
    unprocessed_only = false,
    scheduled_only = false,
    geozone_id?: number,
): Promise<IAudit[]> => {
  return await httpRequest({
    url: AUDIT_PATH,
    method: 'GET',
    params: {
      client_id,
      enterprise_id,
      table_name: null,
      limit: pageSize,
      skip: pageSize * currentPage,
      scheduled_only,
      unprocessed_only,
      geozone_id,
    },
    isAuth: true,
  })
}

export const revertChanges = async ( correlation_id: string, enterprise_id: number ) : Promise<any> => {
    return await httpRequest({
        url: `${AUDIT_PATH}revert/${correlation_id}`,
        method: 'POST',
        params: { enterprise_id },
        isAuth: true,
    })
}