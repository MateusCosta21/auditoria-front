import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { tenantsService } from "@/services/admin/tenants";
import { getErrorMessage } from "@/services/api-client";
import { useToast } from "@/hooks/use-toast";

export default function AdminCreateTenant() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    tenant_name: "",
    tenant_slug: "",
    admin_name: "",
    admin_email: "",
    admin_password: "",
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tenant_name.trim()) {
      newErrors.tenant_name = "Nome da empresa é obrigatório";
    }

    if (!formData.tenant_slug.trim()) {
      newErrors.tenant_slug = "Slug é obrigatório";
    } else if (!/^[a-z0-9-]+$/.test(formData.tenant_slug)) {
      newErrors.tenant_slug = "Slug deve conter apenas letras minúsculas, números e hífens";
    }

    if (!formData.admin_name.trim()) {
      newErrors.admin_name = "Nome do administrador é obrigatório";
    }

    if (!formData.admin_email.trim()) {
      newErrors.admin_email = "E-mail é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin_email)) {
      newErrors.admin_email = "E-mail inválido";
    }

    if (!formData.admin_password) {
      newErrors.admin_password = "Senha é obrigatória";
    } else if (formData.admin_password.length < 8) {
      newErrors.admin_password = "Senha deve ter no mínimo 8 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await tenantsService.create(formData);
      toast({
        title: "Tenant criado com sucesso!",
        description: `Acesso: ${response.domain}`,
      });
      navigate("/admin/tenants");
    } catch (error) {
      toast({
        title: "Erro ao criar tenant",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Auto-generate slug from company name
    if (field === "tenant_name") {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .slice(0, 30);
      setFormData((prev) => ({ ...prev, tenant_slug: slug }));
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
                <Label htmlFor="tenant_name">Nome da Empresa *</Label>
                <Input
                  id="tenant_name"
                  placeholder="Ex: Empresa Alpha"
                  value={formData.tenant_name}
                  onChange={(e) => handleChange("tenant_name", e.target.value)}
                  disabled={isLoading}
                  className={errors.tenant_name ? "border-destructive" : ""}
                />
                {errors.tenant_name && (
                  <p className="text-sm text-destructive">{errors.tenant_name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenant_slug">Slug (Subdomínio) *</Label>
                <div className="flex">
                  <Input
                    id="tenant_slug"
                    placeholder="empresa-alpha"
                    value={formData.tenant_slug}
                    onChange={(e) => handleChange("tenant_slug", e.target.value.toLowerCase())}
                    className={`rounded-r-none ${errors.tenant_slug ? "border-destructive" : ""}`}
                    disabled={isLoading}
                  />
                  <span className="inline-flex items-center rounded-r-lg border border-l-0 bg-muted px-3 text-sm text-muted-foreground">
                    .meusistema.localhost
                  </span>
                </div>
                {errors.tenant_slug && (
                  <p className="text-sm text-destructive">{errors.tenant_slug}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  URL de acesso: {formData.tenant_slug || "empresa"}.meusistema.localhost:8050
                </p>
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
                <Label htmlFor="admin_name">Nome Completo *</Label>
                <Input
                  id="admin_name"
                  placeholder="Ex: João da Silva"
                  value={formData.admin_name}
                  onChange={(e) => handleChange("admin_name", e.target.value)}
                  disabled={isLoading}
                  className={errors.admin_name ? "border-destructive" : ""}
                />
                {errors.admin_name && (
                  <p className="text-sm text-destructive">{errors.admin_name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin_email">E-mail *</Label>
                <Input
                  id="admin_email"
                  type="email"
                  placeholder="joao@empresa.com"
                  value={formData.admin_email}
                  onChange={(e) => handleChange("admin_email", e.target.value)}
                  disabled={isLoading}
                  className={errors.admin_email ? "border-destructive" : ""}
                />
                {errors.admin_email && (
                  <p className="text-sm text-destructive">{errors.admin_email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin_password">Senha *</Label>
                <div className="relative">
                  <Input
                    id="admin_password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={formData.admin_password}
                    onChange={(e) => handleChange("admin_password", e.target.value)}
                    disabled={isLoading}
                    className={errors.admin_password ? "border-destructive" : ""}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.admin_password && (
                  <p className="text-sm text-destructive">{errors.admin_password}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Esta será a senha de acesso do administrador do tenant
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/tenants")}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar Tenant"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
