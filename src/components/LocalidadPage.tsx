import React, { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { CrudTable, CrudColumn } from './CrudTable';
import { CrudForm, FormField } from './CrudForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface Localidad {
  id: number;
  inIdEntity: number;
  vcUbigeo_Code: string;
  vcLocalidad_Code: string;
  vcLocalidad_Description: string;
  biIsDeleted: boolean;
  dtAudit_CreatedAt: string;
  dtAudit_UpdatedAt: string;
  vcAudit_User: string;
  vcAudit_System: string;
  vcAudit_Module: string;
  vcAudit_SP: string;
}

// Mock data para entidades
const mockEntidades = [
  { id: 1, name: 'MINSA' },
  { id: 2, name: 'ESSALUD' },
  { id: 3, name: 'SANIDAD PNP' },
  { id: 4, name: 'SANIDAD EP' }
];

// Mock data para ubigeos (simulando datos de interOper_Ubigeo)
const mockUbigeos = [
  { code: '150101', label: '150101 - Lima, Lima, Lima' },
  { code: '150102', label: '150102 - Lima, Lima, Ancón' },
  { code: '080101', label: '080101 - Cusco, Cusco, Cusco' },
  { code: '040101', label: '040101 - Arequipa, Arequipa, Arequipa' },
  { code: '210101', label: '210101 - Puno, Puno, Puno' }
];

