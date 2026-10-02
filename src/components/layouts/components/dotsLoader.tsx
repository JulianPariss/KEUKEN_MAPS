interface IDotsLoaderProps {
    className?: string;
    dotClassName?: string;
    size?: 'sm' | 'md' | 'lg';
    color?: string;
}

const sizeClasses = {
    sm: 'size-1',
    md: 'size-1.5',
    lg: 'size-2',
};

const DotsLoader = ({
    className = '',
    dotClassName,
    size = 'md',
    color = 'bg-focus-300',
}: IDotsLoaderProps) => {
    const dotStyle = dotClassName ?? `${sizeClasses[size]} ${color} rounded-full animate-bounce`;

    return (
        <div className={`flex space-x-1.5 items-center ${className}`}>
            <div className={`${dotStyle} [animation-delay:-0.3s]`}></div>
            <div className={`${dotStyle} [animation-delay:-0.15s]`}></div>
            <div className={dotStyle}></div>
        </div>
    );
};

export default DotsLoader;
