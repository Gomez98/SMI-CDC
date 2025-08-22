import React, { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { CrudTable, CrudColumn } from './CrudTable';
import { CrudForm, FormField } from './CrudForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { BaseMasterEntity, UserSession } from './shared/types';
import { createNewEntity, updateEntityAudit, softDeleteEntity, validateRequiredFields, validateCodes, checkUniqueCodes, simulateApiCall, createAuditData } from './shared/crudHelpers';

interface Procedencia extends BaseMasterEntity {
  vcProcedencia_Description: string;
  vcProcedencia_Code: string;
}

interface ProcedenciaPageProps {
  currentUser?: UserSession;
}

export function ProcedenciaPage({ currentUser }: ProcedenciaPageProps) {
  const [entities, setEntities] = useState<Procedencia[]>([
    {
      id: 1,
      vcCodigoInterno: 'CE_001',
      vcCodigoExterno: 'CE',
      vcProcedencia_Description: 'Consulta Externa',
      vcProcedencia_Code: 'CE',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-01 10:00:00',
      dtAudit_UpdatedAt: '2025-01-05 15:30:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_procedencia'
    },
    {
      id: 2,
      vcCodigoInterno: 'EM_001',
      vcCodigoExterno: 'EM',
      vcProcedencia_Description: 'Emergencia',
      vcProcedencia_Code: 'EM',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-01 10:15:00',
      dtAudit_UpdatedAt: '2025-01-03 09:20:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_procedencia'
    },
    {
      id: 3,
      vcCodigoInterno: 'HOS_001',
      vcCodigoExterno: 'HOS',
      vcProcedencia_Description: 'Hospitalización',
      vcProcedencia_Code: 'HOS',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-02 14:30:00',
      dtAudit_UpdatedAt: '2025-01-02 14:30:00',
      vcAudit_User: 'supervisor',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_procedencia'
    },
    {
      id: 4,
      vcCodigoInterno: 'REF_001',
      vcCodigoExterno: 'REF',
      vcProcedencia_Description: 'Referido',
      vcProcedencia_Code: 'REF',
      biIsDeleted: true,
      dtAudit_CreatedAt: '2025-01-03 11:45:00',
      dtAudit_UpdatedAt: '2025-01-07 16:20:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_update_procedencia'
    }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'bulk-edit'>('create');
  const [selectedEntity, setSelectedEntity] = useState<Procedencia | null>(null);
  const [selectedEntities, setSelectedEntities] = useState<Procedencia[]>([]);
  const [formData, setFormData] = useState<Partial<Procedencia>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<Procedencia | null>(null);
  const [entitiesToDelete, setEntitiesToDelete] = useState<Procedencia[]>([]);
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
      key: 'vcProcedencia_Code',
      label: 'Código',
      sortable: true
    },
    {
      key: 'vcProcedencia_Description',
      label: 'Descripción',
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
      placeholder: 'Ej: CE_001',
      helpText: 'Código único interno del sistema'
    },
    {
      name: 'vcCodigoExterno',
      label: 'Código Externo',
      type: 'text',
      required: true,
      maxLength: 50,
      placeholder: 'Ej: CE',
      helpText: 'Código de identificación externa'
    },
    {
      name: 'vcProcedencia_Code',
      label: 'Código',
      type: 'text',
      required: true,
      maxLength: 10,
      placeholder: 'Ej: CE, EM, HOS',
      helpText: 'Código único de la procedencia (máximo 10 caracteres)'
    },
    {
      name: 'vcProcedencia_Description',
      label: 'Descripción',
      type: 'text',
      required: true,
      maxLength: 150,
      placeholder: 'Ingrese la descripción de la procedencia',
      helpText: 'Descripción completa de la procedencia del paciente'
    },
    {
      name: 'biIsDeleted',
      label: 'Estado',
      type: 'switch',
      helpText: 'Activo: La procedencia está habilitada en el sistema'
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
      vcProcedencia_Code: '',
      vcProcedencia_Description: '',
      biIsDeleted: false
    });
    setIsFormOpen(true);
  };

  const handleEdit = (entity: Procedencia) => {
    setFormMode('edit');
    setSelectedEntity(entity);
    setFormData(entity);
    setIsFormOpen(true);
  };

  const handleView = (entity: Procedencia) => {
    setFormMode('view');
    setSelectedEntity(entity);
    setFormData(entity);
    setIsFormOpen(true);
  };

  const handleDelete = (entity: Procedencia) => {
    setEntityToDelete(entity);
    setIsDeleteDialogOpen(true);
  };

  const handleBulkEdit = (selectedItems: Procedencia[]) => {
    setFormMode('bulk-edit');
    setSelectedEntities(selectedItems);
    setFormData({
      biIsDeleted: false
    });
    setIsFormOpen(true);
  };

  const handleBulkDelete = (selectedItems: Procedencia[]) => {
    setEntitiesToDelete(selectedItems);
    setIsBulkDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      await simulateApiCall();

      if (formMode === 'create') {
        // Validaciones específicas
        const requiredFields = ['vcCodigoInterno', 'vcCodigoExterno', 'vcProcedencia_Code', 'vcProcedencia_Description'];
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

        const newEntity = createNewEntity<Procedencia>(
          {
            vcCodigoInterno: formData.vcCodigoInterno!,
            vcCodigoExterno: formData.vcCodigoExterno!,
            vcProcedencia_Code: formData.vcProcedencia_Code!.toUpperCase(),
            vcProcedencia_Description: formData.vcProcedencia_Description!,
            biIsDeleted: formData.biIsDeleted || false
          },
          'sp_insert_procedencia',
          Math.max(...entities.map(e => e.id)),
          currentUser
        );
        
        setEntities([...entities, newEntity]);
        toast.success('Procedencia creada exitosamente');

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

        const updatedEntity = updateEntityAudit(selectedEntity, {
          ...formData,
          vcProcedencia_Code: formData.vcProcedencia_Code?.toUpperCase()
        }, 'sp_update_procedencia', currentUser);
        
        setEntities(entities.map(e => e.id === selectedEntity.id ? updatedEntity : e));
        toast.success('Procedencia actualizada exitosamente');

      } else if (formMode === 'bulk-edit' && selectedEntities.length > 0) {
        const updatedEntities = entities.map(entity => {
          if (selectedEntities.some(selected => selected.id === entity.id)) {
            return updateEntityAudit(entity, {
              biIsDeleted: formData.biIsDeleted ?? entity.biIsDeleted
            }, 'sp_bulk_update_procedencia', currentUser);
          }
          return entity;
        });
        
        setEntities(updatedEntities);
        toast.success(`${selectedEntities.length} procedencias actualizadas exitosamente`);
      }

      setIsFormOpen(false);
    } catch (error) {
      toast.error('Error al guardar la procedencia');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!entityToDelete) return;

    setIsLoading(true);
    
    try {
      await simulateApiCall();

      const updatedEntity = softDeleteEntity(entityToDelete, 'sp_delete_procedencia', currentUser);
      setEntities(entities.map(e => e.id === entityToDelete.id ? updatedEntity : e));
      toast.success('Procedencia eliminada exitosamente');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Error al eliminar la procedencia');
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
          return softDeleteEntity(entity, 'sp_bulk_delete_procedencia', currentUser);
        }
        return entity;
      });

      setEntities(updatedEntities);
      toast.success(`${entitiesToDelete.length} procedencias eliminadas exitosamente`);
      setIsBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Error al eliminar las procedencias');
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

  const getAuditData = () => selectedEntity ? createAuditData(selectedEntity) : undefined;

  const getFormTitle = () => {
    switch (formMode) {
      case 'create': return 'Nueva Procedencia';
      case 'edit': return 'Editar Procedencia';
      case 'view': return 'Ver Procedencia';
      case 'bulk-edit': return `Editar ${selectedEntities.length} Procedencias`;
      default: return 'Procedencia';
    }
  };

  const getCurrentFormFields = () => {
    return formMode === 'bulk-edit' ? bulkEditFields : formFields;
  };

  return (
    <>
      <CrudTable
        title="Procedencias"
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

      {/* Single Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará la procedencia "{entityToDelete?.vcProcedencia_Description}" como inactiva. 
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
              Esta acción marcará {entitiesToDelete.length} procedencias como inactivas:
              <div className="mt-2 max-h-32 overflow-y-auto">
                <ul className="list-disc list-inside text-sm">
                  {entitiesToDelete.map(entity => (
                    <li key={entity.id}>{entity.vcProcedencia_Code} - {entity.vcProcedencia_Description}</li>
                  ))}
                </ul>
              </div>
              Podrá reactivarlas posteriormente editando los registros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} disabled={isLoading}>
              {isLoading ? 'Eliminando...' : `Eliminar ${entitiesToDelete.length} procedencias`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}