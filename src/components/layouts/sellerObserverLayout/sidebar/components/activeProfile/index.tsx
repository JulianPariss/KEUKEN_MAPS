import { useAppSelector } from "../../../../../../store/hooks"
import moment from "moment"

const Label = ({ title }: { title: string }) => {
    return (
        <div className="bg-gradient-to-br from-focus to-secondary-light rounded-full p-0.5 px-3 mr-2 mt-1">
            <p className="text-[11px] text-primary-dark">{title}</p>
        </div>
    )
}

const ActiveProfile = () => {
    const { profile } = useAppSelector((state) => state.user);
    const { auth } = useAppSelector((state) => state.auth)

    return (
        <div>
            <span className="text-secondary-light font-bold">Demo - Todos los servicios</span>
            <p className="text-sm text-white">{`Tipo: Demo`}</p>  {/* ${profile.type} */}
            {/* <p className="text-sm text-white">{`Usuarios: ${profile.userActives}/${profile.maxUsers}`}</p> */}
            {auth.expiration_date ?
                <p className="text-white">Fecha de expiracion: <span className="text-secondary-light underline">{moment(auth.expiration_date).format('DD-MM-YYYY')} </span></p>
                : null
            }
            <div className="flex flex-wrap mt-4">
                {profile.features.map((feature) => (
                    <Label key={feature.id} title={feature.title} />
                ))}
            </div>
        </div>
    )
}

export default ActiveProfile;