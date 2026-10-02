import { useMenuRef } from "../utils/hooks/map/useContextRef";

const CustomMenu = () => {
    const { isOpen, Component } = useMenuRef();

    return (
        <>
            <div className=''
                style={{ visibility: isOpen ? "visible" : "hidden" }}>
                {Component}
            </div>
        </>
    )
}
export default CustomMenu;