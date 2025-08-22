import React, { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { CrudTable, CrudColumn } from './CrudTable';
import { CrudForm, FormField } from './CrudForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface TipoDiagnostico {
  id: number;
  vcTipoDiag_Code: string;
  vcTipoDiag_Description: string;
  vcTipoDiag_Priority: string;
  biIsDeleted: boolean;
  dtAudit_CreatedAt: string;
  dtAudit_UpdatedAt: string;
  vcAudit_User: string;
  vcAudit_System: string;
  vcAudit_Module: string;
  vcAudit_SP: string;
}

export function TipoDiagnosticoPage() {
  const [entities, setEntities] = useState<TipoDiagnostico[]>([
    { id: 1, vcTipoDiag_Code: 'PR', vcTipoDiag_Description: 'Diagnóstico Principal', vcTipoDiag_Priority: 'Alta', biIsDeleted: false, dtAudit_CreatedAt: '2025-01-01 10:00:00', dtAudit_UpdatedAt: '2025-01-05 15:30:00', vcAudit_User: 'admin', vcAudit_System: 'INTEROP', vcAudit_Module: 'MAESTROS', vcAudit_SP: 'sp_insert_tipo_diagnostico' },
    { id: 2, vcTipoDiag_Code: 'SE', vcTipoDiag_Description: 'Diagnóstico Secundario', vcTipoDiag_Priority: 'Media', biIsDeleted: false, dtAudit_CreatedAt: '2025-01-01 10:15:00', dtAudit_UpdatedAt: '2025-01-03 09:20:00', vcAudit_User: 'admin', vcAudit_System: 'INTEROP', vcAudit_Module: 'MAESTROS', vcAudit_SP: 'sp_insert_tipo_diagnostico' },
    { id: 3, vcTipoDiag_Code: 'CO', vcTipoDiag_Description: 'Complicación', vcTipoDiag_Priority: 'Alta', biIsDeleted: false, dtAudit_CreatedAt: '2025-01-02 14:30:00', dtAudit_UpdatedAt: '2025-01-02 14:30:00', vcAudit_User: 'supervisor', vcAudit_System: 'INTEROP', vcAudit_Module: 'MAESTROS', vcAudit_SP: 'sp_insert_tipo_diagnostico' }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedEntity, setSelectedEntity] = useState<TipoDiagnostico | null>(null);
  const [formData, setFormData] = useState<Partial<TipoDiagnostico>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<TipoDiagnostico | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const columns: CrudColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'vcTipoDiag_Code', label: 'Código', sortable: true },
    { key: 'vcTipoDiag_Description', label: 'Descripción', sortable: true },
    { key: 'vcTipoDiag_Priority', label: 'Prioridad', sortable: true },
    { key: 'biIsDeleted', label: 'Estado', sortable: true },
    { key: 'dtAudit_UpdatedAt', label: 'Última Actualización', sortable: true, render: (value: string) => new Date(value).toLocaleString('es-PE') }
  ];

  const formFields: FormField[] = [
    { name: 'vcTipoDiag_Code', label: 'Código', type: 'text', required: true, maxLength: 10, placeholder: 'Ej: PR, SE, CO', helpText: 'Código único del tipo de diagnóstico' },
    { name: 'vcTipoDiag_Description', label: 'Descripción', type: 'text', required: true, maxLength: 100, placeholder: 'Ingrese la descripción del tipo', helpText: 'Descripción completa del tipo de diagnóstico' },
    { name: 'vcTipoDiag_Priority', label: 'Prioridad', type: 'select', required: true, options: [{ value: 'Alta', label: 'Alta' }, { value: 'Media', label: 'Media' }, { value: 'Baja', label: 'Baja' }], helpText: 'Nivel de prioridad del tipo de diagnóstico' },
    { name: 'biIsDeleted', label: 'Estado', type: 'switch', helpText: 'Activo: El tipo de diagnóstico está habilitado en el sistema' }
  ];

  const handleNew = () => { setFormMode('create'); setSelectedEntity(null); setFormData({ vcTipoDiag_Code: '', vcTipoDiag_Description: '', vcTipoDiag_Priority: '', biIsDeleted: false }); setIsFormOpen(true); };
  const handleEdit = (entity: TipoDiagnostico) => { setFormMode('edit'); setSelectedEntity(entity); setFormData(entity); setIsFormOpen(true); };
  const handleView = (entity: TipoDiagnostico) => { setFormMode('view'); setSelectedEntity(entity); setFormData(entity); setIsFormOpen(true); };
  const handleDelete = (entity: TipoDiagnostico) => { setEntityToDelete(entity); setIsDeleteDialogOpen(true); };
  const handleDuplicate = (entity: TipoDiagnostico) => { setFormMode('create'); setSelectedEntity(null); setFormData({ ...entity, id: undefined, vcTipoDiag_Code: `${entity.vcTipoDiag_Code}_COPY`, vcTipoDiag_Description: `${entity.vcTipoDiag_Description} (Copia)` }); setIsFormOpen(true); };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (!formData.vcTipoDiag_Code?.trim() || !formData.vcTipoDiag_Description?.trim() || !formData.vcTipoDiag_Priority?.trim()) {
        toast.error('Todos los campos son requeridos');
        setIsLoading(false);
        return;
      }

      const codeExists = entities.some(e => e.vcTipoDiag_Code.toLowerCase() === formData.vcTipoDiag_Code!.toLowerCase() && e.id !== selectedEntity?.id);
      if (codeExists) {
        toast.error('Ya existe un tipo de diagnóstico con ese código');
        setIsLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (formMode === 'create') {
        const newEntity: TipoDiagnostico = { id: Math.max(...entities.map(e => e.id)) + 1, vcTipoDiag_Code: formData.vcTipoDiag_Code!.toUpperCase(), vcTipoDiag_Description: formData.vcTipoDiag_Description!, vcTipoDiag_Priority: formData.vcTipoDiag_Priority!, biIsDeleted: formData.biIsDeleted || false, dtAudit_CreatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19), dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19), vcAudit_User: 'usuario_actual', vcAudit_System: 'INTEROP', vcAudit_Module: 'MAESTROS', vcAudit_SP: 'sp_insert_tipo_diagnostico' };
        setEntities([...entities, newEntity]);
        toast.success('Tipo de diagnóstico creado exitosamente');
      } else if (formMode === 'edit' && selectedEntity) {
        const updatedEntity: TipoDiagnostico = { ...selectedEntity, ...formData, vcTipoDiag_Code: formData.vcTipoDiag_Code!.toUpperCase(), dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19), vcAudit_User: 'usuario_actual', vcAudit_SP: 'sp_update_tipo_diagnostico' } as TipoDiagnostico;
        setEntities(entities.map(e => e.id === selectedEntity.id ? updatedEntity : e));
        toast.success('Tipo de diagnóstico actualizado exitosamente');
      }
      setIsFormOpen(false);
    } catch (error) {
      toast.error('Error al guardar el tipo de diagnóstico');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!entityToDelete) return;
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedEntity: TipoDiagnostico = { ...entityToDelete, biIsDeleted: true, dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19), vcAudit_User: 'usuario_actual', vcAudit_SP: 'sp_delete_tipo_diagnostico' };
      setEntities(entities.map(e => e.id === entityToDelete.id ? updatedEntity : e));
      toast.success('Tipo de diagnóstico eliminado exitosamente');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Error al eliminar el tipo de diagnóstico');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => toast.success('Exportando datos...', { description: 'El archivo se descargará en breve' });
  const handleDataChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
  const getAuditData = () => !selectedEntity ? undefined : { createdAt: new Date(selectedEntity.dtAudit_CreatedAt).toLocaleString('es-PE'), updatedAt: new Date(selectedEntity.dtAudit_UpdatedAt).toLocaleString('es-PE'), user: selectedEntity.vcAudit_User, system: selectedEntity.vcAudit_System, module: selectedEntity.vcAudit_Module, procedure: selectedEntity.vcAudit_SP };

  return (
    <>
      <CrudTable title="Tipos de Diagnóstico" data={entities} columns={columns} onNew={handleNew} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onDuplicate={handleDuplicate} onExport={handleExport} searchPlaceholder="Buscar por código o descripción..." statusFilter={true} />
      <CrudForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={formMode === 'create' ? 'Nuevo Tipo de Diagnóstico' : formMode === 'edit' ? 'Editar Tipo de Diagnóstico' : 'Ver Tipo de Diagnóstico'} mode={formMode} fields={formFields} data={formData} onDataChange={handleDataChange} onSubmit={handleSubmit} isLoading={isLoading} auditData={getAuditData()} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción marcará el tipo de diagnóstico "{entityToDelete?.vcTipoDiag_Description}" como inactivo. Podrá reactivarlo posteriormente editando el registro.</AlertDialogDescription>
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