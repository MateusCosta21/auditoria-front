import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, Users, FileCheck, Edit, Ban, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, Column } from "@/components/ui/data-table";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  lastAccess: string;
}

const mockUsers: User[] = [
  { id: "1", name: "João da Silva", email: "joao@alpha.com", role: "Admin", lastAccess: "2024-02-03" },
  { id: "2", name: "Maria Santos", email: "maria@alpha.com", role: "Auditor", lastAccess: "2024-02-03" },
  { id: "3", name: "Carlos Oliveira", email: "carlos@alpha.com", role: "Auditor", lastAccess: "2024-02-02" },
  { id: "4", name: "Ana Costa", email: "ana@alpha.com", role: "Viewer", lastAccess: "2024-02-01" },
];

const userColumns: Column<User>[] = [
  {
    key: "name",
    header: "Nome",
    cell: (row) => (
      <div>
        <p className="font-medium">{row.name}</p>
        <p className="text-sm text-muted-foreground">{row.email}</p>
      </div>
    ),
  },
  {
    key: "role",
    header: "Papel",
    cell: (row) => (
      <StatusBadge variant={row.role === "Admin" ? "primary" : "default"}>
        {row.role}
      </StatusBadge>
    ),
  },
  {
    key: "lastAccess",
    header: "Último Acesso",
    cell: (row) => new Date(row.lastAccess).toLocaleDateString("pt-BR"),
  },
];

export default function AdminTenantDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock tenant data
  const tenant = {
    id,
    name: "Empresa Alpha",
    subdomain: "alpha",
    plan: "Enterprise",
    status: "active" as const,
    createdAt: "2024-01-15",
    usersCount: 25,
    auditsCount: 143,
    checklistsCount: 12,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title={tenant.name} description={`${tenant.subdomain}.auditpro.com`}>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/admin/tenants")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          {tenant.status === "active" ? (
            <Button variant="destructive" className="gap-2">
              <Ban className="h-4 w-4" />
              Suspender
            </Button>
          ) : (
            <Button variant="default" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Reativar
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Status Card */}
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">{tenant.name}</h2>
                <StatusBadge variant="success" dot>
                  Ativo
                </StatusBadge>
              </div>
              <p className="text-muted-foreground">
                Criado em {new Date(tenant.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
          <StatusBadge variant="primary" className="text-base px-4 py-1.5">
            {tenant.plan}
          </StatusBadge>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tenant.usersCount}</p>
              <p className="text-sm text-muted-foreground">Usuários</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-light">
              <FileCheck className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tenant.auditsCount}</p>
              <p className="text-sm text-muted-foreground">Auditorias</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-light">
              <FileCheck className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tenant.checklistsCount}</p>
              <p className="text-sm text-muted-foreground">Checklists</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Dados Gerais</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="billing">Faturamento</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Tenant</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome da Empresa</p>
                <p className="mt-1">{tenant.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subdomínio</p>
                <p className="mt-1">{tenant.subdomain}.auditpro.com</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Plano</p>
                <p className="mt-1">{tenant.plan}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data de Criação</p>
                <p className="mt-1">{new Date(tenant.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <DataTable columns={userColumns} data={mockUsers} />
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardContent className="flex min-h-[200px] items-center justify-center text-muted-foreground">
              Módulo de faturamento em desenvolvimento
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
