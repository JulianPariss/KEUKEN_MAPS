import { useState } from "react";
import {
    DialogTrigger,
    Popover,
    Dialog,
    OverlayArrow,
    Button,
} from "react-aria-components";
import type { TPlacement } from "../utils/types/general.types";

interface ConfirmableButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    hasConfirmation?: boolean;
    confirmText?: string;
    cancelText?: string;
    className?: string;
    text?: string | React.ReactNode;
    disabled?: boolean;
    placement?: TPlacement;
}

const ConfirmableButton = ({
    children,
    onClick,
    hasConfirmation = false,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    text = '',
    disabled = false,
    className,
    placement = 'left',
}: ConfirmableButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!hasConfirmation) {
        return (
            <button
                onClick={disabled ? () => { } : onClick}
                disabled={disabled}
                className={`p-2 rounded-dx flex justify-center items-center transition-all outline-none ${className ?? ''} ${disabled
                    ? 'cursor-not-allowed bg-focus-500/40 text-variant/50'
                    : 'cursor-pointer bg-focus-500 hover:bg-focus-500/85 text-variant shadow-xs'
                    }`}
            >
                {children}
            </button>
        );
    }

    const handleSubmit = () => {
        setIsOpen(false);
        onClick();
    };

    const rotation =
        placement.startsWith("top")
            ? "rotate-0"
            : placement.startsWith("bottom")
                ? "rotate-180"
                : placement.startsWith("left")
                    ? "-rotate-90"
                    : placement.startsWith("right")
                        ? "rotate-90"
                        : "";

    const isDanger =
        typeof confirmText === 'string' &&
        (confirmText.toLowerCase().includes('eliminar') || confirmText.toLowerCase().includes('borrar'));

    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <Button
                onClick={() => (disabled ? () => { } : setIsOpen(true))}
                isDisabled={disabled}
                className={`outline-none transition-all ${className ?? ''}`}
            >
                {children}
            </Button>
            <Popover placement={placement} className="absolute !z-[9999999] outline-none">
                <OverlayArrow>
                    <svg className={`${rotation} fill-primary-950/95`} width={12} height={12} viewBox="0 0 12 12">
                        <path d="M0 0 L6 6 L12 0" />
                    </svg>
                </OverlayArrow>
                <Dialog className="outline-none">
                    <div className="flex flex-col bg-primary-950/95 backdrop-blur-xl border border-main/10 rounded-dx shadow-2xl p-4 max-w-[360px] text-xs">
                        <div className="text-main font-medium leading-relaxed">{text}</div>
                        <div className="flex flex-row justify-end mt-4">
                            <button
                                className="px-3 py-1.5 rounded-dx text-xs font-medium text-main bg-primary-900 border border-main/15 hover:bg-primary-500/30 shadow-xs mr-2 cursor-pointer transition-all"
                                onClick={() => setIsOpen(false)}
                            >
                                {cancelText}
                            </button>
                            <button
                                className={`px-3 py-1.5 rounded-dx text-xs font-medium shadow-xs cursor-pointer transition-all ${isDanger
                                    ? 'bg-error text-white hover:bg-error/80 border border-error/50 shadow-error/20'
                                    : 'bg-focus-500 hover:bg-focus-300 text-variant border border-focus-300/50'
                                    }`}
                                onClick={handleSubmit}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </Dialog>
            </Popover>
        </DialogTrigger>
    );
};

export default ConfirmableButton;

