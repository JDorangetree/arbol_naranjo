# Guía de Implementación de Firebase Security Rules

Esta guía explica cómo implementar las reglas de seguridad de Firestore y Storage en tu proyecto de Firebase.

---

## Requisitos Previos

1. **Firebase CLI instalado**
   ```bash
   npm install -g firebase-tools
   ```

2. **Autenticación en Firebase**
   ```bash
   firebase login
   ```

3. **Proyecto de Firebase configurado**
   - Tener un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Conocer el ID del proyecto

---

## Archivos de Configuración Creados

| Archivo | Propósito |
|---------|-----------|
| `firebase.json` | Configuración principal de Firebase |
| `firestore.rules` | Reglas de seguridad para Firestore |
| `firestore.indexes.json` | Índices compuestos para queries |
| `storage.rules` | Reglas de seguridad para Storage |

---

## Paso 1: Inicializar Firebase en el Proyecto

Si es la primera vez, ejecuta:

```bash
cd patrimonio-hijo
firebase init
```

Selecciona:
- [x] Firestore
- [x] Storage
- [x] Hosting (opcional, si quieres deploy automático)

Cuando pregunte por archivos existentes, selecciona **usar los existentes**.

---

## Paso 2: Vincular con tu Proyecto

```bash
firebase use --add
```

Selecciona tu proyecto de Firebase y dale un alias (ej: `production`).

O directamente:

```bash
firebase use tu-proyecto-id
```

---

## Paso 3: Desplegar las Reglas

### Opción A: Desplegar todo

```bash
firebase deploy
```

### Opción B: Solo reglas de Firestore

```bash
firebase deploy --only firestore:rules
```

### Opción C: Solo reglas de Storage

```bash
firebase deploy --only storage
```

### Opción D: Solo índices

```bash
firebase deploy --only firestore:indexes
```

---

## Paso 4: Verificar en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Firestore Database** → **Rules**
4. Verifica que las reglas coincidan con `firestore.rules`
5. Ve a **Storage** → **Rules**
6. Verifica que las reglas coincidan con `storage.rules`

---

## Estructura de Reglas Explicada

### Firestore Rules (`firestore.rules`)

```javascript
// Principio fundamental: Solo el dueño accede a sus datos
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}
```

#### Protecciones implementadas:

1. **Autenticación requerida**: Nadie sin login puede acceder
2. **Propiedad verificada**: Solo el usuario ve sus propios datos
3. **Validación de datos**: Campos requeridos verificados en creación
4. **Integridad financiera**: Transacciones no se pueden eliminar
5. **Inmutabilidad parcial**: Tipo y montos de transacciones no se pueden modificar

#### Colecciones protegidas:

| Colección | Leer | Crear | Actualizar | Eliminar |
|-----------|------|-------|------------|----------|
| `users/{userId}` | ✅ Owner | ✅ Owner | ✅ Owner | ❌ |
| `financial/transactions` | ✅ Owner | ✅ Owner | ⚠️ Parcial | ❌ |
| `financial/snapshots` | ✅ Owner | ✅ Owner | ✅ Owner | ❌ |
| `emotional/chapters` | ✅ Owner | ✅ Owner | ✅ Owner | ✅ Owner |
| `emotional/narratives` | ✅ Owner | ✅ Owner | ✅ Owner | ✅ Owner |

### Storage Rules (`storage.rules`)

```javascript
// Solo el dueño puede subir/ver sus archivos
match /users/{userId}/{allPaths=**} {
  allow read, write: if request.auth.uid == userId
    && isValidMedia();
}
```

#### Protecciones implementadas:

1. **Tipos de archivo restringidos**: Solo imágenes y videos
2. **Tamaño máximo**: 10MB para imágenes, 100MB para videos
3. **Rutas aisladas**: Cada usuario solo accede a su carpeta

---

## Probar Reglas Localmente

Firebase ofrece un emulador para probar reglas sin afectar producción:

