import { ConfigurationStyles as Styles } from "./styles";
import ContextMenu from "./components/contextMenu";
import ProfileBanner from "./components/profileBanner";

const ConfigurationPage = () => {
    return (
        <div className={Styles.section}>
            <div className={Styles.container}>
                <ProfileBanner />
                <div className="flex-1 min-h-0 my-4 overflow-hidden">
                    <ContextMenu />
                </div>
            </div>
        </div>
    );
};

export default ConfigurationPage;