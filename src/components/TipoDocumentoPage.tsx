import React, { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { CrudTable, CrudColumn } from './CrudTable';
import { CrudForm, FormField } from './CrudForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { BaseMasterEntity, UserSession } from './shared/types';
import { createNewEntity, updateEntityAudit, softDeleteEntity, validateRequiredFields, validateCodes, checkUniqueCodes, simulateApiCall, createAuditData } from './shared/crudHelpers';

interface TipoDocumento extends BaseMasterEntity {
  vcTipoDoc_Description: string;
  vcTipoDoc_Code: string;
}

interface TipoDocumentoPageProps {
  currentUser?: UserSession;
}

export function TipoDocumentoPage({ currentUser }: TipoDocumentoPageProps) {
  const [entities, setEntities] = useState<TipoDocumento[]>([
    {
      id: 1,
      vcCodigoInterno: 'DNI_001',
      vcCodigoExterno: 'DNI',
      vcTipoDoc_Description: 'Documento Nacional de Identidad',
      vcTipoDoc_Code: 'DNI',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-01 10:00:00',
      dtAudit_UpdatedAt: '2025-01-05 15:30:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_tipo_documento'
    },
    {
      id: 2,
      vcCodigoInterno: 'CE_001',
      vcCodigoExterno: 'CE',
      vcTipoDoc_Description: 'Carné de Extranjería',
      vcTipoDoc_Code: 'CE',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-01 10:15:00',
      dtAudit_UpdatedAt: '2025-01-03 09:20:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_tipo_documento'
    },
    {
      id: 3,
      vcCodigoInterno: 'PAS_001',
      vcCodigoExterno: 'PAS',
      vcTipoDoc_Description: 'Pasaporte',
      vcTipoDoc_Code: 'PAS',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-02 14:30:00',
      dtAudit_UpdatedAt: '2025-01-02 14:30:00',
      vcAudit_User: 'supervisor',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_tipo_documento'
    },
    {
      id: 4,
      vcCodigoInterno: 'RUC_001',
      vcCodigoExterno: 'RUC',
      vcTipoDoc_Description: 'Registro Único de Contribuyentes',
      vcTipoDoc_Code: 'RUC',
      biIsDeleted: true,
      dtAudit_CreatedAt: '2025-01-03 11:45:00',
      dtAudit_UpdatedAt: '2025-01-07 16:20:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_update_tipo_documento'
    }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'bulk-edit'>('create');
  const [selectedEntity, setSelectedEntity] = useState<TipoDocumento | null>(null);
  const [selectedEntities, setSelectedEntities] = useState<TipoDocumento[]>([]);
  const [formData, setFormData] = useState<Partial<TipoDocumento>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<TipoDocumento | null>(null);
  const [entitiesToDelete, setEntitiesToDelete] = useState<TipoDocumento[]>([]);
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
      key: 'vcTipoDoc_Code',
      label: 'Código',
      sortable: true
    },
    {
      key: 'vcTipoDoc_Description',
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
      placeholder: 'Ej: DNI_001',
      helpText: 'Código único interno del sistema'
    },
    {
      name: 'vcCodigoExterno',
      label: 'Código Externo',
      type: 'text',
      required: true,
      maxLength: 50,
      placeholder: 'Ej: DNI',
      helpText: 'Código de identificación externa'
    },
    {
      name: 'vcTipoDoc_Code',
      label: 'Código',
      type: 'text',
      required: true,
      maxLength: 10,
      placeholder: 'Ej: DNI, CE, PAS',
      helpText: 'Código único del tipo de documento (máximo 10 caracteres)'
    },
    {
      name: 'vcTipoDoc_Description',
      label: 'Descripción',
      type: 'text',
      required: true,
      maxLength: 100,
      placeholder: 'Ingrese la descripción del tipo de documento',
      helpText: 'Descripción completa del tipo de documento'
    },
    {
      name: 'biIsDeleted',
      label: 'Estado',
      type: 'switch',
      helpText: 'Activo: El tipo de documento está habilitado en el sistema'
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
      vcTipoDoc_Code: '',
      vcTipoDoc_Description: '',
      biIsDeleted: false
    });
    setIsFormOpen(true);
  };

  const handleEdit = (entity: TipoDocumento) => {
    setFormMode('edit');
    setSelectedEntity(entity);
    setFormData(entity);
    setIsFormOpen(true);
  };

  const handleView = (entity: TipoDocumento) => {
    setFormMode('view');
    setSelectedEntity(entity);
    setFormData(entity);
    setIsFormOpen(true);
  };

  const handleDelete = (entity: TipoDocumento) => {
    setEntityToDelete(entity);
    setIsDeleteDialogOpen(true);
  };

  const handleBulkEdit = (selectedItems: TipoDocumento[]) => {
    setFormMode('bulk-edit');
    setSelectedEntities(selectedItems);
    setFormData({
      biIsDeleted: false
    });
    setIsFormOpen(true);
  };

  const handleBulkDelete = (selectedItems: TipoDocumento[]) => {
    setEntitiesToDelete(selectedItems);
    setIsBulkDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      await simulateApiCall();

      if (formMode === 'create') {
        // Validaciones específicas
        const requiredFields = ['vcCodigoInterno', 'vcCodigoExterno', 'vcTipoDoc_Code', 'vcTipoDoc_Description'];
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

        const newEntity = createNewEntity<TipoDocumento>(
          {
            vcCodigoInterno: formData.vcCodigoInterno!,
            vcCodigoExterno: formData.vcCodigoExterno!,
            vcTipoDoc_Code: formData.vcTipoDoc_Code!.toUpperCase(),
            vcTipoDoc_Description: formData.vcTipoDoc_Description!,
            biIsDeleted: formData.biIsDeleted || false
          },
          'sp_insert_tipo_documento',
          Math.max(...entities.map(e => e.id)),
          currentUser
        );
        
        setEntities([...entities, newEntity]);
        toast.success('Tipo de documento creado exitosamente');

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
          vcTipoDoc_Code: formData.vcTipoDoc_Code?.toUpperCase()
        }, 'sp_update_tipo_documento', currentUser);
        
        setEntities(entities.map(e => e.id === selectedEntity.id ? updatedEntity : e));
        toast.success('Tipo de documento actualizado exitosamente');

      } else if (formMode === 'bulk-edit' && selectedEntities.length > 0) {
        const updatedEntities = entities.map(entity => {
          if (selectedEntities.some(selected => selected.id === entity.id)) {
            return updateEntityAudit(entity, {
              biIsDeleted: formData.biIsDeleted ?? entity.biIsDeleted
            }, 'sp_bulk_update_tipo_documento', currentUser);
          }
          return entity;
        });
        
        setEntities(updatedEntities);
        toast.success(`${selectedEntities.length} tipos de documento actualizados exitosamente`);
      }

      setIsFormOpen(false);
    } catch (error) {
      toast.error('Error al guardar el tipo de documento');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!entityToDelete) return;

    setIsLoading(true);
    
    try {
      await simulateApiCall();

      const updatedEntity = softDeleteEntity(entityToDelete, 'sp_delete_tipo_documento', currentUser);
      setEntities(entities.map(e => e.id === entityToDelete.id ? updatedEntity : e));
      toast.success('Tipo de documento eliminado exitosamente');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Error al eliminar el tipo de documento');
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
          return softDeleteEntity(entity, 'sp_bulk_delete_tipo_documento', currentUser);
        }
        return entity;
      });

      setEntities(updatedEntities);
      toast.success(`${entitiesToDelete.length} tipos de documento eliminados exitosamente`);
      setIsBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Error al eliminar los tipos de documento');
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
      case 'create': return 'Nuevo Tipo de Documento';
      case 'edit': return 'Editar Tipo de Documento';
      case 'view': return 'Ver Tipo de Documento';
      case 'bulk-edit': return `Editar ${selectedEntities.length} Tipos de Documento`;
      default: return 'Tipo de Documento';
    }
  };

  const getCurrentFormFields = () => {
    return formMode === 'bulk-edit' ? bulkEditFields : formFields;
  };

  return (
    <>
      <CrudTable
        title="Tipos de Documento"
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
              Esta acción marcará el tipo de documento "{entityToDelete?.vcTipoDoc_Description}" como inactivo. 
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

      {/* Bulk Delete Dialog */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará {entitiesToDelete.length} tipos de documento como inactivos:
              <div className="mt-2 max-h-32 overflow-y-auto">
                <ul className="list-disc list-inside text-sm">
                  {entitiesToDelete.map(entity => (
                    <li key={entity.id}>{entity.vcTipoDoc_Code} - {entity.vcTipoDoc_Description}</li>
                  ))}
                </ul>
              </div>
              Podrá reactivarlos posteriormente editando los registros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} disabled={isLoading}>
              {isLoading ? 'Eliminando...' : `Eliminar ${entitiesToDelete.length} tipos de documento`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}