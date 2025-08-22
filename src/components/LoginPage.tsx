import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Eye, EyeOff, Shield } from 'lucide-react';

export interface LoginPageProps {
  onLogin: (username: string, role: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Usuarios de prueba
  const testUsers = {
    'admin': { password: 'admin123', role: 'Administrador' },
    'operador': { password: 'oper123', role: 'Operador' },
    'auditor': { password: 'audit123', role: 'Auditor' }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simular validación de login
    await new Promise(resolve => setTimeout(resolve, 1500));

    const user = testUsers[formData.username.toLowerCase() as keyof typeof testUsers];
    
    if (user && user.password === formData.password) {
      onLogin(formData.username, user.role);
    } else {
      setError('Usuario o contraseña incorrectos');
    }
    
    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-primary-light/5 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl text-primary">CDC PERÚ</CardTitle>
            <CardDescription className="text-base mt-2">
              Sistema de Gestión de Maestros e Interoperabilidad
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Ingrese su usuario"
                disabled={isLoading}
                required
                className="bg-input-background border-border focus:border-primary focus:ring-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Ingrese su contraseña"
                  disabled={isLoading}
                  required
                  className="bg-input-background border-border focus:border-primary focus:ring-primary pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="text-center font-medium">Usuarios de prueba:</p>
              <div className="grid gap-1 text-xs">
                <p><span className="font-medium">admin</span> / admin123 (Administrador)</p>
                <p><span className="font-medium">operador</span> / oper123 (Operador)</p>
                <p><span className="font-medium">auditor</span> / audit123 (Auditor)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}