import { useState, useRef } from "react";
import { Search, Filter, Upload, Calendar, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNonConformities, useUpdateNonConformity } from "@/hooks/tenant/useNonConformities";
import { useToast } from "@/hooks/use-toast";
import type { NonConformityListItem } from "@/types/api";

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
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedNC, setSelectedNC] = useState<NonConformityListItem | null>(null);

  // Dialog form state
  const [formResponsible, setFormResponsible] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formAction, setFormAction] = useState("");
  const [formStatus, setFormStatus] = useState("open");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  const { data: ncData, isLoading } = useNonConformities({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const updateMutation = useUpdateNonConformity();

  const openDialog = (nc: NonConformityListItem) => {
    setSelectedNC(nc);
    setFormResponsible(nc.responsible || "");
    setFormDeadline(nc.deadline || "");
    setFormAction(nc.action || "");
    setFormStatus(nc.status);
    setEvidenceFile(null);
  };

  const handleSave = () => {
    if (!selectedNC) return;
    const formData = new FormData();
    formData.append("responsible", formResponsible);
    formData.append("deadline", formDeadline);
    formData.append("action", formAction);
    formData.append("status", formStatus);
    if (evidenceFile) {
      formData.append("evidence", evidenceFile);
    }
    updateMutation.mutate(
      { id: selectedNC.id, formData },
      {
        onSuccess: () => {
          toast({ title: "Não conformidade atualizada" });
          setSelectedNC(null);
        },
        onError: () => {
          toast({ title: "Erro ao atualizar", variant: "destructive" });
        },
      }
    );
  };

  const columns: Column<NonConformityListItem>[] = [
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
            openDialog(row);
          }}
        >
          Gerenciar
        </Button>
      ),
      className: "w-24",
    },
  ];

  const stats = ncData?.stats;

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
        title="Não Conformidades"
        description="Gerencie as não conformidades e planos de ação"
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Abertas</p>
              <p className="text-2xl font-bold">{stats?.open ?? 0}</p>
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
              <p className="text-2xl font-bold text-warning">{stats?.in_progress ?? 0}</p>
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
              <p className="text-2xl font-bold text-destructive">{stats?.overdue ?? 0}</p>
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
              <p className="text-2xl font-bold text-success">{stats?.resolved ?? 0}</p>
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
      <DataTable columns={columns} data={ncData?.data ?? []} />

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
                  <Input
                    placeholder="Nome do responsável"
                    value={formResponsible}
                    onChange={(e) => setFormResponsible(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Prazo
                  </Label>
                  <Input
                    type="date"
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ação Corretiva</Label>
                <Textarea
                  placeholder="Descreva a ação corretiva a ser tomada..."
                  value={formAction}
                  onChange={(e) => setFormAction(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Evidência de Resolução</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setEvidenceFile(file);
                  }}
                />
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Upload de Arquivo
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {evidenceFile ? evidenceFile.name : "Nenhum arquivo anexado"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <Select value={formStatus} onValueChange={setFormStatus}>
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
                  <Button onClick={handleSave} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar"
                    )}
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
