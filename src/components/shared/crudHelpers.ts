import { toast } from 'sonner@2.0.3';
import type { BaseEntity, AuditData, UserSession } from './types';

export const createAuditData = (entity: BaseEntity): AuditData => ({
  createdAt: new Date(entity.dtAudit_CreatedAt).toLocaleString('es-PE'),
  updatedAt: new Date(entity.dtAudit_UpdatedAt).toLocaleString('es-PE'),
  user: entity.vcAudit_User,
  system: entity.vcAudit_System,
  module: entity.vcAudit_Module,
  procedure: entity.vcAudit_SP
});

export const createNewEntity = <T extends BaseEntity>(
  baseData: Omit<T, keyof BaseEntity>,
  spName: string,
  maxId: number,
  currentUser?: UserSession
): T => ({
  ...baseData,
  id: maxId + 1,
  dtAudit_CreatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
  dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
  vcAudit_User: currentUser?.username || 'usuario_sistema',
  vcAudit_System: 'INTEROP',
  vcAudit_Module: 'MAESTROS',
  vcAudit_SP: spName,
  biIsDeleted: false
} as T);

export const updateEntityAudit = <T extends BaseEntity>(
  entity: T,
  updates: Partial<T>,
  spName: string,
  currentUser?: UserSession
): T => ({
  ...entity,
  ...updates,
  dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
  vcAudit_User: currentUser?.username || 'usuario_sistema',
  vcAudit_SP: spName
});

export const softDeleteEntity = <T extends BaseEntity>(
  entity: T,
  spName: string,
  currentUser?: UserSession
): T => ({
  ...entity,
  biIsDeleted: true,
  dtAudit_UpdatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
  vcAudit_User: currentUser?.username || 'usuario_sistema',
  vcAudit_SP: spName
});

export const handleExportData = () => {
  toast.success('Exportando datos...', {
    description: 'El archivo se descargará en breve'
  });
};

export const validateRequiredFields = (data: Record<string, any>, fields: string[]): boolean => {
  for (const field of fields) {
    if (!data[field]?.trim()) {
      toast.error(`El campo ${field} es requerido`);
      return false;
    }
  }
  return true;
};

export const validateCodes = (codigoInterno: string, codigoExterno: string): boolean => {
  if (!codigoInterno?.trim()) {
    toast.error('El código interno es requerido');
    return false;
  }
  if (!codigoExterno?.trim()) {
    toast.error('El código externo es requerido');
    return false;
  }
  return true;
};

export const checkUniqueField = <T extends BaseEntity>(
  entities: T[],
  fieldName: keyof T,
  value: string,
  excludeId?: number
): boolean => {
  return entities.some(e => 
    String(e[fieldName]).toLowerCase() === value.toLowerCase() && 
    e.id !== excludeId
  );
};

export const checkUniqueCodes = <T extends BaseEntity>(
  entities: T[],
  codigoInterno: string,
  codigoExterno: string,
  excludeId?: number
): { isValid: boolean; message?: string } => {
  const hasDuplicateInterno = entities.some(e => 
    (e as any).vcCodigoInterno?.toLowerCase() === codigoInterno.toLowerCase() && 
    e.id !== excludeId
  );
  
  if (hasDuplicateInterno) {
    return { isValid: false, message: 'El código interno ya existe' };
  }
  
  const hasDuplicateExterno = entities.some(e => 
    (e as any).vcCodigoExterno?.toLowerCase() === codigoExterno.toLowerCase() && 
    e.id !== excludeId
  );
  
  if (hasDuplicateExterno) {
    return { isValid: false, message: 'El código externo ya existe' };
  }
  
  return { isValid: true };
};

export const simulateApiCall = (delay: number = 1000): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, delay));