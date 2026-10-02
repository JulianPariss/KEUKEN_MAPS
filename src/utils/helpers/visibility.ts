export const getVisibilityState = (
  id: number,
  watchList: number[],
  filteredList: number[]
): { visibleInMap: boolean, visibleInSidebar: boolean } => {
  const inWatch = watchList.includes(id);
  const inFilter = filteredList.includes(id);

  return {
    visibleInMap: inWatch && inFilter,
    visibleInSidebar: inFilter,
  };
};

export const flattenIds = (watchList: number[], filterList: number[]): number[] => {
  return Array.from(new Set([...watchList, ...filterList]));
};


export const getIntersection = (watchList: number[], filterList: number[]): number[] => {
  const setFilter = new Set(filterList);
  return Array.from(new Set(watchList.filter(id => setFilter.has(id))));
};
