import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Lock,
  User,
  Baby,
  Calendar,
  TreeDeciduous,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Button, Input } from '../../components/common';
import { useAuthStore } from '../../store';

const registerSchema = z
  .object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string(),
    displayName: z.string().min(2, 'Ingresa tu nombre'),
    childName: z.string().min(2, 'Ingresa el nombre de tu hijo/a'),
    childBirthDate: z.string().min(1, 'Selecciona la fecha de nacimiento'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  const [step, setStep] = useState(1);
  const [showError, setShowError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const childName = watch('childName');

  const nextStep = async () => {
    let fieldsToValidate: (keyof RegisterFormData)[] = [];

    if (step === 1) {
      fieldsToValidate = ['displayName', 'email', 'password', 'confirmPassword'];
    } else if (step === 2) {
      fieldsToValidate = ['childName', 'childBirthDate'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      await registerUser({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        childName: data.childName,
        childBirthDate: new Date(data.childBirthDate),
      });
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
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-growth-500 rounded-full mb-4 shadow-lg shadow-growth-500/30"
          >
            <TreeDeciduous className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {step === 1 && 'Crea tu cuenta'}
            {step === 2 && '¿Cómo se llama?'}
            {step === 3 && '¡Todo listo!'}
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            {step === 1 && 'Comienza a construir el futuro de tu familia'}
            {step === 2 && 'Cuéntanos sobre tu pequeño/a'}
            {step === 3 && `El árbol de ${childName} está listo para crecer`}
          </p>
        </div>

        {/* Indicador de pasos */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-8 bg-primary-500'
                  : s < step
                  ? 'w-2 bg-growth-500'
                  : 'w-2 bg-gray-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {/* Paso 1: Datos de cuenta */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Input
                    label="Tu nombre"
                    placeholder="¿Cómo te llamas?"
                    leftIcon={<User className="w-5 h-5" />}
                    error={errors.displayName?.message}
                    {...register('displayName')}
                  />

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
                    placeholder="Mínimo 6 caracteres"
                    leftIcon={<Lock className="w-5 h-5" />}
                    error={errors.password?.message}
                    {...register('password')}
                  />

                  <Input
                    label="Confirmar contraseña"
                    type="password"
                    placeholder="Repite tu contraseña"
                    leftIcon={<Lock className="w-5 h-5" />}
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />

                  <Button
                    type="button"
                    onClick={nextStep}
                    className="w-full"
                    size="lg"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    Continuar
                  </Button>
                </motion.div>
              )}

              {/* Paso 2: Datos del niño */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/50 rounded-full mb-3">
                      <Baby className="w-8 h-8 text-primary-500" />
                    </div>
                  </div>

                  <Input
                    label="Nombre de tu hijo/a"
                    placeholder="¿Cómo se llama tu pequeño/a?"
                    leftIcon={<Baby className="w-5 h-5" />}
                    error={errors.childName?.message}
                    {...register('childName')}
                  />

                  <Input
                    label="Fecha de nacimiento"
                    type="date"
                    leftIcon={<Calendar className="w-5 h-5" />}
                    error={errors.childBirthDate?.message}
                    {...register('childBirthDate')}
                  />

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="secondary"
                      className="flex-1"
                      leftIcon={<ArrowLeft className="w-5 h-5" />}
                    >
                      Atrás
                    </Button>
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex-1"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      Continuar
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Paso 3: Confirmación */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-growth-400 to-growth-600 rounded-full mb-4 shadow-lg"
                    >
                      <Sparkles className="w-12 h-12 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      ¡Estás a un paso de comenzar!
                    </h3>
                    <p className="text-gray-600 dark:text-slate-400">
                      Juntos vamos a plantar y cultivar el árbol del tesoro de{' '}
                      <span className="font-semibold text-primary-500">
                        {childName}
                      </span>
                      . Cada inversión será una semilla que crecerá con el tiempo.
                    </p>
                  </div>

                  {showError && error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-primary-700 dark:text-primary-300 text-sm text-center bg-primary-50 dark:bg-primary-900/30 p-3 rounded-lg border border-primary-200 dark:border-primary-700"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="secondary"
                      className="flex-1"
                      leftIcon={<ArrowLeft className="w-5 h-5" />}
                    >
                      Atrás
                    </Button>
                    <Button
                      type="submit"
                      variant="success"
                      className="flex-1"
                      isLoading={isLoading}
                      rightIcon={<TreeDeciduous className="w-5 h-5" />}
                    >
                      ¡Plantar árbol!
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-slate-400">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="text-primary-500 hover:text-primary-600 font-semibold"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
