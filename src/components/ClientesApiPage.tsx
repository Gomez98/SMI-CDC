import React, { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { CrudTable, CrudColumn } from './CrudTable';
import { CrudForm, FormField } from './CrudForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface ClienteApi {
  id: number;
  vcClient_Name: string;
  vcClient_Code: string;
  vcClient_ApiKey: string;
  vcClient_Description: string;
  biClient_IsActive: boolean;
  biIsDeleted: boolean;
  dtAudit_CreatedAt: string;
  dtAudit_UpdatedAt: string;
  vcAudit_User: string;
  vcAudit_System: string;
  vcAudit_Module: string;
  vcAudit_SP: string;
}

export function ClientesApiPage() {
  const [entities, setEntities] = useState<ClienteApi[]>([
    { id: 1, vcClient_Name: 'Sistema HIS Hospital Nacional', vcClient_Code: 'HIS_HN_001', vcClient_ApiKey: 'api_key_his_hospital_nacional_2025', vcClient_Description: 'Cliente API para el sistema HIS del Hospital Nacional', biClient_IsActive: true, biIsDeleted: false, dtAudit_CreatedAt: '2025-01-01 10:00:00', dtAudit_UpdatedAt: '2025-01-05 15:30:00', vcAudit_User: 'admin', vcAudit_System: 'INTEROP', vcAudit_Module: 'MAESTROS', vcAudit_SP: 'sp_insert_cliente_api' },
    { id: 2, vcClient_Name: 'Sistema RRHH MINSA', vcClient_Code: 'RRHH_MINSA_001', vcClient_ApiKey: 'api_key_rrhh_minsa_2025', vcClient_Description: 'Cliente API para el sistema de RRHH del MINSA', biClient_IsActive: true, biIsDeleted: false, dtAudit_CreatedAt: '2025-01-01 10:15:00', dtAudit_UpdatedAt: '2025-01-03 09:20:00', vcAudit_User: 'admin', vcAudit_System: 'INTEROP', vcAudit_Module: 'MAESTROS', vcAudit_SP: 'sp_insert_cliente_api' },
    { id: 3, vcClient_Name: 'Portal Ciudadano', vcClient_Code: 'PORTAL_CIU_001', vcClient_ApiKey: 'api_key_portal_ciudadano_2025', vcClient_Description: 'Cliente API para el portal del ciudadano', biClient_IsActive: false, biIsDeleted: false, dtAudit_CreatedAt: '2025-01-02 14:30:00', dtAudit_UpdatedAt: '2025-01-02 14:30:00', vcAudit_User: 'supervisor', vcAudit_System: 'INTEROP', vcAudit_Module: 'MAESTROS', vcAudit_SP: 'sp_insert_cliente_api' }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedEntity, setSelectedEntity] = useState<ClienteApi | null>(null);
  const [formData, setFormData] = useState<Partial<ClienteApi>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<ClienteApi | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const columns: CrudColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'vcClient_Code', label: 'Código', sortable: true },
    { key: 'vcClient_Name', label: 'Nombre', sortable: true },
    { key: 'biClient_IsActive', label: 'Activo API', sortable: true, render: (value: boolean) => value ? 'Sí' : 'No' },
    { key: 'biIsDeleted', label: 'Estado', sortable: true },
    { key: 'dtAudit_UpdatedAt', label: 'Última Actualización', sortable: true, render: (value: string) => new Date(value).toLocaleString('es-PE') }
  ];

  const formFields: FormField[] = [
    { name: 'vcClient_Code', label: 'Código', type: 'text', required: true, maxLength: 50, placeholder: 'Ej: HIS_HN_001', helpText: 'Código único del cliente API' },
    { name: 'vcClient_Name', label: 'Nombre', type: 'text', required: true, maxLength: 200, placeholder: 'Ingrese el nombre del cliente', helpText: 'Nombre descriptivo del cliente API' },
    { name: 'vcClient_ApiKey', label: 'API Key', type: 'text', required: true, maxLength: 100, placeholder: 'api_key_...', helpText: 'Clave de acceso API única del cliente' },
    { name: 'vcClient_Description', label: 'Descripción', type: 'textarea', required: true, maxLength: 500, placeholder: 'Descripción del cliente API', helpText: 'Descripción detallada del cliente y su propósito' },
    { name: 'biClient_IsActive', label: 'Activo API', type: 'switch', helpText: 'Define si el cliente puede realizar llamadas a la API' },
    { name: 'biIsDeleted', label: 'Estado', type: 'switch', helpText: 'Activo: El cliente está habilitado en el sistema' }
  ];

  const handleNew = () => { 
    setFormMode('create'); 
    setSelectedEntity(null); 
    setFormData({ 
      vcClient_Code: '', 
      vcClient_Name: '', 
      vcClient_ApiKey: `api_key_${Date.now()}`, 
      vcClient_Description: '', 
      biClient_IsActive: true, 
      biIsDeleted: false 
    }); 
    setIsFormOpen(true); 
  };

  const handleEdit = (entity: ClienteApi) => { setFormMode('edit'); setSelectedEntity(entity); setFormData(entity); setIsFormOpen(true); };
  const handleView = (entity: ClienteApi) => { setFormMode('view'); setSelectedEntity(entity); setFormData(entity); setIsFormOpen(true); };
  const handleDelete = (entity: ClienteApi) => { setEntityToDelete(entity); setIsDeleteDialogOpen(true); };
  const handleDuplicate = (entity: ClienteApi) => { 
    setFormMode('create'); 
    setSelectedEntity(null); 
    setFormData({ 
      ...entity, 
      id: undefined, 
      vcClient_Code: `${entity.vcClient_Code}_COPY`, 
      vcClient_Name: `${entity.vcClient_Name} (Copia)`,
      vcClient_ApiKey: `api_key_${Date.now()}`
    }); 
    setIsFormOpen(true); 
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (!formData.vcClient_Code?.trim() || !formData.vcClient_Name?.trim() || !formData.vcClient_ApiKey?.trim() || !formData.vcClient_Description?.trim()) {
        toast.error('Todos los campos son requeridos');
        setIsLoading(false);
        return;
      }

      const codeExists = entities.some(e => e.vcClient_Code.toLowerCase() === formData.vcClient_Code!.toLowerCase() && e.id !== selectedEntity?.id);
      if (codeExists) {
        toast.error('Ya existe un cliente con ese código');
        setIsLoading(false);
        return;
      }

      const apiKeyExists = entities.some(e => e.vcClient_ApiKey === formData.vcClient_ApiKey && e.id !== selectedEntity?.id);
      if (apiKeyExists) {
        toast.error('Ya existe un cliente con esa API Key');
        setIsLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (formMode === 'create') {
        const newEntity: ClienteApi = { 
          id: Math.max(...entities.map(e => e.id)) + 1, 
          vcClient_Code: formData.vcClient_Code!.toUpperCase(), 
          vcClient_Name: formData.vcClient_Name!, 
          vcClient_ApiKey: formData.vcClient_ApiKey!, 
          vcClient_Description: formData.vcClient_Description!, 
          biClient_IsActive: formData.biClient_IsActive || false, 
          biIsDeleted: formData.biIsDeleted || false, 
          dtAudit_CreatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19), 
          dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19), 
          vcAudit_User: 'usuario_actual', 
          vcAudit_System: 'INTEROP', 
          vcAudit_Module: 'MAESTROS', 
          vcAudit_SP: 'sp_insert_cliente_api' 
        };
        setEntities([...entities, newEntity]);
        toast.success('Cliente API creado exitosamente');
      } else if (formMode === 'edit' && selectedEntity) {
        const updatedEntity: ClienteApi = { 
          ...selectedEntity, 
          ...formData, 
          vcClient_Code: formData.vcClient_Code!.toUpperCase(), 
          dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19), 
          vcAudit_User: 'usuario_actual', 
          vcAudit_SP: 'sp_update_cliente_api' 
        } as ClienteApi;
        setEntities(entities.map(e => e.id === selectedEntity.id ? updatedEntity : e));
        toast.success('Cliente API actualizado exitosamente');
      }
      setIsFormOpen(false);
    } catch (error) {
      toast.error('Error al guardar el cliente API');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!entityToDelete) return;
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedEntity: ClienteApi = { ...entityToDelete, biIsDeleted: true, dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19), vcAudit_User: 'usuario_actual', vcAudit_SP: 'sp_delete_cliente_api' };
      setEntities(entities.map(e => e.id === entityToDelete.id ? updatedEntity : e));
      toast.success('Cliente API eliminado exitosamente');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Error al eliminar el cliente API');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => toast.success('Exportando datos...', { description: 'El archivo se descargará en breve' });
  const handleDataChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
  const getAuditData = () => !selectedEntity ? undefined : { createdAt: new Date(selectedEntity.dtAudit_CreatedAt).toLocaleString('es-PE'), updatedAt: new Date(selectedEntity.dtAudit_UpdatedAt).toLocaleString('es-PE'), user: selectedEntity.vcAudit_User, system: selectedEntity.vcAudit_System, module: selectedEntity.vcAudit_Module, procedure: selectedEntity.vcAudit_SP };

  return (
    <>
      <CrudTable title="Clientes API" data={entities} columns={columns} onNew={handleNew} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onDuplicate={handleDuplicate} onExport={handleExport} searchPlaceholder="Buscar por código o nombre..." statusFilter={true} />
      <CrudForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={formMode === 'create' ? 'Nuevo Cliente API' : formMode === 'edit' ? 'Editar Cliente API' : 'Ver Cliente API'} mode={formMode} fields={formFields} data={formData} onDataChange={handleDataChange} onSubmit={handleSubmit} isLoading={isLoading} auditData={getAuditData()} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción marcará el cliente API "{entityToDelete?.vcClient_Name}" como inactivo. Podrá reactivarlo posteriormente editando el registro.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isLoading}>{isLoading ? 'Eliminando...' : 'Eliminar'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}