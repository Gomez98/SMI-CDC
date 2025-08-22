import React, { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { CrudTable, CrudColumn } from './CrudTable';
import { CrudForm, FormField } from './CrudForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { BaseMasterEntity, UserSession } from './shared/types';
import { createNewEntity, updateEntityAudit, softDeleteEntity, validateRequiredFields, validateCodes, checkUniqueCodes, simulateApiCall } from './shared/crudHelpers';

interface Entidad extends BaseMasterEntity {
  vcEntity_Description: string;
}

interface EntidadesPageProps {
  currentUser?: UserSession;
}

export function EntidadesPage({ currentUser }: EntidadesPageProps) {
  const [entities, setEntities] = useState<Entidad[]>([
    {
      id: 1,
      vcCodigoInterno: 'MINSA_001',
      vcCodigoExterno: 'MINSA',
      vcEntity_Description: 'Ministerio de Salud (MINSA)',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-01 10:00:00',
      dtAudit_UpdatedAt: '2025-01-05 15:30:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_entity'
    },
    {
      id: 2,
      vcCodigoInterno: 'ESSALUD_001',
      vcCodigoExterno: 'ESSALUD',
      vcEntity_Description: 'Seguro Social de Salud (ESSALUD)',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-01 10:15:00',
      dtAudit_UpdatedAt: '2025-01-03 09:20:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_entity'
    },
    {
      id: 3,
      vcCodigoInterno: 'DIRIS_LE_001',
      vcCodigoExterno: 'DIRIS-LE',
      vcEntity_Description: 'Dirección de Redes Integradas de Salud Lima Este',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-02 14:30:00',
      dtAudit_UpdatedAt: '2025-01-02 14:30:00',
      vcAudit_User: 'supervisor',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_entity'
    },
    {
      id: 4,
      vcCodigoInterno: 'INS_001',
      vcCodigoExterno: 'INS',
      vcEntity_Description: 'Instituto Nacional de Salud (INS)',
      biIsDeleted: true,
      dtAudit_CreatedAt: '2025-01-03 11:45:00',
      dtAudit_UpdatedAt: '2025-01-07 16:20:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_update_entity'
    }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'bulk-edit'>('create');
  const [selectedEntity, setSelectedEntity] = useState<Entidad | null>(null);
  const [selectedEntities, setSelectedEntities] = useState<Entidad[]>([]);
  const [formData, setFormData] = useState<Partial<Entidad>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<Entidad | null>(null);
  const [entitiesToDelete, setEntitiesToDelete] = useState<Entidad[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const columns: CrudColumn[] = [
    {
      key: 'id',
      label: 'ID',
      sortable: true
    },
    {
      key: 'vcCodigoInterno',
      label: 'Código Interno',
      sortable: true
    },
    {
      key: 'vcCodigoExterno',
      label: 'Código Externo',
      sortable: true
    },
    {
      key: 'vcEntity_Description',
      label: 'Descripción de Entidad',
      sortable: true
    },
    {
      key: 'biIsDeleted',
      label: 'Estado',
      sortable: true
    },
    {
      key: 'dtAudit_UpdatedAt',
      label: 'Última Actualización',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleString('es-PE')
    }
  ];

  const formFields: FormField[] = [
    {
      name: 'vcCodigoInterno',
      label: 'Código Interno',
      type: 'text',
      required: true,
      maxLength: 50,
      placeholder: 'Ej: MINSA_001',
      helpText: 'Código único interno del sistema'
    },
    {
      name: 'vcCodigoExterno',
      label: 'Código Externo',
      type: 'text',
      required: true,
      maxLength: 50,
      placeholder: 'Ej: MINSA',
      helpText: 'Código de identificación externa'
    },
    {
      name: 'vcEntity_Description',
      label: 'Descripción de Entidad',
      type: 'text',
      required: true,
      maxLength: 200,
      placeholder: 'Ingrese la descripción de la entidad',
      helpText: 'Nombre completo de la entidad de salud'
    },
    {
      name: 'biIsDeleted',
      label: 'Estado',
      type: 'switch',
      helpText: 'Activo: La entidad está habilitada en el sistema'
    }
  ];

  const bulkEditFields: FormField[] = [
    {
      name: 'biIsDeleted',
      label: 'Estado',
      type: 'switch',
      helpText: 'Cambiar estado de todos los elementos seleccionados'
    }
  ];

  const handleNew = () => {
    setFormMode('create');
    setSelectedEntity(null);
    setFormData({
      vcCodigoInterno: '',
      vcCodigoExterno: '',
      vcEntity_Description: '',
      biIsDeleted: false
    });
    setIsFormOpen(true);
  };

  const handleEdit = (entity: Entidad) => {
    setFormMode('edit');
    setSelectedEntity(entity);
    setFormData(entity);
    setIsFormOpen(true);
  };

  const handleView = (entity: Entidad) => {
    setFormMode('view');
    setSelectedEntity(entity);
    setFormData(entity);
    setIsFormOpen(true);
  };

  const handleDelete = (entity: Entidad) => {
    setEntityToDelete(entity);
    setIsDeleteDialogOpen(true);
  };

  const handleBulkEdit = (selectedItems: Entidad[]) => {
    setFormMode('bulk-edit');
    setSelectedEntities(selectedItems);
    setFormData({
      biIsDeleted: false
    });
    setIsFormOpen(true);
  };

  const handleBulkDelete = (selectedItems: Entidad[]) => {
    setEntitiesToDelete(selectedItems);
    setIsBulkDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      await simulateApiCall();

      if (formMode === 'create') {
        // Validaciones específicas
        const requiredFields = ['vcCodigoInterno', 'vcCodigoExterno', 'vcEntity_Description'];
        if (!validateRequiredFields(formData, requiredFields)) {
          setIsLoading(false);
          return;
        }

        if (!validateCodes(formData.vcCodigoInterno!, formData.vcCodigoExterno!)) {
          setIsLoading(false);
          return;
        }

        // Verificar códigos únicos
        const codeValidation = checkUniqueCodes(entities, formData.vcCodigoInterno!, formData.vcCodigoExterno!);
        if (!codeValidation.isValid) {
          toast.error(codeValidation.message!);
          setIsLoading(false);
          return;
        }

        const newEntity = createNewEntity<Entidad>(
          {
            vcCodigoInterno: formData.vcCodigoInterno!,
            vcCodigoExterno: formData.vcCodigoExterno!,
            vcEntity_Description: formData.vcEntity_Description!,
            biIsDeleted: formData.biIsDeleted || false
          },
          'sp_insert_entity',
          Math.max(...entities.map(e => e.id)),
          currentUser
        );
        
        setEntities([...entities, newEntity]);
        toast.success('Entidad creada exitosamente');

      } else if (formMode === 'edit' && selectedEntity) {
        // Validar códigos únicos para edición
        if (formData.vcCodigoInterno && formData.vcCodigoExterno) {
          const codeValidation = checkUniqueCodes(entities, formData.vcCodigoInterno, formData.vcCodigoExterno, selectedEntity.id);
          if (!codeValidation.isValid) {
            toast.error(codeValidation.message!);
            setIsLoading(false);
            return;
          }
        }

        const updatedEntity = updateEntityAudit(selectedEntity, formData, 'sp_update_entity', currentUser);
        setEntities(entities.map(e => e.id === selectedEntity.id ? updatedEntity : e));
        toast.success('Entidad actualizada exitosamente');

      } else if (formMode === 'bulk-edit' && selectedEntities.length > 0) {
        const updatedEntities = entities.map(entity => {
          if (selectedEntities.some(selected => selected.id === entity.id)) {
            return updateEntityAudit(entity, { biIsDeleted: formData.biIsDeleted ?? entity.biIsDeleted }, 'sp_bulk_update_entity', currentUser);
          }
          return entity;
        });
        
        setEntities(updatedEntities);
        toast.success(`${selectedEntities.length} entidades actualizadas exitosamente`);
      }

      setIsFormOpen(false);
    } catch (error) {
      toast.error('Error al guardar la entidad');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!entityToDelete) return;

    setIsLoading(true);
    
    try {
      await simulateApiCall();

      const updatedEntity = softDeleteEntity(entityToDelete, 'sp_delete_entity', currentUser);
      setEntities(entities.map(e => e.id === entityToDelete.id ? updatedEntity : e));
      toast.success('Entidad eliminada exitosamente');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Error al eliminar la entidad');
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
          return softDeleteEntity(entity, 'sp_bulk_delete_entity', currentUser);
        }
        return entity;
      });

      setEntities(updatedEntities);
      toast.success(`${entitiesToDelete.length} entidades eliminadas exitosamente`);
      setIsBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Error al eliminar las entidades');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getAuditData = () => {
    if (!selectedEntity) return undefined;
    
    return {
      createdAt: new Date(selectedEntity.dtAudit_CreatedAt).toLocaleString('es-PE'),
      updatedAt: new Date(selectedEntity.dtAudit_UpdatedAt).toLocaleString('es-PE'),
      user: selectedEntity.vcAudit_User,
      system: selectedEntity.vcAudit_System,
      module: selectedEntity.vcAudit_Module,
      procedure: selectedEntity.vcAudit_SP
    };
  };

  const getFormTitle = () => {
    switch (formMode) {
      case 'create': return 'Nueva Entidad';
      case 'edit': return 'Editar Entidad';
      case 'view': return 'Ver Entidad';
      case 'bulk-edit': return `Editar ${selectedEntities.length} Entidades`;
      default: return 'Entidad';
    }
  };

  const getCurrentFormFields = () => {
    return formMode === 'bulk-edit' ? bulkEditFields : formFields;
  };

  return (
    <>
      <CrudTable
        title="Entidades"
        data={entities}
        columns={columns}
        onNew={handleNew}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkEdit={handleBulkEdit}
        onBulkDelete={handleBulkDelete}
        searchPlaceholder="Buscar por descripción, código interno o externo..."
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

      {/* Single Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará la entidad "{entityToDelete?.vcEntity_Description}" como inactiva. 
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

      {/* Bulk Delete Dialog */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará {entitiesToDelete.length} entidades como inactivas:
              <div className="mt-2 max-h-32 overflow-y-auto">
                <ul className="list-disc list-inside text-sm">
                  {entitiesToDelete.map(entity => (
                    <li key={entity.id}>{entity.vcEntity_Description}</li>
                  ))}
                </ul>
              </div>
              Podrá reactivarlas posteriormente editando los registros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} disabled={isLoading}>
              {isLoading ? 'Eliminando...' : `Eliminar ${entitiesToDelete.length} entidades`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}