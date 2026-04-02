import AppNav from '@/components/AppNav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <AppNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
