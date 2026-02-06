import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, MoreHorizontal, Edit, Copy, Trash2, Eye, Loader2 } from "lucide-react";
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
import { useChecklists, useDuplicateChecklist, useDeleteChecklist } from "@/hooks/tenant/useChecklists";
import { useToast } from "@/hooks/use-toast";
import type { ChecklistListItem } from "@/types/api";

export default function TenantChecklists() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const { data: checklistsData, isLoading } = useChecklists({ search: search || undefined });
  const duplicateMutation = useDuplicateChecklist();
  const deleteMutation = useDeleteChecklist();

  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate(id, {
      onSuccess: () => {
        toast({ title: "Checklist duplicado com sucesso" });
      },
      onError: () => {
        toast({ title: "Erro ao duplicar checklist", variant: "destructive" });
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast({ title: "Checklist excluído com sucesso" });
      },
      onError: () => {
        toast({ title: "Erro ao excluir checklist", variant: "destructive" });
      },
    });
  };

  const columns: Column<ChecklistListItem>[] = [
    {
      key: "name",
      header: "Nome",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-sm text-muted-foreground">{row.category}</p>
        </div>
      ),
    },
    {
      key: "sections",
      header: "Seções",
      cell: (row) => row.sections_count,
    },
    {
      key: "questions",
      header: "Perguntas",
      cell: (row) => row.questions_count,
    },
    {
      key: "audits",
      header: "Auditorias",
      cell: (row) => row.audits_count,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge variant={row.status === "active" ? "success" : "default"} dot>
          {row.status === "active" ? "Ativo" : "Rascunho"}
        </StatusBadge>
      ),
    },
    {
      key: "updatedAt",
      header: "Atualizado",
      cell: (row) => new Date(row.updated_at).toLocaleDateString("pt-BR"),
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
            <DropdownMenuItem onClick={() => navigate(`/tenant/checklists/${row.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/tenant/checklists/${row.id}/editar`)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDuplicate(row.id)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(row.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-12",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Checklists"
        description="Gerencie seus modelos de checklist para auditorias"
      >
        <Button onClick={() => navigate("/tenant/checklists/novo")} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Checklist
        </Button>
      </PageHeader>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={checklistsData?.data ?? []}
        onRowClick={(row) => navigate(`/tenant/checklists/${row.id}`)}
      />
    </div>
  );
}
