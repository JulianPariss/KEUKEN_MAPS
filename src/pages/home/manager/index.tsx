import CustomModal from "../../../components/modal";
import ContextMenu from "./components/contextMenu";
import ProfileBanner from "./components/profileBanner";
import { ConfigurationStyles as Styles } from "./styles";


const Manager = () => {
    return (
        <div className={Styles.section}>
            <CustomModal />
            <div className={Styles.container}>
                <ProfileBanner />
                <div className="flex-1 min-h-0 my-3 overflow-hidden">
                    <ContextMenu />
                </div>
                <div className="w-full flex justify-between items-center px-1 mb-2 shrink-0">
                    <h2 className="text-main/25 font-bold text-xs tracking-wider">® KEUKEN S.A</h2>
                </div>
            </div>
        </div>
    );
};

export default Manager;