import { useState, useEffect, useRef } from "react";
import { ColorSwatch, ColorThumb, ColorWheel, ColorWheelTrack, parseColor, type Color, type ColorWheelProps } from "react-aria-components";
import { CrossIcon } from '@repo/icons';

interface IProps {
  handleSubmit: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  color: string;
  disabled?: boolean;
}

interface IColorWheelProps extends Omit<ColorWheelProps, 'outerRadius' | 'innerRadius'> {}

const CustomWheel = (props: IColorWheelProps) => {
  return (
    <ColorWheel {...props} outerRadius={30} innerRadius={20}>
      <ColorWheelTrack />
      <ColorThumb
        className="w-5 h-5 border-2 border-white rounded-full box-border 
        shadow-[0_0_0_1px_black,inset_0_0_0_1px_black]"
      />
    </ColorWheel>
  );
};

const CustomColorWheel = ({ handleSubmit, isOpen, setIsOpen, color, disabled = false }: IProps) => {
  const [currentValue, setCurrentValue] = useState(parseColor('hsl(45, 70%, 45%)'));
  const wheelRef = useRef<HTMLDivElement>(null);

  const onChangeEnd = (e: Color) => {
    handleSubmit(e.toString("hex"));
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wheelRef.current && !wheelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {isOpen ? (
        <>
        <div ref={wheelRef} className="absolute -left-5 -top-4 z-10">
        <CustomWheel
            value={currentValue}
            onChange={setCurrentValue}
            onChangeEnd={onChangeEnd}
        />
        </div>
        <button className="relative size-5 rounded-full bg-primary-dark mr-2 mt-1 flex justify-center items-center cursor-pointer z-20">
            <CrossIcon className="size-5 stroke-primary-light"/>    
        </button>
        </>
      ) : 
        <ColorSwatch className={`rounded-full size-5 border border-white/65 mr-2 mt-1 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`} color={color} onClick={() => disabled ? ()=>{} : setIsOpen(true)}/>
        }                            
    </>
  );
};

export default CustomColorWheel;

