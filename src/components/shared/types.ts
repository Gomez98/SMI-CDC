export interface BaseEntity {
  id: number;
  biIsDeleted: boolean;
  dtAudit_CreatedAt: string;
  dtAudit_UpdatedAt: string;
  vcAudit_User: string;
  vcAudit_System: string;
  vcAudit_Module: string;
  vcAudit_SP: string;
}

export interface BaseMasterEntity extends BaseEntity {
  vcCodigoInterno: string;  // Nuevo campo
  vcCodigoExterno: string;  // Nuevo campo
}

export interface AuditData {
  createdAt: string;
  updatedAt: string;
  user: string;
  system: string;
  module: string;
  procedure: string;
}

export interface UserSession {
  username: string;
  role: string;
  isAuthenticated: boolean;
}

export type CrudMode = 'create' | 'edit' | 'view';

export interface CrudPageHook<T extends BaseEntity> {
  entities: T[];
  setEntities: (entities: T[]) => void;
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  formMode: CrudMode;
  setFormMode: (mode: CrudMode) => void;
  selectedEntity: T | null;
  setSelectedEntity: (entity: T | null) => void;
  formData: Partial<T>;
  setFormData: (data: Partial<T>) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  entityToDelete: T | null;
  setEntityToDelete: (entity: T | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}