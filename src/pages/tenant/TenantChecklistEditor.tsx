import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, GripVertical, ChevronDown, ChevronRight, Camera, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const weightLabels = {
  1: { label: "Baixo", variant: "weight-low" as const },
  2: { label: "Médio", variant: "weight-medium" as const },
  3: { label: "Alto", variant: "weight-high" as const },
};

export default function TenantChecklistEditor() {
  const navigate = useNavigate();
  const [checklistName, setChecklistName] = useState("Novo Checklist");
  const [sections, setSections] = useState<Section[]>([
    {
      id: "1",
      name: "Seção 1 - Organização",
      isOpen: true,
      questions: [
        { id: "1-1", text: "Os materiais estão organizados no local adequado?", weight: 2, photoRequired: false, commentRequired: true },
        { id: "1-2", text: "As áreas de trabalho estão limpas?", weight: 3, photoRequired: true, commentRequired: true },
      ],
    },
    {
      id: "2",
      name: "Seção 2 - Segurança",
      isOpen: false,
      questions: [
        { id: "2-1", text: "Os EPIs estão sendo utilizados corretamente?", weight: 3, photoRequired: true, commentRequired: true },
      ],
    },
  ]);

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
          <Button>Salvar Checklist</Button>
        </div>
      </PageHeader>

      {/* Checklist Name */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Checklist</Label>
            <Input
              id="name"
              value={checklistName}
              onChange={(e) => setChecklistName(e.target.value)}
              className="max-w-md text-lg font-medium"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section, sectionIndex) => (
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
