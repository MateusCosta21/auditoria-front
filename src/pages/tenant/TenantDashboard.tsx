import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  TrendingUp,
  AlertTriangle,
  ClipboardList,
  Plus,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Audit {
  id: string;
  checklist: string;
  unit: string;
  auditor: string;
  date: string;
  score: number;
  status: "completed" | "in_progress" | "pending";
  nonConformities: number;
}

const mockAudits: Audit[] = [
  { id: "1", checklist: "5S - Produção", unit: "Planta A", auditor: "João Silva", date: "2024-02-03", score: 87, status: "completed", nonConformities: 3 },
  { id: "2", checklist: "Segurança Alimentar", unit: "Cozinha Central", auditor: "Maria Santos", date: "2024-02-02", score: 92, status: "completed", nonConformities: 2 },
  { id: "3", checklist: "ISO 9001", unit: "Planta B", auditor: "Carlos Oliveira", date: "2024-02-01", score: 78, status: "completed", nonConformities: 5 },
  { id: "4", checklist: "BPF", unit: "Laboratório", auditor: "Ana Costa", date: "2024-02-03", score: 0, status: "in_progress", nonConformities: 0 },
];

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-success";
  if (score >= 70) return "text-warning";
  return "text-destructive";
};

const statusMap = {
  completed: { label: "Concluída", variant: "success" as const },
  in_progress: { label: "Em andamento", variant: "warning" as const },
  pending: { label: "Pendente", variant: "default" as const },
};

export default function TenantDashboard() {
  const navigate = useNavigate();

  const columns: Column<Audit>[] = [
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
      cell: (row) =>
        row.status === "completed" ? (
          <span className={`font-bold ${getScoreColor(row.score)}`}>
            {row.score}%
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "nonConformities",
      header: "NC",
      cell: (row) =>
        row.nonConformities > 0 ? (
          <StatusBadge variant="destructive">{row.nonConformities}</StatusBadge>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
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
        description="Visão geral das suas auditorias"
      />

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate("/tenant/auditorias/nova")} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Auditoria
        </Button>
        <Button variant="outline" onClick={() => navigate("/tenant/checklists")} className="gap-2">
          <ClipboardList className="h-4 w-4" />
          Criar Checklist
        </Button>
        <Button variant="outline" onClick={() => navigate("/tenant/relatorios")} className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Relatórios
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Auditorias no Mês"
          value={24}
          icon={FileCheck}
          variant="primary"
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Conformidade Média"
          value="85%"
          icon={TrendingUp}
          variant="success"
          trend={{ value: 3, isPositive: true }}
        />
        <StatCard
          title="NC Abertas"
          value={12}
          icon={AlertTriangle}
          variant="destructive"
          subtitle="4 críticas"
        />
        <StatCard
          title="Checklists Ativos"
          value={8}
          icon={ClipboardList}
          variant="default"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Conformidade por Área</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Produção", value: 92 },
              { name: "Qualidade", value: 88 },
              { name: "Segurança", value: 76 },
              { name: "Meio Ambiente", value: 94 },
            ].map((area) => (
              <div key={area.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{area.name}</span>
                  <span className={`font-medium ${getScoreColor(area.value)}`}>
                    {area.value}%
                  </span>
                </div>
                <Progress
                  value={area.value}
                  className={`h-2 ${
                    area.value >= 90
                      ? "[&>div]:bg-success"
                      : area.value >= 70
                      ? "[&>div]:bg-warning"
                      : "[&>div]:bg-destructive"
                  }`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>NC por Criticidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-destructive-light">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-destructive" />
                <span className="font-medium">Críticas</span>
              </div>
              <span className="text-xl font-bold text-destructive">4</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-warning-light">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-warning" />
                <span className="font-medium">Médias</span>
              </div>
              <span className="text-xl font-bold text-warning">5</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-success-light">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="font-medium">Baixas</span>
              </div>
              <span className="text-xl font-bold text-success">3</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Audits */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Últimas Auditorias</h2>
          <Button variant="outline" onClick={() => navigate("/tenant/auditorias")}>
            Ver todas
          </Button>
        </div>
        <DataTable
          columns={columns}
          data={mockAudits}
          onRowClick={(row) => navigate(`/tenant/auditorias/${row.id}`)}
        />
      </div>
    </div>
  );
}
