interface IProps {
  w?: string;
  h?: string;
  className?: string;
}

const Skeleton = ({ w = "w-full", h = "h-4", className = "" }: IProps) => {
  return (
    <div
      className={`animate-pulse bg-primary-500/25 rounded-dx ${w} ${h} ${className}`}
    />
  );
};

export default Skeleton;