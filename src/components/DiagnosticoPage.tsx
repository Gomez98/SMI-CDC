import React, { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { CrudTable, CrudColumn } from './CrudTable';
import { CrudForm, FormField } from './CrudForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface Diagnostico {
  id: number;
  vcDiag_Code: string;
  vcDiag_Description: string;
  vcDiag_Category: string;
  vcDiag_Type: string;
  biIsDeleted: boolean;
  dtAudit_CreatedAt: string;
  dtAudit_UpdatedAt: string;
  vcAudit_User: string;
  vcAudit_System: string;
  vcAudit_Module: string;
  vcAudit_SP: string;
}

export function DiagnosticoPage() {
  const [entities, setEntities] = useState<Diagnostico[]>([
    { id: 1, vcDiag_Code: 'A09', vcDiag_Description: 'Diarrea y gastroenteritis de presunto origen infeccioso', vcDiag_Category: 'A00-B99', vcDiag_Type: 'Principal', biIsDeleted: false, dtAudit_CreatedAt: '2025-01-01 10:00:00', dtAudit_UpdatedAt: '2025-01-05 15:30:00', vcAudit_User: 'admin', vcAudit_System: 'INTEROP', vcAudit_Module: 'MAESTROS', vcAudit_SP: 'sp_insert_diagnostico' },
    { id: 2, vcDiag_Code: 'J06.9', vcDiag_Description: 'Infección aguda de las vías respiratorias superiores, no especificada', vcDiag_Category: 'J00-J99', vcDiag_Type: 'Principal', biIsDeleted: false, dtAudit_CreatedAt: '2025-01-01 10:15:00', dtAudit_UpdatedAt: '2025-01-03 09:20:00', vcAudit_User: 'admin', vcAudit_System: 'INTEROP', vcAudit_Module: 'MAESTROS', vcAudit_SP: 'sp_insert_diagnostico' },
    { id: 3, vcDiag_Code: 'K59.0', vcDiag_Description: 'Estreñimiento', vcDiag_Category: 'K00-K93', vcDiag_Type: 'Secundario', biIsDeleted: false, dtAudit_CreatedAt: '2025-01-02 14:30:00', dtAudit_UpdatedAt: '2025-01-02 14:30:00', vcAudit_User: 'supervisor', vcAudit_System: 'INTEROP', vcAudit_Module: 'MAESTROS', vcAudit_SP: 'sp_insert_diagnostico' }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedEntity, setSelectedEntity] = useState<Diagnostico | null>(null);
  const [formData, setFormData] = useState<Partial<Diagnostico>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<Diagnostico | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const columns: CrudColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'vcDiag_Code', label: 'Código CIE', sortable: true },
    { key: 'vcDiag_Description', label: 'Descripción', sortable: true },
    { key: 'vcDiag_Category', label: 'Categoría', sortable: true },
    { key: 'vcDiag_Type', label: 'Tipo', sortable: true },
    { key: 'biIsDeleted', label: 'Estado', sortable: true },
    { key: 'dtAudit_UpdatedAt', label: 'Última Actualización', sortable: true, render: (value: string) => new Date(value).toLocaleString('es-PE') }
  ];

  const formFields: FormField[] = [
    { name: 'vcDiag_Code', label: 'Código CIE', type: 'text', required: true, maxLength: 10, placeholder: 'Ej: A09, J06.9', helpText: 'Código CIE-10 del diagnóstico' },
    { name: 'vcDiag_Description', label: 'Descripción', type: 'textarea', required: true, maxLength: 500, placeholder: 'Ingrese la descripción del diagnóstico', helpText: 'Descripción completa del diagnóstico médico' },
    { name: 'vcDiag_Category', label: 'Categoría', type: 'text', required: true, maxLength: 20, placeholder: 'Ej: A00-B99', helpText: 'Categoría CIE-10 del diagnóstico' },
    { name: 'vcDiag_Type', label: 'Tipo', type: 'select', required: true, options: [{ value: 'Principal', label: 'Principal' }, { value: 'Secundario', label: 'Secundario' }, { value: 'Complicación', label: 'Complicación' }], helpText: 'Tipo de diagnóstico médico' },
    { name: 'biIsDeleted', label: 'Estado', type: 'switch', helpText: 'Activo: El diagnóstico está habilitado en el sistema' }
  ];

  const handleNew = () => { setFormMode('create'); setSelectedEntity(null); setFormData({ vcDiag_Code: '', vcDiag_Description: '', vcDiag_Category: '', vcDiag_Type: '', biIsDeleted: false }); setIsFormOpen(true); };
  const handleEdit = (entity: Diagnostico) => { setFormMode('edit'); setSelectedEntity(entity); setFormData(entity); setIsFormOpen(true); };
  const handleView = (entity: Diagnostico) => { setFormMode('view'); setSelectedEntity(entity); setFormData(entity); setIsFormOpen(true); };
  const handleDelete = (entity: Diagnostico) => { setEntityToDelete(entity); setIsDeleteDialogOpen(true); };
  const handleDuplicate = (entity: Diagnostico) => { setFormMode('create'); setSelectedEntity(null); setFormData({ ...entity, id: undefined, vcDiag_Code: `${entity.vcDiag_Code}_COPY`, vcDiag_Description: `${entity.vcDiag_Description} (Copia)` }); setIsFormOpen(true); };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (!formData.vcDiag_Code?.trim() || !formData.vcDiag_Description?.trim() || !formData.vcDiag_Category?.trim() || !formData.vcDiag_Type?.trim()) {
        toast.error('Todos los campos son requeridos');
        setIsLoading(false);
        return;
      }

      const codeExists = entities.some(e => e.vcDiag_Code.toLowerCase() === formData.vcDiag_Code!.toLowerCase() && e.id !== selectedEntity?.id);
      if (codeExists) {
        toast.error('Ya existe un diagnóstico con ese código CIE');
        setIsLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (formMode === 'create') {
        const newEntity: Diagnostico = { id: Math.max(...entities.map(e => e.id)) + 1, vcDiag_Code: formData.vcDiag_Code!.toUpperCase(), vcDiag_Description: formData.vcDiag_Description!, vcDiag_Category: formData.vcDiag_Category!.toUpperCase(), vcDiag_Type: formData.vcDiag_Type!, biIsDeleted: formData.biIsDeleted || false, dtAudit_CreatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19), dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19), vcAudit_User: 'usuario_actual', vcAudit_System: 'INTEROP', vcAudit_Module: 'MAESTROS', vcAudit_SP: 'sp_insert_diagnostico' };
        setEntities([...entities, newEntity]);
        toast.success('Diagnóstico creado exitosamente');
      } else if (formMode === 'edit' && selectedEntity) {
        const updatedEntity: Diagnostico = { ...selectedEntity, ...formData, vcDiag_Code: formData.vcDiag_Code!.toUpperCase(), vcDiag_Category: formData.vcDiag_Category!.toUpperCase(), dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19), vcAudit_User: 'usuario_actual', vcAudit_SP: 'sp_update_diagnostico' } as Diagnostico;
        setEntities(entities.map(e => e.id === selectedEntity.id ? updatedEntity : e));
        toast.success('Diagnóstico actualizado exitosamente');
      }
      setIsFormOpen(false);
    } catch (error) {
      toast.error('Error al guardar el diagnóstico');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!entityToDelete) return;
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedEntity: Diagnostico = { ...entityToDelete, biIsDeleted: true, dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19), vcAudit_User: 'usuario_actual', vcAudit_SP: 'sp_delete_diagnostico' };
      setEntities(entities.map(e => e.id === entityToDelete.id ? updatedEntity : e));
      toast.success('Diagnóstico eliminado exitosamente');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Error al eliminar el diagnóstico');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => toast.success('Exportando datos...', { description: 'El archivo se descargará en breve' });
  const handleDataChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
  const getAuditData = () => !selectedEntity ? undefined : { createdAt: new Date(selectedEntity.dtAudit_CreatedAt).toLocaleString('es-PE'), updatedAt: new Date(selectedEntity.dtAudit_UpdatedAt).toLocaleString('es-PE'), user: selectedEntity.vcAudit_User, system: selectedEntity.vcAudit_System, module: selectedEntity.vcAudit_Module, procedure: selectedEntity.vcAudit_SP };

  return (
    <>
      <CrudTable title="Diagnósticos" data={entities} columns={columns} onNew={handleNew} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onDuplicate={handleDuplicate} onExport={handleExport} searchPlaceholder="Buscar por código CIE o descripción..." statusFilter={true} />
      <CrudForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={formMode === 'create' ? 'Nuevo Diagnóstico' : formMode === 'edit' ? 'Editar Diagnóstico' : 'Ver Diagnóstico'} mode={formMode} fields={formFields} data={formData} onDataChange={handleDataChange} onSubmit={handleSubmit} isLoading={isLoading} auditData={getAuditData()} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción marcará el diagnóstico "{entityToDelete?.vcDiag_Code}" como inactivo. Podrá reactivarlo posteriormente editando el registro.</AlertDialogDescription>
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