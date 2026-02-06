import { useState, useRef } from "react";
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
  Loader2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useChecklists } from "@/hooks/tenant/useChecklists";
import { useCreateAudit, useSaveDraft, useFinalizeAudit } from "@/hooks/tenant/useAudits";
import { useUploadPhoto } from "@/hooks/tenant/useUploads";
import { useToast } from "@/hooks/use-toast";
import { checklistsService } from "@/services/tenant/checklists";
import type { AnswerPayload, AuditSectionDetail, ChecklistSection } from "@/types/api";

interface LocalQuestion {
  id: number;
  text: string;
  weight: 1 | 2 | 3;
  photoRequired: boolean;
  commentRequired: boolean;
  answer?: "conform" | "non-conform" | "na";
  comment?: string;
  photos: string[];
}

interface LocalSection {
  id: number;
  name: string;
  questions: LocalQuestion[];
}

const weightLabels = {
  1: { label: "Baixo", variant: "weight-low" as const },
  2: { label: "Médio", variant: "weight-medium" as const },
  3: { label: "Alto", variant: "weight-high" as const },
};

const safeNumber = (value: unknown, fallback: number): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default function TenantAuditExecution() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Setup state
  const [phase, setPhase] = useState<"setup" | "execution">("setup");
  const [selectedChecklistId, setSelectedChecklistId] = useState<string>("");
  const [unit, setUnit] = useState("");
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split("T")[0]);

  // Execution state
  const [auditId, setAuditId] = useState<string | null>(null);
  const [auditTitle, setAuditTitle] = useState("");
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sections, setSections] = useState<LocalSection[]>([]);
  const [showCommentFor, setShowCommentFor] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<number | null>(null);

  // Hooks
  const { data: checklistsData, isLoading: loadingChecklists } = useChecklists({ status: "active" } as never);
  const createAudit = useCreateAudit();
  const saveDraft = useSaveDraft();
  const finalizeAudit = useFinalizeAudit();
  const uploadPhoto = useUploadPhoto();

  const mapSectionsFromApi = (apiSections: AuditSectionDetail[]): LocalSection[] =>
    apiSections.map((s) => ({
      id: s.id,
      name: s.name,
      questions: s.questions.map((q) => ({
        id: q.id,
        text: q.text,
        weight: q.weight,
        photoRequired: q.photo_required,
        commentRequired: q.comment_required,
        answer: q.answer ?? undefined,
        comment: q.comment ?? undefined,
        photos: q.photos ?? [],
      })),
    }));

  const mapSectionsFromChecklist = (sections: ChecklistSection[]): LocalSection[] =>
    sections.map((s, sIdx) => ({
      id: safeNumber(s.id, sIdx + 1),
      name: s.name,
      questions: s.questions.map((q, qIdx) => ({
        id: safeNumber(q.id, (sIdx + 1) * 1000 + qIdx + 1),
        text: q.text,
        weight: q.weight,
        photoRequired: q.photo_required,
        commentRequired: q.comment_required,
        photos: [],
      })),
    }));

  const handleStartAudit = () => {
    if (!selectedChecklistId || !unit) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    createAudit.mutate(
      {
        checklist_id: selectedChecklistId,
        unit,
        date: auditDate,
      },
      {
        onSuccess: async (response) => {
          setAuditId(response.audit.id);
          setAuditTitle(`${response.audit.checklist_name} | ${response.audit.unit}`);
          const apiSections = response.audit.sections ?? [];
          if (Array.isArray(apiSections) && apiSections.length > 0) {
            setSections(mapSectionsFromApi(apiSections));
            setPhase("execution");
            return;
          }
          try {
            const checklist = await checklistsService.getById(selectedChecklistId);
            setSections(mapSectionsFromChecklist(checklist.sections ?? []));
          } catch {
            toast({
              title: "Auditoria criada, mas não foi possível carregar as perguntas",
              variant: "destructive",
            });
          } finally {
            setPhase("execution");
          }
        },
        onError: () => {
          toast({ title: "Erro ao criar auditoria", variant: "destructive" });
        },
      }
    );
  };

  // Execution logic
  const currentSection = sections[currentSectionIndex];
  const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0);
  const answeredQuestions = sections.reduce(
    (acc, s) => acc + s.questions.filter((q) => q.answer).length,
    0
  );
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

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
        } else if (q.answer !== "na") {
          maxPoints += q.weight;
        }
      });
    });

    const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    return { score, totalPoints, maxPoints, nonConformities, criticalNC };
  };

  const stats = calculateScore();

  const updateAnswer = (questionId: number, answer: "conform" | "non-conform" | "na") => {
    setSections(sections.map((s) => ({
      ...s,
      questions: s.questions.map((q) =>
        q.id === questionId ? { ...q, answer } : q
      ),
    })));

    const question = currentSection?.questions.find((q) => q.id === questionId);
    if (answer === "non-conform" && question?.commentRequired) {
      setShowCommentFor(String(questionId));
    } else {
      setShowCommentFor(null);
    }
  };

  const updateComment = (questionId: number, comment: string) => {
    setSections(sections.map((s) => ({
      ...s,
      questions: s.questions.map((q) =>
        q.id === questionId ? { ...q, comment } : q
      ),
    })));
  };

  const buildAnswerPayloads = (): AnswerPayload[] => {
    const answers: AnswerPayload[] = [];
    sections.forEach((s) => {
      s.questions.forEach((q) => {
        if (q.answer) {
          answers.push({
            question_id: q.id,
            answer: q.answer,
            comment: q.comment,
            photos: q.photos.length > 0 ? q.photos : undefined,
          });
        }
      });
    });
    return answers;
  };

  const handleSaveDraft = () => {
    if (!auditId) return;
    saveDraft.mutate(
      { id: auditId, answers: buildAnswerPayloads() },
      {
        onSuccess: () => toast({ title: "Rascunho salvo com sucesso" }),
        onError: () => toast({ title: "Erro ao salvar rascunho", variant: "destructive" }),
      }
    );
  };

  const handleFinalize = () => {
    if (!auditId) return;
    saveDraft.mutate(
      { id: auditId, answers: buildAnswerPayloads() },
      {
        onSuccess: () => {
          finalizeAudit.mutate(auditId, {
            onSuccess: (response) => {
              toast({ title: `Auditoria finalizada! Nota: ${response.score}%` });
              navigate(`/tenant/auditorias/${auditId}/resultado`);
            },
            onError: () => toast({ title: "Erro ao finalizar auditoria", variant: "destructive" }),
          });
        },
        onError: () => toast({ title: "Erro ao salvar respostas", variant: "destructive" }),
      }
    );
  };

  const handlePhotoUpload = (questionId: number) => {
    setUploadingFor(questionId);
    fileInputRef.current?.click();
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingFor === null) return;
    const qId = uploadingFor;
    uploadPhoto.mutate(file, {
      onSuccess: (result) => {
        setSections(sections.map((s) => ({
          ...s,
          questions: s.questions.map((q) =>
            q.id === qId ? { ...q, photos: [...q.photos, result.url] } : q
          ),
        })));
        toast({ title: "Foto enviada com sucesso" });
      },
      onError: () => toast({ title: "Erro ao enviar foto", variant: "destructive" }),
    });
    setUploadingFor(null);
    e.target.value = "";
  };

  // Setup phase
  if (phase === "setup") {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Nova Auditoria"
          description="Configure os dados da auditoria antes de iniciar"
        />
        <Card>
          <CardHeader>
            <CardTitle>Configuração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Checklist</Label>
              <Select value={selectedChecklistId} onValueChange={setSelectedChecklistId}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingChecklists ? "Carregando..." : "Selecione um checklist"} />
                </SelectTrigger>
                <SelectContent>
                  {(checklistsData?.data ?? []).map((cl) => (
                    <SelectItem key={cl.id} value={String(cl.id)}>
                      {cl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unidade / Local</Label>
              <Input
                placeholder="Ex: Planta A, Cozinha Central..."
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={auditDate}
                onChange={(e) => setAuditDate(e.target.value)}
              />
            </div>
            <Button
              onClick={handleStartAudit}
              disabled={createAudit.isPending}
              className="gap-2"
            >
              {createAudit.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Iniciar Auditoria
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Execution phase
  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileSelected}
      />
      <PageHeader
        title="Execução de Auditoria"
        description={auditTitle}
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
      {currentSection && (
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
                {(showCommentFor === String(question.id) || (question.answer === "non-conform" && question.comment)) && (
                  <div className="mt-4 space-y-2">
                    <Textarea
                      placeholder="Descreva a não conformidade encontrada..."
                      value={question.comment || ""}
                      onChange={(e) => updateComment(question.id, e.target.value)}
                      className="min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => handlePhotoUpload(question.id)}
                        disabled={uploadPhoto.isPending}
                      >
                        <Camera className="h-4 w-4" />
                        {uploadPhoto.isPending ? "Enviando..." : "Adicionar Foto"}
                      </Button>
                    </div>
                    {question.photos.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {question.photos.map((url, i) => (
                          <img key={i} src={url} alt={`Foto ${i + 1}`} className="h-16 w-16 rounded object-cover border" />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

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
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleSaveDraft}
              disabled={saveDraft.isPending}
            >
              {saveDraft.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Rascunho
            </Button>
            <Button
              className="gap-2"
              onClick={handleFinalize}
              disabled={finalizeAudit.isPending || saveDraft.isPending}
            >
              {finalizeAudit.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Finalizar Auditoria
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
