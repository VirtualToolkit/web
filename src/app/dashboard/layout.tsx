import DashboardShell from "@/components/DashboardShell";

export default function Dashboard({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
