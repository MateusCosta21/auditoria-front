import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Plus, Upload, Calendar, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface NonConformity {
  id: string;
  item: string;
  section: string;
  weight: 1 | 2 | 3;
  auditDate: string;
  responsible: string | null;
  deadline: string | null;
  status: "open" | "in_progress" | "resolved" | "overdue";
  action: string | null;
}

const mockNonConformities: NonConformity[] = [
  { id: "1", item: "EPIs não utilizados corretamente", section: "Segurança", weight: 3, auditDate: "2024-02-03", responsible: "Carlos Oliveira", deadline: "2024-02-10", status: "in_progress", action: "Realizar treinamento de reciclagem sobre uso de EPIs" },
  { id: "2", item: "Área de trabalho desorganizada", section: "5S", weight: 3, auditDate: "2024-02-03", responsible: "Maria Santos", deadline: "2024-02-08", status: "overdue", action: "Reorganizar estações de trabalho e aplicar 5S" },
  { id: "3", item: "Registros com preenchimento incorreto", section: "Documentação", weight: 2, auditDate: "2024-02-01", responsible: null, deadline: null, status: "open", action: null },
  { id: "4", item: "Extintor vencido", section: "Segurança", weight: 3, auditDate: "2024-01-28", responsible: "João Silva", deadline: "2024-02-05", status: "resolved", action: "Substituição do extintor e atualização do plano de manutenção" },
  { id: "5", item: "Documentação desatualizada", section: "ISO", weight: 2, auditDate: "2024-01-25", responsible: "Ana Costa", deadline: "2024-02-15", status: "in_progress", action: "Revisão e atualização dos procedimentos operacionais" },
];

const statusMap = {
  open: { label: "Aberta", variant: "default" as const },
  in_progress: { label: "Em Andamento", variant: "warning" as const },
  resolved: { label: "Resolvida", variant: "success" as const },
  overdue: { label: "Atrasada", variant: "destructive" as const },
};

const weightLabels = {
  1: { label: "Baixo", variant: "weight-low" as const },
  2: { label: "Médio", variant: "weight-medium" as const },
  3: { label: "Alto", variant: "weight-high" as const },
};

export default function TenantNonConformities() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedNC, setSelectedNC] = useState<NonConformity | null>(null);

  const filteredNCs = mockNonConformities.filter((nc) => {
    const matchesSearch = nc.item.toLowerCase().includes(search.toLowerCase()) ||
      nc.section.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || nc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<NonConformity>[] = [
    {
      key: "item",
      header: "Item",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.item}</p>
          <p className="text-sm text-muted-foreground">{row.section}</p>
        </div>
      ),
    },
    {
      key: "weight",
      header: "Criticidade",
      cell: (row) => (
        <StatusBadge variant={weightLabels[row.weight].variant}>
          {weightLabels[row.weight].label}
        </StatusBadge>
      ),
    },
    {
      key: "responsible",
      header: "Responsável",
      cell: (row) => row.responsible || <span className="text-muted-foreground">Não definido</span>,
    },
    {
      key: "deadline",
      header: "Prazo",
      cell: (row) => row.deadline ? new Date(row.deadline).toLocaleDateString("pt-BR") : <span className="text-muted-foreground">-</span>,
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
      key: "actions",
      header: "",
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedNC(row);
          }}
        >
          Gerenciar
        </Button>
      ),
      className: "w-24",
    },
  ];

  // Stats
  const stats = {
    total: mockNonConformities.length,
    open: mockNonConformities.filter((nc) => nc.status === "open").length,
    inProgress: mockNonConformities.filter((nc) => nc.status === "in_progress").length,
    overdue: mockNonConformities.filter((nc) => nc.status === "overdue").length,
    resolved: mockNonConformities.filter((nc) => nc.status === "resolved").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Não Conformidades"
        description="Gerencie as não conformidades e planos de ação"
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Abertas</p>
              <p className="text-2xl font-bold">{stats.open}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Em Andamento</p>
              <p className="text-2xl font-bold text-warning">{stats.inProgress}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-warning-light flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Atrasadas</p>
              <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-destructive-light flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Resolvidas</p>
              <p className="text-2xl font-bold text-success">{stats.resolved}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-success-light flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">Abertas</SelectItem>
            <SelectItem value="in_progress">Em Andamento</SelectItem>
            <SelectItem value="overdue">Atrasadas</SelectItem>
            <SelectItem value="resolved">Resolvidas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredNCs} />

      {/* Detail Dialog */}
      <Dialog open={!!selectedNC} onOpenChange={() => setSelectedNC(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Plano de Ação</DialogTitle>
          </DialogHeader>
          {selectedNC && (
            <div className="space-y-6">
              <div className="rounded-lg border p-4 bg-muted/30">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{selectedNC.item}</p>
                    <p className="text-sm text-muted-foreground">{selectedNC.section}</p>
                  </div>
                  <StatusBadge variant={weightLabels[selectedNC.weight].variant}>
                    {weightLabels[selectedNC.weight].label}
                  </StatusBadge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Responsável
                  </Label>
                  <Select defaultValue={selectedNC.responsible || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Carlos Oliveira">Carlos Oliveira</SelectItem>
                      <SelectItem value="Maria Santos">Maria Santos</SelectItem>
                      <SelectItem value="João Silva">João Silva</SelectItem>
                      <SelectItem value="Ana Costa">Ana Costa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Prazo
                  </Label>
                  <Input type="date" defaultValue={selectedNC.deadline || undefined} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ação Corretiva</Label>
                <Textarea
                  placeholder="Descreva a ação corretiva a ser tomada..."
                  defaultValue={selectedNC.action || ""}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Evidência de Resolução</Label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload de Arquivo
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Nenhum arquivo anexado
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <Select defaultValue={selectedNC.status}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aberta</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="resolved">Resolvida</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setSelectedNC(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setSelectedNC(null)}>
                    Salvar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
