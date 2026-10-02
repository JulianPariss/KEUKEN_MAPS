import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "..";
import type { IPortfolio } from "../../utils/types/sellerObserver/portfolios.types";

const selectPortfolios = (state: RootState) => state.portfolio.porfolios;

const selectPortfoliosByIdMap = (state: RootState) => state.portfolio.portfoliosById;

export const getPortfolioById = (id: number) =>
    createSelector(
        [selectPortfolios, selectPortfoliosByIdMap],
        (portfolios, idMap): IPortfolio | null => {
            const index = idMap[id];

            if (index !== undefined && portfolios[index]) {
                return portfolios[index];
            }

            return portfolios.find((p) => p.id === id) ?? null;
        }
    );

export const getAllPortfolioById = (ids: number[]) =>
    createSelector([selectPortfolios, selectPortfoliosByIdMap],
        (portfolios, porfoliosById): IPortfolio[] => {
            if (!ids || ids.length === 0) return [];

            return ids
                .map((id) => {
                    const index = porfoliosById[id];
                    return portfolios[index];
                })
                .filter((p): p is IPortfolio => p !== undefined && p !== null);
        }
    );