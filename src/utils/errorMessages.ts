/**
 * Mensajes de error centralizados para El Tesoro de Tomás
 *
 * Todos los mensajes están en español, escritos de forma amigable
 * y alineados con la visión del proyecto: acompañamiento, no control.
 */

// ============================================
// ERRORES DE AUTENTICACIÓN
// ============================================

export const AUTH_ERRORS: Record<string, string> = {
  // Inicio de sesión
  'auth/invalid-credential': 'El correo o la contraseña no coinciden. Revisa los datos e intenta de nuevo.',
  'auth/user-not-found': 'No encontramos una cuenta con este correo. ¿Quizás aún no te has registrado?',
  'auth/wrong-password': 'La contraseña no es correcta. Tómate tu tiempo y vuelve a intentarlo.',
  'auth/invalid-email': 'El formato del correo no parece correcto. Revísalo con calma.',
  'auth/user-disabled': 'Esta cuenta ha sido desactivada. Si crees que es un error, contáctanos.',

  // Registro
  'auth/email-already-in-use': 'Ya existe una cuenta con este correo. ¿Quizás ya te registraste antes?',
  'auth/weak-password': 'La contraseña necesita ser más fuerte. Intenta con al menos 6 caracteres.',
  'auth/operation-not-allowed': 'Este método de registro no está disponible en este momento.',

  // Red y límites
  'auth/network-request-failed': 'Parece que hay un problema de conexión. Verifica tu internet e intenta de nuevo.',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento antes de volver a intentar.',
  'auth/internal-error': 'Algo salió mal de nuestro lado. Por favor, intenta de nuevo en un momento.',

  // Sesión
  'auth/requires-recent-login': 'Por seguridad, necesitas volver a iniciar sesión para realizar esta acción.',
  'auth/session-expired': 'Tu sesión ha expirado. Vuelve a iniciar sesión para continuar.',
};

export const AUTH_DEFAULT_ERROR = 'Algo no salió como esperábamos. Intenta de nuevo.';

// ============================================
// ERRORES DE STORAGE (Imágenes/Archivos)
// ============================================

export const STORAGE_ERRORS: Record<string, string> = {
  'storage/unauthorized': 'No tienes permiso para subir archivos. Verifica tu sesión.',
  'storage/canceled': 'La subida fue cancelada.',
  'storage/unknown': 'Ocurrió un error inesperado. Intenta de nuevo.',
  'storage/quota-exceeded': 'Se ha alcanzado el límite de almacenamiento.',
  'storage/retry-limit-exceeded': 'La conexión falló varias veces. Verifica tu internet.',
  'storage/invalid-checksum': 'El archivo se corrompió durante la subida. Intenta de nuevo.',
  'storage/object-not-found': 'No pudimos encontrar el archivo solicitado.',
};

export const STORAGE_DEFAULT_ERROR = 'No pudimos completar la operación con el archivo. Intenta de nuevo.';

// ============================================
// ERRORES DE INVERSIONES
// ============================================

export const INVESTMENT_ERRORS = {
  NOT_FOUND: 'No encontramos esta inversión. Es posible que haya sido eliminada.',
  CREATE_FAILED: 'No pudimos registrar la inversión. Intenta de nuevo.',
  UPDATE_FAILED: 'No pudimos actualizar la inversión. Intenta de nuevo.',
  DELETE_FAILED: 'No pudimos eliminar la inversión. Intenta de nuevo.',
  LOAD_FAILED: 'No pudimos cargar tus inversiones. Verifica tu conexión e intenta de nuevo.',
  TRANSACTION_FAILED: 'No pudimos registrar el aporte. Intenta de nuevo.',
  INVALID_AMOUNT: 'El monto ingresado no es válido. Verifica los datos.',
  INVALID_UNITS: 'La cantidad de unidades no es válida. Verifica los datos.',
};

// ============================================
// ERRORES DE CAPÍTULOS/CONTENIDO EMOCIONAL
// ============================================

export const CHAPTER_ERRORS = {
  NOT_FOUND: 'No encontramos este capítulo. Es posible que haya sido eliminado.',
  CREATE_FAILED: 'No pudimos crear el capítulo. Intenta de nuevo.',
  UPDATE_FAILED: 'No pudimos guardar los cambios en el capítulo. Intenta de nuevo.',
  DELETE_FAILED: 'No pudimos eliminar el capítulo. Intenta de nuevo.',
  LOAD_FAILED: 'No pudimos cargar los capítulos. Verifica tu conexión e intenta de nuevo.',
  VERSION_NOT_FOUND: 'No encontramos esta versión del capítulo.',
  LOCKED: 'Este capítulo aún no está disponible. Se desbloqueará cuando llegue el momento.',
};

// ============================================
// ERRORES DE METADATOS
// ============================================

export const METADATA_ERRORS = {
  NOT_FOUND: 'No encontramos los datos asociados a esta transacción.',
  CREATE_FAILED: 'No pudimos guardar la información adicional. Intenta de nuevo.',
  UPDATE_FAILED: 'No pudimos actualizar la información. Intenta de nuevo.',
  VERSION_NOT_FOUND: 'No encontramos esta versión del registro.',
};

// ============================================
// ERRORES DE EXPORTACIÓN
// ============================================

