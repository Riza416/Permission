import { RoleProvider } from "@/components/Sidebar";
import Sidebar from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <div className="flex min-h-screen bg-gray-50">
        {/* Fixed sidebar */}
        <Sidebar />

        {/* Main content — offset by sidebar width */}
        <main className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
          {children}
        </main>
      </div>
    </RoleProvider>
  );
}
