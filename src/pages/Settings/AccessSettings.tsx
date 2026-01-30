/**
 * Configuración de Acceso
 *
 * Permite al padre configurar el PIN de acceso para el hijo
 * y otras opciones relacionadas con el modo lectura.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Eye,
  EyeOff,
  Save,
  Shield,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button, Card, Input } from '../../components/common';
import { useAppModeStore } from '../../store/useAppModeStore';

export const AccessSettings: React.FC = () => {
  const { setChildModePin, verifyPin, childModeSettings, setChildModeSettings } = useAppModeStore();

  // Estados del formulario
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Verificar si hay un PIN configurado
  const hasCustomPin = localStorage.getItem('childModePin') !== null;

  // Handler para cambiar PIN
  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Verificar PIN actual si existe
    if (hasCustomPin && !verifyPin(currentPin)) {
      setError('El PIN actual es incorrecto');
      return;
    }

    // Validar nuevo PIN
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setError('El PIN debe tener exactamente 4 números');
      return;
    }

    if (newPin !== confirmPin) {
      setError('Los PINs no coinciden');
      return;
    }

    // Guardar nuevo PIN
    setChildModePin(newPin);
    setSuccess('PIN actualizado correctamente');
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  };

  // Handler para configuración de secciones
  const toggleSection = (section: string) => {
    const currentSections = childModeSettings?.allowedSections || [];
    const newSections = currentSections.includes(section)
      ? currentSections.filter((s) => s !== section)
      : [...currentSections, section];

    const showFinancial = childModeSettings?.showFinancialDetails ?? false;
    setChildModeSettings({
      showFinancialDetails: showFinancial,
      allowedSections: newSections,
    });
  };

  const availableSections = [
    { id: 'dashboard', label: 'Panel Principal', description: 'Ver resumen del tesoro' },
    { id: 'story_mode', label: 'Modo Historia', description: 'Leer capítulos y cartas' },
    { id: 'history', label: 'Historial', description: 'Ver movimientos pasados' },
    { id: 'chapters', label: 'Capítulos', description: 'Acceso a los capítulos' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary-500" />
          Configuración de Acceso
        </h1>
        <p className="text-gray-500 mt-1">
          Configura cómo tu hijo accede a ver su tesoro
        </p>
      </div>

      {/* Cambiar PIN */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Código de Acceso (PIN)
            </h2>
            <p className="text-sm text-gray-500">
              {hasCustomPin
                ? 'Tu hijo usa este código para entrar'
                : 'El PIN por defecto es 1234. Te recomendamos cambiarlo.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePin} className="space-y-4">
          {/* PIN actual (solo si hay uno personalizado) */}
          {hasCustomPin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN Actual
              </label>
              <div className="relative">
                <Input
                  type={showCurrentPin ? 'text' : 'password'}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder="****"
                  maxLength={4}
                  inputMode="numeric"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPin(!showCurrentPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPin ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Nuevo PIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {hasCustomPin ? 'Nuevo PIN' : 'Crear PIN'}
            </label>
            <div className="relative">
              <Input
                type={showNewPin ? 'text' : 'password'}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="4 números"
                maxLength={4}
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={() => setShowNewPin(!showNewPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPin ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Confirmar PIN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar PIN
            </label>
            <Input
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="Repetir PIN"
              maxLength={4}
              inputMode="numeric"
            />
          </div>

          {/* Mensajes de error/éxito */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg"
            >
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">{success}</span>
            </motion.div>
          )}

          <Button type="submit" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {hasCustomPin ? 'Cambiar PIN' : 'Guardar PIN'}
          </Button>
        </form>
      </Card>

      {/* Secciones permitidas */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-growth-100 rounded-xl flex items-center justify-center">
            <Eye className="w-5 h-5 text-growth-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Secciones Visibles
            </h2>
            <p className="text-sm text-gray-500">
              Elige qué puede ver tu hijo cuando accede
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {availableSections.map((section) => {
            const isEnabled = childModeSettings?.allowedSections.includes(section.id);
            return (
              <label
                key={section.id}
                className={`
                  flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${isEnabled
                    ? 'border-growth-300 bg-growth-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div>
                  <p className="font-medium text-gray-900">{section.label}</p>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => toggleSection(section.id)}
                  className="w-5 h-5 text-growth-500 rounded focus:ring-growth-500"
                />
              </label>
            );
          })}
        </div>
      </Card>

      {/* Información */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">
          ¿Cómo funciona?
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">1.</span>
            Tu hijo va a la página de inicio y hace clic en "Soy el hijo, quiero ver mi tesoro"
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">2.</span>
            Ingresa el código PIN que configuraste aquí
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">3.</span>
            Puede ver todo en modo lectura, sin poder modificar nada
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">4.</span>
            Los capítulos bloqueados solo se mostrarán cuando alcance la edad configurada
          </li>
        </ul>
      </Card>
    </div>
  );
};