export const EXPORT_ERRORS = {
  NOT_AUTHENTICATED: 'Necesitas iniciar sesión para exportar tus datos.',
  ZIP_NOT_SUPPORTED: 'Tu navegador no soporta la exportación en formato ZIP. Intenta con JSON o HTML.',
  GENERATION_FAILED: 'No pudimos generar el archivo de exportación. Intenta de nuevo.',
  DOWNLOAD_FAILED: 'No pudimos descargar el archivo. Verifica tu conexión e intenta de nuevo.',
  NO_DATA: 'No hay datos para exportar todavía.',
  FORMAT_NOT_SUPPORTED: 'Este formato de exportación no está disponible.',
};

// ============================================
// ERRORES DE DATOS DE MERCADO
// ============================================

export const MARKET_ERRORS = {
  RATE_LIMIT: 'El servicio de precios está ocupado. Los precios se actualizarán en un momento.',
  SYMBOL_NOT_FOUND: 'No pudimos encontrar información para este instrumento.',
  API_ERROR: 'No pudimos obtener los precios actuales. Se mostrarán los últimos valores conocidos.',
  EXCHANGE_RATE_FAILED: 'No pudimos obtener la tasa de cambio. Se usará el valor por defecto.',
  CONNECTION_FAILED: 'No pudimos conectar con el servicio de precios. Verifica tu conexión.',
};

// ============================================
// ERRORES DE RED/CONEXIÓN
// ============================================

export const NETWORK_ERRORS = {
  OFFLINE: 'Parece que no tienes conexión a internet. Verifica tu conexión e intenta de nuevo.',
  TIMEOUT: 'La operación tardó demasiado. Verifica tu conexión e intenta de nuevo.',
  SERVER_ERROR: 'Nuestros servidores están teniendo problemas. Intenta de nuevo en un momento.',
  UNKNOWN: 'Ocurrió un error de conexión. Intenta de nuevo.',
};

// ============================================
// ERRORES GENÉRICOS
// ============================================

export const GENERIC_ERRORS = {
  UNKNOWN: 'Algo no salió como esperábamos. Intenta de nuevo.',
  PERMISSION_DENIED: 'No tienes permiso para realizar esta acción.',
  NOT_AUTHENTICATED: 'Necesitas iniciar sesión para continuar.',
  VALIDATION_FAILED: 'Algunos datos no son válidos. Revisa la información e intenta de nuevo.',
  OPERATION_CANCELLED: 'La operación fue cancelada.',
};

// ============================================
// FUNCIONES HELPER
// ============================================

/**
 * Obtiene un mensaje de error amigable para errores de Firebase Auth
 */
export function getAuthErrorMessage(errorCode: string): string {
  return AUTH_ERRORS[errorCode] || AUTH_DEFAULT_ERROR;
}

/**
 * Obtiene un mensaje de error amigable para errores de Firebase Storage
 */
export function getStorageErrorMessage(errorCode: string): string {
  return STORAGE_ERRORS[errorCode] || STORAGE_DEFAULT_ERROR;
}

/**
 * Obtiene un mensaje de error amigable para cualquier error de Firebase
 */
export function getFirebaseErrorMessage(error: { code?: string; message?: string }): string {
  if (!error.code) {
    return GENERIC_ERRORS.UNKNOWN;
  }

  // Detectar tipo de error por prefijo
  if (error.code.startsWith('auth/')) {
    return getAuthErrorMessage(error.code);
  }

  if (error.code.startsWith('storage/')) {
    return getStorageErrorMessage(error.code);
  }

  // Errores de Firestore
  const firestoreErrors: Record<string, string> = {
    'permission-denied': GENERIC_ERRORS.PERMISSION_DENIED,
    'unavailable': NETWORK_ERRORS.SERVER_ERROR,
    'deadline-exceeded': NETWORK_ERRORS.TIMEOUT,
    'not-found': GENERIC_ERRORS.UNKNOWN,
  };

  return firestoreErrors[error.code] || GENERIC_ERRORS.UNKNOWN;
}

/**
 * Extrae un mensaje amigable de cualquier error
 */
export function getFriendlyErrorMessage(error: unknown): string {
  // Si es un error de Firebase con código
  if (error && typeof error === 'object' && 'code' in error) {
    return getFirebaseErrorMessage(error as { code: string });
  }

  // Si es un Error estándar, usar su mensaje si ya es amigable
  if (error instanceof Error) {
    // Si el mensaje parece técnico (en inglés o con stack), dar mensaje genérico
    if (
      error.message.includes('undefined') ||
      error.message.includes('null') ||
      error.message.includes('TypeError') ||
      error.message.includes('Cannot') ||
      error.message.includes('is not')
    ) {
      return GENERIC_ERRORS.UNKNOWN;
    }
    return error.message;
  }

  return GENERIC_ERRORS.UNKNOWN;
}

/**
 * Verifica si el error es por falta de conexión
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('offline') ||
      message.includes('timeout') ||
      message.includes('econnreset') ||
      message.includes('etimedout') ||
      message.includes('enotfound') ||
      message.includes('econnrefused')
    );
  }

  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    return (
      code === 'auth/network-request-failed' ||
      code === 'unavailable' ||
      code === 'deadline-exceeded'
    );
  }

  return false;
}
