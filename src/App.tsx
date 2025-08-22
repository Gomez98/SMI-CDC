import React, { useState } from 'react';
import { Toaster } from './components/ui/sonner';
import { AppLayout } from './components/AppLayout';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { EntidadesPage } from './components/EntidadesPage';
import { TipoDocumentoPage } from './components/TipoDocumentoPage';
import { ProcedenciaPage } from './components/ProcedenciaPage';
import { EtniaPage } from './components/EtniaPage';
import { TipoViaPage } from './components/TipoViaPage';
import { AgrupamientoPage } from './components/AgrupamientoPage';
import { SexoPage } from './components/SexoPage';
import { UbigeoPage } from './components/UbigeoPage';
import { LocalidadPage } from './components/LocalidadPage';
import { PaisPage } from './components/PaisPage';
import { DiagnosticoPage } from './components/DiagnosticoPage';
import { TipoDiagnosticoPage } from './components/TipoDiagnosticoPage';
import { EtniaProcedenciaPage } from './components/EtniaProcedenciaPage';
import { ClientesApiPage } from './components/ClientesApiPage';
import { LogsRequestsPage } from './components/LogsRequestsPage';
import { LogsErroresPage } from './components/LogsErroresPage';
import type { UserSession } from './components/shared/types';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  const handleLogin = (username: string, role: string) => {
    setCurrentUser({
      username,
      role,
      isAuthenticated: true
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('dashboard');
  };

  // Si no está autenticado, mostrar la página de login
  if (!currentUser?.isAuthenticated) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster position="top-right" />
      </>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard currentUser={currentUser} />;
      case 'entidades':
        return <EntidadesPage currentUser={currentUser} />;
      case 'tipo-documento':
        return <TipoDocumentoPage currentUser={currentUser} />;
      case 'procedencia':
        return <ProcedenciaPage currentUser={currentUser} />;
      case 'etnia':
        return <EtniaPage currentUser={currentUser} />;
      case 'tipo-via':
        return <TipoViaPage currentUser={currentUser} />;
      case 'agrupamiento':
        return <AgrupamientoPage currentUser={currentUser} />;
      case 'sexo':
        return <SexoPage currentUser={currentUser} />;
      case 'ubigeo':
        return <UbigeoPage currentUser={currentUser} />;
      case 'localidad':
        return <LocalidadPage currentUser={currentUser} />;
      case 'pais':
        return <PaisPage currentUser={currentUser} />;
      case 'diagnostico':
        return <DiagnosticoPage currentUser={currentUser} />;
      case 'tipo-diagnostico':
        return <TipoDiagnosticoPage currentUser={currentUser} />;
      case 'etnia-procedencia':
        return <EtniaProcedenciaPage currentUser={currentUser} />;
      case 'clientes-api':
        return <ClientesApiPage currentUser={currentUser} />;
      case 'logs-requests':
        return <LogsRequestsPage />;
      case 'logs-errores':
        return <LogsErroresPage />;
      default:
        return <Dashboard currentUser={currentUser} />;
    }
  };

  return (
    <>
      <AppLayout 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        currentUser={currentUser}
        onLogout={handleLogout}
      >
        {renderPage()}
      </AppLayout>
      <Toaster position="top-right" />
    </>
  );
}