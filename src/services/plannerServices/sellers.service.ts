import { httpRequest } from "../"
import type { ISeller } from "../../utils/types/planner/sellers.types"


const SELLER_PATH = '/mobileUser/'

export const getMobileUsers = async (enterprise_id: number): Promise<ISeller[]> => {
    return await httpRequest({
        url: `${SELLER_PATH}`,
        method: 'GET',
        params: {
            enterprise_id
        },
        isAuth: true,
    })
}