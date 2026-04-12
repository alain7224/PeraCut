import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, User, Calendar, Globe, AlertCircle } from 'lucide-react';
import { LANGUAGES, translations, type Language } from '@/lib/i18n';

const LOGO_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663287789737/MuedJEETeftFMeBGAmYga5/peracut-logo-7jjx5QyvZTJ9KfbBdzD8sv.webp';

export default function Auth() {
  const [, navigate] = useLocation();
  const [language, setLanguage] = useState<Language>('es');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login state
  const [masterKey, setMasterKey] = useState('');

  // Register state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('');
  const [username, setUsername] = useState('');

  const t = (key: string, defaultValue?: string): string => {
    return translations[language]?.[key] || defaultValue || key;
  };

  const handleMasterKeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Llamar a API para validar llave maestra
      if (masterKey.length === 0) {
        setError('Ingresa la llave maestra');
        return;
      }

      // Simular login exitoso
      localStorage.setItem('peracut-auth-type', 'master');
      localStorage.setItem('peracut-master-key', masterKey);
      navigate('/');
    } catch (err) {
      setError('Llave maestra inválida');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validaciones
      if (!email || !name || !lastName || !username) {
        setError('Por favor completa todos los campos requeridos');
        return;
      }

      if (username.length < 4) {
        setError('El nombre de usuario debe tener al menos 4 caracteres');
        return;
      }

      // TODO: Llamar a API para registrar usuario
      console.log('Registrando usuario:', {
        email,
        name,
        lastName,
        age: age ? parseInt(age) : undefined,
        country,
        username,
      });

      // Simular registro exitoso
      localStorage.setItem('peracut-auth-type', 'user');
      localStorage.setItem('peracut-user-email', email);
      navigate('/');
    } catch (err) {
      setError('Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={LOGO_URL} alt="PeraCut" className="h-16 w-16 rounded-lg shadow-lg" />
        </div>

        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">PeraCut</h1>
          <p className="text-muted-foreground">Editor de Fotos y Videos con IA</p>
        </div>

        {/* Tabs */}
        <Card className="p-6 shadow-lg">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Llave Maestra</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 flex gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Login Tab - Llave Maestra */}
            <TabsContent value="login">
              <form onSubmit={handleMasterKeyLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Llave Maestra
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                      type="password"
                      value={masterKey}
                      onChange={(e) => setMasterKey(e.target.value)}
                      placeholder="Ingresa tu llave maestra"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Solo para el creador de la aplicación
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Verificando...' : 'Acceder'}
                </Button>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Nombre */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Nombre *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Apellido */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Apellido *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Tu apellido"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Nombre de Usuario * (mín 4 caracteres)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="tu_usuario"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Edad */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Edad (opcional)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="18"
                      min="13"
                      max="120"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* País */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    País (opcional)
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Tu país"
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Registrando...' : 'Crear Cuenta'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  * Campos requeridos
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2026 PeraCut. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
