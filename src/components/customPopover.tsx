import { Dialog, Popover, type PopoverProps } from 'react-aria-components';

interface IProps extends Omit<PopoverProps, 'children'> {
    children: React.ReactNode;
    className?: string;
}

const CustomPopover = ({ children, className = '', ...props }: IProps) => {
    return (
        <Popover
            placement="bottom right"
            {...props}
            className={`rounded-dx bg-linear-to-b from-primary-900/95 to-primary-950/95 backdrop-blur-xl text-main shadow-xl p-4 z-50 border border-main/10 ${className}`}
        >
            <Dialog className="outline-none">
                {children}
            </Dialog>
        </Popover>
    );
};

export default CustomPopover;