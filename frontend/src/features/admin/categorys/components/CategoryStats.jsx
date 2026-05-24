export default function CategoryStats({ total }) {
    return (
        <div className="md:col-span-1 bg-white p-6 rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] border border-outline-variant/30">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Tổng số
            </p>

            <div className="flex items-baseline gap-2 mt-2">
                <span className="font-headline-lg text-headline-lg text-primary">
                    {total}
                </span>
                <span className="text-body-md text-on-surface-variant">
                    Danh mục
                </span>
            </div>
        </div>
    );
}