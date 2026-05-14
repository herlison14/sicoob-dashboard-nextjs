interface KPICardProps {
  label: string;
  value: string | number;
  delta?: string;
  type?: 'default' | 'success' | 'warning' | 'alert';
}

export default function KPICard({ label, value, delta, type = 'default' }: KPICardProps) {
  const borderColors: Record<string, string> = {
    default: 'border-l-[#7DB61C]',
    success: 'border-l-[#2A9D8F]',
    warning: 'border-l-[#F4A261]',
    alert: 'border-l-[#E63946]',
  };

  return (
    <div className={`bg-white p-5 rounded-lg border-l-4 ${borderColors[type]} shadow-sm`}>
      <div className="text-xs uppercase text-gray-500 font-semibold tracking-wider mb-2">
        {label}
      </div>
      <div className="text-2xl font-bold text-[#003641] leading-tight">
        {value}
      </div>
      {delta && (
        <div className="text-sm text-gray-500 mt-1">
          {delta}
        </div>
      )}
    </div>
  );
}
