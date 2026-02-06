import { useState } from "react";
import { Search, Filter, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useReports, useDownloadAuditPdf, useDownloadConsolidatedPdf } from "@/hooks/tenant/useReports";
import { useToast } from "@/hooks/use-toast";
import type { ReportListItem } from "@/types/api";

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-success";
  if (score >= 70) return "text-warning";
  return "text-destructive";
};

export default function TenantReports() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [checklistFilter, setChecklistFilter] = useState<string>("all");
  const [unitFilter, setUnitFilter] = useState<string>("all");
  const [scoreFilter, setScoreFilter] = useState<string>("all");

  const { data: reportsData, isLoading } = useReports({
    search: search || undefined,
    checklist: checklistFilter !== "all" ? checklistFilter : undefined,
    unit: unitFilter !== "all" ? unitFilter : undefined,
    score_range: scoreFilter !== "all" ? scoreFilter : undefined,
  });

  const downloadPdf = useDownloadAuditPdf();
  const downloadConsolidated = useDownloadConsolidatedPdf();

  const handleDownloadPdf = (auditId: string) => {
    downloadPdf.mutate(auditId, {
      onError: () => toast({ title: "Erro ao gerar PDF", variant: "destructive" }),
    });
  };

  const handleDownloadConsolidated = () => {
    downloadConsolidated.mutate(
      {
        search: search || undefined,
        checklist: checklistFilter !== "all" ? checklistFilter : undefined,
        unit: unitFilter !== "all" ? unitFilter : undefined,
        score_range: scoreFilter !== "all" ? scoreFilter : undefined,
      },
      {
        onError: () => toast({ title: "Erro ao gerar relatório consolidado", variant: "destructive" }),
      }
    );
  };

  const columns: Column<ReportListItem>[] = [
    {
      key: "checklist",
      header: "Checklist",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.checklist}</p>
          <p className="text-sm text-muted-foreground">{row.unit}</p>
        </div>
      ),
    },
    {
      key: "auditor",
      header: "Auditor",
      cell: (row) => row.auditor,
    },
    {
      key: "date",
      header: "Data",
      cell: (row) => new Date(row.date).toLocaleDateString("pt-BR"),
    },
    {
      key: "score",
      header: "Nota",
      cell: (row) => (
        <span className={cn("text-lg font-bold", getScoreColor(row.score))}>
          {row.score}%
        </span>
      ),
    },
    {
      key: "nonConformities",
      header: "NC",
      cell: (row) =>
        row.non_conformities > 0 ? (
          <StatusBadge variant="destructive">{row.non_conformities}</StatusBadge>
        ) : (
          <StatusBadge variant="success">0</StatusBadge>
        ),
    },
    {
      key: "actions",
      header: "",
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => handleDownloadPdf(row.id)}
          disabled={downloadPdf.isPending}
        >
          {downloadPdf.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          PDF
        </Button>
      ),
      className: "w-24",
    },
  ];

  // Unique values for filters from API data
  const reports = reportsData?.data ?? [];
  const checklists = [...new Set(reports.map((r) => r.checklist))];
  const units = [...new Set(reports.map((r) => r.unit))];
  const summary = reportsData?.summary;

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
        title="Relatórios"
        description="Consulte e exporte relatórios de auditorias"
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total de Auditorias</p>
            <p className="text-3xl font-bold">{summary?.total_audits ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Média de Conformidade</p>
            <p className="text-3xl font-bold text-success">
              {summary?.average_compliance ?? 0}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Auditorias Críticas</p>
            <p className="text-3xl font-bold text-destructive">
              {summary?.critical_audits ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">NC Totais</p>
            <p className="text-3xl font-bold text-warning">
              {summary?.total_ncs ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={checklistFilter} onValueChange={setChecklistFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Checklist" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Checklists</SelectItem>
                {checklists.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={unitFilter} onValueChange={setUnitFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Unidades</SelectItem>
                {units.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Nota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Notas</SelectItem>
                <SelectItem value="excellent">Excelente (&ge;90%)</SelectItem>
                <SelectItem value="good">Regular (70-89%)</SelectItem>
                <SelectItem value="critical">Crítico (&lt;70%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <DataTable columns={columns} data={reports} />

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          className="gap-2"
          onClick={handleDownloadConsolidated}
          disabled={downloadConsolidated.isPending}
        >
          {downloadConsolidated.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Exportar Relatório Consolidado
        </Button>
      </div>
    </div>
  );
}
