# Plan de Implementación de Testing (Vitest + React Testing Library)

Este documento detalla los pasos necesarios para configurar el entorno de testing en el proyecto Next.js y escribir la primera suite de pruebas unitarias/integración para `RegisterForm.tsx`.

## Fase 1: Instalación de Dependencias

Ejecutar el siguiente comando para instalar las herramientas necesarias como dependencias de desarrollo:

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/user-event
```

- **vitest**: El framework principal de pruebas (reemplazo moderno de Jest).
- **@vitejs/plugin-react**: Necesario para que Vitest entienda el código React/JSX.
- **jsdom**: Simula un navegador (DOM) en el entorno de Node.js para que React pueda renderizar.
- **@testing-library/\*** : Herramientas para renderizar e interactuar con los componentes simulando a un usuario real.

## Fase 2: Configuración del Entorno

1. **Crear archivo `vitest.config.ts`** en la raíz del proyecto:
   Deberá configurarse para usar `jsdom`, cargar el plugin de React y mapear los alias (como `@/` hacia `src/`).

2. **Actualizar `package.json`**:
   Agregar el script para ejecutar las pruebas:

   ```json
   "scripts": {
     "test": "vitest",
     "test:ui": "vitest --ui"
   }
   ```

3. **Crear archivo de setup `vitest.setup.ts`**:
   Para cargar configuraciones globales o mocks necesarios antes de cada test (opcional pero recomendado si se mockean globals).

## Fase 3: Preparación de Mocks (Simulaciones)

Dado que `RegisterForm.tsx` usa librerías externas que NO debemos testear, necesitamos crear "mocks" para:

- **next/navigation**: Simular `useRouter` para evitar errores de contexto y verificar que se llame a `router.replace`.
- **next-intl**: Simular `useTranslations` para que devuelva las keys directamente sin necesidad de cargar los archivos `.json`.
- **react-hot-toast**: Simular `toast.success` y `toast.error`.
- **@/lib/auth-client**: Simular el comportamiento de `authClient.signUp.email` para probar tanto el éxito como el fallo.

## Fase 4: Implementación de la Suite de Pruebas

Crear el archivo `__tests__/components/RegisterForm.test.tsx` o `src/components/RegisterForm.test.tsx`.

Se implementarán los siguientes casos de prueba definidos previamente:

- [ ] **Test 1: Smoke Test** - Verifica el renderizado básico inicial de inputs, labels y estado del botón de submit (deshabilitado).
- [ ] **Test 2: Interacción UI** - Verifica que al hacer clic en el ícono del ojo, el input de password cambie entre tipo `text` y `password`.
- [ ] **Test 3: Validación de Errores** - Verifica que si se intenta enviar el formulario vacío (previa aceptación de términos), se muestren los errores de validación de Zod/React Hook Form.
- [ ] **Test 4: Happy Path (Camino Feliz)** - Mockea un éxito en auth, ingresa datos válidos y verifica llamadas a `authClient`, al `toast.success` y redirección.
- [ ] **Test 5: Sad Path (Fallo del Servidor)** - Mockea un error en auth, ingresa datos y verifica llamada a `toast.error` y que NO haya redirección.

---

> **Nota para la próxima sesión:** Arrancar directamente desde la Fase 1 copiando y pegando el comando en la terminal. El foco será armar un test a la vez para entender bien la sintaxis.

Buenísimo, me gusta que preguntes antes de tirarte a la pileta. Así es como piensa un verdadero ingeniero de software. Vamos a desglosar exactamente lo que vamos a testear en tu componente `RegisterForm.tsx`.

Nuestro objetivo con estos tests es garantizar que **la interfaz de usuario (UI)** reaccione correctamente ante lo que hace el usuario, sin importar si la base de datos se cayó o si internet anda lento.

Acá está la lista exacta y detallada de los casos de prueba (Test Cases) que vamos a programar:

### 1. Renderizado básico (Smoke Test)

_¿Para qué? Para asegurarnos de que la página no explota ni bien carga y todo está donde tiene que estar._

- Vamos a montar el componente en memoria.
- Vamos a verificar que existan los inputs de Nombre, Email y Contraseña.
- Vamos a buscar el checkbox de Términos y Condiciones y confirmar que esté desmarcado por defecto.
- Vamos a verificar que el botón de "Sign Up" exista y **esté deshabilitado** al inicio (porque depende de que los términos estén aceptados).

### 2. Interacción de UI: El botón de Mostrar Contraseña

_¿Para qué? Para testear la lógica interna de estado (`useState` de `showPassword`)._

- Vamos a confirmar que el input de la contraseña es de tipo `password` (o sea, oculta los caracteres).
- Vamos a simular un clic en el botón del "ojito".
- Vamos a verificar que el input cambie automáticamente a tipo `text` (para que se vea la clave).
- Vamos a hacer clic de nuevo y verificar que vuelva a `password`.

### 3. Validaciones de Errores (El usuario hace cualquiera)

_¿Para qué? Para garantizar que React Hook Form y Zod están bien conectados a tu UI._

- Vamos a simular que el usuario hace clic en el checkbox de Términos (para habilitar el botón).
- Vamos a simular un clic en "Sign Up", pero **dejando todos los campos vacíos**.
- Vamos a verificar que aparezcan los mensajes de error correspondientes bajo cada input ("Requerido", "Email inválido", etc.). Con esto probamos que si alguien quiere pasar de vivo, el formulario lo frena antes de hacer ninguna petición al servidor.

### 4. El Camino Feliz (Éxito al registrarse)

_¿Para qué? Para testear que le pasamos los datos correctos a Better Auth y manejamos bien el éxito._

- **Preparación (Mocking):** Le vamos a decir a Vitest: _"Che, si alguien llama a `authClient.signUp.email`, no hagas la petición de verdad. Fingí que funcionó y devolvé un éxito"_. También vamos a "mockear" el `useRouter` de Next.js y el `toast` de notificaciones.
- Vamos a simular que el usuario escribe "Pepe", "pepe@gmail.com", "12345678" y acepta los términos.
- Vamos a hacer clic en "Sign Up".
- **Comprobación 1:** ¿Se llamó a `authClient.signUp.email` exactamente una vez?
- **Comprobación 2:** ¿Se le pasaron los datos exactos que escribió Pepe? (Es decir, que no haya bugs donde el input de email mande la data al campo de contraseña por error).
- **Comprobación 3:** ¿Apareció el `toast.success` avisando que se mandó el mail?
- **Comprobación 4:** ¿Se llamó al router para redirigir a `/auth/login`?

### 5. El Camino Triste (Fallo en el servidor)

_¿Para qué? Para asegurarnos de que si Better Auth tira un error (ej. email ya existe), la app no crashee y le avise al usuario._

- **Preparación:** Vamos a "mockear" el `authClient` de nuevo, pero esta vez le decimos: _"Fingí que devolviste un error"_.
- Llenamos los datos y le damos a "Sign Up".
- **Comprobación 1:** Verificamos que el router **NO** haya redirigido a ningún lado (el usuario se tiene que quedar ahí para corregir el error).
- **Comprobación 2:** Verificamos que haya aparecido el `toast.error` avisando que hubo un problema.

---

### ¿Ves la diferencia?

En ningún momento vamos a comprobar si el usuario efectivamente apareció en Postgres o si el email le llegó a la bandeja de entrada de Pepe. Todo lo que testeamos es: **"Dado que el usuario hace X, ¿mi interfaz reacciona con Y?"**.

Y para que esto funcione, vamos a tener que "truchar" (mockear) a `useTranslations` (porque no nos importa cargar archivos de idiomas en el test), a `useRouter` y a `authClient`.

Esta es la forma madura y escalable de testear front-end. ¿Estás listo para que instalemos las librerías necesarias y configuremos esto?
