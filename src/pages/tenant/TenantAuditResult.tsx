import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Share2,
  Printer,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Signature,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface NonConformity {
  id: string;
  section: string;
  question: string;
  weight: 1 | 2 | 3;
  comment: string;
}

const mockNonConformities: NonConformity[] = [
  { id: "1", section: "Segurança", question: "Os EPIs estão sendo utilizados corretamente?", weight: 3, comment: "Colaborador sem óculos de proteção na área de soldagem" },
  { id: "2", section: "Organização", question: "As áreas de trabalho estão limpas e ordenadas?", weight: 3, comment: "Materiais espalhados na área de montagem" },
  { id: "3", section: "Documentação", question: "Os registros estão preenchidos corretamente?", weight: 2, comment: "Falta assinatura do supervisor no formulário de inspeção" },
];

const sectionScores = [
  { name: "Organização (5S)", score: 75, maxScore: 100 },
  { name: "Segurança", score: 66, maxScore: 100 },
  { name: "Documentação", score: 100, maxScore: 100 },
];

const weightLabels = {
  1: { label: "Baixo", variant: "weight-low" as const },
  2: { label: "Médio", variant: "weight-medium" as const },
  3: { label: "Alto", variant: "weight-high" as const },
};

export default function TenantAuditResult() {
  const navigate = useNavigate();
  const finalScore = 78;

  const getScoreColor = (score: number) => {
    if (score >= 90) return { color: "text-success", bg: "bg-success", status: "Excelente" };
    if (score >= 70) return { color: "text-warning", bg: "bg-warning", status: "Regular" };
    return { color: "text-destructive", bg: "bg-destructive", status: "Crítico" };
  };

  const scoreStyle = getScoreColor(finalScore);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Resultado da Auditoria"
        description="5S - Produção | Planta A | 03/02/2024"
      >
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/tenant/auditorias")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Gerar PDF
          </Button>
        </div>
      </PageHeader>

      {/* Main Score Card */}
      <Card className={cn("border-2", finalScore >= 90 ? "border-success" : finalScore >= 70 ? "border-warning" : "border-destructive")}>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className={cn("flex h-32 w-32 items-center justify-center rounded-full", scoreStyle.bg)}>
              <span className="text-5xl font-bold text-white">{finalScore}%</span>
            </div>
            <div>
              <h2 className={cn("text-3xl font-bold", scoreStyle.color)}>
                {scoreStyle.status}
              </h2>
              <p className="text-muted-foreground">
                Conformidade da auditoria
              </p>
            </div>
            <div className="flex gap-8 text-center">
              <div>
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-2xl font-bold">6</span>
                </div>
                <p className="text-sm text-muted-foreground">Conformes</p>
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <span className="text-2xl font-bold">3</span>
                </div>
                <p className="text-sm text-muted-foreground">Não Conformes</p>
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <span className="text-2xl font-bold">2</span>
                </div>
                <p className="text-sm text-muted-foreground">Críticas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Nota por Seção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sectionScores.map((section) => {
            const percentage = Math.round((section.score / section.maxScore) * 100);
            const style = getScoreColor(percentage);
            return (
              <div key={section.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{section.name}</span>
                  <span className={cn("font-bold", style.color)}>{percentage}%</span>
                </div>
                <Progress
                  value={percentage}
                  className={cn(
                    "h-3",
                    percentage >= 90 ? "[&>div]:bg-success" : percentage >= 70 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"
                  )}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Non-Conformities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Não Conformidades ({mockNonConformities.length})
          </CardTitle>
          <Button variant="outline" onClick={() => navigate("/tenant/nao-conformidades")}>
            Gerenciar Planos de Ação
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockNonConformities
            .sort((a, b) => b.weight - a.weight)
            .map((nc, index) => (
              <div
                key={nc.id}
                className={cn(
                  "rounded-lg border p-4",
                  nc.weight === 3 && "border-destructive bg-destructive-light/30"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white",
                      nc.weight === 3 ? "bg-destructive" : nc.weight === 2 ? "bg-warning" : "bg-success"
                    )}>
                      {index + 1}
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{nc.section}</p>
                      <p className="font-medium">{nc.question}</p>
                      <p className="text-sm text-muted-foreground">{nc.comment}</p>
                    </div>
                  </div>
                  <StatusBadge variant={weightLabels[nc.weight].variant}>
                    {weightLabels[nc.weight].label}
                  </StatusBadge>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      {/* Signatures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Signature className="h-5 w-5" />
            Assinaturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Auditor</p>
              <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed bg-muted/30">
                <p className="text-muted-foreground">João da Silva</p>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Assinado digitalmente em 03/02/2024 às 15:32
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Responsável da Área</p>
              <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed bg-muted/30">
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Solicitar Assinatura
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Aguardando assinatura
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
