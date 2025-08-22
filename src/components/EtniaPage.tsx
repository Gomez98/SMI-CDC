import React, { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { CrudTable, CrudColumn } from './CrudTable';
import { CrudForm, FormField } from './CrudForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { BaseMasterEntity, UserSession } from './shared/types';
import { createNewEntity, updateEntityAudit, softDeleteEntity, validateRequiredFields, validateCodes, checkUniqueCodes, simulateApiCall, createAuditData } from './shared/crudHelpers';

interface Etnia extends BaseMasterEntity {
  vcEtnia_Description: string;
  vcEtnia_Code: string;
}

interface EtniaPageProps {
  currentUser?: UserSession;
}

export function EtniaPage({ currentUser }: EtniaPageProps) {
  const [entities, setEntities] = useState<Etnia[]>([
    {
      id: 1,
      vcCodigoInterno: 'MES_001',
      vcCodigoExterno: 'MES',
      vcEtnia_Description: 'Mestizo',
      vcEtnia_Code: 'MES',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-01 10:00:00',
      dtAudit_UpdatedAt: '2025-01-05 15:30:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_etnia'
    },
    {
      id: 2,
      vcCodigoInterno: 'QUE_001',
      vcCodigoExterno: 'QUE',
      vcEtnia_Description: 'Quechua',
      vcEtnia_Code: 'QUE',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-01 10:15:00',
      dtAudit_UpdatedAt: '2025-01-03 09:20:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_etnia'
    },
    {
      id: 3,
      vcCodigoInterno: 'AYM_001',
      vcCodigoExterno: 'AYM',
      vcEtnia_Description: 'Aymara',
      vcEtnia_Code: 'AYM',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-02 14:30:00',
      dtAudit_UpdatedAt: '2025-01-02 14:30:00',
      vcAudit_User: 'supervisor',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_etnia'
    },
    {
      id: 4,
      vcCodigoInterno: 'ASH_001',
      vcCodigoExterno: 'ASH',
      vcEtnia_Description: 'Asháninka',
      vcEtnia_Code: 'ASH',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-03 11:45:00',
      dtAudit_UpdatedAt: '2025-01-07 16:20:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_etnia'
    },
    {
      id: 5,
      vcCodigoInterno: 'AWA_001',
      vcCodigoExterno: 'AWA',
      vcEtnia_Description: 'Awajún',
      vcEtnia_Code: 'AWA',
      biIsDeleted: true,
      dtAudit_CreatedAt: '2025-01-04 09:30:00',
      dtAudit_UpdatedAt: '2025-01-08 11:15:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_update_etnia'
    }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'bulk-edit'>('create');
  const [selectedEntity, setSelectedEntity] = useState<Etnia | null>(null);
  const [selectedEntities, setSelectedEntities] = useState<Etnia[]>([]);
  const [formData, setFormData] = useState<Partial<Etnia>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<Etnia | null>(null);
  const [entitiesToDelete, setEntitiesToDelete] = useState<Etnia[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const columns: CrudColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'vcCodigoInterno', label: 'Código Interno', sortable: true },
    { key: 'vcCodigoExterno', label: 'Código Externo', sortable: true },
    { key: 'vcEtnia_Code', label: 'Código', sortable: true },
    { key: 'vcEtnia_Description', label: 'Descripción', sortable: true },
    { key: 'biIsDeleted', label: 'Estado', sortable: true },
    { key: 'dtAudit_UpdatedAt', label: 'Última Actualización', sortable: true, render: (value: string) => new Date(value).toLocaleString('es-PE') }
  ];

  const formFields: FormField[] = [
    { name: 'vcCodigoInterno', label: 'Código Interno', type: 'text', required: true, maxLength: 50, placeholder: 'Ej: MES_001', helpText: 'Código único interno del sistema' },
    { name: 'vcCodigoExterno', label: 'Código Externo', type: 'text', required: true, maxLength: 50, placeholder: 'Ej: MES', helpText: 'Código de identificación externa' },
    { name: 'vcEtnia_Code', label: 'Código', type: 'text', required: true, maxLength: 10, placeholder: 'Ej: MES, QUE, AYM', helpText: 'Código único de la etnia (máximo 10 caracteres)' },
    { name: 'vcEtnia_Description', label: 'Descripción', type: 'text', required: true, maxLength: 100, placeholder: 'Ingrese el nombre de la etnia', helpText: 'Nombre completo de la etnia o grupo étnico' },
    { name: 'biIsDeleted', label: 'Estado', type: 'switch', helpText: 'Activo: La etnia está habilitada en el sistema' }
  ];

  const bulkEditFields: FormField[] = [
    { name: 'biIsDeleted', label: 'Estado', type: 'switch', helpText: 'Cambiar estado de todos los elementos seleccionados' }
  ];

  const handleNew = () => {
    setFormMode('create');
    setSelectedEntity(null);
    setFormData({ vcCodigoInterno: '', vcCodigoExterno: '', vcEtnia_Code: '', vcEtnia_Description: '', biIsDeleted: false });
    setIsFormOpen(true);
  };

  const handleEdit = (entity: Etnia) => {
    setFormMode('edit');
    setSelectedEntity(entity);
    setFormData(entity);
    setIsFormOpen(true);
  };

  const handleView = (entity: Etnia) => {
    setFormMode('view');
    setSelectedEntity(entity);
    setFormData(entity);
    setIsFormOpen(true);
  };

  const handleDelete = (entity: Etnia) => {
    setEntityToDelete(entity);
    setIsDeleteDialogOpen(true);
  };

  const handleBulkEdit = (selectedItems: Etnia[]) => {
    setFormMode('bulk-edit');
    setSelectedEntities(selectedItems);
    setFormData({ biIsDeleted: false });
    setIsFormOpen(true);
  };

  const handleBulkDelete = (selectedItems: Etnia[]) => {
    setEntitiesToDelete(selectedItems);
    setIsBulkDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      await simulateApiCall();

      if (formMode === 'create') {
        const requiredFields = ['vcCodigoInterno', 'vcCodigoExterno', 'vcEtnia_Code', 'vcEtnia_Description'];
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

        const newEntity = createNewEntity<Etnia>({
          vcCodigoInterno: formData.vcCodigoInterno!,
          vcCodigoExterno: formData.vcCodigoExterno!,
          vcEtnia_Code: formData.vcEtnia_Code!.toUpperCase(),
          vcEtnia_Description: formData.vcEtnia_Description!,
          biIsDeleted: formData.biIsDeleted || false
        }, 'sp_insert_etnia', Math.max(...entities.map(e => e.id)), currentUser);
        
        setEntities([...entities, newEntity]);
        toast.success('Etnia creada exitosamente');

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
          vcEtnia_Code: formData.vcEtnia_Code?.toUpperCase()
        }, 'sp_update_etnia', currentUser);
        
        setEntities(entities.map(e => e.id === selectedEntity.id ? updatedEntity : e));
        toast.success('Etnia actualizada exitosamente');

      } else if (formMode === 'bulk-edit' && selectedEntities.length > 0) {
        const updatedEntities = entities.map(entity => {
          if (selectedEntities.some(selected => selected.id === entity.id)) {
            return updateEntityAudit(entity, { biIsDeleted: formData.biIsDeleted ?? entity.biIsDeleted }, 'sp_bulk_update_etnia', currentUser);
          }
          return entity;
        });
        
        setEntities(updatedEntities);
        toast.success(`${selectedEntities.length} etnias actualizadas exitosamente`);
      }

      setIsFormOpen(false);
    } catch (error) {
      toast.error('Error al guardar la etnia');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!entityToDelete) return;
    setIsLoading(true);
    
    try {
      await simulateApiCall();
      const updatedEntity = softDeleteEntity(entityToDelete, 'sp_delete_etnia', currentUser);
      setEntities(entities.map(e => e.id === entityToDelete.id ? updatedEntity : e));
      toast.success('Etnia eliminada exitosamente');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Error al eliminar la etnia');
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
          return softDeleteEntity(entity, 'sp_bulk_delete_etnia', currentUser);
        }
        return entity;
      });

      setEntities(updatedEntities);
      toast.success(`${entitiesToDelete.length} etnias eliminadas exitosamente`);
      setIsBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Error al eliminar las etnias');
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
      case 'create': return 'Nueva Etnia';
      case 'edit': return 'Editar Etnia';
      case 'view': return 'Ver Etnia';
      case 'bulk-edit': return `Editar ${selectedEntities.length} Etnias`;
      default: return 'Etnia';
    }
  };

  const getCurrentFormFields = () => {
    return formMode === 'bulk-edit' ? bulkEditFields : formFields;
  };

  return (
    <>
      <CrudTable
        title="Etnias"
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
              Esta acción marcará la etnia "{entityToDelete?.vcEtnia_Description}" como inactiva. 
              Podrá reactivarla posteriormente editando el registro.
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
              Esta acción marcará {entitiesToDelete.length} etnias como inactivas:
              <div className="mt-2 max-h-32 overflow-y-auto">
                <ul className="list-disc list-inside text-sm">
                  {entitiesToDelete.map(entity => (
                    <li key={entity.id}>{entity.vcEtnia_Code} - {entity.vcEtnia_Description}</li>
                  ))}
                </ul>
              </div>
              Podrá reactivarlas posteriormente editando los registros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} disabled={isLoading}>
              {isLoading ? 'Eliminando...' : `Eliminar ${entitiesToDelete.length} etnias`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}