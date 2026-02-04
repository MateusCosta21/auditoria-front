import { useNavigate } from "react-router-dom";
import { Shield, CheckSquare, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted to-background p-4">
      <div className="w-full max-w-4xl animate-fade-in">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Sistema de Auditorias Digitais
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Escolha qual área você deseja acessar
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Admin Central */}
          <Card className="group relative overflow-hidden border-2 transition-all hover:border-primary hover:shadow-xl cursor-pointer" onClick={() => navigate("/admin/login")}>
            <div className="absolute inset-0 bg-gradient-to-br from-sidebar to-sidebar/80 opacity-0 transition-opacity group-hover:opacity-5" />
            <CardHeader className="pb-4">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-sidebar text-sidebar-primary-foreground shadow-lg">
                <Shield className="h-7 w-7" />
              </div>
              <CardTitle className="text-2xl">Admin Central</CardTitle>
              <CardDescription className="text-base">
                Área de gerenciamento do sistema (Landlord)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Gerenciar tenants (empresas)
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Controle de usuários globais
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Configurações do sistema
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Monitoramento e métricas
                </li>
              </ul>
              <Button className="w-full gap-2 group-hover:gap-3 transition-all">
                Acessar Admin
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Tenant Portal */}
          <Card className="group relative overflow-hidden border-2 transition-all hover:border-primary hover:shadow-xl cursor-pointer" onClick={() => navigate("/tenant/login")}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 opacity-0 transition-opacity group-hover:opacity-5" />
            <CardHeader className="pb-4">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                <CheckSquare className="h-7 w-7" />
              </div>
              <CardTitle className="text-2xl">Portal do Cliente</CardTitle>
              <CardDescription className="text-base">
                Área de auditorias da empresa (Tenant)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Criar e executar auditorias
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Gerenciar checklists
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Acompanhar não conformidades
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Gerar relatórios
                </li>
              </ul>
              <Button className="w-full gap-2 group-hover:gap-3 transition-all">
                Acessar Portal
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          © 2024 AuditPro. Sistema de Auditorias Digitais.
        </p>
      </div>
    </div>
  );
}
