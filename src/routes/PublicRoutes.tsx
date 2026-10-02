import { Routes, Route } from "react-router"
import { GetRoutes } from "./RoutesList";
import { Suspense } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { MessageProvider } from '../utils/contexts/message.context';
import Spinner from "../components/spinner";

const PublicRoutes = () => {
    const { auth } = useSelector((state: RootState) => state.auth );
    const routes = GetRoutes(auth.role);
    
    return(
        <Suspense fallback={<div className="w-full h-full flex justify-center items-center bg-primary-main"><Spinner/></div>}>
            <MessageProvider>
                <Routes>
                    {routes.map((route) => (
                        <Route key={route.path} path={route.path} element={<route.page/>}/>
                    ))}
                </Routes>
            </MessageProvider>
        </Suspense>
    )
}

export default PublicRoutes;

