import { httpRequest } from "../"
import type { IDraft } from "../../utils/types/planner/draft.types"

const DRAFT_PATH = '/draft/';

export const createDraft = async (enterprise_id: number, data: { draftname: string }): Promise<IDraft> => {
  return await httpRequest({
    url: `${DRAFT_PATH}`,
    method: 'POST',
    params: {
      enterprise_id
    },
    data: {
      name: data.draftname,
    },
    isAuth: true,
  })
}

export const duplicateDraft = async (enterprise_id: number, draft_id: number, data: { draftname: string }): Promise<IDraft> => {
  return await httpRequest({
    url: `${DRAFT_PATH}${draft_id}/duplicate`,
    method: 'POST',
    params: {
      enterprise_id
    },
    data: {
      name: data.draftname,
    },
    isAuth: true,
  })
}

export const deleteDraft = async (enterprise_id: number, draft_id: number): Promise<IDraft[]> => {
  return await httpRequest({
    url: `${DRAFT_PATH}${draft_id}`,
    method: 'DELETE',
    params: {
      enterprise_id
    },
    isAuth: true,
  })
}

export const updateDraft = async (enterprise_id: number, draft_id: number, data: any): Promise<IDraft> => {
  return await httpRequest({
    url: `${DRAFT_PATH}${draft_id}`,
    method: 'PUT',
    params: {
      enterprise_id
    },
    data,
    isAuth: true,
  })
}


export const getDrafts = async (enterprise_id: number): Promise<IDraft[]> => {
  return await httpRequest({
    url: `${DRAFT_PATH}`,
    method: 'GET',
    params: {
      enterprise_id
    },
    isAuth: true,
  })
}
