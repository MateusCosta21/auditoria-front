import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  X,
  Minus,
  Camera,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  text: string;
  weight: 1 | 2 | 3;
  photoRequired: boolean;
  commentRequired: boolean;
  answer?: "conform" | "non-conform" | "na";
  comment?: string;
  photos?: string[];
}

interface Section {
  id: string;
  name: string;
  questions: Question[];
}

const weightLabels = {
  1: { label: "Baixo", variant: "weight-low" as const },
  2: { label: "Médio", variant: "weight-medium" as const },
  3: { label: "Alto", variant: "weight-high" as const },
};

const mockSections: Section[] = [
  {
    id: "1",
    name: "Organização (5S)",
    questions: [
      { id: "1-1", text: "Os materiais estão organizados no local adequado?", weight: 2, photoRequired: false, commentRequired: true },
      { id: "1-2", text: "As áreas de trabalho estão limpas e ordenadas?", weight: 3, photoRequired: true, commentRequired: true },
      { id: "1-3", text: "Os equipamentos estão em bom estado de conservação?", weight: 2, photoRequired: false, commentRequired: true },
      { id: "1-4", text: "Os documentos estão organizados e acessíveis?", weight: 1, photoRequired: false, commentRequired: false },
    ],
  },
  {
    id: "2",
    name: "Segurança",
    questions: [
      { id: "2-1", text: "Os EPIs estão sendo utilizados corretamente?", weight: 3, photoRequired: true, commentRequired: true },
      { id: "2-2", text: "As saídas de emergência estão desobstruídas?", weight: 3, photoRequired: true, commentRequired: true },
      { id: "2-3", text: "Os extintores estão dentro da validade?", weight: 3, photoRequired: true, commentRequired: true },
    ],
  },
  {
    id: "3",
    name: "Documentação",
    questions: [
      { id: "3-1", text: "Os registros estão preenchidos corretamente?", weight: 2, photoRequired: false, commentRequired: true },
      { id: "3-2", text: "Os procedimentos estão atualizados?", weight: 2, photoRequired: false, commentRequired: true },
    ],
  },
];

