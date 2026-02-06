import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  FilePlus,
  FileCheck,
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  CheckSquare,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTenantAuth } from "@/contexts/TenantAuthContext";
import { getTenantSlug } from "@/services/api-client";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/tenant",
  },
  {
    title: "Checklists",
    icon: ClipboardList,
    href: "/tenant/checklists",
  },
  {
    title: "Nova Auditoria",
    icon: FilePlus,
    href: "/tenant/auditorias/nova",
  },
  {
    title: "Auditorias",
    icon: FileCheck,
    href: "/tenant/auditorias",
  },
  {
    title: "Não Conformidades",
    icon: AlertTriangle,
    href: "/tenant/nao-conformidades",
  },
  {
    title: "Relatórios",
    icon: BarChart3,
    href: "/tenant/relatorios",
  },
  {
    title: "Configurações",
    icon: Settings,
    href: "/tenant/configuracoes",
  },
];

export function TenantSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useTenantAuth();
  const slug = getTenantSlug();

  const initials = slug
    ? slug.slice(0, 2).toUpperCase()
    : '??';

  return (
    <aside
      className={cn(
        "flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <CheckSquare className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-accent-foreground">
              AuditPro
            </span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.href !== "/tenant" &&
              location.pathname.startsWith(item.href));
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="mb-3 flex items-center gap-3 px-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium text-sidebar-accent-foreground">
              {initials}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-sidebar-accent-foreground">
                {slug}
              </p>
              <p className="truncate text-xs text-sidebar-foreground">
                {user?.name ?? 'Usuário'}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => logout()}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
