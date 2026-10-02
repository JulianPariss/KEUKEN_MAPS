import { useEffect, useState } from "react";
import { LoginStyles as Styles } from "../styles";

interface IProps {
    defaultValue?: string;
    register: any;
    errors: any;
    type?: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
}

const CustomInput = (props: IProps) => {
    const {defaultValue, register, errors, type = 'text', label, placeholder, disabled } = props;

    const [failed, setFailed] = useState<boolean>(!!errors);

    useEffect(() => {
        setFailed(!!errors);
    }, [errors])

    return (
        <div>
            <h4 className="text-white">{label}</h4>
            <input 
                {...register}
                placeholder={placeholder ?? 'Ingrese el campo'}
                type={type} 
                defaultValue={defaultValue}
                className={`${Styles.input.field} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={disabled}
            />
            <span className={Styles.input.error(failed)}>*{errors}</span>
        </div>  
    )
}

export default CustomInput;