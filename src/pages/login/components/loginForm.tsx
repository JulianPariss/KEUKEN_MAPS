import { LoginStyles as Styles } from "../styles";
import { useForm, type SubmitHandler } from "react-hook-form"
import CustomInput from "./input"
import CustomButton from "./button"
import { fetchLogin } from "../../../store/slices/authSlice";

import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import type { ILoginData } from "../../../utils/types/auth.types";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";


const schema = yup
    .object({
        email: yup.string().email('Por favor ingrese un mail válido').required('Este campo es requerido.'),
        password: yup.string().required('Este campo es requerido.')
    }).required();

const LoginForm = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ILoginData>(
        {
            resolver: yupResolver(schema),
        }
    )

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { loading } = useAppSelector(state => state.auth);

    const onSubmit: SubmitHandler<ILoginData> = async (data) => {
        const result = await dispatch(fetchLogin(data))
        if(fetchLogin.fulfilled.match(result)) {
            navigate('/', { replace: true });
        }
    }

    return (
        <div className="w-full h-full flex flex-col items-center">
            <form onSubmit={handleSubmit(onSubmit)} className={`${Styles.form.form} ${loading ? 'pointer-events-none opacity-80' : 'opacity-100'} transition-opacity duration-300`}>
                <div className="mb-2">
                    <CustomInput
                        register={{ ...register("email") }}
                        errors={errors.email?.message}
                        label="Email"
                        placeholder="Juan.perez@keuken.com"
                        type="email"
                        disabled={loading}
                    />
                    <CustomInput
                        register={{ ...register("password") }}
                        errors={errors.password?.message}
                        label="Contraseña"
                        type="password"
                        disabled={loading}
                    />
                </div>
                <CustomButton 
                    type={'submit'}
                    loading={loading}
                >
                    Ingresar
                </CustomButton>
            </form>
        </div>
    )
}

export default LoginForm;