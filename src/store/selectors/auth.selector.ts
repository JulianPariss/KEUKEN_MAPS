import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "..";

const selectEnterprises = (state: RootState) => state.auth.auth.enterprises;
const selectEnterprise = (state: RootState) => state.user.enterprise.enterprise_id

export const getSalesTeams = () =>
    createSelector([selectEnterprises, selectEnterprise], (enterprises, currentEnterprise): string[] => (       
        enterprises.find((enterprise) => enterprise.enterprise_id === currentEnterprise)?.sales_team ?? []
    ));
