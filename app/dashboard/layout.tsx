import TopMenu from '../components/TopMenu';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <TopMenu />
        {children}
      </div>
    </div>
  );
}