export default function TenantAuditExecution() {
  const navigate = useNavigate();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sections, setSections] = useState<Section[]>(mockSections);
  const [showCommentFor, setShowCommentFor] = useState<string | null>(null);

  const currentSection = sections[currentSectionIndex];
  const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0);
  const answeredQuestions = sections.reduce(
    (acc, s) => acc + s.questions.filter((q) => q.answer).length,
    0
  );
  const progress = (answeredQuestions / totalQuestions) * 100;

  // Calculate scores
  const calculateScore = () => {
    let totalPoints = 0;
    let maxPoints = 0;
    let nonConformities = 0;
    let criticalNC = 0;

    sections.forEach((section) => {
      section.questions.forEach((q) => {
        if (q.answer === "conform") {
          totalPoints += q.weight;
          maxPoints += q.weight;
        } else if (q.answer === "non-conform") {
          maxPoints += q.weight;
          nonConformities++;
          if (q.weight === 3) criticalNC++;
        } else if (q.answer === "na") {
          // N/A doesn't count
        } else {
          // Unanswered
          maxPoints += q.weight;
        }
      });
    });

    const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    return { score, totalPoints, maxPoints, nonConformities, criticalNC };
  };

  const stats = calculateScore();

  const updateAnswer = (questionId: string, answer: "conform" | "non-conform" | "na") => {
    setSections(sections.map((s) => ({
      ...s,
      questions: s.questions.map((q) =>
        q.id === questionId ? { ...q, answer } : q
      ),
    })));

    // If non-conform and comment required, show comment box
    const question = currentSection.questions.find((q) => q.id === questionId);
    if (answer === "non-conform" && question?.commentRequired) {
      setShowCommentFor(questionId);
    } else {
      setShowCommentFor(null);
    }
  };

  const updateComment = (questionId: string, comment: string) => {
    setSections(sections.map((s) => ({
      ...s,
      questions: s.questions.map((q) =>
        q.id === questionId ? { ...q, comment } : q
      ),
    })));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <PageHeader
        title="Execução de Auditoria"
        description="5S - Produção | Planta A"
      />

      {/* Stepper */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {sections.map((section, index) => {
          const sectionAnswered = section.questions.filter((q) => q.answer).length;
          const isComplete = sectionAnswered === section.questions.length;
          const isCurrent = index === currentSectionIndex;

          return (
            <button
              key={section.id}
              onClick={() => setCurrentSectionIndex(index)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap",
                isCurrent
                  ? "bg-primary text-primary-foreground"
                  : isComplete
                  ? "bg-success-light text-success"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">
                {isComplete ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              {section.name}
              <StatusBadge variant="default" className="ml-1">
                {sectionAnswered}/{section.questions.length}
              </StatusBadge>
            </button>
          );
        })}
      </div>

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>{currentSection.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentSection.questions.map((question, index) => (
            <div
              key={question.id}
              className={cn(
                "rounded-lg border p-4 transition-all",
                question.answer === "conform" && "border-success bg-success-light/30",
                question.answer === "non-conform" && "border-destructive bg-destructive-light/30",
                question.answer === "na" && "border-muted bg-muted/30"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {index + 1}
                  </span>
                  <div className="space-y-2">
                    <p className="font-medium">{question.text}</p>
                    <div className="flex items-center gap-2">
                      <StatusBadge variant={weightLabels[question.weight].variant}>
                        Peso: {weightLabels[question.weight].label}
                      </StatusBadge>
                      {question.photoRequired && (
                        <StatusBadge variant="default" className="gap-1">
                          <Camera className="h-3 w-3" />
                          Foto
                        </StatusBadge>
                      )}
                      {question.commentRequired && (
                        <StatusBadge variant="default" className="gap-1">
                          <MessageSquare className="h-3 w-3" />
                          Comentário
                        </StatusBadge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Answer Buttons */}
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant={question.answer === "conform" ? "default" : "outline"}
                    className={cn(
                      "gap-1.5",
                      question.answer === "conform" && "bg-success hover:bg-success/90"
                    )}
                    onClick={() => updateAnswer(question.id, "conform")}
                  >
                    <Check className="h-4 w-4" />
                    C
                  </Button>
                  <Button
                    size="sm"
                    variant={question.answer === "non-conform" ? "default" : "outline"}
                    className={cn(
                      "gap-1.5",
                      question.answer === "non-conform" && "bg-destructive hover:bg-destructive/90"
                    )}
                    onClick={() => updateAnswer(question.id, "non-conform")}
                  >
                    <X className="h-4 w-4" />
                    NC
                  </Button>
                  <Button
                    size="sm"
                    variant={question.answer === "na" ? "default" : "outline"}
                    className={cn(
                      "gap-1.5",
                      question.answer === "na" && "bg-muted-foreground hover:bg-muted-foreground/90"
                    )}
                    onClick={() => updateAnswer(question.id, "na")}
                  >
                    <Minus className="h-4 w-4" />
                    N/A
                  </Button>
                </div>
              </div>

              {/* Comment Section (for NC) */}
              {(showCommentFor === question.id || (question.answer === "non-conform" && question.comment)) && (
                <div className="mt-4 space-y-2">
                  <Textarea
                    placeholder="Descreva a não conformidade encontrada..."
                    value={question.comment || ""}
                    onChange={(e) => updateComment(question.id, e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5">
                      <Camera className="h-4 w-4" />
                      Adicionar Foto
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
          disabled={currentSectionIndex === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Seção Anterior
        </Button>
        <Button
          variant="outline"
          onClick={() => setCurrentSectionIndex(Math.min(sections.length - 1, currentSectionIndex + 1))}
          disabled={currentSectionIndex === sections.length - 1}
          className="gap-2"
        >
          Próxima Seção
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Bottom Bar - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-card p-4 shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Progresso</p>
              <div className="flex items-center gap-2">
                <Progress value={progress} className="h-2 w-32" />
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div>
              <p className="text-sm text-muted-foreground">Nota Parcial</p>
              <p className={cn(
                "text-2xl font-bold",
                stats.score >= 90 ? "text-success" : stats.score >= 70 ? "text-warning" : "text-destructive"
              )}>
                {stats.score}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pontos</p>
              <p className="text-lg font-semibold">
                {stats.totalPoints} / {stats.maxPoints}
              </p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex items-center gap-2">
              <AlertTriangle className={cn(
                "h-5 w-5",
                stats.criticalNC > 0 ? "text-destructive" : "text-muted-foreground"
              )} />
              <div>
                <p className="text-sm text-muted-foreground">Não Conformidades</p>
                <p className="font-semibold">
                  {stats.nonConformities} total
                  {stats.criticalNC > 0 && (
                    <span className="ml-2 text-destructive">({stats.criticalNC} críticas)</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Save className="h-4 w-4" />
              Salvar Rascunho
            </Button>
            <Button
              className="gap-2"
              onClick={() => navigate("/tenant/auditorias/1/resultado")}
            >
              <Send className="h-4 w-4" />
              Finalizar Auditoria
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
