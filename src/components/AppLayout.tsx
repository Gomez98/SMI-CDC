import React, { useState } from 'react';
import { 
  HelpCircle, 
  LayoutDashboard, 
  Building, 
  FileText, 
  MapPin, 
  Users, 
  Route, 
  Layers, 
  Globe, 
  Stethoscope, 
  Activity, 
  Key, 
  FileSearch, 
  AlertTriangle,
  Menu,
  X,
  Settings,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Map,
  Navigation,
  User,
  LogOut
} from 'lucide-react';
import { Button } from './ui/button';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from './ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import type { UserSession } from './shared/types';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  currentUser?: UserSession;
  onLogout?: () => void;
}

const mainNavigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

const maestrosNavigationItems = [
  { id: 'entidades', label: 'Maestro Establecimiento', icon: Building },
  { id: 'tipo-documento', label: 'Maestro Tipo de Documento', icon: FileText },
  { id: 'procedencia', label: 'Maestro Procedencia', icon: MapPin },
  { id: 'etnia', label: 'Maestro Etnia', icon: Users },
  { id: 'tipo-via', label: 'Maestro Tipo Vía', icon: Route },
  { id: 'agrupamiento', label: 'Maestro Agrupamiento Rural', icon: Layers },
  { id: 'sexo', label: 'Maestro Sexo', icon: UserCheck },
  { id: 'ubigeo', label: 'Maestro Ubigeo', icon: Map },
  { id: 'localidad', label: 'Maestro Localidad', icon: Navigation },
  { id: 'pais', label: 'Maestro País', icon: Globe },
  { id: 'diagnostico', label: 'Maestro Diagnóstico', icon: Stethoscope },
  { id: 'tipo-diagnostico', label: 'Tipo de Diagnóstico', icon: Activity },
  { id: 'etnia-procedencia', label: 'Maestro Etnia Procedencia', icon: Users },
  { id: 'clientes-api', label: 'Clientes API', icon: Key },
];

const logsNavigationItems = [
  { id: 'logs-requests', label: 'Logs de Requests', icon: FileSearch },
  { id: 'logs-errores', label: 'Logs de Errores', icon: AlertTriangle },
];

export function AppLayout({ children, currentPage, onNavigate, currentUser, onLogout }: AppLayoutProps) {
  const [maestrosOpen, setMaestrosOpen] = useState(true);

  // Check if any maestros page is active
  const isMaestrosActive = maestrosNavigationItems.some(item => item.id === currentPage);

  const getUserInitials = (username: string): string => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <Sidebar className="border-r border-border">
          <SidebarContent className="px-3 py-4">
            {/* Logo */}
            <div className="px-3 mb-6">
              <h2 className="text-lg font-medium text-primary">CDC PERÚ</h2>
              <p className="text-sm text-muted-foreground">Interoperabilidad</p>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {/* Main items */}
              {mainNavigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start gap-2 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                    onClick={() => onNavigate(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}

              {/* Configuración Maestros - Collapsible */}
              <Collapsible open={maestrosOpen} onOpenChange={setMaestrosOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant={isMaestrosActive ? "default" : "ghost"}
                    className={`w-full justify-start gap-2 ${
                      isMaestrosActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    Configuración Maestros
                    {maestrosOpen ? (
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    ) : (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pl-6 mt-1">
                  {maestrosNavigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    
                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start gap-2 ${
                          isActive 
                            ? 'bg-accent text-accent-foreground font-medium' 
                            : 'hover:bg-accent hover:text-accent-foreground'
                        }`}
                        onClick={() => onNavigate(item.id)}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>

              {/* Logs items */}
              {logsNavigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start gap-2 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-accent hover:text-accent-foreground'
                    }`}
                    onClick={() => onNavigate(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-border bg-card px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <div className="font-medium text-primary">CDC PERÚ</div>
                  <span className="text-muted-foreground">·</span>
                  <div className="text-sm text-muted-foreground">Interoperabilidad</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Help */}
                <Button variant="ghost" size="icon">
                  <HelpCircle className="h-4 w-4" />
                </Button>

                {/* User Menu */}
                {currentUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {getUserInitials(currentUser.username)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{currentUser.username}</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {currentUser.role}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer" onClick={onLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar sesión</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-border px-6 py-3 bg-card">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>Sistema de Interoperabilidad v1.0.0</div>
              <div>© 2025 CDC PERÚ</div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}