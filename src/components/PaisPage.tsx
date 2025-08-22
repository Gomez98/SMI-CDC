import React, { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { CrudTable, CrudColumn } from './CrudTable';
import { CrudForm, FormField } from './CrudForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface Pais {
  id: number;
  vcPais_Name: string;
  vcPais_Code: string;
  vcPais_Iso2: string;
  vcPais_Iso3: string;
  biIsDeleted: boolean;
  dtAudit_CreatedAt: string;
  dtAudit_UpdatedAt: string;
  vcAudit_User: string;
  vcAudit_System: string;
  vcAudit_Module: string;
  vcAudit_SP: string;
}

export function PaisPage() {
  const [entities, setEntities] = useState<Pais[]>([
    { id: 1, vcPais_Name: 'Perú', vcPais_Code: 'PE', vcPais_Iso2: 'PE', vcPais_Iso3: 'PER', biIsDeleted: false, dtAudit_CreatedAt: '2025-01-01 10:00:00', dtAudit_UpdatedAt: '2025-01-05 15:30:00', vcAudit_User: 'admin', vcAudit_System: 'INTEROP', vcAudit_Module: 'MAESTROS', vcAudit_SP: 'sp_insert_pais' },
    { id: 2, vcPais_Name: 'Colombia', vcPais_Code: 'CO', vcPais_Iso2: 'CO', vcPais_Iso3: 'COL', biIsDeleted: false, dtAudit_CreatedAt: '2025-01-01 10:15:00', dtAudit_UpdatedAt: '2025-01-03 09:20:00', vcAudit_User: 'admin', vcAudit_System: 'INTEROP', vcAudit_Module: 'MAESTROS', vcAudit_SP: 'sp_insert_pais' },
    { id: 3, vcPais_Name: 'Ecuador', vcPais_Code: 'EC', vcPais_Iso2: 'EC', vcPais_Iso3: 'ECU', biIsDeleted: false, dtAudit_CreatedAt: '2025-01-02 14:30:00', dtAudit_UpdatedAt: '2025-01-02 14:30:00', vcAudit_User: 'supervisor', vcAudit_System: 'INTEROP', vcAudit_Module: 'MAESTROS', vcAudit_SP: 'sp_insert_pais' },
    { id: 4, vcPais_Name: 'Venezuela', vcPais_Code: 'VE', vcPais_Iso2: 'VE', vcPais_Iso3: 'VEN', biIsDeleted: true, dtAudit_CreatedAt: '2025-01-03 11:45:00', dtAudit_UpdatedAt: '2025-01-07 16:20:00', vcAudit_User: 'admin', vcAudit_System: 'INTEROP', vcAudit_Module: 'MAESTROS', vcAudit_SP: 'sp_update_pais' }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedEntity, setSelectedEntity] = useState<Pais | null>(null);
  const [formData, setFormData] = useState<Partial<Pais>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<Pais | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const columns: CrudColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'vcPais_Code', label: 'Código', sortable: true },
    { key: 'vcPais_Name', label: 'Nombre', sortable: true },
    { key: 'vcPais_Iso2', label: 'ISO2', sortable: true },
    { key: 'vcPais_Iso3', label: 'ISO3', sortable: true },
    { key: 'biIsDeleted', label: 'Estado', sortable: true },
    { key: 'dtAudit_UpdatedAt', label: 'Última Actualización', sortable: true, render: (value: string) => new Date(value).toLocaleString('es-PE') }
  ];

  const formFields: FormField[] = [
    { name: 'vcPais_Code', label: 'Código', type: 'text', required: true, maxLength: 10, placeholder: 'Ej: PE, CO, EC', helpText: 'Código único del país (máximo 10 caracteres)' },
    { name: 'vcPais_Name', label: 'Nombre', type: 'text', required: true, maxLength: 100, placeholder: 'Ingrese el nombre del país', helpText: 'Nombre oficial del país' },
    { name: 'vcPais_Iso2', label: 'Código ISO2', type: 'text', required: true, maxLength: 2, placeholder: 'PE', helpText: 'Código ISO de 2 caracteres' },
    { name: 'vcPais_Iso3', label: 'Código ISO3', type: 'text', required: true, maxLength: 3, placeholder: 'PER', helpText: 'Código ISO de 3 caracteres' },
    { name: 'biIsDeleted', label: 'Estado', type: 'switch', helpText: 'Activo: El país está habilitado en el sistema' }
  ];

  const handleNew = () => { setFormMode('create'); setSelectedEntity(null); setFormData({ vcPais_Code: '', vcPais_Name: '', vcPais_Iso2: '', vcPais_Iso3: '', biIsDeleted: false }); setIsFormOpen(true); };
  const handleEdit = (entity: Pais) => { setFormMode('edit'); setSelectedEntity(entity); setFormData(entity); setIsFormOpen(true); };
  const handleView = (entity: Pais) => { setFormMode('view'); setSelectedEntity(entity); setFormData(entity); setIsFormOpen(true); };
  const handleDelete = (entity: Pais) => { setEntityToDelete(entity); setIsDeleteDialogOpen(true); };
  const handleDuplicate = (entity: Pais) => { setFormMode('create'); setSelectedEntity(null); setFormData({ ...entity, id: undefined, vcPais_Code: `${entity.vcPais_Code}_COPY`, vcPais_Name: `${entity.vcPais_Name} (Copia)` }); setIsFormOpen(true); };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (!formData.vcPais_Code?.trim() || !formData.vcPais_Name?.trim() || !formData.vcPais_Iso2?.trim() || !formData.vcPais_Iso3?.trim()) {
        toast.error('Todos los campos son requeridos');
        setIsLoading(false);
        return;
      }

      const codeExists = entities.some(e => e.vcPais_Code.toLowerCase() === formData.vcPais_Code!.toLowerCase() && e.id !== selectedEntity?.id);
      if (codeExists) {
        toast.error('Ya existe un país con ese código');
        setIsLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (formMode === 'create') {
        const newEntity: Pais = { id: Math.max(...entities.map(e => e.id)) + 1, vcPais_Code: formData.vcPais_Code!.toUpperCase(), vcPais_Name: formData.vcPais_Name!, vcPais_Iso2: formData.vcPais_Iso2!.toUpperCase(), vcPais_Iso3: formData.vcPais_Iso3!.toUpperCase(), biIsDeleted: formData.biIsDeleted || false, dtAudit_CreatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19), dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19), vcAudit_User: 'usuario_actual', vcAudit_System: 'INTEROP', vcAudit_Module: 'MAESTROS', vcAudit_SP: 'sp_insert_pais' };
        setEntities([...entities, newEntity]);
        toast.success('País creado exitosamente');
      } else if (formMode === 'edit' && selectedEntity) {
        const updatedEntity: Pais = { ...selectedEntity, ...formData, vcPais_Code: formData.vcPais_Code!.toUpperCase(), vcPais_Iso2: formData.vcPais_Iso2!.toUpperCase(), vcPais_Iso3: formData.vcPais_Iso3!.toUpperCase(), dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19), vcAudit_User: 'usuario_actual', vcAudit_SP: 'sp_update_pais' } as Pais;
        setEntities(entities.map(e => e.id === selectedEntity.id ? updatedEntity : e));
        toast.success('País actualizado exitosamente');
      }
      setIsFormOpen(false);
    } catch (error) {
      toast.error('Error al guardar el país');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!entityToDelete) return;
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedEntity: Pais = { ...entityToDelete, biIsDeleted: true, dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19), vcAudit_User: 'usuario_actual', vcAudit_SP: 'sp_delete_pais' };
      setEntities(entities.map(e => e.id === entityToDelete.id ? updatedEntity : e));
      toast.success('País eliminado exitosamente');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Error al eliminar el país');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => toast.success('Exportando datos...', { description: 'El archivo se descargará en breve' });
  const handleDataChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
  const getAuditData = () => !selectedEntity ? undefined : { createdAt: new Date(selectedEntity.dtAudit_CreatedAt).toLocaleString('es-PE'), updatedAt: new Date(selectedEntity.dtAudit_UpdatedAt).toLocaleString('es-PE'), user: selectedEntity.vcAudit_User, system: selectedEntity.vcAudit_System, module: selectedEntity.vcAudit_Module, procedure: selectedEntity.vcAudit_SP };

  return (
    <>
      <CrudTable title="Países" data={entities} columns={columns} onNew={handleNew} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} onDuplicate={handleDuplicate} onExport={handleExport} searchPlaceholder="Buscar por código o nombre..." statusFilter={true} />
      <CrudForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={formMode === 'create' ? 'Nuevo País' : formMode === 'edit' ? 'Editar País' : 'Ver País'} mode={formMode} fields={formFields} data={formData} onDataChange={handleDataChange} onSubmit={handleSubmit} isLoading={isLoading} auditData={getAuditData()} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción marcará el país "{entityToDelete?.vcPais_Name}" como inactivo. Podrá reactivarlo posteriormente editando el registro.</AlertDialogDescription>
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