```bash
# Iniciar emuladores
firebase emulators:start

# O solo Firestore
firebase emulators:start --only firestore
```

El emulador estará disponible en `http://localhost:8080` (Firestore UI).

### Escribir tests de reglas

Crea un archivo `firestore.rules.test.js`:

```javascript
const { assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
const fs = require('fs');

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-test',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

test('usuario puede leer sus propios datos', async () => {
  const userId = 'user123';
  const context = testEnv.authenticatedContext(userId);
  const db = context.firestore();

  await assertSucceeds(
    db.collection('users').doc(userId).get()
  );
});

test('usuario NO puede leer datos de otros', async () => {
  const context = testEnv.authenticatedContext('user123');
  const db = context.firestore();

  await assertFails(
    db.collection('users').doc('otroUsuario').get()
  );
});

test('usuario NO puede eliminar transacciones', async () => {
  const userId = 'user123';
  const context = testEnv.authenticatedContext(userId);
  const db = context.firestore();

  await assertFails(
    db.collection('users').doc(userId)
      .collection('financial').doc('data')
      .collection('transactions').doc('tx1')
      .delete()
  );
});
```

Ejecutar tests:

```bash
npm install --save-dev @firebase/rules-unit-testing
npx jest firestore.rules.test.js
```

---

## Ambientes: Desarrollo vs Producción

### Desarrollo (más permisivo para debugging)

Puedes crear `firestore.rules.dev`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // SOLO PARA DESARROLLO - NO USAR EN PRODUCCIÓN
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Producción (restrictivo)

Usa siempre `firestore.rules` (el archivo principal).

### Cambiar entre ambientes

```bash
# Desarrollo
firebase use development
firebase deploy --only firestore:rules

# Producción
firebase use production
firebase deploy --only firestore:rules
```

---

## Troubleshooting

### Error: "Missing or insufficient permissions"

**Causa**: Las reglas están bloqueando el acceso.

**Solución**:
1. Verifica que el usuario esté autenticado
2. Verifica que el `userId` en la ruta coincida con `request.auth.uid`
3. Revisa la estructura de la colección (puede haber typo en la ruta)

### Error: "Rules file not found"

**Solución**: Verifica que `firebase.json` apunte al archivo correcto:

```json
{
  "firestore": {
    "rules": "firestore.rules"
  }
}
```

### Las reglas no se actualizan

**Solución**: Las reglas pueden tardar hasta 1 minuto en propagarse. Espera y refresca.

### Error en validación de campos

**Causa**: Estás intentando crear un documento sin campos requeridos.

**Ejemplo**: Crear un capítulo requiere `title`, `type`, y `content`:

```javascript
// ❌ Fallará
await addDoc(chaptersRef, { title: 'Mi carta' });

// ✅ Funcionará
await addDoc(chaptersRef, {
  title: 'Mi carta',
  type: 'letter',
  content: 'Querido hijo...'
});
```

---

## Checklist de Seguridad

Antes de ir a producción, verifica:

- [ ] `firestore.rules` desplegado con reglas restrictivas
- [ ] `storage.rules` desplegado con validación de tipos
- [ ] No hay reglas con `allow read, write: if true`
- [ ] Índices creados para queries frecuentes
- [ ] Tests de reglas pasando
- [ ] Verificado en Firebase Console que las reglas están activas

---

## Comandos Útiles

```bash
# Ver proyecto actual
firebase projects:list

# Cambiar proyecto
firebase use <project-id>

# Ver reglas actuales en producción
firebase firestore:rules:get

# Desplegar todo
firebase deploy

# Desplegar solo reglas
firebase deploy --only firestore:rules,storage

# Ver logs de reglas (debugging)
firebase functions:log
```

---

## Recursos Adicionales

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firestore Security Rules Reference](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules Reference](https://firebase.google.com/docs/storage/security)
- [Rules Unit Testing](https://firebase.google.com/docs/rules/unit-tests)
