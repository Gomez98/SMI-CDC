import React, { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { CrudTable, CrudColumn } from './CrudTable';
import { CrudForm, FormField } from './CrudForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { BaseMasterEntity, UserSession } from './shared/types';
import { createNewEntity, updateEntityAudit, softDeleteEntity, validateRequiredFields, validateCodes, checkUniqueCodes, simulateApiCall, createAuditData } from './shared/crudHelpers';

interface Sexo extends BaseMasterEntity {
  vcSexo_Description: string;
  vcSexo_Code: string;
}

interface SexoPageProps {
  currentUser?: UserSession;
}

export function SexoPage({ currentUser }: SexoPageProps) {
  const [entities, setEntities] = useState<Sexo[]>([
    {
      id: 1,
      vcCodigoInterno: 'MASC_001',
      vcCodigoExterno: 'M',
      vcSexo_Description: 'Masculino',
      vcSexo_Code: 'M',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-01 10:00:00',
      dtAudit_UpdatedAt: '2025-01-05 15:30:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_sexo'
    },
    {
      id: 2,
      vcCodigoInterno: 'FEM_001',
      vcCodigoExterno: 'F',
      vcSexo_Description: 'Femenino',
      vcSexo_Code: 'F',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-01 10:15:00',
      dtAudit_UpdatedAt: '2025-01-03 09:20:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_sexo'
    },
    {
      id: 3,
      vcCodigoInterno: 'IND_001',
      vcCodigoExterno: 'I',
      vcSexo_Description: 'Indeterminado',
      vcSexo_Code: 'I',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-02 14:30:00',
      dtAudit_UpdatedAt: '2025-01-02 14:30:00',
      vcAudit_User: 'supervisor',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_sexo'
    }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'bulk-edit'>('create');
  const [selectedEntity, setSelectedEntity] = useState<Sexo | null>(null);
  const [selectedEntities, setSelectedEntities] = useState<Sexo[]>([]);
  const [formData, setFormData] = useState<Partial<Sexo>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<Sexo | null>(null);
  const [entitiesToDelete, setEntitiesToDelete] = useState<Sexo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const columns: CrudColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'vcCodigoInterno', label: 'Código Interno', sortable: true },
    { key: 'vcCodigoExterno', label: 'Código Externo', sortable: true },
    { key: 'vcSexo_Code', label: 'Código', sortable: true },
    { key: 'vcSexo_Description', label: 'Descripción', sortable: true },
    { key: 'biIsDeleted', label: 'Estado', sortable: true },
    { key: 'dtAudit_UpdatedAt', label: 'Última Actualización', sortable: true, render: (value: string) => new Date(value).toLocaleString('es-PE') }
  ];

  const formFields: FormField[] = [
    { name: 'vcCodigoInterno', label: 'Código Interno', type: 'text', required: true, maxLength: 50, placeholder: 'Ej: MASC_001', helpText: 'Código único interno del sistema' },
    { name: 'vcCodigoExterno', label: 'Código Externo', type: 'text', required: true, maxLength: 50, placeholder: 'Ej: M', helpText: 'Código de identificación externa' },
    { name: 'vcSexo_Code', label: 'Código', type: 'text', required: true, maxLength: 5, placeholder: 'Ej: M, F, I', helpText: 'Código único del sexo (máximo 5 caracteres)' },
    { name: 'vcSexo_Description', label: 'Descripción', type: 'text', required: true, maxLength: 50, placeholder: 'Ej: Masculino, Femenino', helpText: 'Descripción del sexo' },
    { name: 'biIsDeleted', label: 'Estado', type: 'switch', helpText: 'Activo: El sexo está habilitado en el sistema' }
  ];

  const bulkEditFields: FormField[] = [
    { name: 'biIsDeleted', label: 'Estado', type: 'switch', helpText: 'Cambiar estado de todos los elementos seleccionados' }
  ];

  const handleNew = () => {
    setFormMode('create');
    setSelectedEntity(null);
    setFormData({ vcCodigoInterno: '', vcCodigoExterno: '', vcSexo_Code: '', vcSexo_Description: '', biIsDeleted: false });
    setIsFormOpen(true);
  };

  const handleEdit = (entity: Sexo) => {
    setFormMode('edit');
    setSelectedEntity(entity);
    setFormData(entity);
    setIsFormOpen(true);
  };

  const handleView = (entity: Sexo) => {
    setFormMode('view');
    setSelectedEntity(entity);
    setFormData(entity);
    setIsFormOpen(true);
  };

  const handleDelete = (entity: Sexo) => {
    setEntityToDelete(entity);
    setIsDeleteDialogOpen(true);
  };

  const handleBulkEdit = (selectedItems: Sexo[]) => {
    setFormMode('bulk-edit');
    setSelectedEntities(selectedItems);
    setFormData({ biIsDeleted: false });
    setIsFormOpen(true);
  };

  const handleBulkDelete = (selectedItems: Sexo[]) => {
    setEntitiesToDelete(selectedItems);
    setIsBulkDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      await simulateApiCall();

      if (formMode === 'create') {
        const requiredFields = ['vcCodigoInterno', 'vcCodigoExterno', 'vcSexo_Code', 'vcSexo_Description'];
        if (!validateRequiredFields(formData, requiredFields)) {
          setIsLoading(false);
          return;
        }

        if (!validateCodes(formData.vcCodigoInterno!, formData.vcCodigoExterno!)) {
          setIsLoading(false);
          return;
        }

        const codeValidation = checkUniqueCodes(entities, formData.vcCodigoInterno!, formData.vcCodigoExterno!);
        if (!codeValidation.isValid) {
          toast.error(codeValidation.message!);
          setIsLoading(false);
          return;
        }

        const newEntity = createNewEntity<Sexo>({
          vcCodigoInterno: formData.vcCodigoInterno!,
          vcCodigoExterno: formData.vcCodigoExterno!,
          vcSexo_Code: formData.vcSexo_Code!.toUpperCase(),
          vcSexo_Description: formData.vcSexo_Description!,
          biIsDeleted: formData.biIsDeleted || false
        }, 'sp_insert_sexo', Math.max(...entities.map(e => e.id)), currentUser);
        
        setEntities([...entities, newEntity]);
        toast.success('Sexo creado exitosamente');

      } else if (formMode === 'edit' && selectedEntity) {
        if (formData.vcCodigoInterno && formData.vcCodigoExterno) {
          const codeValidation = checkUniqueCodes(entities, formData.vcCodigoInterno, formData.vcCodigoExterno, selectedEntity.id);
          if (!codeValidation.isValid) {
            toast.error(codeValidation.message!);
            setIsLoading(false);
            return;
          }
        }

        const updatedEntity = updateEntityAudit(selectedEntity, {
          ...formData,
          vcSexo_Code: formData.vcSexo_Code?.toUpperCase()
        }, 'sp_update_sexo', currentUser);
        
        setEntities(entities.map(e => e.id === selectedEntity.id ? updatedEntity : e));
        toast.success('Sexo actualizado exitosamente');

      } else if (formMode === 'bulk-edit' && selectedEntities.length > 0) {
        const updatedEntities = entities.map(entity => {
          if (selectedEntities.some(selected => selected.id === entity.id)) {
            return updateEntityAudit(entity, { biIsDeleted: formData.biIsDeleted ?? entity.biIsDeleted }, 'sp_bulk_update_sexo', currentUser);
          }
          return entity;
        });
        
        setEntities(updatedEntities);
        toast.success(`${selectedEntities.length} sexos actualizados exitosamente`);
      }

      setIsFormOpen(false);
    } catch (error) {
      toast.error('Error al guardar el sexo');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!entityToDelete) return;
    setIsLoading(true);
    
    try {
      await simulateApiCall();
      const updatedEntity = softDeleteEntity(entityToDelete, 'sp_delete_sexo', currentUser);
      setEntities(entities.map(e => e.id === entityToDelete.id ? updatedEntity : e));
      toast.success('Sexo eliminado exitosamente');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Error al eliminar el sexo');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmBulkDelete = async () => {
    if (entitiesToDelete.length === 0) return;
    setIsLoading(true);
    
    try {
      await simulateApiCall(1500);
      const updatedEntities = entities.map(entity => {
        if (entitiesToDelete.some(toDelete => toDelete.id === entity.id)) {
          return softDeleteEntity(entity, 'sp_bulk_delete_sexo', currentUser);
        }
        return entity;
      });

      setEntities(updatedEntities);
      toast.success(`${entitiesToDelete.length} sexos eliminados exitosamente`);
      setIsBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Error al eliminar los sexos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getAuditData = () => selectedEntity ? createAuditData(selectedEntity) : undefined;

  const getFormTitle = () => {
    switch (formMode) {
      case 'create': return 'Nuevo Sexo';
      case 'edit': return 'Editar Sexo';
      case 'view': return 'Ver Sexo';
      case 'bulk-edit': return `Editar ${selectedEntities.length} Sexos`;
      default: return 'Sexo';
    }
  };

  const getCurrentFormFields = () => {
    return formMode === 'bulk-edit' ? bulkEditFields : formFields;
  };

  return (
    <>
      <CrudTable
        title="Sexos"
        data={entities}
        columns={columns}
        onNew={handleNew}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkEdit={handleBulkEdit}
        onBulkDelete={handleBulkDelete}
        searchPlaceholder="Buscar por código o descripción..."
        statusFilter={true}
        showBulkActions={true}
      />

      <CrudForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={getFormTitle()}
        mode={formMode === 'bulk-edit' ? 'edit' : formMode}
        fields={getCurrentFormFields()}
        data={formData}
        onDataChange={handleDataChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        auditData={formMode !== 'bulk-edit' ? getAuditData() : undefined}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará el sexo "{entityToDelete?.vcSexo_Description}" como inactivo. 
              Podrá reactivarlo posteriormente editando el registro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isLoading}>
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará {entitiesToDelete.length} sexos como inactivos:
              <div className="mt-2 max-h-32 overflow-y-auto">
                <ul className="list-disc list-inside text-sm">
                  {entitiesToDelete.map(entity => (
                    <li key={entity.id}>{entity.vcSexo_Code} - {entity.vcSexo_Description}</li>
                  ))}
                </ul>
              </div>
              Podrá reactivarlos posteriormente editando los registros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} disabled={isLoading}>
              {isLoading ? 'Eliminando...' : `Eliminar ${entitiesToDelete.length} sexos`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}