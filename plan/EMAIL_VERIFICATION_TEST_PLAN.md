# Plan de Testing: Flujo de Verificación de Correo (Vitest + RTL)

**Objetivo:** Garantizar que todos los estados posibles del flujo de verificación funcionen correctamente a nivel de interfaz de usuario, aislando la lógica mediante mocks de `better-auth` y `next/navigation`.

> **⚠️ REQUISITO PREVIO ARQUITECTÓNICO:**
> Dado que Next.js Server Components (`page.tsx` con `async`) no soportan interactividad (`onClick`, `useState`), la lógica testeable deberá vivir en un **Client Component** (ej. `<VerificationClient />`) que será importado en tu `page.tsx`. Este plan asume la existencia de ese componente cliente.

---

## 🛠️ Configuración Global del Test (Setup)

Antes de cada bloque de test, debemos preparar el entorno:
1. **Mock de Better Auth:** Espiar (`vi.spyOn` o mock de módulo) los métodos `authClient.verifyEmail` y `authClient.sendVerificationEmail`.
2. **Mock de Next Navigation:** Mockear `useRouter` y `useSearchParams`.
3. **Limpieza:** Hacer `vi.clearAllMocks()` después de cada test para no contaminar el estado.

---

## 🧪 Casos de Prueba Detallados

### Escenario 1: Redirección desde Login (Falta Verificación)
* **Contexto:** El usuario intentó loguearse sin éxito. El sistema lo redirigió acá pasando su email por URL (`?email=usuario@test.com`).
* **Pasos de Prueba:**
  1. **Preparar (Arrange):** Mockear `useSearchParams` para que devuelva `{ email: 'usuario@test.com' }`. No hay token.
  2. **Actuar (Act):** Renderizar el componente `<VerificationClient />`.
  3. **Aserción 1 (Assert):** Verificar que se muestre en pantalla el mensaje "Verificá tu correo loco" (o equivalente).
  4. **Aserción 2:** Verificar que el botón "Reenviar correo" esté en el documento.
  5. **Actuar:** Simular un click del usuario (`userEvent.click`) en el botón "Reenviar correo".
  6. **Aserción 3:** Verificar que la función mockeada `authClient.sendVerificationEmail` haya sido llamada EXACTAMENTE con el objeto `{ email: 'usuario@test.com' }`.
  7. **Aserción 4:** Verificar que aparezca un mensaje/toast de éxito diciendo "Correo reenviado".
* **¿Por qué?:** Comprueba que la página sabe leer el email de la URL y no hace al usuario reescribirlo, reduciendo la fricción.

### Escenario 2: Camino Feliz - Token Válido
* **Contexto:** El usuario hizo clic en el enlace de su bandeja de entrada recién recibido (`?token=abcd123`).
* **Pasos de Prueba:**
  1. **Preparar:** Mockear `useSearchParams` para devolver `{ token: 'abcd123' }`.
  2. **Preparar:** Configurar el mock de `authClient.verifyEmail` para que devuelva un estado exitoso (`{ data: { status: true } }`).
  3. **Actuar:** Renderizar el componente.
  4. **Aserción 1:** (Opcional) Verificar que se muestra un estado de "Cargando/Verificando...".
  5. **Aserción 2:** Esperar (`waitFor`) y verificar que `authClient.verifyEmail` fue llamado automáticamente al montar el componente con el token correcto.
  6. **Aserción 3:** Verificar que la pantalla cambie para mostrar "¡Email verificado correctamente!".
  7. **Aserción 4:** Verificar que aparezca el botón "Ir al inicio de sesión" apuntando a `/auth/login`.
* **¿Por qué?:** Es el flujo principal de éxito. Asegura que el componente reacciona automáticamente al detectar un token en la URL sin intervención manual.

### Escenario 3: Camino Triste - Token Vencido o Inválido
* **Contexto:** El usuario hizo clic en un enlace viejo (`?token=vencido_123`).
* **Pasos de Prueba:**
  1. **Preparar:** Mockear `useSearchParams` para devolver `{ token: 'vencido_123' }`.
  2. **Preparar:** Configurar el mock de `authClient.verifyEmail` para devolver un error (ej. rechazar la promesa o devolver `{ error: 'token_expired' }`).
  3. **Actuar:** Renderizar el componente.
  4. **Aserción 1:** Esperar y verificar que se llame a la función de verificación.
  5. **Aserción 2:** Verificar que se muestre el mensaje de error: "El enlace expiró o no es válido".
  6. **Aserción 3:** Verificar que la UI ahora renderice un **campo de entrada (input)** para el email y un botón "Pedir nuevo enlace".
  7. **Actuar:** Simular que el usuario tipea `nuevo@test.com` en el input y hace click en el botón.
  8. **Aserción 4:** Verificar que `authClient.sendVerificationEmail` se haya llamado con `{ email: 'nuevo@test.com' }`.
* **¿Por qué?:** Demuestra manejo de errores robusto. Si el back falla, el front debe atraparlo, informar al usuario y ofrecer una vía de escape clara (pedir otro correo manualmente).

### Escenario 4: Prevención de Spam (Rate Limiting)
* **Contexto:** El usuario impaciente hace click 5 veces seguidas en "Reenviar correo".
* **Pasos de Prueba:**
  1. **Preparar:** Configurar el entorno igual al Escenario 1.
  2. **Preparar:** Configurar el mock de `authClient.sendVerificationEmail` para que devuelva un error de `TOO_MANY_REQUESTS` (o manejar el cooldown de estado local).
  3. **Actuar:** Renderizar y hacer click en "Reenviar correo".
  4. **Aserción 1:** Verificar que se atrape el error y la UI muestre "Por favor, esperá 5 minutos".
  5. **Aserción 2:** Verificar que el botón quede en estado `disabled` (deshabilitado).
* **¿Por qué?:** Previene que un usuario frustrado cause que tu dominio de envío de correos sea marcado como SPAM.

### Escenario 5: Acceso Directo Anómalo (Edge Case)
* **Contexto:** Un curioso entra manualmente a `/auth/new-verification` sin email en la URL y sin token.
* **Pasos de Prueba:**
  1. **Preparar:** Mockear `useSearchParams` para devolver un objeto vacío `{}`.
  2. **Actuar:** Renderizar el componente.
  3. **Aserción 1:** Verificar que se muestre un mensaje neutral ("Esta página es solo accesible desde un enlace de verificación").
  4. **Aserción 2:** Verificar que NO se llame a ninguna función de verificación de Better Auth automáticamente.
* **¿Por qué?:** Seguridad y UX. Evita hacer llamadas innecesarias a la API si la URL no tiene los parámetros requeridos.
