import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'switch' | 'date' | 'datetime';
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  options?: { value: string; label: string }[];
  helpText?: string;
  disabled?: boolean;
}

export interface CrudFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mode: 'create' | 'edit' | 'view';
  fields: FormField[];
  data: Record<string, any>;
  onDataChange: (field: string, value: any) => void;
  onSubmit: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
  auditData?: {
    createdAt?: string;
    updatedAt?: string;
    operation?: string;
    user?: string;
    system?: string;
    module?: string;
    procedure?: string;
  };
}

export function CrudForm({
  isOpen,
  onClose,
  title,
  mode,
  fields,
  data,
  onDataChange,
  onSubmit,
  onDelete,
  isLoading = false,
  auditData
}: CrudFormProps) {
  const isReadOnly = mode === 'view';
  const isEdit = mode === 'edit';

  const renderField = (field: FormField) => {
    const value = data[field.name] || '';
    const isDisabled = isReadOnly || field.disabled;

    switch (field.type) {
      case 'select':
        return (
          <Select 
            value={String(value)} 
            onValueChange={(val) => onDataChange(field.name, val)}
            disabled={isDisabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Seleccionar ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => onDataChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            disabled={isDisabled}
            className="min-h-[100px] font-mono text-sm"
          />
        );

      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={Boolean(value)}
              onCheckedChange={(checked) => onDataChange(field.name, checked)}
              disabled={isDisabled}
            />
            <Label className="text-sm font-normal">
              {field.name === 'biIsDeleted' 
                ? (value ? 'Inactivo' : 'Activo')
                : (value ? 'Activo' : 'Inactivo')
              }
            </Label>
          </div>
        );

      case 'password':
        return (
          <Input
            type="password"
            value={value}
            onChange={(e) => onDataChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            disabled={isDisabled}
          />
        );

      default:
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => onDataChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            disabled={isDisabled}
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === 'create' && 'Complete los campos requeridos para crear un nuevo registro.'}
            {mode === 'edit' && 'Modifique los campos necesarios y guarde los cambios.'}
            {mode === 'view' && 'Información detallada del registro.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => (
              <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <Label htmlFor={field.name} className="text-sm font-medium">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <div className="mt-1">
                  {renderField(field)}
                </div>
                {field.helpText && (
                  <p className="text-xs text-muted-foreground mt-1">{field.helpText}</p>
                )}
                {field.maxLength && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Máximo {field.maxLength} caracteres
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Audit Information */}
          {auditData && mode !== 'create' && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Información de Auditoría
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {auditData.createdAt && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Creado el</Label>
                      <p className="font-mono">{auditData.createdAt}</p>
                    </div>
                  )}
                  {auditData.updatedAt && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Actualizado el</Label>
                      <p className="font-mono">{auditData.updatedAt}</p>
                    </div>
                  )}
                  {auditData.user && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Usuario</Label>
                      <p>{auditData.user}</p>
                    </div>
                  )}
                  {auditData.system && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Sistema</Label>
                      <p>{auditData.system}</p>
                    </div>
                  )}
                  {auditData.module && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Módulo</Label>
                      <p>{auditData.module}</p>
                    </div>
                  )}
                  {auditData.procedure && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Procedimiento</Label>
                      <p className="font-mono text-xs">{auditData.procedure}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          {mode === 'view' && onDelete && (
            <Button variant="destructive" onClick={onDelete}>
              Eliminar
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            {mode === 'view' ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!isReadOnly && (
            <Button onClick={onSubmit} disabled={isLoading}>
              {isLoading ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Guardar'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}