import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Sparkles } from 'lucide-react';
import { Button, Input } from '../../components/common';
import { NaranjoYTorre } from '../../components/illustrations';
import { useAuthStore } from '../../store';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showError, setShowError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data);
      navigate('/');
    } catch {
      setShowError(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-growth-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo y título */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="mb-4"
          >
            <NaranjoYTorre size="sm" fruitCount={4} />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bienvenido de vuelta
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Continúa cultivando el futuro de tu familia
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@email.com"
              leftIcon={<Mail className="w-5 h-5" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="Tu contraseña"
              leftIcon={<Lock className="w-5 h-5" />}
              error={errors.password?.message}
              {...register('password')}
            />

            {showError && error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-primary-700 dark:text-primary-300 text-sm text-center bg-primary-50 dark:bg-primary-900/30 p-3 rounded-lg border border-primary-200 dark:border-primary-700"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Iniciar sesión
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-slate-400">
              ¿No tienes una cuenta?{' '}
              <Link
                to="/register"
                className="text-primary-500 hover:text-primary-600 font-semibold"
              >
                Regístrate
              </Link>
            </p>
          </div>

          {/* Acceso para el hijo */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
            <Link
              to="/child-access"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-primary-50 to-growth-50 dark:from-primary-900/30 dark:to-growth-900/30 hover:from-primary-100 hover:to-growth-100 dark:hover:from-primary-900/50 dark:hover:to-growth-900/50 rounded-xl text-gray-700 dark:text-slate-300 font-medium transition-all"
            >
              <Sparkles className="w-5 h-5 text-primary-500" />
              Soy el hijo, quiero ver mi tesoro
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
