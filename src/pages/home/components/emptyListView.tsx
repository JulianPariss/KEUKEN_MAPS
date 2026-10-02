import { memo } from "react";

const EmptyListView = memo(() => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center select-none animate-in fade-in zoom-in-95 duration-700">

            <div className="max-w-sm space-y-3">
                <h3 className="text-2xl font-bold text-main">
                    Sin categorías seleccionadas
                </h3>
                <p className="text-main/60 text-base font-normal">
                    Por favor, seleccione una categoría del panel lateral para visualizar la tabla.
                </p>
            </div>

            <div className="mt-16 flex items-center gap-3">
                <div className="h-px w-8 bg-linear-to-r from-transparent to-main/15" />
                <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="size-1.5 rounded-full bg-focus-500 animate-bounce"
                            style={{ animationDelay: `${i * 150}ms` }}
                        />
                    ))}
                </div>
                <div className="h-px w-8 bg-linear-to-l from-transparent to-main/15" />
            </div>

        </div>
    );
});

EmptyListView.displayName = 'EmptyListView';

export default EmptyListView;
