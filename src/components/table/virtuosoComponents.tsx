import { forwardRef } from "react";


const VirtuosoComponents = {
    Table: (props: any) => <table {...props} className="w-full text-left border-separate border-spacing-0 table-fixed" />,
    TableHead: forwardRef<HTMLTableSectionElement>((props, ref) => (
        <thead {...props} ref={ref} className="bg-primary-main text-white/85 uppercase text-xs sticky top-0 z-20 shadow-sm shadow-black/50" />
    )),
    TableRow: (props: any) => {
        const { item, ...rest } = props;
        if (!item) return <tr {...rest} />;
        if (item.type === 'header') return <tr {...rest} className="border-y border-primary-light/20" />;
        return (
            <tr {...rest} className={`group last:border-none ${item.index % 2 === 0 ? 'bg-primary-main' : 'bg-primary-main/40'}`} />
        );
    }
};

export default VirtuosoComponents;