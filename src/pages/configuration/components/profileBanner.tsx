import { useAppSelector } from "../../../store/hooks";
import { ConfigurationStyles as Styles } from "../styles";
import { useNavigate } from "react-router";
import { ProfileIcon } from "@repo/icons";

const ProfileBanner = () => {
    const { profile } = useAppSelector((state) => state.user);
    const navigate = useNavigate();

    return (
        <div className={Styles.banner.container}>
            <div className="flex flex-row items-center">
                <div className={Styles.banner.content}>
                    <ProfileIcon className="size-8 fill-main/40" />
                </div>
                <div>
                    <h2 className={Styles.banner.title}>{profile.username}</h2>
                    <div>
                        <p className={Styles.banner.text}>Tipo de usuario: {profile.type}</p>
                    </div>
                </div>
            </div>
            <button onClick={() => navigate('/')} className={Styles.banner.button}>
                Volver a Mapas
            </button>
        </div>
    );
};

export default ProfileBanner;