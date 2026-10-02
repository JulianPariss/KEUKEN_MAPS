interface IProps {
    bgColor?: string;
    className?: string;
}   

const Spinner = ({ bgColor = 'bg-focus-300', className = '' }: IProps) => {
    return (
        <div className={`w-full h-full flex justify-center items-center ${className}`}>
            <div className="animate-spin flex flex-col justify-between items-center size-fit">
                <div className={`size-4 rounded-full ${bgColor} shadow-xs my-1`} />
                <div className={`size-2 rounded-full ${bgColor} shadow-xs my-1`} />
            </div>
        </div>
    );
};

export default Spinner;