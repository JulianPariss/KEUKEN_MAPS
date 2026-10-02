import type { IProfile } from "../../../../../../utils/types/sellerObserver/user.types"
import { RightContentStyles as Styles } from './styles';

const RightContent  = (props : IProfile) => {
    const { userActives, maxUsers } = props; 
    return (
        <div className={Styles.container}>
            <div className={Styles.item}>
                <p className={Styles.title}>Usuarios en línea</p>
                <span className={Styles.value}>{userActives}</span>
            </div>
            <hr className={Styles.divider} />
            <div className={Styles.item}>
                <p className={Styles.title}>Usuarios</p>
                <span className={Styles.value}>{maxUsers}</span>
            </div>
            <hr className={Styles.divider}/>
            <div className={Styles.item}>
                <p className={Styles.title}>Máx. usuarios</p>
                <span className={Styles.value}>{maxUsers}</span>
            </div>
        </div>  
    )
}

export default RightContent;