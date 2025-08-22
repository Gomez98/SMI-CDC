import React, { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { CrudTable, CrudColumn } from './CrudTable';
import { CrudForm, FormField } from './CrudForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface Ubigeo {
  id: number;
  inIdEntity: number;
  vcUbigeo_Code: string;
  vcDepartamento: string;
  vcProvincia: string;
  vcDistrito: string;
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

export function UbigeoPage() {
  const [entities, setEntities] = useState<Ubigeo[]>([
    {
      id: 1,
      inIdEntity: 1,
      vcUbigeo_Code: '150101',
      vcDepartamento: 'Lima',
      vcProvincia: 'Lima',
      vcDistrito: 'Lima',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-01 10:00:00',
      dtAudit_UpdatedAt: '2025-01-05 15:30:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_ubigeo'
    },
    {
      id: 2,
      inIdEntity: 1,
      vcUbigeo_Code: '150102',
      vcDepartamento: 'Lima',
      vcProvincia: 'Lima',
      vcDistrito: 'Ancón',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-01 10:15:00',
      dtAudit_UpdatedAt: '2025-01-03 09:20:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_ubigeo'
    },
    {
      id: 3,
      inIdEntity: 1,
      vcUbigeo_Code: '080101',
      vcDepartamento: 'Cusco',
      vcProvincia: 'Cusco',
      vcDistrito: 'Cusco',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-02 14:30:00',
      dtAudit_UpdatedAt: '2025-01-02 14:30:00',
      vcAudit_User: 'supervisor',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_ubigeo'
    },
    {
      id: 4,
      inIdEntity: 2,
      vcUbigeo_Code: '040101',
      vcDepartamento: 'Arequipa',
      vcProvincia: 'Arequipa',
      vcDistrito: 'Arequipa',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-03 11:45:00',
      dtAudit_UpdatedAt: '2025-01-07 16:20:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_ubigeo'
    },
    {
      id: 5,
      inIdEntity: 1,
      vcUbigeo_Code: '210101',
      vcDepartamento: 'Puno',
      vcProvincia: 'Puno',
      vcDistrito: 'Puno',
      biIsDeleted: true,
      dtAudit_CreatedAt: '2025-01-04 09:30:00',
      dtAudit_UpdatedAt: '2025-01-08 11:15:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_update_ubigeo'
    }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'bulk-edit'>('create');
  const [selectedEntity, setSelectedEntity] = useState<Ubigeo | null>(null);
  const [selectedEntities, setSelectedEntities] = useState<Ubigeo[]>([]);
  const [formData, setFormData] = useState<Partial<Ubigeo>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<Ubigeo | null>(null);
  const [entitiesToDelete, setEntitiesToDelete] = useState<Ubigeo[]>([]);
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
      key: 'vcDepartamento',
      label: 'Departamento',
      sortable: true
    },
    {
      key: 'vcProvincia',
      label: 'Provincia',
      sortable: true
    },
    {
      key: 'vcDistrito',
      label: 'Distrito',
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
      type: 'text',
      required: true,
      maxLength: 10,
      placeholder: 'Ej: 150101, 080101',
      helpText: 'Código único de ubigeo INEI (máximo 10 caracteres)'
    },
    {
      name: 'vcDepartamento',
      label: 'Departamento',
      type: 'text',
      required: true,
      maxLength: 100,
      placeholder: 'Ingrese el nombre del departamento',
      helpText: 'Nombre del departamento (máximo 100 caracteres)'
    },
    {
      name: 'vcProvincia',
      label: 'Provincia',
      type: 'text',
      required: true,
      maxLength: 100,
      placeholder: 'Ingrese el nombre de la provincia',
      helpText: 'Nombre de la provincia (máximo 100 caracteres)'
    },
    {
      name: 'vcDistrito',
      label: 'Distrito',
      type: 'text',
      required: true,
      maxLength: 100,
      placeholder: 'Ingrese el nombre del distrito',
      helpText: 'Nombre del distrito (máximo 100 caracteres)'
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
      vcDepartamento: '',
      vcProvincia: '',
      vcDistrito: '',
      biIsDeleted: false
    });
    setIsFormOpen(true);
  };

  const handleEdit = (entity: Ubigeo) => {
    setFormMode('edit');
    setSelectedEntity(entity);
    setFormData(entity);
    setIsFormOpen(true);
  };

  const handleView = (entity: Ubigeo) => {
    setFormMode('view');
    setSelectedEntity(entity);
    setFormData(entity);
    setIsFormOpen(true);
  };

  const handleDelete = (entity: Ubigeo) => {
    setEntityToDelete(entity);
    setIsDeleteDialogOpen(true);
  };

  const handleBulkEdit = (selectedItems: Ubigeo[]) => {
    setFormMode('bulk-edit');
    setSelectedEntities(selectedItems);
    setFormData({
      biIsDeleted: false
    });
    setIsFormOpen(true);
  };

  const handleBulkDelete = (selectedItems: Ubigeo[]) => {
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

        if (!formData.vcDepartamento?.trim()) {
          toast.error('El departamento es requerido');
          setIsLoading(false);
          return;
        }

        if (!formData.vcProvincia?.trim()) {
          toast.error('La provincia es requerida');
          setIsLoading(false);
          return;
        }

        if (!formData.vcDistrito?.trim()) {
          toast.error('El distrito es requerido');
          setIsLoading(false);
          return;
        }

        // Validar unicidad de Código Ubigeo
        const codeExists = entities.some(e => 
          e.vcUbigeo_Code === formData.vcUbigeo_Code && 
          e.id !== selectedEntity?.id
        );
        
        if (codeExists) {
          toast.error('Ya existe un registro con ese código de ubigeo');
          setIsLoading(false);
          return;
        }

        const newEntity: Ubigeo = {
          id: Math.max(...entities.map(e => e.id)) + 1,
          inIdEntity: formData.inIdEntity!,
          vcUbigeo_Code: formData.vcUbigeo_Code!,
          vcDepartamento: formData.vcDepartamento!,
          vcProvincia: formData.vcProvincia!,
          vcDistrito: formData.vcDistrito!,
          biIsDeleted: formData.biIsDeleted || false,
          dtAudit_CreatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          vcAudit_User: 'usuario_actual',
          vcAudit_System: 'INTEROP',
          vcAudit_Module: 'MAESTROS',
          vcAudit_SP: 'sp_insert_ubigeo'
        };
        
        setEntities([...entities, newEntity]);
        toast.success('Ubigeo creado exitosamente');

      } else if (formMode === 'edit' && selectedEntity) {
        const updatedEntity: Ubigeo = {
          ...selectedEntity,
          ...formData,
          dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          vcAudit_User: 'usuario_actual',
          vcAudit_SP: 'sp_update_ubigeo'
        } as Ubigeo;
        
        setEntities(entities.map(e => e.id === selectedEntity.id ? updatedEntity : e));
        toast.success('Ubigeo actualizado exitosamente');

      } else if (formMode === 'bulk-edit' && selectedEntities.length > 0) {
        const updatedEntities = entities.map(entity => {
          if (selectedEntities.some(selected => selected.id === entity.id)) {
            return {
              ...entity,
              biIsDeleted: formData.biIsDeleted ?? entity.biIsDeleted,
              dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              vcAudit_User: 'usuario_actual',
              vcAudit_SP: 'sp_bulk_update_ubigeo'
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

      const updatedEntity: Ubigeo = {
        ...entityToDelete,
        biIsDeleted: true,
        dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        vcAudit_User: 'usuario_actual',
        vcAudit_SP: 'sp_delete_ubigeo'
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
            vcAudit_SP: 'sp_bulk_delete_ubigeo'
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
      case 'create': return 'Nuevo Ubigeo';
      case 'edit': return 'Editar Ubigeo';
      case 'view': return 'Ver Ubigeo';
      case 'bulk-edit': return `Editar ${selectedEntities.length} Registros`;
      default: return 'Ubigeo';
    }
  };

  const getCurrentFormFields = () => {
    return formMode === 'bulk-edit' ? bulkEditFields : formFields;
  };

  return (
    <>
      <CrudTable
        title="Ubigeo"
        data={entities}
        columns={columns}
        onNew={handleNew}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkEdit={handleBulkEdit}
        onBulkDelete={handleBulkDelete}
        searchPlaceholder="Buscar por código, departamento, provincia o distrito..."
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
              Esta acción marcará el ubigeo "{entityToDelete?.vcUbigeo_Code} - {entityToDelete?.vcDistrito}, {entityToDelete?.vcProvincia}, {entityToDelete?.vcDepartamento}" como inactivo. 
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
              Esta acción marcará {entitiesToDelete.length} registros como inactivos:
              <div className="mt-2 max-h-32 overflow-y-auto">
                <ul className="list-disc list-inside text-sm">
                  {entitiesToDelete.map(entity => (
                    <li key={entity.id}>{entity.vcUbigeo_Code} - {entity.vcDistrito}, {entity.vcProvincia}</li>
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