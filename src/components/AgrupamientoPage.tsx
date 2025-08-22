import React, { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { CrudTable, CrudColumn } from './CrudTable';
import { CrudForm, FormField } from './CrudForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { BaseMasterEntity, UserSession } from './shared/types';
import { createNewEntity, updateEntityAudit, softDeleteEntity, validateRequiredFields, validateCodes, checkUniqueCodes, simulateApiCall, createAuditData } from './shared/crudHelpers';

interface Agrupamiento extends BaseMasterEntity {
  vcAgrupamiento_Description: string;
  vcAgrupamiento_Code: string;
  vcAgrupamiento_Type: string;
}

interface AgrupamientoPageProps {
  currentUser?: UserSession;
}

export function AgrupamientoPage({ currentUser }: AgrupamientoPageProps) {
  const [entities, setEntities] = useState<Agrupamiento[]>([
    {
      id: 1,
      vcCodigoInterno: 'CENTRO_001',
      vcCodigoExterno: 'CP',
      vcAgrupamiento_Description: 'Centro Poblado',
      vcAgrupamiento_Code: 'CP',
      vcAgrupamiento_Type: 'Urbano',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-01 10:00:00',
      dtAudit_UpdatedAt: '2025-01-05 15:30:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_agrupamiento'
    },
    {
      id: 2,
      vcCodigoInterno: 'CASERIO_001',
      vcCodigoExterno: 'CAS',
      vcAgrupamiento_Description: 'Caserío',
      vcAgrupamiento_Code: 'CAS',
      vcAgrupamiento_Type: 'Rural',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-01 10:15:00',
      dtAudit_UpdatedAt: '2025-01-03 09:20:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_agrupamiento'
    },
    {
      id: 3,
      vcCodigoInterno: 'ANEXO_001',
      vcCodigoExterno: 'ANX',
      vcAgrupamiento_Description: 'Anexo',
      vcAgrupamiento_Code: 'ANX',
      vcAgrupamiento_Type: 'Rural',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-02 14:30:00',
      dtAudit_UpdatedAt: '2025-01-02 14:30:00',
      vcAudit_User: 'supervisor',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_agrupamiento'
    }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'bulk-edit'>('create');
  const [selectedEntity, setSelectedEntity] = useState<Agrupamiento | null>(null);
  const [selectedEntities, setSelectedEntities] = useState<Agrupamiento[]>([]);
  const [formData, setFormData] = useState<Partial<Agrupamiento>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<Agrupamiento | null>(null);
  const [entitiesToDelete, setEntitiesToDelete] = useState<Agrupamiento[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const columns: CrudColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'vcCodigoInterno', label: 'Código Interno', sortable: true },
    { key: 'vcCodigoExterno', label: 'Código Externo', sortable: true },
    { key: 'vcAgrupamiento_Code', label: 'Código', sortable: true },
    { key: 'vcAgrupamiento_Description', label: 'Descripción', sortable: true },
    { key: 'vcAgrupamiento_Type', label: 'Tipo', sortable: true },
    { key: 'biIsDeleted', label: 'Estado', sortable: true },
    { key: 'dtAudit_UpdatedAt', label: 'Última Actualización', sortable: true, render: (value: string) => new Date(value).toLocaleString('es-PE') }
  ];

  const formFields: FormField[] = [
    { name: 'vcCodigoInterno', label: 'Código Interno', type: 'text', required: true, maxLength: 50, placeholder: 'Ej: CENTRO_001', helpText: 'Código único interno del sistema' },
    { name: 'vcCodigoExterno', label: 'Código Externo', type: 'text', required: true, maxLength: 50, placeholder: 'Ej: CP', helpText: 'Código de identificación externa' },
    { name: 'vcAgrupamiento_Code', label: 'Código', type: 'text', required: true, maxLength: 10, placeholder: 'Ej: CP, CAS, ANX', helpText: 'Código único del agrupamiento rural' },
    { name: 'vcAgrupamiento_Description', label: 'Descripción', type: 'text', required: true, maxLength: 100, placeholder: 'Ingrese el nombre del agrupamiento', helpText: 'Nombre completo del tipo de agrupamiento rural' },
    { name: 'vcAgrupamiento_Type', label: 'Tipo', type: 'select', required: true, options: [{ value: 'Urbano', label: 'Urbano' }, { value: 'Rural', label: 'Rural' }], helpText: 'Clasificación del tipo de agrupamiento' },
    { name: 'biIsDeleted', label: 'Estado', type: 'switch', helpText: 'Activo: El agrupamiento está habilitado en el sistema' }
  ];

  const bulkEditFields: FormField[] = [
    { name: 'biIsDeleted', label: 'Estado', type: 'switch', helpText: 'Cambiar estado de todos los elementos seleccionados' }
  ];

  const handleNew = () => {
    setFormMode('create');
    setSelectedEntity(null);
    setFormData({ vcCodigoInterno: '', vcCodigoExterno: '', vcAgrupamiento_Code: '', vcAgrupamiento_Description: '', vcAgrupamiento_Type: '', biIsDeleted: false });
    setIsFormOpen(true);
  };

  const handleEdit = (entity: Agrupamiento) => {
    setFormMode('edit');
    setSelectedEntity(entity);
    setFormData(entity);
    setIsFormOpen(true);
  };

  const handleView = (entity: Agrupamiento) => {
    setFormMode('view');
    setSelectedEntity(entity);
    setFormData(entity);
    setIsFormOpen(true);
  };

  const handleDelete = (entity: Agrupamiento) => {
    setEntityToDelete(entity);
    setIsDeleteDialogOpen(true);
  };

  const handleBulkEdit = (selectedItems: Agrupamiento[]) => {
    setFormMode('bulk-edit');
    setSelectedEntities(selectedItems);
    setFormData({ biIsDeleted: false });
    setIsFormOpen(true);
  };

  const handleBulkDelete = (selectedItems: Agrupamiento[]) => {
    setEntitiesToDelete(selectedItems);
    setIsBulkDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      await simulateApiCall();

      if (formMode === 'create') {
        const requiredFields = ['vcCodigoInterno', 'vcCodigoExterno', 'vcAgrupamiento_Code', 'vcAgrupamiento_Description', 'vcAgrupamiento_Type'];
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

        const newEntity = createNewEntity<Agrupamiento>({
          vcCodigoInterno: formData.vcCodigoInterno!,
          vcCodigoExterno: formData.vcCodigoExterno!,
          vcAgrupamiento_Code: formData.vcAgrupamiento_Code!.toUpperCase(),
          vcAgrupamiento_Description: formData.vcAgrupamiento_Description!,
          vcAgrupamiento_Type: formData.vcAgrupamiento_Type!,
          biIsDeleted: formData.biIsDeleted || false
        }, 'sp_insert_agrupamiento', Math.max(...entities.map(e => e.id)), currentUser);
        
        setEntities([...entities, newEntity]);
        toast.success('Agrupamiento creado exitosamente');

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
          vcAgrupamiento_Code: formData.vcAgrupamiento_Code?.toUpperCase()
        }, 'sp_update_agrupamiento', currentUser);
        
        setEntities(entities.map(e => e.id === selectedEntity.id ? updatedEntity : e));
        toast.success('Agrupamiento actualizado exitosamente');

      } else if (formMode === 'bulk-edit' && selectedEntities.length > 0) {
        const updatedEntities = entities.map(entity => {
          if (selectedEntities.some(selected => selected.id === entity.id)) {
            return updateEntityAudit(entity, { biIsDeleted: formData.biIsDeleted ?? entity.biIsDeleted }, 'sp_bulk_update_agrupamiento', currentUser);
          }
          return entity;
        });
        
        setEntities(updatedEntities);
        toast.success(`${selectedEntities.length} agrupamientos actualizados exitosamente`);
      }

      setIsFormOpen(false);
    } catch (error) {
      toast.error('Error al guardar el agrupamiento');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!entityToDelete) return;
    setIsLoading(true);
    
    try {
      await simulateApiCall();
      const updatedEntity = softDeleteEntity(entityToDelete, 'sp_delete_agrupamiento', currentUser);
      setEntities(entities.map(e => e.id === entityToDelete.id ? updatedEntity : e));
      toast.success('Agrupamiento eliminado exitosamente');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Error al eliminar el agrupamiento');
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
          return softDeleteEntity(entity, 'sp_bulk_delete_agrupamiento', currentUser);
        }
        return entity;
      });

      setEntities(updatedEntities);
      toast.success(`${entitiesToDelete.length} agrupamientos eliminados exitosamente`);
      setIsBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Error al eliminar los agrupamientos');
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
      case 'create': return 'Nuevo Agrupamiento Rural';
      case 'edit': return 'Editar Agrupamiento Rural';
      case 'view': return 'Ver Agrupamiento Rural';
      case 'bulk-edit': return `Editar ${selectedEntities.length} Agrupamientos Rurales`;
      default: return 'Agrupamiento Rural';
    }
  };

  const getCurrentFormFields = () => {
    return formMode === 'bulk-edit' ? bulkEditFields : formFields;
  };

  return (
    <>
      <CrudTable
        title="Agrupamientos Rurales"
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
              Esta acción marcará el agrupamiento "{entityToDelete?.vcAgrupamiento_Description}" como inactivo. 
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
              Esta acción marcará {entitiesToDelete.length} agrupamientos como inactivos:
              <div className="mt-2 max-h-32 overflow-y-auto">
                <ul className="list-disc list-inside text-sm">
                  {entitiesToDelete.map(entity => (
                    <li key={entity.id}>{entity.vcAgrupamiento_Code} - {entity.vcAgrupamiento_Description}</li>
                  ))}
                </ul>
              </div>
              Podrá reactivarlos posteriormente editando los registros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} disabled={isLoading}>
              {isLoading ? 'Eliminando...' : `Eliminar ${entitiesToDelete.length} agrupamientos`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}