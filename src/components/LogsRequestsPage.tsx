import React, { useState } from 'react';
import { CrudTable, CrudColumn } from './CrudTable';
import { handleExportData } from './shared/crudHelpers';

interface LogRequest {
  id: number;
  vcLog_RequestId: string;
  vcLog_ClientCode: string;
  vcLog_Method: string;
  vcLog_Endpoint: string;
  vcLog_StatusCode: number;
  vcLog_Duration: number;
  vcLog_IpAddress: string;
  dtLog_Timestamp: string;
}

const sampleData: LogRequest[] = [
  { id: 1, vcLog_RequestId: 'req_67890123456789', vcLog_ClientCode: 'HIS_HN_001', vcLog_Method: 'GET', vcLog_Endpoint: '/api/v1/maestros/entidades', vcLog_StatusCode: 200, vcLog_Duration: 145, vcLog_IpAddress: '192.168.1.100', dtLog_Timestamp: '2025-01-13 14:30:25' },
  { id: 2, vcLog_RequestId: 'req_67890123456790', vcLog_ClientCode: 'RRHH_MINSA_001', vcLog_Method: 'POST', vcLog_Endpoint: '/api/v1/maestros/tipo-documento', vcLog_StatusCode: 201, vcLog_Duration: 234, vcLog_IpAddress: '10.0.0.50', dtLog_Timestamp: '2025-01-13 14:28:15' },
  { id: 3, vcLog_RequestId: 'req_67890123456791', vcLog_ClientCode: 'PORTAL_CIU_001', vcLog_Method: 'PUT', vcLog_Endpoint: '/api/v1/maestros/procedencia/3', vcLog_StatusCode: 404, vcLog_Duration: 89, vcLog_IpAddress: '172.16.0.25', dtLog_Timestamp: '2025-01-13 14:25:45' },
  { id: 4, vcLog_RequestId: 'req_67890123456792', vcLog_ClientCode: 'HIS_HN_001', vcLog_Method: 'DELETE', vcLog_Endpoint: '/api/v1/maestros/etnia/5', vcLog_StatusCode: 500, vcLog_Duration: 1250, vcLog_IpAddress: '192.168.1.100', dtLog_Timestamp: '2025-01-13 14:20:10' }
];

export function LogsRequestsPage() {
  const [entities] = useState<LogRequest[]>(sampleData);

  const columns: CrudColumn[] = [
    { key: 'dtLog_Timestamp', label: 'Timestamp', sortable: true, render: (value: string) => new Date(value).toLocaleString('es-PE') },
    { key: 'vcLog_ClientCode', label: 'Cliente', sortable: true },
    { key: 'vcLog_Method', label: 'Método', sortable: true, render: (value: string) => <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getMethodColor(value)}`}>{value}</span> },
    { key: 'vcLog_Endpoint', label: 'Endpoint', sortable: true },
    { key: 'vcLog_StatusCode', label: 'Estado', sortable: true, render: (value: number) => <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(value)}`}>{value}</span> },
    { key: 'vcLog_Duration', label: 'Duración (ms)', sortable: true, render: (value: number) => `${value}ms` },
    { key: 'vcLog_IpAddress', label: 'IP', sortable: true },
    { key: 'vcLog_RequestId', label: 'Request ID', sortable: false, render: (value: string) => <code className="text-xs bg-muted px-1 rounded">{value.slice(-8)}</code> }
  ];

  // Solo visualización, sin operaciones CRUD
  const handleView = (entity: LogRequest) => {
    console.log('Ver detalles del request:', entity);
  };

  return (
    <CrudTable
      title="Logs de Requests"
      data={entities}
      columns={columns}
      onView={handleView}
      onExport={handleExportData}
      searchPlaceholder="Buscar por cliente, endpoint o IP..."
      showNewButton={false}
      showEditButton={false}
      showDeleteButton={false}
      showDuplicateButton={false}
      statusFilter={false}
    />
  );
}

function getMethodColor(method: string): string {
  const colors = {
    GET: 'bg-blue-100 text-blue-800',
    POST: 'bg-green-100 text-green-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    DELETE: 'bg-red-100 text-red-800',
    PATCH: 'bg-purple-100 text-purple-800'
  };
  return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'bg-green-100 text-green-800';
  if (status >= 300 && status < 400) return 'bg-yellow-100 text-yellow-800';
  if (status >= 400 && status < 500) return 'bg-orange-100 text-orange-800';
  if (status >= 500) return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
}