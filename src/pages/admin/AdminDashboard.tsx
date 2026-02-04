import { Building2, Users, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  plan: string;
  status: "active" | "pending" | "suspended";
  createdAt: string;
  usersCount: number;
}

const mockTenants: Tenant[] = [
  {
    id: "1",
    name: "Empresa Alpha",
    subdomain: "alpha",
    plan: "Enterprise",
    status: "active",
    createdAt: "2024-01-15",
    usersCount: 25,
  },
  {
    id: "2",
    name: "Beta Industria",
    subdomain: "beta",
    plan: "Professional",
    status: "active",
    createdAt: "2024-01-20",
    usersCount: 12,
  },
  {
    id: "3",
    name: "Gamma Solutions",
    subdomain: "gamma",
    plan: "Starter",
    status: "pending",
    createdAt: "2024-02-01",
    usersCount: 5,
  },
  {
    id: "4",
    name: "Delta Corp",
    subdomain: "delta",
    plan: "Professional",
    status: "active",
    createdAt: "2024-02-03",
    usersCount: 18,
  },
];

const statusMap = {
  active: { label: "Ativo", variant: "success" as const },
  pending: { label: "Pendente", variant: "warning" as const },
  suspended: { label: "Suspenso", variant: "destructive" as const },
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const columns: Column<Tenant>[] = [
    {
      key: "name",
      header: "Empresa",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-sm text-muted-foreground">{row.subdomain}.auditpro.com</p>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plano",
      cell: (row) => <StatusBadge variant="primary">{row.plan}</StatusBadge>,
    },
    {
      key: "users",
      header: "Usuários",
      cell: (row) => row.usersCount,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge variant={statusMap[row.status].variant} dot>
          {statusMap[row.status].label}
        </StatusBadge>
      ),
    },
    {
      key: "createdAt",
      header: "Criado em",
      cell: (row) => new Date(row.createdAt).toLocaleDateString("pt-BR"),
    },
    {
      key: "actions",
      header: "",
      cell: () => (
        <Button variant="ghost" size="sm">
          <ArrowRight className="h-4 w-4" />
        </Button>
      ),
      className: "w-12",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Visão geral do sistema de auditorias"
      >
        <Button onClick={() => navigate("/admin/tenants/novo")} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Tenant
        </Button>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Tenants"
          value={42}
          icon={Building2}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Tenants Ativos"
          value={38}
          icon={Users}
          variant="success"
          subtitle="90% do total"
        />
        <StatCard
          title="Novos este Mês"
          value={8}
          icon={TrendingUp}
          variant="warning"
          trend={{ value: 33, isPositive: true }}
        />
        <StatCard
          title="Usuários Totais"
          value={456}
          icon={Users}
          variant="default"
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Recent Tenants */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Últimos Tenants Criados</h2>
          <Button variant="outline" onClick={() => navigate("/admin/tenants")}>
            Ver todos
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={mockTenants}
          onRowClick={(row) => navigate(`/admin/tenants/${row.id}`)}
        />
      </div>
    </div>
  );
}
