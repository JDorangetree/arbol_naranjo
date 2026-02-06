# El Tesoro de Tomás

Una aplicación web para padres que desean crear un patrimonio financiero para sus hijos, documentando no solo las inversiones sino también el contexto emocional y las razones detrás de cada decisión.

## Filosofía del Proyecto

El Tesoro de Tomás no es solo una app de seguimiento de inversiones. Es una **bitácora generacional** que combina:

- **Capa Financiera**: Registro de inversiones en ETFs y otros instrumentos
- **Capa de Metadatos**: El "por qué" detrás de cada decisión (contexto económico, personal)
- **Capa Emocional**: Cartas, capítulos y narrativas para el futuro

La visión es crear un legado que el hijo pueda explorar cuando crezca, entendiendo no solo el valor de las inversiones, sino las historias y decisiones que las construyeron.

## Tecnologías

- **Frontend**: React 19 + TypeScript + Vite
- **Estilos**: Tailwind CSS 4
- **Estado**: Zustand
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Testing**: Vitest + Testing Library
- **Animaciones**: Framer Motion
- **Gráficos**: Recharts
- **PDFs**: @react-pdf/renderer

## Requisitos Previos

- Node.js 18+
- npm 9+
- Cuenta de Firebase (para desarrollo local)

## Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd patrimonio-hijo
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Crear archivo `.env.local` en la raíz del proyecto:
   ```env
   VITE_FIREBASE_API_KEY=tu-api-key
   VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tu-proyecto
   VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   VITE_FINNHUB_API_KEY=tu-api-key-finnhub  # Opcional, para precios en tiempo real
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173`

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila la aplicación para producción |
| `npm run preview` | Previsualiza el build de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm test` | Ejecuta todos los tests |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:ui` | Interfaz visual de Vitest |
| `npm run test:coverage` | Tests con reporte de coverage |

## Estructura del Proyecto

```
src/
├── assets/              # Imágenes, iconos, animaciones Lottie
├── components/          # Componentes React reutilizables
│   ├── common/          # Botones, modales, inputs, etc.
│   ├── illustrations/   # Componentes visuales (árbol, etc.)
│   ├── investments/     # Componentes de inversiones
│   └── layout/          # Header, footer, layouts
├── hooks/               # Custom hooks
├── pages/               # Páginas de la aplicación
│   ├── Auth/            # Login, registro
│   ├── Dashboard/       # Página principal
│   ├── History/         # Historial de transacciones
│   ├── Investments/     # Gestión de inversiones
│   ├── MyStory/         # Capítulos y cartas
│   ├── Reports/         # Reportes y PDFs
│   └── Export/          # Exportación de datos
├── services/            # Servicios externos
│   ├── firebase/        # Auth, Firestore, Storage
│   ├── marketData/      # Precios de mercado (Finnhub)
│   └── export/          # Exportadores (JSON, HTML, ZIP)
├── store/               # Estado global (Zustand)
├── test/                # Configuración de tests
├── theme/               # Tema y modo oscuro
├── types/               # Tipos TypeScript
└── utils/               # Utilidades y constantes
```

## Arquitectura de 3 Capas

### 1. Capa Financiera (`/services/firebase/investments.ts`)
- Inversiones y transacciones
- ETFs disponibles
- Precios de mercado

### 2. Capa de Metadatos (`/services/firebase/metadataService.ts`)
- Razones de cada inversión
- Contexto económico y personal
- Momentos especiales (milestones)
- Versionado de cambios

### 3. Capa Emocional (`/services/firebase/emotionalService.ts`)
- Capítulos y cartas
- Sistema de desbloqueo por edad
- Narrativas anuales
- Versionado de contenido

## Seguridad

- **Autenticación**: Firebase Auth con email/contraseña
- **Autorización**: Reglas de Firestore que validan propiedad de datos
- **PIN del hijo**: Hash con salt usando tweetnacl (no se almacena en texto plano)
- **Validación de tokens**: authGuard.ts valida sesiones antes de operaciones sensibles

## Testing

El proyecto usa Vitest con Testing Library. Actualmente hay **134 tests** que cubren:

- Stores de Zustand (useAuthStore, useInvestmentStore)
- Servicios de Firebase (auth, authGuard)
- Servicio de criptografía
- Componentes UI (Button)

Ver [docs/TESTING.md](docs/TESTING.md) para la guía completa de testing.

## Despliegue

### Firebase
```bash
# Desplegar reglas de seguridad
firebase deploy --only "storage,firestore:rules"

# Desplegar todo
firebase deploy
```

Ver [docs/FIREBASE_DEPLOYMENT.md](docs/FIREBASE_DEPLOYMENT.md) para la guía completa.

### Vercel
El proyecto incluye `vercel.json` para despliegue automático.

## Documentación

- [ROADMAP.md](ROADMAP.md) - Estado actual y plan de desarrollo
- [docs/TESTING.md](docs/TESTING.md) - Guía de testing
- [docs/FIREBASE_DEPLOYMENT.md](docs/FIREBASE_DEPLOYMENT.md) - Guía de despliegue Firebase

## Estado del Proyecto

**~85% del MVP completado**

### Completado
- Sistema de autenticación
- Registro de inversiones y transacciones
- Dashboard con visualización de árbol
- Historial de transacciones con filtros
- Sistema de capítulos con desbloqueo por edad
- Error boundaries y manejo de errores
- Tests unitarios e integración
- Mensajes de error amigables en español

### Pendiente
- Tests E2E con Playwright
- Retry logic para operaciones de red
- Página de edición de perfil
- Sistema de notificaciones
- Logging centralizado (Sentry)

Ver [ROADMAP.md](ROADMAP.md) para el detalle completo.

## Contribuir

1. Fork del repositorio
2. Crear rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Proyecto privado - Todos los derechos reservados.
