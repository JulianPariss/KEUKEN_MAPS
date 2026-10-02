import type { ReactNode } from "react";

interface IProps {
    children: ReactNode;
    title?: string;
    className?: string;
}

const Card = ({ children, title, className = "" }: IProps) => {
    return (
        <div className={`p-4 my-4 bg-linear-to-r from-primary-500/80 to-primary-500/90 backdrop-blur-xl rounded-dx border border-main/20 shadow-md ${className}`}>
            {title && <h3 className="text-main font-semibold text-base mb-2">{title}</h3>}
            {children}
        </div>
    );
};

export default Card;