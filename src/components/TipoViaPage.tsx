import React, { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { CrudTable, CrudColumn } from './CrudTable';
import { CrudForm, FormField } from './CrudForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { BaseMasterEntity, UserSession } from './shared/types';
import { createNewEntity, updateEntityAudit, softDeleteEntity, validateRequiredFields, validateCodes, checkUniqueCodes, simulateApiCall, createAuditData } from './shared/crudHelpers';

interface TipoVia extends BaseMasterEntity {
  vcTipoVia_Description: string;
  vcTipoVia_Code: string;
  vcTipoVia_Abbreviation: string;
}

interface TipoViaPageProps {
  currentUser?: UserSession;
}

export function TipoViaPage({ currentUser }: TipoViaPageProps) {
  const [entities, setEntities] = useState<TipoVia[]>([
    {
      id: 1,
      vcCodigoInterno: 'CALLE_001',
      vcCodigoExterno: 'CA',
      vcTipoVia_Description: 'Calle',
      vcTipoVia_Code: 'CA',
      vcTipoVia_Abbreviation: 'CA.',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-01 10:00:00',
      dtAudit_UpdatedAt: '2025-01-05 15:30:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_tipo_via'
    },
    {
      id: 2,
      vcCodigoInterno: 'AVENIDA_001',
      vcCodigoExterno: 'AV',
      vcTipoVia_Description: 'Avenida',
      vcTipoVia_Code: 'AV',
      vcTipoVia_Abbreviation: 'AV.',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-01 10:15:00',
      dtAudit_UpdatedAt: '2025-01-03 09:20:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_tipo_via'
    },
    {
      id: 3,
      vcCodigoInterno: 'JIRON_001',
      vcCodigoExterno: 'JR',
      vcTipoVia_Description: 'Jirón',
      vcTipoVia_Code: 'JR',
      vcTipoVia_Abbreviation: 'JR.',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-02 14:30:00',
      dtAudit_UpdatedAt: '2025-01-02 14:30:00',
      vcAudit_User: 'supervisor',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_tipo_via'
    }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'bulk-edit'>('create');
  const [selectedEntity, setSelectedEntity] = useState<TipoVia | null>(null);
  const [selectedEntities, setSelectedEntities] = useState<TipoVia[]>([]);
  const [formData, setFormData] = useState<Partial<TipoVia>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<TipoVia | null>(null);
  const [entitiesToDelete, setEntitiesToDelete] = useState<TipoVia[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const columns: CrudColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'vcCodigoInterno', label: 'Código Interno', sortable: true },
    { key: 'vcCodigoExterno', label: 'Código Externo', sortable: true },
    { key: 'vcTipoVia_Code', label: 'Código', sortable: true },
    { key: 'vcTipoVia_Description', label: 'Descripción', sortable: true },
    { key: 'vcTipoVia_Abbreviation', label: 'Abreviación', sortable: true },
    { key: 'biIsDeleted', label: 'Estado', sortable: true },
    { key: 'dtAudit_UpdatedAt', label: 'Última Actualización', sortable: true, render: (value: string) => new Date(value).toLocaleString('es-PE') }
  ];

  const formFields: FormField[] = [
    { name: 'vcCodigoInterno', label: 'Código Interno', type: 'text', required: true, maxLength: 50, placeholder: 'Ej: CALLE_001', helpText: 'Código único interno del sistema' },
    { name: 'vcCodigoExterno', label: 'Código Externo', type: 'text', required: true, maxLength: 50, placeholder: 'Ej: CA', helpText: 'Código de identificación externa' },
    { name: 'vcTipoVia_Code', label: 'Código', type: 'text', required: true, maxLength: 10, placeholder: 'Ej: CA, AV, JR', helpText: 'Código único del tipo de vía' },
    { name: 'vcTipoVia_Description', label: 'Descripción', type: 'text', required: true, maxLength: 100, placeholder: 'Ingrese el nombre del tipo de vía', helpText: 'Nombre completo del tipo de vía' },
    { name: 'vcTipoVia_Abbreviation', label: 'Abreviación', type: 'text', required: true, maxLength: 10, placeholder: 'Ej: CA., AV., JR.', helpText: 'Abreviación oficial del tipo de vía' },
    { name: 'biIsDeleted', label: 'Estado', type: 'switch', helpText: 'Activo: El tipo de vía está habilitado en el sistema' }
  ];

  const bulkEditFields: FormField[] = [
    { name: 'biIsDeleted', label: 'Estado', type: 'switch', helpText: 'Cambiar estado de todos los elementos seleccionados' }
  ];

  const handleNew = () => {
    setFormMode('create');
    setSelectedEntity(null);
    setFormData({ vcCodigoInterno: '', vcCodigoExterno: '', vcTipoVia_Code: '', vcTipoVia_Description: '', vcTipoVia_Abbreviation: '', biIsDeleted: false });
    setIsFormOpen(true);
  };

  const handleEdit = (entity: TipoVia) => {
    setFormMode('edit');
    setSelectedEntity(entity);
    setFormData(entity);
    setIsFormOpen(true);
  };

  const handleView = (entity: TipoVia) => {
    setFormMode('view');
    setSelectedEntity(entity);
    setFormData(entity);
    setIsFormOpen(true);
  };

  const handleDelete = (entity: TipoVia) => {
    setEntityToDelete(entity);
    setIsDeleteDialogOpen(true);
  };

  const handleBulkEdit = (selectedItems: TipoVia[]) => {
    setFormMode('bulk-edit');
    setSelectedEntities(selectedItems);
    setFormData({ biIsDeleted: false });
    setIsFormOpen(true);
  };

  const handleBulkDelete = (selectedItems: TipoVia[]) => {
    setEntitiesToDelete(selectedItems);
    setIsBulkDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      await simulateApiCall();

      if (formMode === 'create') {
        const requiredFields = ['vcCodigoInterno', 'vcCodigoExterno', 'vcTipoVia_Code', 'vcTipoVia_Description', 'vcTipoVia_Abbreviation'];
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

        const newEntity = createNewEntity<TipoVia>({
          vcCodigoInterno: formData.vcCodigoInterno!,
          vcCodigoExterno: formData.vcCodigoExterno!,
          vcTipoVia_Code: formData.vcTipoVia_Code!.toUpperCase(),
          vcTipoVia_Description: formData.vcTipoVia_Description!,
          vcTipoVia_Abbreviation: formData.vcTipoVia_Abbreviation!.toUpperCase(),
          biIsDeleted: formData.biIsDeleted || false
        }, 'sp_insert_tipo_via', Math.max(...entities.map(e => e.id)), currentUser);
        
        setEntities([...entities, newEntity]);
        toast.success('Tipo de vía creado exitosamente');

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
          vcTipoVia_Code: formData.vcTipoVia_Code?.toUpperCase(),
          vcTipoVia_Abbreviation: formData.vcTipoVia_Abbreviation?.toUpperCase()
        }, 'sp_update_tipo_via', currentUser);
        
        setEntities(entities.map(e => e.id === selectedEntity.id ? updatedEntity : e));
        toast.success('Tipo de vía actualizado exitosamente');

      } else if (formMode === 'bulk-edit' && selectedEntities.length > 0) {
        const updatedEntities = entities.map(entity => {
          if (selectedEntities.some(selected => selected.id === entity.id)) {
            return updateEntityAudit(entity, { biIsDeleted: formData.biIsDeleted ?? entity.biIsDeleted }, 'sp_bulk_update_tipo_via', currentUser);
          }
          return entity;
        });
        
        setEntities(updatedEntities);
        toast.success(`${selectedEntities.length} tipos de vía actualizados exitosamente`);
      }

      setIsFormOpen(false);
    } catch (error) {
      toast.error('Error al guardar el tipo de vía');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!entityToDelete) return;
    setIsLoading(true);
    
    try {
      await simulateApiCall();
      const updatedEntity = softDeleteEntity(entityToDelete, 'sp_delete_tipo_via', currentUser);
      setEntities(entities.map(e => e.id === entityToDelete.id ? updatedEntity : e));
      toast.success('Tipo de vía eliminado exitosamente');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Error al eliminar el tipo de vía');
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
          return softDeleteEntity(entity, 'sp_bulk_delete_tipo_via', currentUser);
        }
        return entity;
      });

      setEntities(updatedEntities);
      toast.success(`${entitiesToDelete.length} tipos de vía eliminados exitosamente`);
      setIsBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Error al eliminar los tipos de vía');
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
      case 'create': return 'Nuevo Tipo de Vía';
      case 'edit': return 'Editar Tipo de Vía';
      case 'view': return 'Ver Tipo de Vía';
      case 'bulk-edit': return `Editar ${selectedEntities.length} Tipos de Vía`;
      default: return 'Tipo de Vía';
    }
  };

  const getCurrentFormFields = () => {
    return formMode === 'bulk-edit' ? bulkEditFields : formFields;
  };

  return (
    <>
      <CrudTable
        title="Tipos de Vía"
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
              Esta acción marcará el tipo de vía "{entityToDelete?.vcTipoVia_Description}" como inactivo. 
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
              Esta acción marcará {entitiesToDelete.length} tipos de vía como inactivos:
              <div className="mt-2 max-h-32 overflow-y-auto">
                <ul className="list-disc list-inside text-sm">
                  {entitiesToDelete.map(entity => (
                    <li key={entity.id}>{entity.vcTipoVia_Code} - {entity.vcTipoVia_Description}</li>
                  ))}
                </ul>
              </div>
              Podrá reactivarlos posteriormente editando los registros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} disabled={isLoading}>
              {isLoading ? 'Eliminando...' : `Eliminar ${entitiesToDelete.length} tipos de vía`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}