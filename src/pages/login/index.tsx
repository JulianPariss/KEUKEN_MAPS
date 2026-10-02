import LoginForm from "./components/loginForm";
import LandImage from './../../assets/image.png';
import { LogoIcon } from '@repo/icons';
import { APPVERSION } from "../../utils/constants/config.constants";
import { useWindowSize } from "../../utils/hooks/layout/useWindowSize";
import { useAppSelector } from "../../store/hooks";

const LoginPage = () => {
    const isMobile = useWindowSize().width <= 1024;

    const { loading } = useAppSelector(state => state.auth);

    const DesktopLogin = () => {
        return (
            <>
                <div
                    className="min-w-[450px] flex flex-col justify-center items-start px-20 h-full bg-linear-to-tr from-primary-950 to-primary-500 z-1"
                    style={{ boxShadow: '5px 0px 15px 10px rgba(0,0,0,0.15)' }}
                >
                    <h2 className="text-main text-4xl font-bold">{loading ? "Iniciando sesion..." : "Iniciar sesion"}</h2>
                    <div className="h-1/2 w-full">
                        <LoginForm />
                    </div>
                </div>
                <div className="w-full h-full bg-primary-950 relative overflow-hidden flex justify-center items-center">
                    <img src={LandImage} className="object-cover w-full h-full opacity-15 mask-t-from-80% mask-b-from-80%  mask-radial-from-50% absolute top-0 z-2" />
                    <div className="absolute w-full h-full bg-radial from-80% from-black/0 to-black/20 z-3 top-0 " />
                    <div className="w-1/3 h-full z-4 flex flex-col justify-between items-center">
                        <div className="my-[20%] flex flex-col justify-center items-center h-1/3">
                            <h2 className="text-main text-[100px] font-bold">MAPAS</h2>
                            <p className="text-main/80 text-[20px] font-light mt-[-20px]">El mapa de tu distribuidora</p>
                        </div>
                        <div className="relative h-2/3 flex flex-col justify-between items-center">
                            <LogoIcon className="size-50 drop-shadow-2xl drop-shadow-black animate-pulse" />
                            <p className="text-main/25 whitespace-nowrap">{`KEUKEN S.A ${APPVERSION}`}</p>
                        </div>
                    </div>
                </div>
            </>
        )
    }


    return (
        <section className="w-screen h-screen bg-primary-950 flex">
            {isMobile ?
                <div className="w-full h-full bg-primary-950 relative overflow-hidden flex justify-center items-center">
                    <img src={LandImage} className="object-cover w-full h-full opacity-15 mask-t-from-80% mask-b-from-80%  mask-radial-from-50% absolute top-0 z-2" />
                    <div className="absolute w-full h-full bg-radial from-80% from-black/0 to-black/20 z-3 top-0 " />
                    <div className="w-2/4 h-full z-4 flex flex-col justify-between items-center">
                        <div className="my-[20%] flex flex-col justify-center items-center h-2/3">
                            <h2 className="text-main text-[100px] font-bold">MAPAS</h2>
                            <p className="text-main/80 text-[20px] font-light mt-[-20px]">El mapa de tu distribuidora</p>
                        </div>
                        <LoginForm />
                        <p className="text-main/25 whitespace-nowrap">{`KEUKEN S.A ${APPVERSION}`}</p>
                    </div>
                </div>
                : <DesktopLogin />
            }
        </section>
    )
}

export default LoginPage;