export function LocalidadPage() {
  const [entities, setEntities] = useState<Localidad[]>([
    {
      id: 1,
      inIdEntity: 1,
      vcUbigeo_Code: '150101',
      vcLocalidad_Code: 'C001',
      vcLocalidad_Description: 'Centro Histórico de Lima',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-01 10:00:00',
      dtAudit_UpdatedAt: '2025-01-05 15:30:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_localidad'
    },
    {
      id: 2,
      inIdEntity: 1,
      vcUbigeo_Code: '150101',
      vcLocalidad_Code: 'M001',
      vcLocalidad_Description: 'Miraflores Centro',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-01 10:15:00',
      dtAudit_UpdatedAt: '2025-01-03 09:20:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_localidad'
    },
    {
      id: 3,
      inIdEntity: 1,
      vcUbigeo_Code: '080101',
      vcLocalidad_Code: 'S001',
      vcLocalidad_Description: 'San Blas',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-02 14:30:00',
      dtAudit_UpdatedAt: '2025-01-02 14:30:00',
      vcAudit_User: 'supervisor',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_localidad'
    },
    {
      id: 4,
      inIdEntity: 2,
      vcUbigeo_Code: '040101',
      vcLocalidad_Code: 'Y001',
      vcLocalidad_Description: 'Yanahuara',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-03 11:45:00',
      dtAudit_UpdatedAt: '2025-01-07 16:20:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_localidad'
    },
    {
      id: 5,
      inIdEntity: 1,
      vcUbigeo_Code: '150102',
      vcLocalidad_Code: 'A001',
      vcLocalidad_Description: 'Ancon Playa',
      biIsDeleted: true,
      dtAudit_CreatedAt: '2025-01-04 09:30:00',
      dtAudit_UpdatedAt: '2025-01-08 11:15:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_update_localidad'
    }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'bulk-edit'>('create');
  const [selectedEntity, setSelectedEntity] = useState<Localidad | null>(null);
  const [selectedEntities, setSelectedEntities] = useState<Localidad[]>([]);
  const [formData, setFormData] = useState<Partial<Localidad>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<Localidad | null>(null);
  const [entitiesToDelete, setEntitiesToDelete] = useState<Localidad[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const columns: CrudColumn[] = [
    {
      key: 'id',
      label: 'ID',
      sortable: true
    },
    {
      key: 'inIdEntity',
      label: 'Entidad',
      sortable: true,
      render: (value: number) => {
        const entidad = mockEntidades.find(e => e.id === value);
        return entidad ? entidad.name : `ID: ${value}`;
      }
    },
    {
      key: 'vcUbigeo_Code',
      label: 'Código Ubigeo',
      sortable: true
    },
    {
      key: 'vcLocalidad_Code',
      label: 'Código Localidad',
      sortable: true
    },
    {
      key: 'vcLocalidad_Description',
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
      name: 'inIdEntity',
      label: 'Entidad',
      type: 'select',
      required: true,
      options: mockEntidades.map(e => ({ value: e.id, label: e.name })),
      helpText: 'Seleccione la entidad a la que pertenece el registro'
    },
    {
      name: 'vcUbigeo_Code',
      label: 'Código Ubigeo',
      type: 'select',
      required: true,
      options: mockUbigeos.map(u => ({ value: u.code, label: u.label })),
      helpText: 'Seleccione el ubigeo de referencia'
    },
    {
      name: 'vcLocalidad_Code',
      label: 'Código Localidad',
      type: 'text',
      required: true,
      maxLength: 20,
      placeholder: 'Ej: C001, M001, S001',
      helpText: 'Código único de la localidad (máximo 20 caracteres)'
    },
    {
      name: 'vcLocalidad_Description',
      label: 'Descripción',
      type: 'text',
      required: true,
      maxLength: 200,
      placeholder: 'Ingrese la descripción de la localidad',
      helpText: 'Descripción completa de la localidad (máximo 200 caracteres)'
    },
    {
      name: 'biIsDeleted',
      label: 'Estado',
      type: 'switch',
      helpText: 'Activo: El registro está habilitado en el sistema'
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
      inIdEntity: undefined,
      vcUbigeo_Code: '',
      vcLocalidad_Code: '',
      vcLocalidad_Description: '',
      biIsDeleted: false
    });
    setIsFormOpen(true);
  };

  const handleEdit = (entity: Localidad) => {
    setFormMode('edit');
    setSelectedEntity(entity);
    setFormData(entity);
    setIsFormOpen(true);
  };

  const handleView = (entity: Localidad) => {
    setFormMode('view');
    setSelectedEntity(entity);
    setFormData(entity);
    setIsFormOpen(true);
  };

  const handleDelete = (entity: Localidad) => {
    setEntityToDelete(entity);
    setIsDeleteDialogOpen(true);
  };

  const handleBulkEdit = (selectedItems: Localidad[]) => {
    setFormMode('bulk-edit');
    setSelectedEntities(selectedItems);
    setFormData({
      biIsDeleted: false
    });
    setIsFormOpen(true);
  };

  const handleBulkDelete = (selectedItems: Localidad[]) => {
    setEntitiesToDelete(selectedItems);
    setIsBulkDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (formMode === 'create') {
        if (!formData.inIdEntity) {
          toast.error('La entidad es requerida');
          setIsLoading(false);
          return;
        }

        if (!formData.vcUbigeo_Code?.trim()) {
          toast.error('El código ubigeo es requerido');
          setIsLoading(false);
          return;
        }

        if (!formData.vcLocalidad_Code?.trim()) {
          toast.error('El código localidad es requerido');
          setIsLoading(false);
          return;
        }

        if (!formData.vcLocalidad_Description?.trim()) {
          toast.error('La descripción es requerida');
          setIsLoading(false);
          return;
        }

        // Validar unicidad por Ubigeo + Código Localidad
        const codeExists = entities.some(e => 
          e.vcUbigeo_Code === formData.vcUbigeo_Code && 
          e.vcLocalidad_Code === formData.vcLocalidad_Code && 
          e.id !== selectedEntity?.id
        );
        
        if (codeExists) {
          toast.error('Ya existe un registro con esa combinación de Ubigeo + Código Localidad');
          setIsLoading(false);
          return;
        }

        const newEntity: Localidad = {
          id: Math.max(...entities.map(e => e.id)) + 1,
          inIdEntity: formData.inIdEntity!,
          vcUbigeo_Code: formData.vcUbigeo_Code!,
          vcLocalidad_Code: formData.vcLocalidad_Code!,
          vcLocalidad_Description: formData.vcLocalidad_Description!,
          biIsDeleted: formData.biIsDeleted || false,
          dtAudit_CreatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          vcAudit_User: 'usuario_actual',
          vcAudit_System: 'INTEROP',
          vcAudit_Module: 'MAESTROS',
          vcAudit_SP: 'sp_insert_localidad'
        };
        
        setEntities([...entities, newEntity]);
        toast.success('Localidad creada exitosamente');

      } else if (formMode === 'edit' && selectedEntity) {
        const updatedEntity: Localidad = {
          ...selectedEntity,
          ...formData,
          dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          vcAudit_User: 'usuario_actual',
          vcAudit_SP: 'sp_update_localidad'
        } as Localidad;
        
        setEntities(entities.map(e => e.id === selectedEntity.id ? updatedEntity : e));
        toast.success('Localidad actualizada exitosamente');

      } else if (formMode === 'bulk-edit' && selectedEntities.length > 0) {
        const updatedEntities = entities.map(entity => {
          if (selectedEntities.some(selected => selected.id === entity.id)) {
            return {
              ...entity,
              biIsDeleted: formData.biIsDeleted ?? entity.biIsDeleted,
              dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              vcAudit_User: 'usuario_actual',
              vcAudit_SP: 'sp_bulk_update_localidad'
            };
          }
          return entity;
        });
        
        setEntities(updatedEntities);
        toast.success(`${selectedEntities.length} registros actualizados exitosamente`);
      }

      setIsFormOpen(false);
    } catch (error) {
      toast.error('Error al guardar el registro');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!entityToDelete) return;

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedEntity: Localidad = {
        ...entityToDelete,
        biIsDeleted: true,
        dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        vcAudit_User: 'usuario_actual',
        vcAudit_SP: 'sp_delete_localidad'
      };

      setEntities(entities.map(e => e.id === entityToDelete.id ? updatedEntity : e));
      toast.success('Registro eliminado exitosamente');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Error al eliminar el registro');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmBulkDelete = async () => {
    if (entitiesToDelete.length === 0) return;

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const updatedEntities = entities.map(entity => {
        if (entitiesToDelete.some(toDelete => toDelete.id === entity.id)) {
          return {
            ...entity,
            biIsDeleted: true,
            dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            vcAudit_User: 'usuario_actual',
            vcAudit_SP: 'sp_bulk_delete_localidad'
          };
        }
        return entity;
      });

      setEntities(updatedEntities);
      toast.success(`${entitiesToDelete.length} registros eliminados exitosamente`);
      setIsBulkDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Error al eliminar los registros');
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
      case 'create': return 'Nueva Localidad';
      case 'edit': return 'Editar Localidad';
      case 'view': return 'Ver Localidad';
      case 'bulk-edit': return `Editar ${selectedEntities.length} Registros`;
      default: return 'Localidad';
    }
  };

  const getCurrentFormFields = () => {
    return formMode === 'bulk-edit' ? bulkEditFields : formFields;
  };

  return (
    <>
      <CrudTable
        title="Localidad"
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
              Esta acción marcará la localidad "{entityToDelete?.vcLocalidad_Code} - {entityToDelete?.vcLocalidad_Description}" como inactiva. 
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
              Esta acción marcará {entitiesToDelete.length} registros como inactivos:
              <div className="mt-2 max-h-32 overflow-y-auto">
                <ul className="list-disc list-inside text-sm">
                  {entitiesToDelete.map(entity => (
                    <li key={entity.id}>{entity.vcLocalidad_Code} - {entity.vcLocalidad_Description}</li>
                  ))}
                </ul>
              </div>
              Podrá reactivarlos posteriormente editando los registros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} disabled={isLoading}>
              {isLoading ? 'Eliminando...' : `Eliminar ${entitiesToDelete.length} registros`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}