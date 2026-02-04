import { useState } from "react";
import { Search, Filter, Download, Calendar } from "lucide-react";
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

interface AuditReport {
  id: string;
  checklist: string;
  unit: string;
  auditor: string;
  date: string;
  score: number;
  status: "completed" | "in_progress";
  nonConformities: number;
}

const mockReports: AuditReport[] = [
  { id: "1", checklist: "5S - Produção", unit: "Planta A", auditor: "João Silva", date: "2024-02-03", score: 87, status: "completed", nonConformities: 3 },
  { id: "2", checklist: "Segurança Alimentar", unit: "Cozinha Central", auditor: "Maria Santos", date: "2024-02-02", score: 92, status: "completed", nonConformities: 2 },
  { id: "3", checklist: "ISO 9001", unit: "Planta B", auditor: "Carlos Oliveira", date: "2024-02-01", score: 78, status: "completed", nonConformities: 5 },
  { id: "4", checklist: "BPF", unit: "Laboratório", auditor: "Ana Costa", date: "2024-01-30", score: 95, status: "completed", nonConformities: 1 },
  { id: "5", checklist: "5S - Produção", unit: "Planta B", auditor: "João Silva", date: "2024-01-28", score: 82, status: "completed", nonConformities: 4 },
  { id: "6", checklist: "Meio Ambiente", unit: "Geral", auditor: "Maria Santos", date: "2024-01-25", score: 68, status: "completed", nonConformities: 6 },
];

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-success";
  if (score >= 70) return "text-warning";
  return "text-destructive";
};

export default function TenantReports() {
  const [search, setSearch] = useState("");
  const [checklistFilter, setChecklistFilter] = useState<string>("all");
  const [unitFilter, setUnitFilter] = useState<string>("all");
  const [scoreFilter, setScoreFilter] = useState<string>("all");

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch = report.checklist.toLowerCase().includes(search.toLowerCase()) ||
      report.unit.toLowerCase().includes(search.toLowerCase()) ||
      report.auditor.toLowerCase().includes(search.toLowerCase());
    const matchesChecklist = checklistFilter === "all" || report.checklist === checklistFilter;
    const matchesUnit = unitFilter === "all" || report.unit === unitFilter;
    const matchesScore = scoreFilter === "all" ||
      (scoreFilter === "excellent" && report.score >= 90) ||
      (scoreFilter === "good" && report.score >= 70 && report.score < 90) ||
      (scoreFilter === "critical" && report.score < 70);
    return matchesSearch && matchesChecklist && matchesUnit && matchesScore;
  });

  const columns: Column<AuditReport>[] = [
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
        row.nonConformities > 0 ? (
          <StatusBadge variant="destructive">{row.nonConformities}</StatusBadge>
        ) : (
          <StatusBadge variant="success">0</StatusBadge>
        ),
    },
    {
      key: "actions",
      header: "",
      cell: (row) => (
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          PDF
        </Button>
      ),
      className: "w-24",
    },
  ];

  // Unique values for filters
  const checklists = [...new Set(mockReports.map((r) => r.checklist))];
  const units = [...new Set(mockReports.map((r) => r.unit))];

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
            <p className="text-3xl font-bold">{mockReports.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Média de Conformidade</p>
            <p className="text-3xl font-bold text-success">
              {Math.round(mockReports.reduce((acc, r) => acc + r.score, 0) / mockReports.length)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Auditorias Críticas</p>
            <p className="text-3xl font-bold text-destructive">
              {mockReports.filter((r) => r.score < 70).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">NC Totais</p>
            <p className="text-3xl font-bold text-warning">
              {mockReports.reduce((acc, r) => acc + r.nonConformities, 0)}
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
                <SelectItem value="excellent">Excelente (≥90%)</SelectItem>
                <SelectItem value="good">Regular (70-89%)</SelectItem>
                <SelectItem value="critical">Crítico (&lt;70%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <DataTable columns={columns} data={filteredReports} />

      {/* Export Button */}
      <div className="flex justify-end">
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Relatório Consolidado
        </Button>
      </div>
    </div>
  );
}
