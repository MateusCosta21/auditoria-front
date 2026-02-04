import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function AdminCreateTenant() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    subdomain: "",
    plan: "",
    adminName: "",
    adminEmail: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate creation
    navigate("/admin/tenants");
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-generate subdomain from company name
    if (field === "companyName") {
      const subdomain = value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 20);
      setFormData((prev) => ({ ...prev, subdomain }));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Novo Tenant" description="Cadastre uma nova empresa no sistema">
        <Button variant="outline" onClick={() => navigate("/admin/tenants")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>Dados da Empresa</CardTitle>
              <CardDescription>
                Informações básicas do tenant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa *</Label>
                <Input
                  id="companyName"
                  placeholder="Ex: Empresa Alpha"
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subdomain">Subdomínio *</Label>
                <div className="flex">
                  <Input
                    id="subdomain"
                    placeholder="empresa-alpha"
                    value={formData.subdomain}
                    onChange={(e) => handleChange("subdomain", e.target.value)}
                    className="rounded-r-none"
                    required
                  />
                  <span className="inline-flex items-center rounded-r-lg border border-l-0 bg-muted px-3 text-sm text-muted-foreground">
                    .auditpro.com
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  URL de acesso: {formData.subdomain || "empresa"}.auditpro.com
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">Plano *</Label>
                <Select
                  value={formData.plan}
                  onValueChange={(value) => handleChange("plan", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">
                      <div>
                        <span className="font-medium">Starter</span>
                        <span className="ml-2 text-muted-foreground">- até 5 usuários</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="professional">
                      <div>
                        <span className="font-medium">Professional</span>
                        <span className="ml-2 text-muted-foreground">- até 25 usuários</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="enterprise">
                      <div>
                        <span className="font-medium">Enterprise</span>
                        <span className="ml-2 text-muted-foreground">- usuários ilimitados</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Admin Info */}
          <Card>
            <CardHeader>
              <CardTitle>Administrador do Tenant</CardTitle>
              <CardDescription>
                Primeiro usuário com acesso administrativo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminName">Nome Completo *</Label>
                <Input
                  id="adminName"
                  placeholder="Ex: João da Silva"
                  value={formData.adminName}
                  onChange={(e) => handleChange("adminName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">E-mail *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="joao@empresa.com"
                  value={formData.adminEmail}
                  onChange={(e) => handleChange("adminEmail", e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Um e-mail com instruções de acesso será enviado
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/tenants")}>
            Cancelar
          </Button>
          <Button type="submit">
            Criar Tenant
          </Button>
        </div>
      </form>
    </div>
  );
}
