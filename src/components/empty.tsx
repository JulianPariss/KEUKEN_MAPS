interface IProps {
    text?: string; 
    className?: string;
}


const Empty = (props: IProps) => {
    const {
        text = 'Parece que aún no hay elementos.',
        className = '',
    } = props;

    return (
        <div className={`w-full h-full text-sm bg-primary-500/10 p-5 flex justify-center items-center border-2 border-dashed border-main/15 rounded-dx ${className}`}>
            <p className="text-main/50 text-center font-medium">{text}</p>
        </div>
    );
};

export default Empty;