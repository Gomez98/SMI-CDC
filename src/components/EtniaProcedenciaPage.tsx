import React, { useState } from 'react';
import { toast } from 'sonner@2.0.3';
import { CrudTable, CrudColumn } from './CrudTable';
import { CrudForm, FormField } from './CrudForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface EtniaProcedencia {
  id: number;
  inIdEntity: number;
  inIdEtnia: number;
  inIdProcedencia: number;
  vcDescription: string;
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

// Mock data para etnias
const mockEtnias = [
  { id: 1, name: 'Mestizo' },
  { id: 2, name: 'Quechua' },
  { id: 3, name: 'Aymara' },
  { id: 4, name: 'Asháninka' },
  { id: 5, name: 'Awajún' }
];

// Mock data para procedencias
const mockProcedencias = [
  { id: 1, name: 'Nacional' },
  { id: 2, name: 'Extranjero' },
  { id: 3, name: 'Binacional' },
  { id: 4, name: 'Regional' }
];

export function EtniaProcedenciaPage() {
  const [entities, setEntities] = useState<EtniaProcedencia[]>([
    {
      id: 1,
      inIdEntity: 1,
      inIdEtnia: 1,
      inIdProcedencia: 1,
      vcDescription: 'Mestizo Nacional',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-01 10:00:00',
      dtAudit_UpdatedAt: '2025-01-05 15:30:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_etnia_procedencia'
    },
    {
      id: 2,
      inIdEntity: 1,
      inIdEtnia: 2,
      inIdProcedencia: 1,
      vcDescription: 'Quechua Nacional',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-01 10:15:00',
      dtAudit_UpdatedAt: '2025-01-03 09:20:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_etnia_procedencia'
    },
    {
      id: 3,
      inIdEntity: 2,
      inIdEtnia: 3,
      inIdProcedencia: 2,
      vcDescription: 'Aymara Extranjero',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-02 14:30:00',
      dtAudit_UpdatedAt: '2025-01-02 14:30:00',
      vcAudit_User: 'supervisor',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_etnia_procedencia'
    },
    {
      id: 4,
      inIdEntity: 1,
      inIdEtnia: 4,
      inIdProcedencia: 3,
      vcDescription: 'Asháninka Binacional',
      biIsDeleted: false,
      dtAudit_CreatedAt: '2025-01-03 11:45:00',
      dtAudit_UpdatedAt: '2025-01-07 16:20:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_insert_etnia_procedencia'
    },
    {
      id: 5,
      inIdEntity: 2,
      inIdEtnia: 5,
      inIdProcedencia: 4,
      vcDescription: 'Awajún Regional',
      biIsDeleted: true,
      dtAudit_CreatedAt: '2025-01-04 09:30:00',
      dtAudit_UpdatedAt: '2025-01-08 11:15:00',
      vcAudit_User: 'admin',
      vcAudit_System: 'INTEROP',
      vcAudit_Module: 'MAESTROS',
      vcAudit_SP: 'sp_update_etnia_procedencia'
    }
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'bulk-edit'>('create');
  const [selectedEntity, setSelectedEntity] = useState<EtniaProcedencia | null>(null);
  const [selectedEntities, setSelectedEntities] = useState<EtniaProcedencia[]>([]);
  const [formData, setFormData] = useState<Partial<EtniaProcedencia>>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<EtniaProcedencia | null>(null);
  const [entitiesToDelete, setEntitiesToDelete] = useState<EtniaProcedencia[]>([]);
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
      key: 'inIdEtnia',
      label: 'Etnia',
      sortable: true,
      render: (value: number) => {
        const etnia = mockEtnias.find(e => e.id === value);
        return etnia ? etnia.name : `ID: ${value}`;
      }
    },
    {
      key: 'inIdProcedencia',
      label: 'Procedencia',
      sortable: true,
      render: (value: number) => {
        const procedencia = mockProcedencias.find(p => p.id === value);
        return procedencia ? procedencia.name : `ID: ${value}`;
      }
    },
    {
      key: 'vcDescription',
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
      name: 'inIdEtnia',
      label: 'Etnia',
      type: 'select',
      required: true,
      options: mockEtnias.map(e => ({ value: e.id, label: e.name })),
      helpText: 'Seleccione la etnia de referencia'
    },
    {
      name: 'inIdProcedencia',
      label: 'Procedencia',
      type: 'select',
      required: true,
      options: mockProcedencias.map(p => ({ value: p.id, label: p.name })),
      helpText: 'Seleccione la procedencia de referencia'
    },
    {
      name: 'vcDescription',
      label: 'Descripción',
      type: 'text',
      required: true,
      maxLength: 200,
      placeholder: 'Ingrese una descripción de la relación',
      helpText: 'Descripción de la relación etnia-procedencia (máximo 200 caracteres)'
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
      inIdEtnia: undefined,
      inIdProcedencia: undefined,
      vcDescription: '',
      biIsDeleted: false
    });
    setIsFormOpen(true);
  };

  const handleEdit = (entity: EtniaProcedencia) => {
    setFormMode('edit');
    setSelectedEntity(entity);
    setFormData(entity);
    setIsFormOpen(true);
  };

  const handleView = (entity: EtniaProcedencia) => {
    setFormMode('view');
    setSelectedEntity(entity);
    setFormData(entity);
    setIsFormOpen(true);
  };

  const handleDelete = (entity: EtniaProcedencia) => {
    setEntityToDelete(entity);
    setIsDeleteDialogOpen(true);
  };

  const handleBulkEdit = (selectedItems: EtniaProcedencia[]) => {
    setFormMode('bulk-edit');
    setSelectedEntities(selectedItems);
    setFormData({
      biIsDeleted: false
    });
    setIsFormOpen(true);
  };

  const handleBulkDelete = (selectedItems: EtniaProcedencia[]) => {
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

        if (!formData.inIdEtnia) {
          toast.error('La etnia es requerida');
          setIsLoading(false);
          return;
        }

        if (!formData.inIdProcedencia) {
          toast.error('La procedencia es requerida');
          setIsLoading(false);
          return;
        }

        if (!formData.vcDescription?.trim()) {
          toast.error('La descripción es requerida');
          setIsLoading(false);
          return;
        }

        // Validar unicidad por Entidad + Etnia + Procedencia
        const combinationExists = entities.some(e => 
          e.inIdEntity === formData.inIdEntity && 
          e.inIdEtnia === formData.inIdEtnia && 
          e.inIdProcedencia === formData.inIdProcedencia && 
          e.id !== selectedEntity?.id
        );
        
        if (combinationExists) {
          toast.error('Ya existe un registro con esa combinación de Entidad + Etnia + Procedencia');
          setIsLoading(false);
          return;
        }

        const newEntity: EtniaProcedencia = {
          id: Math.max(...entities.map(e => e.id)) + 1,
          inIdEntity: formData.inIdEntity!,
          inIdEtnia: formData.inIdEtnia!,
          inIdProcedencia: formData.inIdProcedencia!,
          vcDescription: formData.vcDescription!,
          biIsDeleted: formData.biIsDeleted || false,
          dtAudit_CreatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          vcAudit_User: 'usuario_actual',
          vcAudit_System: 'INTEROP',
          vcAudit_Module: 'MAESTROS',
          vcAudit_SP: 'sp_insert_etnia_procedencia'
        };
        
        setEntities([...entities, newEntity]);
        toast.success('Registro creado exitosamente');

      } else if (formMode === 'edit' && selectedEntity) {
        const updatedEntity: EtniaProcedencia = {
          ...selectedEntity,
          ...formData,
          dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          vcAudit_User: 'usuario_actual',
          vcAudit_SP: 'sp_update_etnia_procedencia'
        } as EtniaProcedencia;
        
        setEntities(entities.map(e => e.id === selectedEntity.id ? updatedEntity : e));
        toast.success('Registro actualizado exitosamente');

      } else if (formMode === 'bulk-edit' && selectedEntities.length > 0) {
        const updatedEntities = entities.map(entity => {
          if (selectedEntities.some(selected => selected.id === entity.id)) {
            return {
              ...entity,
              biIsDeleted: formData.biIsDeleted ?? entity.biIsDeleted,
              dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              vcAudit_User: 'usuario_actual',
              vcAudit_SP: 'sp_bulk_update_etnia_procedencia'
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

      const updatedEntity: EtniaProcedencia = {
        ...entityToDelete,
        biIsDeleted: true,
        dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        vcAudit_User: 'usuario_actual',
        vcAudit_SP: 'sp_delete_etnia_procedencia'
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
            vcAudit_SP: 'sp_bulk_delete_etnia_procedencia'
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
      case 'create': return 'Nuevo Maestro Etnia Procedencia';
      case 'edit': return 'Editar Maestro Etnia Procedencia';
      case 'view': return 'Ver Maestro Etnia Procedencia';
      case 'bulk-edit': return `Editar ${selectedEntities.length} Registros`;
      default: return 'Maestro Etnia Procedencia';
    }
  };

  const getCurrentFormFields = () => {
    return formMode === 'bulk-edit' ? bulkEditFields : formFields;
  };

  return (
    <>
      <CrudTable
        title="Maestro Etnia Procedencia"
        data={entities}
        columns={columns}
        onNew={handleNew}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBulkEdit={handleBulkEdit}
        onBulkDelete={handleBulkDelete}
        searchPlaceholder="Buscar por etnia, procedencia o descripción..."
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
              Esta acción marcará el registro "{entityToDelete?.vcDescription}" como inactivo. 
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
                    <li key={entity.id}>{entity.vcDescription}</li>
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