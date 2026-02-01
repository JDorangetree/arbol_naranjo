/**
 * Página de exportación de datos
 *
 * Permite exportar la bitácora completa en diferentes formatos:
 * - JSON: Datos estructurados para backup/migración
 * - HTML: Versión navegable sin necesidad de la app
 * - ZIP: Paquete completo con datos, HTML e imágenes
 *
 * Cumple con el principio 5.1 de la visión:
 * "El contenido debe poder sobrevivir a cualquier tecnología"
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  FileJson,
  FileText,
  FolderArchive,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2,
  Shield,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../../components/common';
import { useExport } from '../../hooks/useExport';
import { ExportFormat, ExportOptions } from '../../types/app.types';

interface ExportOptionCardProps {
  format: ExportFormat;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  recommended?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  isExporting: boolean;
  onExport: () => void;
}

const ExportOptionCard: React.FC<ExportOptionCardProps> = ({
  format,
  title,
  description,
  icon,
  features,
  recommended,
  disabled,
  disabledReason,
  isExporting,
  onExport,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative"
  >
    {recommended && (
      <div className="absolute -top-3 left-4 bg-gradient-to-r from-gold-500 to-gold-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg">
        Recomendado
      </div>
    )}
    <Card
      className={`p-6 h-full ${
        recommended ? 'ring-2 ring-gold-400 shadow-lg shadow-gold-500/10' : ''
      } ${disabled ? 'opacity-60' : ''}`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start gap-4 mb-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              format === 'json'
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                : format === 'html'
                ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400'
                : 'bg-growth-100 dark:bg-growth-900/50 text-growth-600 dark:text-growth-400'
            }`}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">{description}</p>
          </div>
        </div>

        <ul className="space-y-2 mb-6 flex-1">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300">
              <CheckCircle className="w-4 h-4 text-growth-500 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {disabled ? (
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">{disabledReason}</p>
          </div>
        ) : (
          <Button
            onClick={onExport}
            disabled={isExporting}
            className={`w-full ${
              recommended
                ? 'bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700'
                : ''
            }`}
            variant={recommended ? 'primary' : 'secondary'}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Descargar {title}
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  </motion.div>
);

export const ExportPage: React.FC = () => {
  const {
    isExporting,
    progress,
    lastResult,
    error,
    exportJSON,
    exportHTML,
    exportZIP,
    clearError,
    canExportZIP,
  } = useExport();

  // Opciones de exportación
  const [options, setOptions] = useState<Partial<ExportOptions>>({
    includeFinancial: true,
    includeMetadata: true,
    includeEmotional: true,
    includeMedia: true,
    includeLockedChapters: true,
    preserveVersionHistory: true,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    switch (format) {
      case 'json':
        await exportJSON(options);
        break;
      case 'html':
        await exportHTML(options);
        break;
      case 'zip':
        await exportZIP(options);
        break;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver al Dashboard</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-growth-400 to-growth-600 rounded-2xl flex items-center justify-center shadow-lg shadow-growth-500/20">
            <FolderArchive className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Exportar Bitacora
            </h1>
            <p className="text-gray-500 dark:text-slate-400">
              Descarga tu contenido para preservarlo siempre
            </p>
          </div>
        </div>
      </motion.div>

      {/* Mensaje de filosofía */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-r from-primary-50 to-growth-50 dark:from-primary-900/30 dark:to-growth-900/30 border-primary-100 dark:border-primary-800">
          <div className="flex gap-4">
            <Shield className="w-6 h-6 text-primary-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                Tu contenido es eterno
              </h3>
              <p className="text-sm text-gray-600 dark:text-slate-300">
                La bitacora que estas construyendo debe poder sobrevivir a cualquier
                tecnologia. Estos archivos te permiten guardar todo tu contenido
                de forma independiente, legible sin necesidad de esta aplicacion.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Progress durante exportación */}
      <AnimatePresence>
        {isExporting && progress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card className="bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-4">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      {progress.currentItem || 'Preparando exportacion...'}
                    </span>
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {Math.round(progress.progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-6"
          >
            <Card className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                  <button
                    onClick={clearError}
                    className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 mt-2"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resultado exitoso */}
      <AnimatePresence>
        {lastResult?.success && !isExporting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-6"
          >
            <Card className="bg-growth-50 dark:bg-growth-900/30 border-growth-200 dark:border-growth-800">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-growth-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-growth-700 dark:text-growth-300 font-medium">
                    Exportacion completada exitosamente
                  </p>
                  <p className="text-sm text-growth-600 dark:text-growth-400 mt-1">
                    Archivo: {lastResult.filename} ({(lastResult.size / 1024).toFixed(1)} KB)
                  </p>
                  <p className="text-sm text-growth-600 dark:text-growth-400">
                    Contenido: {lastResult.itemCount.transactions} transacciones,{' '}
                    {lastResult.itemCount.chapters} capitulos,{' '}
                    {lastResult.itemCount.narratives} narrativas
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Opciones avanzadas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 transition-colors"
        >
          {showAdvanced ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          {showAdvanced ? 'Ocultar opciones avanzadas' : 'Mostrar opciones avanzadas'}
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                  Que incluir en la exportacion:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeFinancial}
                      onChange={(e) =>
                        setOptions({ ...options, includeFinancial: e.target.checked })
                      }
                      className="w-4 h-4 text-primary-500 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-300">Datos financieros</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeMetadata}
                      onChange={(e) =>
                        setOptions({ ...options, includeMetadata: e.target.checked })
                      }
                      className="w-4 h-4 text-primary-500 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-300">Metadatos (contexto)</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeEmotional}
                      onChange={(e) =>
                        setOptions({ ...options, includeEmotional: e.target.checked })
                      }
                      className="w-4 h-4 text-primary-500 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-300">Capitulos y cartas</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeLockedChapters}
                      onChange={(e) =>
                        setOptions({ ...options, includeLockedChapters: e.target.checked })
                      }
                      className="w-4 h-4 text-primary-500 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-300">Capitulos bloqueados</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.preserveVersionHistory}
                      onChange={(e) =>
                        setOptions({ ...options, preserveVersionHistory: e.target.checked })
                      }
                      className="w-4 h-4 text-primary-500 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-300">Historial de versiones</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeMedia}
                      onChange={(e) =>
                        setOptions({ ...options, includeMedia: e.target.checked })
                      }
                      className="w-4 h-4 text-primary-500 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-300">Referencias multimedia</span>
                  </label>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Opciones de formato */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ExportOptionCard
          format="json"
          title="JSON"
          description="Datos estructurados"
          icon={<FileJson className="w-6 h-6" />}
          features={[
            'Formato universal y estandar',
            'Ideal para backup tecnico',
            'Importable a otros sistemas',
            'Incluye checksums de integridad',
          ]}
          isExporting={isExporting}
          onExport={() => handleExport('json')}
        />

        <ExportOptionCard
          format="html"
          title="HTML"
          description="Version navegable"
          icon={<FileText className="w-6 h-6" />}
          features={[
            'Abrir en cualquier navegador',
            'No requiere internet',
            'Imprimible directamente',
            'Estilos y navegacion incluidos',
          ]}
          isExporting={isExporting}
          onExport={() => handleExport('html')}
        />

        <ExportOptionCard
          format="zip"
          title="ZIP Completo"
          description="Paquete con todo"
          icon={<FolderArchive className="w-6 h-6" />}
          features={[
            'Incluye JSON + HTML + README',
            'Referencias a multimedia',
            'Archivo unico para guardar',
            'La opcion mas completa',
          ]}
          recommended={true}
          disabled={!canExportZIP}
          disabledReason="Tu navegador no soporta la generacion de archivos ZIP"
          isExporting={isExporting}
          onExport={() => handleExport('zip')}
        />
      </div>

      {/* Información adicional */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <div className="flex gap-4">
            <Info className="w-5 h-5 text-gray-400 dark:text-slate-500 flex-shrink-0" />
            <div className="space-y-2 text-sm text-gray-600 dark:text-slate-300">
              <p>
                <strong className="dark:text-white">Recomendacion:</strong> Descarga el archivo ZIP completo y
                guardalo en un lugar seguro (disco externo, nube, USB). Este archivo
                contiene todo lo necesario para leer la bitacora sin depender de esta
                aplicacion.
              </p>
              <p>
                <strong className="dark:text-white">Nota sobre multimedia:</strong> Las fotos adjuntas se incluyen
                como referencias (URLs). Para una copia completa, descarga las imagenes
                manualmente y guardalas junto al archivo exportado.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
