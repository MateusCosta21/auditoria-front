import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, MoreHorizontal, Edit, Copy, Trash2, Eye } from "lucide-react";
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

interface Checklist {
  id: string;
  name: string;
  category: string;
  sectionsCount: number;
  questionsCount: number;
  auditsCount: number;
  updatedAt: string;
  status: "active" | "draft";
}

const mockChecklists: Checklist[] = [
  { id: "1", name: "5S - Produção", category: "Qualidade", sectionsCount: 5, questionsCount: 25, auditsCount: 45, updatedAt: "2024-02-01", status: "active" },
  { id: "2", name: "Segurança Alimentar", category: "Segurança", sectionsCount: 8, questionsCount: 42, auditsCount: 32, updatedAt: "2024-01-28", status: "active" },
  { id: "3", name: "ISO 9001 - Completo", category: "ISO", sectionsCount: 10, questionsCount: 68, auditsCount: 18, updatedAt: "2024-01-25", status: "active" },
  { id: "4", name: "BPF - Laboratório", category: "BPF", sectionsCount: 6, questionsCount: 35, auditsCount: 12, updatedAt: "2024-01-20", status: "active" },
  { id: "5", name: "Meio Ambiente (Rascunho)", category: "Meio Ambiente", sectionsCount: 4, questionsCount: 18, auditsCount: 0, updatedAt: "2024-02-02", status: "draft" },
];

export default function TenantChecklists() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredChecklists = mockChecklists.filter((checklist) =>
    checklist.name.toLowerCase().includes(search.toLowerCase()) ||
    checklist.category.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Checklist>[] = [
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
      cell: (row) => row.sectionsCount,
    },
    {
      key: "questions",
      header: "Perguntas",
      cell: (row) => row.questionsCount,
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
        <StatusBadge variant={row.status === "active" ? "success" : "default"} dot>
          {row.status === "active" ? "Ativo" : "Rascunho"}
        </StatusBadge>
      ),
    },
    {
      key: "updatedAt",
      header: "Atualizado",
      cell: (row) => new Date(row.updatedAt).toLocaleDateString("pt-BR"),
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
            <DropdownMenuItem>
              <Copy className="mr-2 h-4 w-4" />
              Duplicar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
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
        data={filteredChecklists}
        onRowClick={(row) => navigate(`/tenant/checklists/${row.id}`)}
      />
    </div>
  );
}
