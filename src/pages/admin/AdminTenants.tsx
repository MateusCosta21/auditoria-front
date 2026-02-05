import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Ban, Power, Loader2, RefreshCw } from "lucide-react";
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
import { tenantsService } from "@/services/admin/tenants";
import { getErrorMessage } from "@/services/api-client";
import { useToast } from "@/hooks/use-toast";
import type { Tenant } from "@/types/api";

const statusMap = {
  active: { label: "Ativo", variant: "success" as const },
  inactive: { label: "Inativo", variant: "destructive" as const },
};

export default function AdminTenants() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  const loadTenants = async () => {
    setIsLoading(true);
    try {
      const params: { search?: string; active?: boolean } = {};
      if (search) params.search = search;
      if (statusFilter === "active") params.active = true;
      if (statusFilter === "inactive") params.active = false;

      const response = await tenantsService.list(params);
      setTenants(response.data);
    } catch (error) {
      toast({
        title: "Erro ao carregar tenants",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, [statusFilter]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTenants();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleStatus = async (tenant: Tenant, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsToggling(tenant.id);
    try {
      const response = await tenantsService.toggleStatus(tenant.id);
      toast({
        title: response.is_active ? "Tenant ativado" : "Tenant desativado",
        description: `${tenant.name} foi ${response.is_active ? "ativado" : "desativado"} com sucesso.`,
      });
      loadTenants();
    } catch (error) {
      toast({
        title: "Erro ao alterar status",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsToggling(null);
    }
  };

  const columns: Column<Tenant>[] = [
    {
      key: "name",
      header: "Empresa",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-sm text-muted-foreground">{row.slug}.meusistema.localhost</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => {
        const status = row.is_active ? "active" : "inactive";
        return (
          <StatusBadge variant={statusMap[status].variant} dot>
            {statusMap[status].label}
          </StatusBadge>
        );
      },
    },
    {
      key: "createdAt",
      header: "Criado em",
      cell: (row) => new Date(row.created_at).toLocaleDateString("pt-BR"),
    },
    {
      key: "actions",
      header: "",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
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
            <DropdownMenuItem
              onClick={(e) => handleToggleStatus(row, e)}
              disabled={isToggling === row.id}
            >
              {row.is_active ? (
                <>
                  <Ban className="mr-2 h-4 w-4" />
                  Desativar
                </>
              ) : (
                <>
                  <Power className="mr-2 h-4 w-4" />
                  Ativar
                </>
              )}
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTenants} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => navigate("/admin/tenants/novo")} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Tenant
          </Button>
        </div>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou slug..."
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
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">Nenhum tenant encontrado</p>
          <p className="text-sm text-muted-foreground">
            {search ? "Tente buscar com outros termos" : "Crie o primeiro tenant para começar"}
          </p>
          {!search && (
            <Button onClick={() => navigate("/admin/tenants/novo")} className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Criar Tenant
            </Button>
          )}
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tenants}
          onRowClick={(row) => navigate(`/admin/tenants/${row.id}`)}
        />
      )}
    </div>
  );
}
