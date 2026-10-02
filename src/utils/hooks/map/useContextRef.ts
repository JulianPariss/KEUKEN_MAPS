import { useContext } from "react";
import { useMapSellerObserverContext } from "../../contexts/sellerObserver/map.context";
import { useMapPlannerContext } from "../../contexts/planner/map.context";
import { useMapDriverObserverContext } from "../../contexts/driverObserver/map.context";
import { ModalContext } from "../../contexts/modal.context";
import { MessageContext } from "../../contexts/message.context";
import { RenderContext } from "../../contexts/sellerObserver/render.context";
import { RenderContext as DriverRenderContext } from "../../contexts/driverObserver/render.context";
import { ModeContext } from "../../contexts/mode.context";
import { MenuContext } from "../../contexts/menu.context";
import { BoxContext } from "../../contexts/box.context";
import { EditPolygonContext, type IEditPolygonHandler } from "../../contexts/polygonEdit.context";
import { ViewContext } from "../../contexts/view.context";
import { ListViewContext } from "../../contexts/listView.context";

export { useMapSellerObserverContext, useMapPlannerContext, useMapDriverObserverContext };

export const useModalRef = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("ModalContext not initialized");
    }
    return context;
}

export const useNotifyRef = () => {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error("MessageContext not initialized");
    }
    return context;
}

export const useRenderRef = () => {
    const context = useContext(RenderContext);
    if (!context) {
        throw new Error("RenderContext not initialized");
    }
    return context;
}

export const useDriverRenderRef = () => {
    const context = useContext(DriverRenderContext);
    if (!context) {
        throw new Error("RenderContext not initialized");
    }
    return context;
}

export const useModeRef = () => {
    const context = useContext(ModeContext);
    if (!context) {
        throw new Error("ModeContext not initialized");
    }
    return context;
}

export const useViewRef = () => {
    const context = useContext(ViewContext);
    if (!context) {
        throw new Error("ViewContext not initialized");
    }
    return context;
}

export const useMenuRef = () => {
    const context = useContext(MenuContext);
    if (!context) {
        throw new Error("MenuContext not initialized");
    }
    return context;
}

export const useBoxRef = () => {
    const context = useContext(BoxContext);
    if  (!context) {
        throw new Error("BoxContext not initialized");
    }
    return context;
}

export const useEditPolygonRef = (): IEditPolygonHandler => {
      const context = useContext(EditPolygonContext);

      if (!context) {
            throw new Error("useEditPolygon not initialized");
      }

      return context;
};

export const useListViewContentRef = () => {
    const context = useContext(ListViewContext);
    if (!context) {
        throw new Error("ListViewContext not initialized");
    }
    return context;
}
