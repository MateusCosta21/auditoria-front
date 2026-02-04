import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  plan: string;
  status: "active" | "pending" | "suspended";
  createdAt: string;
  usersCount: number;
  auditsCount: number;
}

const mockTenants: Tenant[] = [
  { id: "1", name: "Empresa Alpha", subdomain: "alpha", plan: "Enterprise", status: "active", createdAt: "2024-01-15", usersCount: 25, auditsCount: 143 },
  { id: "2", name: "Beta Industria", subdomain: "beta", plan: "Professional", status: "active", createdAt: "2024-01-20", usersCount: 12, auditsCount: 87 },
  { id: "3", name: "Gamma Solutions", subdomain: "gamma", plan: "Starter", status: "pending", createdAt: "2024-02-01", usersCount: 5, auditsCount: 12 },
  { id: "4", name: "Delta Corp", subdomain: "delta", plan: "Professional", status: "active", createdAt: "2024-02-03", usersCount: 18, auditsCount: 56 },
  { id: "5", name: "Epsilon LTDA", subdomain: "epsilon", plan: "Enterprise", status: "active", createdAt: "2024-02-10", usersCount: 32, auditsCount: 201 },
  { id: "6", name: "Zeta Alimentos", subdomain: "zeta", plan: "Starter", status: "suspended", createdAt: "2024-01-05", usersCount: 3, auditsCount: 8 },
];

const statusMap = {
  active: { label: "Ativo", variant: "success" as const },
  pending: { label: "Pendente", variant: "warning" as const },
  suspended: { label: "Suspenso", variant: "destructive" as const },
};

export default function AdminTenants() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");

  const filteredTenants = mockTenants.filter((tenant) => {
    const matchesSearch = tenant.name.toLowerCase().includes(search.toLowerCase()) ||
      tenant.subdomain.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || tenant.status === statusFilter;
    const matchesPlan = planFilter === "all" || tenant.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

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
      key: "audits",
      header: "Auditorias",
      cell: (row) => row.auditsCount,
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
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate(`/admin/tenants/${row.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Ban className="mr-2 h-4 w-4" />
              Suspender
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-12",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Tenants"
        description="Gerencie todas as empresas cadastradas no sistema"
      >
        <Button onClick={() => navigate("/admin/tenants/novo")} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Tenant
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou subdomínio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="suspended">Suspenso</SelectItem>
            </SelectContent>
          </Select>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="Starter">Starter</SelectItem>
              <SelectItem value="Professional">Professional</SelectItem>
              <SelectItem value="Enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredTenants}
        onRowClick={(row) => navigate(`/admin/tenants/${row.id}`)}
      />
    </div>
  );
}
