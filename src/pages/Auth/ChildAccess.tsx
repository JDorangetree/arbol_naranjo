/**
 * Página de Acceso para el Hijo
 *
 * Permite al hijo ingresar con un código PIN para ver
 * el contenido en modo solo lectura.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAppModeStore } from '../../store/useAppModeStore';
import { useAuthStore } from '../../store';
import { Card } from '../../components/common';
import { NaranjoTree } from '../../components/illustrations';

export const ChildAccess: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { verifyPin, lockChildMode, updateChildAge } = useAppModeStore();

  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Actualizar edad del hijo cuando hay usuario
  useEffect(() => {
    if (user?.childBirthDate) {
      const birthDate = user.childBirthDate instanceof Date
        ? user.childBirthDate
        : new Date(user.childBirthDate);
      updateChildAge(birthDate);
    }
  }, [user?.childBirthDate, updateChildAge]);

  // Focus en el primer input al cargar
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handlePinChange = (index: number, value: string) => {
    // Solo permitir números
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // Mover al siguiente input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Verificar PIN cuando está completo
    if (value && index === 3) {
      const fullPin = newPin.join('');
      verifyAndEnter(fullPin);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d+$/.test(pastedData)) {
      const newPin = pastedData.split('').slice(0, 4);
      while (newPin.length < 4) newPin.push('');
      setPin(newPin);

      if (newPin.length === 4 && newPin.every(d => d !== '')) {
        verifyAndEnter(newPin.join(''));
      }
    }
  };

  const verifyAndEnter = (fullPin: string) => {
    if (verifyPin(fullPin)) {
      // Activar modo hijo y navegar
      lockChildMode();
      navigate('/');
    } else {
      setError('Código incorrecto');
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        setPin(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }, 500);
    }
  };

  const childName = user?.childName || 'pequeño explorador';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-growth-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Botón volver */}
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </button>

        <Card className="p-8 text-center">
          {/* Ilustración del Naranjo */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <NaranjoTree size="md" fruitCount={3} />
          </motion.div>

          {/* Saludo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Hola, {childName}!
            </h1>
            <p className="text-gray-500 mb-8">
              Ingresa tu código secreto para ver tu tesoro
            </p>
          </motion.div>

          {/* Input de PIN */}
          <motion.div
            animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex justify-center gap-3 mb-6"
            onPaste={handlePaste}
          >
            {pin.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`
                  w-14 h-16 text-center text-2xl font-bold rounded-xl border-2
                  focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all
                  ${error
                    ? 'border-red-300 bg-red-50'
                    : digit
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-gray-200 bg-white'
                  }
                `}
              />
            ))}
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 text-red-500 mb-6"
            >
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          {/* Hint */}
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <Lock className="w-4 h-4" />
            <span>Pide el código a mamá o papá</span>
          </div>
        </Card>

        {/* Decoración */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Tu historia te espera...
          </p>
        </div>
      </motion.div>
    </div>
  );
};
