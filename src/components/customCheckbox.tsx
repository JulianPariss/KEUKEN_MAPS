import { Checkbox, type CheckboxProps } from 'react-aria-components';


const CheckIcon  = ({isSelected, isIndeterminate}: {isSelected: boolean, isIndeterminate: boolean}) => {
    return(
        <svg
        viewBox="0 0 18 18"
        aria-hidden="true"
        className={`
        w-3.5 h-3.5 stroke-white stroke-[3] transition-all duration-200
        ${isSelected || isIndeterminate ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
        `}
        >
        {isIndeterminate ? (
            <rect x={3} y={8} width={12} height={2.5} rx={1} />
            ) : (
            <polyline points="2 9 7 14 16 4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        )}
        </svg>
    )
}

interface IProps extends CheckboxProps{
    children?: React.ReactNode;
    handleChange: (value: boolean) => void;
}

const CustomCheckbox = (props: IProps) => {
    const { children, handleChange, defaultSelected } = props;
    return (
        <Checkbox {...props} defaultSelected={defaultSelected} onChange={(e) => handleChange(e)} className="group flex items-center gap-2 cursor-pointer select-none">
            {({ isSelected, isIndeterminate, isDisabled }) => (
                <>
                    <div
                    className={`
                    w-5 h-5 flex items-center justify-center rounded-md
                    transition-all duration-200 focus:border-1 focus:border-focus
                    ${isDisabled
                    ? 'border-gray-400 bg-gray-200 cursor-not-allowed'
                    : isSelected || isIndeterminate
                        ? 'bg-focus'
                        : 'bg-white inset-shadow-xsl group-hover:border-primary-main'}
                    `}
                    >
                        <CheckIcon isSelected={isSelected} isIndeterminate={isIndeterminate}/>
                    </div>
                    {children && (
                        <span
                        className={`
                        text-sm transition-colors duration-200
                        ${isDisabled ? 'text-gray-400' : 'text-white group-hover:text-focus'}
                        `}
                        >
                            {children}
                        </span>
                    )}
                </>
            )}
        </Checkbox>
    );
};

export default CustomCheckbox;
