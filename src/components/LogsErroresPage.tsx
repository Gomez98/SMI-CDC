import React, { useState } from 'react';
import { CrudTable, CrudColumn } from './CrudTable';
import { handleExportData } from './shared/crudHelpers';

interface LogError {
  id: number;
  vcError_Id: string;
  vcError_Type: string;
  vcError_Message: string;
  vcError_StackTrace: string;
  vcError_ClientCode: string;
  vcError_Endpoint: string;
  vcError_Severity: string;
  vcError_IpAddress: string;
  dtError_Timestamp: string;
}

const sampleData: LogError[] = [
  { id: 1, vcError_Id: 'err_67890123456789', vcError_Type: 'ValidationException', vcError_Message: 'Campo vcEntity_Description es requerido', vcError_StackTrace: 'at ValidationService.validateEntity(...)', vcError_ClientCode: 'HIS_HN_001', vcError_Endpoint: '/api/v1/maestros/entidades', vcError_Severity: 'Warning', vcError_IpAddress: '192.168.1.100', dtError_Timestamp: '2025-01-13 14:35:20' },
  { id: 2, vcError_Id: 'err_67890123456790', vcError_Type: 'DatabaseException', vcError_Message: 'Conexión a base de datos perdida', vcError_StackTrace: 'at DatabaseConnection.execute(...)', vcError_ClientCode: 'RRHH_MINSA_001', vcError_Endpoint: '/api/v1/maestros/tipo-documento', vcError_Severity: 'Error', vcError_IpAddress: '10.0.0.50', dtError_Timestamp: '2025-01-13 14:30:15' },
  { id: 3, vcError_Id: 'err_67890123456791', vcError_Type: 'AuthenticationException', vcError_Message: 'API Key inválida o expirada', vcError_StackTrace: 'at AuthService.validateApiKey(...)', vcError_ClientCode: 'PORTAL_CIU_001', vcError_Endpoint: '/api/v1/maestros/procedencia', vcError_Severity: 'Critical', vcError_IpAddress: '172.16.0.25', dtError_Timestamp: '2025-01-13 14:25:45' },
  { id: 4, vcError_Id: 'err_67890123456792', vcError_Type: 'SystemException', vcError_Message: 'Memoria insuficiente para procesar solicitud', vcError_StackTrace: 'at MemoryManager.allocate(...)', vcError_ClientCode: 'HIS_HN_001', vcError_Endpoint: '/api/v1/maestros/diagnostico', vcError_Severity: 'Critical', vcError_IpAddress: '192.168.1.100', dtError_Timestamp: '2025-01-13 14:20:10' }
];

export function LogsErroresPage() {
  const [entities] = useState<LogError[]>(sampleData);

  const columns: CrudColumn[] = [
    { key: 'dtError_Timestamp', label: 'Timestamp', sortable: true, render: (value: string) => new Date(value).toLocaleString('es-PE') },
    { key: 'vcError_Severity', label: 'Severidad', sortable: true, render: (value: string) => <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getSeverityColor(value)}`}>{value}</span> },
    { key: 'vcError_Type', label: 'Tipo', sortable: true },
    { key: 'vcError_Message', label: 'Mensaje', sortable: false, render: (value: string) => <span className="max-w-xs truncate" title={value}>{value}</span> },
    { key: 'vcError_ClientCode', label: 'Cliente', sortable: true },
    { key: 'vcError_Endpoint', label: 'Endpoint', sortable: true },
    { key: 'vcError_IpAddress', label: 'IP', sortable: true },
    { key: 'vcError_Id', label: 'Error ID', sortable: false, render: (value: string) => <code className="text-xs bg-muted px-1 rounded">{value.slice(-8)}</code> }
  ];

  // Solo visualización, sin operaciones CRUD
  const handleView = (entity: LogError) => {
    console.log('Ver detalles del error:', entity);
  };

  return (
    <CrudTable
      title="Logs de Errores"
      data={entities}
      columns={columns}
      onView={handleView}
      onExport={handleExportData}
      searchPlaceholder="Buscar por tipo, mensaje o cliente..."
      showNewButton={false}
      showEditButton={false}
      showDeleteButton={false}
      showDuplicateButton={false}
      statusFilter={false}
    />
  );
}

function getSeverityColor(severity: string): string {
  const colors = {
    Info: 'bg-blue-100 text-blue-800',
    Warning: 'bg-yellow-100 text-yellow-800',
    Error: 'bg-orange-100 text-orange-800',
    Critical: 'bg-red-100 text-red-800'
  };
  return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}