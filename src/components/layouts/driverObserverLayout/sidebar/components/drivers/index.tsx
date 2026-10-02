import { useEffect, useState, type RefObject } from "react";
import { useAppSelector, useAppDispatch } from "../../../../../../store/hooks";
import Item from "./components/item";
import ExpandibleList from "../../../../../expandableList";
import Empty from "../../../../../empty";
import type { IMobileUser } from "../../../../../../utils/types/mobileUser.types";
import { changeAllVisibility, changeFilteredList, changeOneVisibility, fetchAllLocationHistory } from "../../../../../../store/slices/driverObserver/driversSlice";
interface IProps {
    sidebarRef: RefObject<HTMLDivElement | null>;
}

const DriverSection = (props: IProps) => {
    const [searchValue, setSearchValue] = useState<string>('');
    const { drivers, watchList, driverRoutes, loading } = useAppSelector((state) => state.drivers)

    const { enterprise } = useAppSelector((state) => state.user);
    const { date } = useAppSelector((state) => state.sidebar);

    const isWatchingSellers = (): boolean => {
        return watchList.length > 0
    }

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (enterprise.enterprise_id === -1) return
        dispatch(fetchAllLocationHistory());

    }, [date, drivers, enterprise.enterprise_id])

    const isWatched = (id: number): boolean => {
        return watchList.some((wi) => wi === id);
    }

    const changeWatchedState = (id: number) => {
        dispatch(changeOneVisibility(id));
    }

    const handleToggleVisibilities = () => {
        dispatch(changeAllVisibility(!isWatchingSellers()));
    }

    const getRelevance = (driver: IMobileUser) => {
        const search = searchValue.toLowerCase();
        let score = 0;
        if (driver.id?.toString().toLowerCase().startsWith(search)) score += 2;
        else if (driver.id?.toString().toLowerCase().includes(search)) score += 1;

        if (driver.name?.toLowerCase().startsWith(search)) score += 2;
        else if (driver.name?.toLowerCase().includes(search)) score += 1;

        return score;
    };

    const filteredSellers = [...drivers]
        .filter((a) => getRelevance(a) > 0)
        .sort((a, b) => getRelevance(b) - getRelevance(a));

    const watchedSellers = filteredSellers;

    useEffect(() => {
        const filteredIds = drivers.reduce<number[]>((acc, driver) => {
            acc.push(driver.id);
            return acc;
        }, []);

        dispatch(changeFilteredList(filteredIds));
    }, [drivers]);

    return (
        <ExpandibleList
            handleToggleVisibilities={handleToggleVisibilities}
            toggleView={isWatchingSellers()}
            ammountItems={`${drivers.length}`}
            title="Conductores"
            isSticky
            setSearchValue={setSearchValue}
            sidebarRef={props.sidebarRef}
            isLoading={loading}
        >
            <div>
                {watchedSellers.length > 0 ? (
                    watchedSellers
                        .map((driver) => (
                            <Item
                                sidebarRef={props.sidebarRef}
                                visibleTags={false}
                                key={driver.id}
                                isWatched={isWatched(driver.id)}
                                watchList={watchList}
                                changeWatchedState={changeWatchedState}
                                routes={driverRoutes.routes[driver.id]}
                                {...driver}
                            />
                        ))) : (
                    <Empty text="No existen elementos que cumplan con estos filtros." />
                )}
            </div>
        </ExpandibleList>

    )
}

export default DriverSection;
