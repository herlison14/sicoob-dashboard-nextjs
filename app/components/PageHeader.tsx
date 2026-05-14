interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
}

export default function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-[#003641] via-[#00524F] to-[#003641] rounded-xl p-6 text-white shadow-lg mb-6">
      <div className="flex items-start gap-4">
        {icon && <div className="text-4xl">{icon}</div>}
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">{title}</h1>
          {subtitle && <p className="opacity-90 text-sm md:text-base">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
