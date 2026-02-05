import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Contexts
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";

// Components
import { ProtectedAdminRoute } from "@/components/ProtectedRoute";

// Layouts
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { TenantLayout } from "@/components/layouts/TenantLayout";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTenants from "./pages/admin/AdminTenants";
import AdminCreateTenant from "./pages/admin/AdminCreateTenant";
import AdminTenantDetails from "./pages/admin/AdminTenantDetails";

// Tenant Pages
import TenantLogin from "./pages/tenant/TenantLogin";
import TenantDashboard from "./pages/tenant/TenantDashboard";
import TenantChecklists from "./pages/tenant/TenantChecklists";
import TenantChecklistEditor from "./pages/tenant/TenantChecklistEditor";
import TenantAuditExecution from "./pages/tenant/TenantAuditExecution";
import TenantAuditResult from "./pages/tenant/TenantAuditResult";
import TenantNonConformities from "./pages/tenant/TenantNonConformities";
import TenantReports from "./pages/tenant/TenantReports";

const queryClient = new QueryClient();

function AdminRoutes() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLogin />} />
        <Route
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="tenants" element={<AdminTenants />} />
          <Route path="tenants/novo" element={<AdminCreateTenant />} />
          <Route path="tenants/:id" element={<AdminTenantDetails />} />
          <Route path="usuarios" element={<AdminDashboard />} />
          <Route path="configuracoes" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Home - Selection */}
          <Route path="/" element={<Index />} />

          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* Tenant Routes */}
          <Route path="/tenant/login" element={<TenantLogin />} />
          <Route path="/tenant" element={<TenantLayout />}>
            <Route index element={<TenantDashboard />} />
            <Route path="checklists" element={<TenantChecklists />} />
            <Route path="checklists/novo" element={<TenantChecklistEditor />} />
            <Route path="checklists/:id" element={<TenantChecklistEditor />} />
            <Route path="checklists/:id/editar" element={<TenantChecklistEditor />} />
            <Route path="auditorias" element={<TenantDashboard />} />
            <Route path="auditorias/nova" element={<TenantAuditExecution />} />
            <Route path="auditorias/:id" element={<TenantAuditResult />} />
            <Route path="auditorias/:id/resultado" element={<TenantAuditResult />} />
            <Route path="nao-conformidades" element={<TenantNonConformities />} />
            <Route path="relatorios" element={<TenantReports />} />
            <Route path="configuracoes" element={<TenantDashboard />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
