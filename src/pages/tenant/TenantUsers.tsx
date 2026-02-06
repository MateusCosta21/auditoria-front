import { useState } from "react";
import { Plus, Search, Edit, Loader2, UserCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, Column } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateTenantUser, useTenantUsers, useUpdateTenantUser } from "@/hooks/tenant/useUsers";
import { useToast } from "@/hooks/use-toast";
import type { TenantUserListItem } from "@/types/api";

type RoleFilter = "all" | "admin" | "auditor" | "user";
type StatusFilter = "all" | "active" | "inactive";

const roleLabels: Record<Exclude<RoleFilter, "all">, string> = {
  admin: "Admin",
  auditor: "Auditor",
  user: "Usuário",
};

export default function TenantUsers() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<TenantUserListItem | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Exclude<RoleFilter, "all">>("user");
  const [isActive, setIsActive] = useState(true);

  const usersQuery = useTenantUsers({
    search: search || undefined,
    role: roleFilter === "all" ? undefined : roleFilter,
    is_active: statusFilter === "all" ? undefined : statusFilter === "active",
  });
  const createMutation = useCreateTenantUser();
  const updateMutation = useUpdateTenantUser();

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("user");
    setIsActive(true);
  };

  const openCreate = () => {
    setEditingUser(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (user: TenantUserListItem) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);
    setIsActive(user.is_active);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name.trim() || !email.trim() || !role) {
      toast({ title: "Preencha nome, email e perfil", variant: "destructive" });
      return;
    }
    if (!editingUser && password.trim().length < 6) {
      toast({ title: "Senha deve ter no mínimo 6 caracteres", variant: "destructive" });
      return;
    }

    if (editingUser) {
      updateMutation.mutate(
        {
          id: editingUser.id,
          data: {
            name: name.trim(),
            email: email.trim(),
            password: password.trim() || undefined,
            role,
            is_active: isActive,
          },
        },
        {
          onSuccess: () => {
            toast({ title: "Usuário atualizado com sucesso" });
            setDialogOpen(false);
          },
          onError: () => toast({ title: "Erro ao atualizar usuário", variant: "destructive" }),
        }
      );
      return;
    }

    createMutation.mutate(
      {
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        is_active: isActive,
      },
      {
        onSuccess: () => {
          toast({ title: "Usuário criado com sucesso" });
          setDialogOpen(false);
        },
        onError: () => toast({ title: "Erro ao criar usuário", variant: "destructive" }),
      }
    );
  };

  const columns: Column<TenantUserListItem>[] = [
    {
      key: "name",
      header: "Usuário",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-sm text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Perfil",
      cell: (row) => roleLabels[row.role],
    },
    {
      key: "status",
      header: "Status",
      cell: (row) =>
        row.is_active ? (
          <StatusBadge variant="success" dot>
            Ativo
          </StatusBadge>
        ) : (
          <StatusBadge variant="default" dot>
            Inativo
          </StatusBadge>
        ),
    },
    {
      key: "createdAt",
      header: "Criado em",
      cell: (row) => new Date(row.created_at).toLocaleDateString("pt-BR"),
    },
    {
      key: "actions",
      header: "",
      cell: (row) => (
        <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
          <Edit className="h-4 w-4" />
        </Button>
      ),
      className: "w-12",
    },
  ];

  if (usersQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Usuários" description="Gerencie usuários e permissões">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={roleFilter} onValueChange={(value: RoleFilter) => setRoleFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Perfil" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Perfis</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="auditor">Auditor</SelectItem>
            <SelectItem value="user">Usuário</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={usersQuery.data?.data ?? []} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                {editingUser ? "Senha (opcional)" : "Senha"}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Perfil</Label>
              <Select value={role} onValueChange={(value: Exclude<RoleFilter, "all">) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="auditor">Auditor</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Usuário ativo</p>
                <p className="text-xs text-muted-foreground">
                  {isActive ? "Pode acessar o sistema" : "Acesso bloqueado"}
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingUser ? (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Salvar
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Criar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
