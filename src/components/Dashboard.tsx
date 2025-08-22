import React from 'react';
import { 
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
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  Map,
  Navigation,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { UserSession } from './shared/types';

interface MetricCardProps {
  title: string;
  value: number;
  total: number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface ApiMetricCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
}

interface DashboardProps {
  currentUser?: UserSession;
}

function MetricCard({ title, value, total, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>de {total.toLocaleString()} totales</span>
          {trend && (
            <div className={`flex items-center gap-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="h-3 w-3" />
              {trend.value}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ApiMetricCard({ title, value, icon: Icon, description }: ApiMetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground">
          {description}
        </div>
      </CardContent>
    </Card>
  );
}

export function Dashboard({ currentUser }: DashboardProps) {
  // Mock data - En implementación real vendría de API
  const metrics = [
    { title: 'Maestro Establecimiento', active: 15, total: 18, icon: Building, trend: { value: 5.2, isPositive: true } },
    { title: 'Maestro Tipo de Documento', active: 142, total: 150, icon: FileText, trend: { value: 2.1, isPositive: true } },
    { title: 'Maestro Diagnóstico', active: 8420, total: 8500, icon: Stethoscope, trend: { value: 1.8, isPositive: true } },
    { title: 'Maestro País', active: 195, total: 195, icon: Globe },
    { title: 'Clientes API', active: 8, total: 12, icon: Key, trend: { value: 3.2, isPositive: false } },
    { title: 'Maestro Procedencia', active: 28, total: 30, icon: MapPin },
    { title: 'Maestro Sexo', active: 3, total: 4, icon: UserCheck, trend: { value: 0, isPositive: true } },
    { title: 'Maestro Ubigeo', active: 1864, total: 1865, icon: Map, trend: { value: 0.1, isPositive: true } },
    { title: 'Maestro Localidad', active: 425, total: 450, icon: Navigation, trend: { value: 2.3, isPositive: true } },
    { title: 'Maestro Etnia', active: 12, total: 15, icon: Users, trend: { value: 1.2, isPositive: true } },
    { title: 'Maestro Etnia Procedencia', active: 85, total: 90, icon: Users, trend: { value: 0.8, isPositive: true } },
  ];

  // Nuevas métricas adicionales
  const apiMetrics = [
    { title: 'Consumo APIs (Hoy)', value: 1247, icon: BarChart3, description: 'Total de requests del día' },
    { title: 'Errores Recientes (Hoy)', value: 23, icon: AlertCircle, description: 'Errores en las últimas 24h' }
  ];

  const recentRequests = [
    {
      id: 1,
      client: 'MINSA-API',
      endpoint: '/api/v1/diagnosticos',
      method: 'GET',
      status: '200',
      timestamp: '2025-01-08 14:32:15',
      ip: '192.168.1.100'
    },
    {
      id: 2,
      client: 'ESSALUD-WS',
      endpoint: '/api/v1/pacientes',
      method: 'POST',
      status: '201',
      timestamp: '2025-01-08 14:31:45',
      ip: '192.168.1.105'
    },
    {
      id: 3,
      client: 'DIRIS-API',
      endpoint: '/api/v1/entidades',
      method: 'GET',
      status: '200',
      timestamp: '2025-01-08 14:30:22',
      ip: '192.168.1.110'
    },
    {
      id: 4,
      client: 'MINSA-API',
      endpoint: '/api/v1/tipo-documento',
      method: 'GET',
      status: '200',
      timestamp: '2025-01-08 14:29:58',
      ip: '192.168.1.100'
    },
    {
      id: 5,
      client: 'HOSPITAL-SIS',
      endpoint: '/api/v1/procedencia',
      method: 'GET',
      status: '403',
      timestamp: '2025-01-08 14:28:33',
      ip: '192.168.1.120'
    }
  ];

  const recentErrors = [
    {
      id: 1,
      client: 'HOSPITAL-SIS',
      message: 'Token expirado',
      status: '401',
      timestamp: '2025-01-08 14:25:10'
    },
    {
      id: 2,
      client: 'EXTERNA-API',
      message: 'Cliente no autorizado',
      status: '403',
      timestamp: '2025-01-08 14:20:45'
    },
    {
      id: 3,
      client: 'TEST-CLIENT',
      message: 'Parámetros inválidos en request',
      status: '400',
      timestamp: '2025-01-08 14:15:22'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusCode = parseInt(status);
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge variant="default" className="bg-green-100 text-green-800">OK</Badge>;
    } else if (statusCode >= 400 && statusCode < 500) {
      return <Badge variant="destructive" className="bg-yellow-100 text-yellow-800">CLIENT</Badge>;
    } else if (statusCode >= 500) {
      return <Badge variant="destructive">ERROR</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      GET: 'bg-blue-100 text-blue-800',
      POST: 'bg-green-100 text-green-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      PATCH: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <Badge variant="outline" className={colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {method}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-medium">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido, {currentUser?.username} ({currentUser?.role}). Resumen general del sistema de interoperabilidad
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.active}
            total={metric.total}
            icon={metric.icon}
            trend={metric.trend}
          />
        ))}
      </div>

      {/* API Metrics */}
      <div>
        <h2 className="text-xl font-medium mb-4">Métricas de Interoperabilidad</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apiMetrics.map((metric, index) => (
            <ApiMetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              description={metric.description}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent API Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Últimos Requests</CardTitle>
              <CardDescription>
                Actividad reciente de la API
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Ver todos
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.client}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {request.endpoint}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getMethodBadge(request.method)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {request.timestamp.split(' ')[1]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Errors */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Últimos Errores</CardTitle>
              <CardDescription>
                Errores recientes del sistema
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              Ver todos
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Hora</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentErrors.map((error) => (
                  <TableRow key={error.id}>
                    <TableCell className="font-medium">
                      {error.client}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {error.message}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(error.status)}
                    </TableCell>
                    <TableCell className="text-xs font-mono">
                      {error.timestamp.split(' ')[1]}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estado del Sistema</CardTitle>
          <CardDescription>
            Información de salud y rendimiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">API Status</div>
                <div className="text-sm text-muted-foreground">Operativo</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">Base de Datos</div>
                <div className="text-sm text-muted-foreground">Conectada</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="font-medium">Tiempo Respuesta</div>
                <div className="text-sm text-muted-foreground">245ms promedio</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium">Requests/hora</div>
                <div className="text-sm text-muted-foreground">1,247</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}