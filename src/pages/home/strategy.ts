import type React from "react";
import Planner from "./planner";
import SellerObserver from "./sellerObserver";
import { composeProviders } from "../../utils/helpers/composeProviders";
import { SellerMapProvider } from "../../utils/contexts/sellerObserver/map.context";
import { DriverMapProvider } from "../../utils/contexts/driverObserver/map.context";
import { RenderProvider } from "../../utils/contexts/sellerObserver/render.context";
import { RenderProvider as DriverRenderProvider } from "../../utils/contexts/driverObserver/render.context";
import { ModalProvider } from "../../utils/contexts/modal.context";
import { MessageProvider } from "../../utils/contexts/message.context";
import SellerObserverLayout from "../../components/layouts/sellerObserverLayout";
import PlannerLayout from "../../components/layouts/plannerLayout";
import { PlannerMapProvider } from "../../utils/contexts/planner/map.context";
import { MenuProvider } from "../../utils/contexts/menu.context";
import { BoxProvider } from "../../utils/contexts/box.context";
import { ListViewProvider } from "../../utils/contexts/listView.context";
import Manager from "./manager";
import ManagerLayout from "../../components/layouts/managerLayout";
import { useMapDriverObserverContext, useMapPlannerContext, useMapSellerObserverContext } from "../../utils/hooks/map/useContextRef";
import type { IMapRef } from "@repo/map-core";
import { EditPolygonProvider } from "../../utils/contexts/polygonEdit.context";
import DriverObserverLayout from "../../components/layouts/driverObserverLayout";
import DriverObserver from "./driverObserver";
import DefaultLayout from "../../components/layouts/defaultLayout";
import DefaultHome from "./default";

export type TViews = 'mapView' | 'listView' | 'default';

export type TModes = 'sellerObserver' | 'planner' | 'default' | 'manager' | 'driverObserver';

interface IMode {
    Component: React.ComponentType<any>;
    providers: any;
    Layout: React.ComponentType<any>;
    mapRef?: MapRefHook | null;
}

type MapRefHook<T extends IMapRef = IMapRef> = () => T;

const MapModes: Record<TModes, IMode> = {
    default: {
        Component: DefaultHome,
        providers: composeProviders(
            MessageProvider,
            ModalProvider
        ),
        Layout: DefaultLayout,
        mapRef: null
    },
    sellerObserver: {
        Component: SellerObserver,
        providers: composeProviders(
            SellerMapProvider,
            RenderProvider,
            ModalProvider,
            MessageProvider,
            MenuProvider,
            EditPolygonProvider,
            ListViewProvider
        ),
        Layout: SellerObserverLayout,
        mapRef: useMapSellerObserverContext
    },
    driverObserver: {
        Component: DriverObserver,
        providers: composeProviders(
            DriverMapProvider,
            DriverRenderProvider,
            ModalProvider,
            MessageProvider,
            ListViewProvider
        ),
        Layout: DriverObserverLayout,
        mapRef: useMapDriverObserverContext
    },
    planner: {
        Component: Planner,
        providers: composeProviders(
            PlannerMapProvider,
            RenderProvider,
            ModalProvider,
            MessageProvider,
            MenuProvider,
            EditPolygonProvider,
            BoxProvider,
            ListViewProvider
        ),
        Layout: PlannerLayout,
        mapRef: useMapPlannerContext
    },
    manager: {
        Component: Manager,
        providers: composeProviders(
            MessageProvider,
            ModalProvider
        ),
        Layout: ManagerLayout,
        mapRef: null
    },
}


const getMapModeComponent = (mode: TModes): React.ComponentType<any> => {
    return MapModes[mode ?? 'default'].Component ?? MapModes.default.Component;
}

const getMapModeProviders = (mode: TModes): any => {
    return MapModes[mode ?? 'default'].providers ?? MapModes.default.providers;
}

const getMapModeLayout = (mode: TModes): any => {
    return MapModes[mode ?? 'default'].Layout ?? MapModes.default.Layout;
}

const getMapModeRef = (mode?: TModes): IMapRef | null => {
    const mapRef = MapModes[mode ?? 'default'].mapRef;
    if (!mapRef) return null;
    return mapRef() ?? null;
};



export { getMapModeComponent, getMapModeProviders, getMapModeLayout, getMapModeRef };