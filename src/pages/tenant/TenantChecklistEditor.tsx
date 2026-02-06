import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, GripVertical, ChevronDown, ChevronRight, Camera, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useChecklist, useCreateChecklist, useUpdateChecklist } from "@/hooks/tenant/useChecklists";
import { useToast } from "@/hooks/use-toast";
import type { SaveChecklistRequest } from "@/types/api";

interface Question {
  id: string;
  text: string;
  weight: 1 | 2 | 3;
  photoRequired: boolean;
  commentRequired: boolean;
}

interface Section {
  id: string;
  name: string;
  questions: Question[];
  isOpen: boolean;
}

export default function TenantChecklistEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const isEditing = !!id;

  const { data: checklist, isLoading: loadingChecklist } = useChecklist(
    isEditing ? Number(id) : undefined
  );
  const createMutation = useCreateChecklist();
  const updateMutation = useUpdateChecklist();

  const [checklistName, setChecklistName] = useState("Novo Checklist");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"active" | "draft">("draft");
  const [sections, setSections] = useState<Section[]>([
    {
      id: "1",
      name: "Seção 1",
      isOpen: true,
      questions: [],
    },
  ]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (checklist && !initialized) {
      setChecklistName(checklist.name);
      setCategory(checklist.category);
      setStatus(checklist.status);
      setSections(
        checklist.sections.map((s, sIdx) => ({
          id: s.id?.toString() ?? `s-${sIdx}`,
          name: s.name,
          isOpen: sIdx === 0,
          questions: s.questions.map((q, qIdx) => ({
            id: q.id?.toString() ?? `q-${sIdx}-${qIdx}`,
            text: q.text,
            weight: q.weight,
            photoRequired: q.photo_required,
            commentRequired: q.comment_required,
          })),
        }))
      );
      setInitialized(true);
    }
  }, [checklist, initialized]);

  const toggleSection = (sectionId: string) => {
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, isOpen: !s.isOpen } : s
    ));
  };

  const addSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      name: `Seção ${sections.length + 1}`,
      isOpen: true,
      questions: [],
    };
    setSections([...sections, newSection]);
  };

  const addQuestion = (sectionId: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          questions: [
            ...s.questions,
            {
              id: `${sectionId}-${Date.now()}`,
              text: "",
              weight: 2 as const,
              photoRequired: false,
              commentRequired: true,
            },
          ],
        };
      }
      return s;
    }));
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          questions: s.questions.map(q =>
            q.id === questionId ? { ...q, ...updates } : q
          ),
        };
      }
      return s;
    }));
  };

  const removeQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        return {
          ...s,
          questions: s.questions.filter(q => q.id !== questionId),
        };
      }
      return s;
    }));
  };

  const buildPayload = (): SaveChecklistRequest => ({
    name: checklistName,
    category,
    status,
    sections: sections.map((s, sIdx) => ({
      name: s.name,
      order: sIdx + 1,
      questions: s.questions.map((q, qIdx) => ({
        text: q.text,
        weight: q.weight,
        photo_required: q.photoRequired,
        comment_required: q.commentRequired,
        order: qIdx + 1,
      })),
    })),
  });

  const handleSave = () => {
    const payload = buildPayload();
    if (isEditing) {
      updateMutation.mutate(
        { id: Number(id), data: payload },
        {
          onSuccess: () => {
            toast({ title: "Checklist atualizado com sucesso" });
            navigate("/tenant/checklists");
          },
          onError: () => {
            toast({ title: "Erro ao salvar checklist", variant: "destructive" });
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast({ title: "Checklist criado com sucesso" });
          navigate("/tenant/checklists");
        },
        onError: () => {
          toast({ title: "Erro ao criar checklist", variant: "destructive" });
        },
      });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isEditing && loadingChecklist) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Editor de Checklist"
        description="Configure as seções e perguntas do seu checklist"
      >
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/tenant/checklists")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Checklist"
            )}
          </Button>
        </div>
      </PageHeader>

      {/* Checklist Info */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Checklist</Label>
              <Input
                id="name"
                value={checklistName}
                onChange={(e) => setChecklistName(e.target.value)}
                className="text-lg font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Qualidade, Segurança, ISO..."
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as "active" | "draft")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.id}>
            <Collapsible open={section.isOpen} onOpenChange={() => toggleSection(section.id)}>
              <CardHeader className="pb-3">
                <CollapsibleTrigger className="flex w-full items-center gap-3">
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                  {section.isOpen ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                  <Input
                    value={section.name}
                    onChange={(e) => {
                      e.stopPropagation();
                      setSections(sections.map(s =>
                        s.id === section.id ? { ...s, name: e.target.value } : s
                      ));
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 border-0 bg-transparent p-0 text-lg font-semibold focus-visible:ring-0"
                  />
                  <StatusBadge variant="default">
                    {section.questions.length} perguntas
                  </StatusBadge>
                </CollapsibleTrigger>
              </CardHeader>

              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  {section.questions.map((question, questionIndex) => (
                    <div
                      key={question.id}
                      className="rounded-lg border bg-muted/30 p-4 space-y-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary">
                          {questionIndex + 1}
                        </span>
                        <div className="flex-1 space-y-3">
                          <Input
                            placeholder="Digite a pergunta..."
                            value={question.text}
                            onChange={(e) => updateQuestion(section.id, question.id, { text: e.target.value })}
                          />
                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm text-muted-foreground">Peso:</Label>
                              <Select
                                value={question.weight.toString()}
                                onValueChange={(v) => updateQuestion(section.id, question.id, { weight: parseInt(v) as 1 | 2 | 3 })}
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">
                                    <div className="flex items-center gap-2">
                                      <StatusBadge variant="weight-low">Baixo</StatusBadge>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="2">
                                    <div className="flex items-center gap-2">
                                      <StatusBadge variant="weight-medium">Médio</StatusBadge>
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="3">
                                    <div className="flex items-center gap-2">
                                      <StatusBadge variant="weight-high">Alto</StatusBadge>
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={question.photoRequired}
                                onCheckedChange={(v) => updateQuestion(section.id, question.id, { photoRequired: v })}
                              />
                              <Label className="flex items-center gap-1.5 text-sm">
                                <Camera className="h-4 w-4" />
                                Foto obrigatória
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={question.commentRequired}
                                onCheckedChange={(v) => updateQuestion(section.id, question.id, { commentRequired: v })}
                              />
                              <Label className="flex items-center gap-1.5 text-sm">
                                <MessageSquare className="h-4 w-4" />
                                Comentário se NC
                              </Label>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeQuestion(section.id, question.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => addQuestion(section.id)}
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Pergunta
                  </Button>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}

        <Button
          variant="outline"
          className="w-full gap-2 border-dashed"
          onClick={addSection}
        >
          <Plus className="h-4 w-4" />
          Adicionar Seção
        </Button>
      </div>
    </div>
  );
}
