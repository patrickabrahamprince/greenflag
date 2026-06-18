import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

function AdminLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="block rounded px-3 py-2 text-sm hover:bg-gray-700">
      {label}
    </Link>
  );
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();
  if (!admin || admin.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-gray-900 text-white font-sans">
      <aside className="w-64 bg-gray-800 p-4">
        <nav className="flex flex-col space-y-2">
          <AdminLink href="/admin" label="Dashboard" />
          <AdminLink href="/admin/users" label="Users" />
          <AdminLink href="/admin/submissions" label="Submissions" />
          <AdminLink href="/admin/tests" label="Tests" />
          <AdminLink href="/admin/kill-switches" label="Kill Switches" />
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
