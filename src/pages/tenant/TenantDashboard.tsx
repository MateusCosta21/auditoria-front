import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  TrendingUp,
  AlertTriangle,
  ClipboardList,
  Plus,
  ArrowRight,
  BarChart3,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDashboardStats, useComplianceByArea, useNcBySeverity, useRecentAudits } from "@/hooks/tenant/useDashboard";
import type { AuditListItem } from "@/types/api";

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
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: complianceAreas, isLoading: complianceLoading } = useComplianceByArea();
  const { data: ncSeverity, isLoading: ncLoading } = useNcBySeverity();
  const { data: recentAudits, isLoading: auditsLoading } = useRecentAudits(5);

  const columns: Column<AuditListItem>[] = [
    {
      key: "checklist_name",
      header: "Checklist",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.checklist_name}</p>
          <p className="text-sm text-muted-foreground">{row.unit}</p>
        </div>
      ),
    },
    {
      key: "auditor_name",
      header: "Auditor",
      cell: (row) => row.auditor_name,
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
        row.status === "completed" && row.score !== null ? (
          <span className={`font-bold ${getScoreColor(row.score)}`}>
            {row.score}%
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: "non_conformities_count",
      header: "NC",
      cell: (row) =>
        row.non_conformities_count > 0 ? (
          <StatusBadge variant="destructive">{row.non_conformities_count}</StatusBadge>
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

  const isLoading = statsLoading || complianceLoading || ncLoading || auditsLoading;

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          value={stats?.audits_this_month ?? 0}
          icon={FileCheck}
          variant="primary"
          trend={stats?.audits_trend !== undefined ? { value: stats.audits_trend, isPositive: stats.audits_trend >= 0 } : undefined}
        />
        <StatCard
          title="Conformidade Média"
          value={`${stats?.average_compliance ?? 0}%`}
          icon={TrendingUp}
          variant="success"
          trend={stats?.compliance_trend !== undefined ? { value: stats.compliance_trend, isPositive: stats.compliance_trend >= 0 } : undefined}
        />
        <StatCard
          title="NC Abertas"
          value={stats?.open_ncs ?? 0}
          icon={AlertTriangle}
          variant="destructive"
          subtitle={stats?.critical_ncs ? `${stats.critical_ncs} críticas` : undefined}
        />
        <StatCard
          title="Checklists Ativos"
          value={stats?.active_checklists ?? 0}
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
            {(complianceAreas ?? []).map((area) => (
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
              <span className="text-xl font-bold text-destructive">{ncSeverity?.critical ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-warning-light">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-warning" />
                <span className="font-medium">Médias</span>
              </div>
              <span className="text-xl font-bold text-warning">{ncSeverity?.medium ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-success-light">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="font-medium">Baixas</span>
              </div>
              <span className="text-xl font-bold text-success">{ncSeverity?.low ?? 0}</span>
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
          data={recentAudits ?? []}
          onRowClick={(row) => navigate(`/tenant/auditorias/${row.id}`)}
        />
      </div>
    </div>
  );
}
