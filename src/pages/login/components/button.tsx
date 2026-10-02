import type { ReactNode } from "react";
import { LoginStyles as Styles } from "../styles";
import Spinner from "../../../components/spinner";

interface IProps {
    type: "submit" | "reset" | "button" | undefined;
    children: ReactNode;
    loading?: boolean;
    disabled?: boolean;
}

const CustomButton = (props: IProps) => {
    const { type, loading, disabled, children } = props;
    return (
        <button
            type={type}
            disabled={disabled || loading}
            className={`${Styles.button} ${disabled || loading ? 'opacity-50 cursor-not-allowed grayscale-[0.5]' : ''} relative flex justify-center items-center gap-2 transition-all duration-300`}
        >
            {loading ? (
                <div className="flex items-center gap-2">
                    <div className="size-5 p-2">
                        <Spinner bgColor="bg-white" />
                    </div>
                </div>
            ) : (
                children
            )}
        </button>
    )
}

export default CustomButton;