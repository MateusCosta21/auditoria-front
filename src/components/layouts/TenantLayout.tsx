import { Outlet } from "react-router-dom";
import { TenantSidebar } from "./TenantSidebar";
import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export function TenantLayout() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <TenantSidebar />
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar auditorias, checklists..."
                className="w-80 pl-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate("/tenant/auditorias/nova")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Auditoria
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                5
              </span>
            </Button>
            <div className="flex items-center gap-3 border-l pl-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                JD
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">João da Silva</p>
                <p className="text-xs text-muted-foreground">Auditor</p>
              </div>
            </div>
          </div>
        </header>
        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
