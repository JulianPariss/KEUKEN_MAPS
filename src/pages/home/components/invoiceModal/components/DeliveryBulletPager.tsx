interface IBulletDotProps {
  id: number;
  isActive: boolean;
  onChange: (id: number) => void;
}

const BulletDot = ({ id, isActive, onChange }: IBulletDotProps) => (
  <button
    type="button"
    onClick={() => onChange(id)}
    title={`Reparto #${id}`}
    aria-label={`Reparto #${id}`}
    className={`rounded-full mx-1.5 cursor-pointer size-2.5 transition-all border-0 p-0 ${
      isActive
        ? 'bg-focus-300 ring-2 ring-focus-100/40 scale-125'
        : 'bg-primary-500/25 border border-main/10 hover:bg-primary-500/50'
    }`}
  />
);

interface IDeliveryBulletPagerProps {
  deliveryIds: number[];
  currentDeliveryId: number;
  onChange: (id: number) => void;
}

export const DeliveryBulletPager = ({
  deliveryIds,
  currentDeliveryId,
  onChange,
}: IDeliveryBulletPagerProps) => {
  if (deliveryIds.length <= 1) return null;

  return (
    <div className="flex justify-center items-center mt-2 bg-primary-950/20 backdrop-blur-md p-2 rounded-full mx-auto border border-main/5 shrink-0">
      {deliveryIds.map((id) => (
        <BulletDot
          key={id}
          id={id}
          isActive={currentDeliveryId === id}
          onChange={onChange}
        />
      ))}
    </div>
  );
};

export default DeliveryBulletPager;
