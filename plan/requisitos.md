# Lista de Requisitos Funcionales - Finance App v2.0

## Stack Tecnológico Actualizado

**Framework & Lenguaje:**

- Next.js 15+ (App Router con React 19)
- TypeScript 5.7+
- Node.js 22 LTS

**Base de Datos & ORM:**

- Drizzle ORM (sustituyendo Prisma)
- PostgreSQL 16+ o Neon (serverless)
- Drizzle Kit para migraciones

**Autenticación:**

- Better Auth (sustituyendo NextAuth v5 beta)
- Soporte para 2FA/TOTP
- Magic links y verificación de email

**UI & Styling:**

- Tailwind CSS 4.0
- Shadcn UI (componentes base)
- Radix UI (primitivos accesibles)
- React Aria Components (accesibilidad mejorada)

**Estado & Data Fetching:**

- TanStack Query v5 (React Query)
- Zustand 5.0+ (estado cliente)
- Server Actions nativas de Next.js 15

**Formularios & Validación:**

- React Hook Form 7.54+
- Zod 3.23+ (validación schemas)
- Conform (alternativa moderna para forms)

**Visualización de Datos:**

- Recharts 2.12+ o Tremor (gráficos financieros)
- TanStack Table v8 (tablas de datos)

**Utilidades Adicionales:**

- date-fns o Temporal API (manejo de fechas)
- decimal.js (precisión financiera)
- react-papaparse (importación CSV)
- nodemailer o Resend (emails transaccionales)
- tesseract.js (OCR para recibos)

**APIs Externas:**

- CoinGecko API o CoinMarketCap API (precios criptomonedas)
- Alpha Vantage o Finnhub API (precios acciones)
- Yahoo Finance API (datos mercado)

---

## RF-001: Gestión de Usuarios y Autenticación

### RF-001.1: Registro de Usuario

- **Descripción:** El sistema debe permitir el registro de nuevos usuarios mediante email y contraseña
- **Criterios de aceptación:**
  - Email único y validado según RFC 5322
  - Contraseña con mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolos
  - Envío automático de email de verificación
  - Validación mediante Zod schema
  - Rate limiting: máximo 3 intentos por hora por IP

### RF-001.2: Verificación de Email

- **Descripción:** Verificación obligatoria de email antes de acceder a funcionalidades
- **Criterios de aceptación:**
  - Token de verificación con expiración de 24 horas
  - Link mágico enviado al email registrado
  - Reenvío de token disponible cada 5 minutos
  - Verificación mediante Better Auth

### RF-001.3: Inicio de Sesión

- **Descripción:** Autenticación de usuarios registrados
- **Criterios de aceptación:**
  - Login con email y contraseña
  - Opción de "Recordarme" con sesión extendida (30 días)
  - Máximo 5 intentos fallidos antes de bloqueo temporal (15 minutos)
  - Soporte para sesiones en múltiples dispositivos
  - Token JWT con refresh token automático

### RF-001.4: Autenticación de Dos Factores (2FA)

- **Descripción:** Capa adicional de seguridad mediante TOTP
- **Criterios de aceptación:**
  - Generación de código QR para apps autenticadoras (Google Authenticator, Authy)
  - Códigos de respaldo únicos (10 códigos)
  - Validación de código TOTP de 6 dígitos
  - Ventana de tolerancia de ±30 segundos

### RF-001.5: Recuperación de Contraseña

- **Descripción:** Proceso seguro para resetear contraseña olvidada
- **Criterios de aceptación:**
  - Token único enviado por email con expiración de 1 hora
  - Validación de nueva contraseña con mismos criterios que registro
  - Invalidación de todas las sesiones activas tras cambio exitoso
  - Rate limiting: 3 intentos por hora

### RF-001.6: Gestión de Perfil

- **Descripción:** Actualización de información personal del usuario
- **Criterios de aceptación:**
  - Edición de nombre, apellidos, email
  - Cambio de contraseña con validación de contraseña actual
  - Cambio de idioma preferido (Español/Inglés)
  - Configuración de zona horaria y formato de moneda

---

## RF-002: Gestión de Trabajos y Nómina

### RF-002.1: Registro de Empleo

- **Descripción:** Creación de perfiles de empleo/trabajo
- **Criterios de aceptación:**
  - Campos: nombre empresa, cargo, fecha inicio, salario base, tipo (tiempo completo/parcial/freelance)
  - Múltiples empleos simultáneos permitidos
  - Estado: activo/inactivo/finalizado
  - Validación de fechas coherentes (inicio <= fin si aplica)

### RF-002.2: Histórico de Salarios

- **Descripción:** Registro de aumentos salariales con fecha efectiva
- **Criterios de aceptación:**
  - Tabla de aumentos con fecha, salario anterior, nuevo salario y porcentaje de aumento
  - Cálculo automático de diferencial y porcentaje
  - Visualización en timeline de historial salarial
  - Soporte para salarios por hora, diarios, quincenales, mensuales, anuales

### RF-002.3: Control de Horas Trabajadas (Clock In/Out)

- **Descripción:** Sistema de marcaje de entrada y salida laboral
- **Criterios de aceptación:**
  - Registro de timestamp de entrada y salida
  - Cálculo automático de horas trabajadas diarias
  - Soporte para múltiples entradas/salidas por día (turnos partidos)
  - Detección de horas extras (>8h/día o >40h/semana según configuración)
  - Edición manual con justificación y aprobación
  - Exportación de reportes semanales/mensuales

### RF-002.4: Calculadora de Tiempo de Vacaciones

- **Descripción:** Acumulación y gestión de días de vacaciones
- **Criterios de aceptación:**
  - Configuración de política de acumulación (días/mes, días/año)
  - Registro de vacaciones tomadas con fechas
  - Balance actual y proyectado
  - Notificaciones de expiración de días no usados
  - Integración con calendario

### RF-002.5: Gestión de Días Festivos (Holidays)

- **Descripción:** Registro de días festivos de la empresa/país
- **Criterios de aceptación:**
  - Calendario de festivos nacionales y de empresa
  - Marcado automático en sistema de asistencia
  - Configuración por país/región
  - Actualización anual automática desde fuente externa (API)

### RF-002.6: Formulario de Declaración de Impuestos (Tax Form)

- **Descripción:** Asistente para completar información fiscal anual
- **Criterios de aceptación:**
  - Formularios personalizados según país (W-4 para USA, equivalentes)
  - Campos: estado civil, dependientes, deducciones
  - Almacenamiento seguro cifrado
  - Exportación en formato PDF
  - Integración con cálculo de retenciones

### RF-002.7: Cálculo de Ingreso Neto Proyectado

- **Descripción:** Estimación de ingresos netos después de impuestos y deducciones
- **Criterios de aceptación:**
  - Cálculo por día, semana, quincena, mes, año
  - Consideración de:
    - Impuestos federales y locales
    - Seguridad social / Medicare
    - Deducciones opcionales (401k, seguros)
    - Horas extras
  - Visualización comparativa (bruto vs neto)
  - Gráficos de distribución de deducciones
  - Escenarios "what-if" para cambios salariales

---

## RF-003: Gestión de Cuentas Bancarias

### RF-003.1: Creación de Cuentas

- **Descripción:** Registro de cuentas bancarias del usuario
- **Criterios de aceptación:**
  - Campos: nombre, tipo (corriente/ahorro/inversión), banco, moneda, balance inicial
  - Ícono y color personalizables
  - Soporte para múltiples monedas
  - Validación de balance inicial como BigInt (sin decimales perdidos)

### RF-003.2: Edición y Eliminación de Cuentas

- **Descripción:** Modificación o baja de cuentas existentes
- **Criterios de aceptación:**
  - Edición de todos los campos excepto balance (se ajusta con transacciones)
  - Eliminación lógica (soft delete) con confirmación
  - Transferencia de transacciones a otra cuenta antes de eliminar (opcional)
  - Prevención de eliminación si hay transacciones activas

### RF-003.3: Visualización de Balances

- **Descripción:** Vista consolidada de saldos de todas las cuentas
- **Criterios de aceptación:**
  - Balance individual por cuenta
  - Balance total consolidado
  - Conversión automática a moneda base del usuario
  - Indicadores visuales (colores) según estado (positivo/negativo/alerta)
  - Actualización en tiempo real

---

## RF-004: Gestión de Categorías

### RF-004.1: Creación de Categorías

- **Descripción:** Definición de categorías para clasificar transacciones
- **Criterios de aceptación:**
  - Nombre único por usuario
  - Ícono y color personalizables
  - Tipo: ingreso/gasto
  - Categorías predeterminadas sugeridas en primer uso
  - Subcategorías (jerarquía de 2 niveles máximo)

### RF-004.2: Edición y Eliminación de Categorías

- **Descripción:** Mantenimiento de catálogo de categorías
- **Criterios de aceptación:**
  - Edición completa de campos
  - Eliminación con reasignación automática a categoría "Sin categoría"
  - Prevención de eliminación de categorías del sistema
  - Estadísticas de uso antes de eliminar

---

## RF-005: Gestión de Transacciones

### RF-005.1: Registro Manual de Transacciones

- **Descripción:** Creación individual de movimientos financieros
- **Criterios de aceptación:**
  - Campos obligatorios: monto, fecha, cuenta, categoría
  - Campos opcionales: beneficiario, notas, adjuntos
  - Validación de monto > 0
  - Fecha no posterior a hoy
  - Actualización automática de balance de cuenta
  - Soporte para múltiples monedas con conversión

### RF-005.2: Edición y Eliminación de Transacciones

- **Descripción:** Modificación o anulación de transacciones registradas
- **Criterios de aceptación:**
  - Edición completa con recalculo de balance
  - Soft delete con confirmación
  - Registro de auditoría (quién y cuándo modificó)
  - Restricción de edición para transacciones >30 días (configurable)

### RF-005.3: Importación Masiva CSV

- **Descripción:** Carga de transacciones desde archivos CSV
- **Criterios de aceptación:**
  - Parser inteligente que detecta formato automáticamente
  - Mapeo de columnas CSV a campos del sistema
  - Preview de datos antes de importar
  - Validación de duplicados por fecha+monto+cuenta
  - Skip de transacciones inválidas con reporte de errores
  - Asignación manual de categorías durante importación
  - Soporte para formatos de bancos populares (presets)

### RF-005.4: Filtrado Avanzado

- **Descripción:** Búsqueda y filtrado de transacciones
- **Criterios de aceptación:**
  - Filtros por:
    - Rango de fechas (presets: hoy, semana, mes, año, personalizado)
    - Cuenta(s)
    - Categoría(s)
    - Tipo (ingreso/gasto)
    - Monto (rango)
    - Beneficiario
    - Texto en notas
  - Filtros combinables (AND/OR)
  - Guardado de filtros favoritos
  - Exportación de resultados filtrados (CSV/PDF)

### RF-005.5: Transacciones Recurrentes

- **Descripción:** Automatización de movimientos periódicos
- **Criterios de aceptación:**
  - Configuración de frecuencia (diaria, semanal, quincenal, mensual, anual)
  - Fecha de inicio y fin (opcional)
  - Generación automática vía cron job
  - Notificación antes de ejecutar
  - Edición/cancelación de serie completa o instancia individual

---

## RF-006: Gestión de Suscripciones

### RF-006.1: Registro de Suscripciones

- **Descripción:** Catálogo de servicios de suscripción activos
- **Criterios de aceptación:**
  - Campos: nombre servicio, monto, frecuencia de cobro, fecha próximo cobro, cuenta cargo
  - Logo/ícono del servicio (biblioteca de logos comunes)
  - Categorización automática
  - Detección inteligente desde transacciones recurrentes

### RF-006.2: Alertas de Renovación

- **Descripción:** Notificaciones previas a cobros de suscripción
- **Criterios de aceptación:**
  - Notificación 7 días antes del cobro
  - Email y notificación in-app
  - Resumen mensual de suscripciones totales

### RF-006.3: Cancelación Asistida

- **Descripción:** Facilitación del proceso de cancelación
- **Criterios de aceptación:**
  - Links directos a páginas de cancelación
  - Recordatorios de cancelación antes de fin de período de prueba
  - Instrucciones paso a paso por servicio
  - Marcado como "pendiente cancelación" con fecha límite

### RF-006.4: Análisis de Gasto en Suscripciones

- **Descripción:** Reporte de impacto financiero de suscripciones
- **Criterios de aceptación:**
  - Gasto total mensual/anual en suscripciones
  - Comparativa por categoría (streaming, productividad, fitness, etc.)
  - Identificación de suscripciones no utilizadas (sin actividad)
  - Recomendaciones de optimización

---

## RF-007: Escaneo y Procesamiento de Recibos

### RF-007.1: Captura de Recibos

- **Descripción:** Digitalización de tickets de compra
- **Criterios de aceptación:**
  - Captura desde cámara o galería
  - Soporte para formatos: JPG, PNG, PDF
  - Preview con recorte automático
  - Límite 10MB por archivo
  - Almacenamiento seguro en object storage (S3/R2)

### RF-007.2: Extracción OCR de Datos

- **Descripción:** Procesamiento automático de texto en recibos
- **Criterios de aceptación:**
  - Extracción de:
    - Fecha de compra
    - Nombre establecimiento
    - Total pagado
    - Lista de productos con precio individual
    - Método de pago
    - Impuestos
  - Confianza mínima de OCR: 80%
  - Validación y corrección manual disponible
  - Soporte para múltiples idiomas (EN/ES)

### RF-007.3: Desglose de Gastos por Producto

- **Descripción:** Detalle línea por línea de compras (especialmente groceries)
- **Criterios de aceptación:**
  - Tabla de productos escaneados con monto individual
  - Asignación de categoría específica por producto (lácteos, carnes, limpieza, etc.)
  - Vinculación con transacción principal
  - Estadísticas de gasto por tipo de producto
  - Trending de precios por producto a lo largo del tiempo

### RF-007.4: División de Gastos entre Usuarios

- **Descripción:** Reparto equitativo de compras compartidas
- **Criterios de aceptación:**
  - Invitación a otros usuarios de la app para compartir recibo
  - Asignación de productos a personas específicas
  - Cálculo automático de división equitativa o personalizada
  - Envío de solicitudes de pago (debt tracking)
  - Historial de deudas pendientes/saldadas
  - Notificaciones de recordatorio de pago

---

## RF-008: Presupuesto de Balance Cero (Zero-Based Budget)

### RF-008.1: Configuración de Presupuesto Mensual

- **Descripción:** Sistema de presupuesto donde cada dólar tiene un propósito asignado
- **Criterios de aceptación:**
  - Ingreso mensual total esperado como punto de partida
  - Asignación manual de fondos a categorías de gasto
  - Asignación a fondos de emergencia, ahorros, inversiones
  - Balance de asignaciones debe tender a $0 (ingreso total - total asignado = 0)
  - Alertas visuales si balance no es cero (dinero sin asignar o sobre-asignado)
  - Plantillas de presupuesto predefinidas (50/30/20, personalizado)

### RF-008.2: Categorías de Asignación

- **Descripción:** Organización de destinos de dinero en el presupuesto
- **Criterios de aceptación:**
  - Categorías principales:
    - Necesidades básicas (vivienda, comida, transporte, servicios)
    - Obligaciones financieras (deudas, pagos mínimos)
    - Ahorro/Inversión
    - Gastos discrecionales (entretenimiento, hobbies)
    - Fondos de emergencia
  - Subcategorías personalizables dentro de cada principal
  - Asignación de monto fijo o porcentaje del ingreso
  - Priorización de categorías (orden de asignación)

### RF-008.3: Balance de Asignaciones vs Real

- **Descripción:** Comparativa entre presupuesto planeado y gasto real
- **Criterios de aceptación:**
  - Vista de tres columnas: Asignado | Gastado | Restante
  - Cálculo automático de diferencial por categoría
  - Indicadores visuales (verde: dentro presupuesto, amarillo: cerca del límite, rojo: excedido)
  - Balance general: suma de todos los diferenciales (debe tender a 0)
  - Actualización en tiempo real conforme se registran transacciones
  - Reasignación dinámica de fondos entre categorías

### RF-008.4: Rollover de Presupuesto

- **Descripción:** Transferencia de fondos no utilizados al mes siguiente
- **Criterios de aceptación:**
  - Opción de rollover por categoría (activar/desactivar)
  - Fondos no gastados se suman al presupuesto del mes siguiente
  - Histórico de rollover acumulado por categoría
  - Límite máximo de acumulación configurable (opcional)
  - Opción de mover excedente a ahorros automáticamente

### RF-008.5: Ajuste de Presupuesto Mid-Cycle

- **Descripción:** Modificación de asignaciones durante el período activo
- **Criterios de aceptación:**
  - Reasignación de fondos no gastados entre categorías
  - Registro de cambios con timestamp y justificación
  - Mantener balance cero tras cada ajuste
  - Visualización de historial de ajustes
  - Sugerencias automáticas basadas en patrones de gasto

### RF-008.6: Reporte de Efectividad de Presupuesto

- **Descripción:** Análisis de cumplimiento del plan de gastos
- **Criterios de aceptación:**
  - Porcentaje de cumplimiento por categoría
  - Categorías más/menos adheridas al plan
  - Tendencia de mejora mes a mes
  - Recomendaciones de ajuste para próximo mes
  - Identificación de gastos imprevistos recurrentes

---

## RF-009: Gestión de Inversiones y Portafolio

### RF-009.1: Registro de Activos de Inversión

- **Descripción:** Catálogo de activos en portafolio (acciones, criptos, fondos)
- **Criterios de aceptación:**
  - Tipos soportados: acciones, ETFs, criptomonedas, bonos, fondos mutuos
  - Campos: símbolo/ticker, nombre, cantidad, precio promedio de compra, fecha de adquisición
  - Soporte para múltiples lotes de compra del mismo activo (FIFO/LIFO)
  - Categorización por tipo de activo y sector
  - Notas personalizadas por posición

### RF-009.2: Integración con APIs de Precios en Tiempo Real

- **Descripción:** Actualización automática de valores de mercado
- **Criterios de aceptación:**
  - **Acciones/ETFs:**
    - API: Alpha Vantage, Finnhub o Yahoo Finance
    - Actualización cada 15 minutos durante horario de mercado
    - Datos: precio actual, cambio diario ($, %), volumen, apertura/cierre
  - **Criptomonedas:**
    - API: CoinGecko o CoinMarketCap
    - Actualización cada 5 minutos (24/7)
    - Datos: precio USD, cambio 24h, market cap, volumen
  - Caché de precios para minimizar llamadas API
  - Fallback a precio manual si API falla
  - Rate limiting según límites de API gratuita

### RF-009.3: Cálculo de Performance de Portafolio

- **Descripción:** Métricas de rendimiento de inversiones
- **Criterios de aceptación:**
  - Por posición individual:
    - Valor actual de mercado
    - Ganancia/pérdida no realizada ($, %)
    - ROI desde compra
  - Consolidado total:
    - Valor total del portafolio
    - Ganancia/pérdida total
    - Distribución por tipo de activo (pie chart)
    - Distribución por sector/categoría
  - Métricas avanzadas:
    - Performance YTD, 1M, 3M, 6M, 1Y, All-Time
    - Comparativa con índices (S&P 500, Bitcoin)

### RF-009.4: Registro de Operaciones (Compra/Venta)

- **Descripción:** Historial de transacciones de inversión
- **Criterios de aceptación:**
  - Tipo de operación: compra, venta, dividendo, split
  - Campos: fecha, ticker, cantidad, precio unitario, comisiones, total
  - Cálculo automático de precio promedio (cost basis)
  - Vinculación con cuenta bancaria de origen/destino
  - Generación automática de transacción en cuenta principal
  - Soporte para fracciones de activos (crypto, acciones fraccionadas)

### RF-009.5: Tracking de Dividendos y Ganancias de Capital

- **Descripción:** Registro de ingresos pasivos de inversiones
- **Criterios de aceptación:**
  - Registro de dividendos recibidos (fecha, monto, ticker)
  - Calendario de próximos dividendos esperados
  - Cálculo de yield anualizado
  - Registro de ganancias/pérdidas realizadas en ventas
  - Reporte fiscal de dividendos y capital gains

### RF-009.6: Alertas de Precios

- **Descripción:** Notificaciones cuando activos alcanzan precios objetivo
- **Criterios de aceptación:**
  - Configuración de alertas por ticker:
    - Precio objetivo (alcista/bajista)
    - Cambio porcentual (±X% en Y tiempo)
    - Cruce de media móvil
  - Notificación vía email y in-app
  - Desactivación automática tras disparo (opcional)
  - Historial de alertas disparadas

### RF-009.7: Rebalanceo de Portafolio

- **Descripción:** Herramienta para mantener asignación objetivo
- **Criterios de aceptación:**
  - Definición de asignación objetivo (% por activo/categoría)
  - Comparación asignación actual vs objetivo
  - Sugerencias de compra/venta para rebalancear
  - Consideración de impactos fiscales (tax-loss harvesting)
  - Simulación de rebalanceo antes de ejecutar

---

## RF-010: Dashboard y Reportes

### RF-010.1: Panel Principal (Dashboard)

- **Descripción:** Vista resumida de estado financiero actual
- **Criterios de aceptación:**
  - **KPIs principales:**
    - Balance total (cuentas bancarias + inversiones)
    - Ingresos del período
    - Gastos del período
    - Ahorro neto
    - Tasa de ahorro (%)
    - Ingreso neto proyectado (mensual)
    - Net Worth (activos - pasivos)
  - **Gráficos:**
    - Evolución de balance (área)
    - Ingresos vs gastos (barras comparativas)
    - Distribución de gastos por categoría (pie/donut)
    - Tendencia de ahorro mensual
    - Performance de portafolio (línea temporal)
  - Período seleccionable (último mes, trimestre, año, personalizado)
  - Comparativa con período anterior (variación %)

### RF-010.2: Reporte de Presupuesto (Budget Report)

- **Descripción:** Estado del presupuesto de balance cero
- **Criterios de aceptación:**
  - Visualización de asignaciones vs gastos reales
  - Balance actual (debe ser $0)
  - Top categorías excedidas/bajo presupuesto
  - Proyección de fin de mes
  - Sugerencias de ajuste

### RF-010.3: Reporte de Gastos por Categoría

- **Descripción:** Análisis detallado de distribución de gastos
- **Criterios de aceptación:**
  - Top 5 categorías con mayor gasto
  - Porcentaje del total por categoría
  - Comparativa mes a mes
  - Identificación de categorías con crecimiento anómalo

### RF-010.4: Reporte de Ingresos

- **Descripción:** Desglose de fuentes de ingreso
- **Criterios de aceptación:**
  - Separación por tipo: salario, freelance, inversiones, dividendos, otros
  - Comparativa mensual/anual
  - Proyección de ingresos según histórico
  - Inclusión de ingreso neto calculado desde RF-002.7

### RF-010.5: Reporte de Impuestos Anuales

- **Descripción:** Asistente para declaración fiscal anual
- **Criterios de aceptación:**
  - Resumen de ingresos anuales totales
  - Deducciones aplicables identificadas
  - Impuestos estimados a pagar/devolver
  - Reporte de ganancias de capital e inversiones
  - Reporte de dividendos recibidos
  - Recomendaciones de optimización fiscal
  - Exportación de reporte completo en PDF
  - Integración con datos de RF-002.6

### RF-010.6: Reporte de Net Worth Evolution

- **Descripción:** Seguimiento de patrimonio neto a lo largo del tiempo
- **Criterios de aceptación:**
  - Cálculo: (Activos totales) - (Pasivos/Deudas)
  - Gráfico de evolución mensual/anual
  - Desglose de componentes (efectivo, inversiones, deudas)
  - Proyección futura basada en tendencia
  - Comparativa con objetivos de patrimonio

### RF-010.7: Exportación de Reportes

- **Descripción:** Generación de documentos para análisis externo
- **Criterios de aceptación:**
  - Formatos: PDF, Excel, CSV
  - Reportes disponibles:
    - Estado financiero completo
    - Histórico de transacciones
    - Análisis de categorías
    - Reporte fiscal
    - Reporte de horas trabajadas
    - Reporte de inversiones y performance
    - Reporte de presupuesto mensual
  - Personalización de período y filtros
  - Envío automático por email programado (opcional)

---

## RF-011: Notificaciones y Alertas

### RF-011.1: Notificaciones de Transacciones

- **Descripción:** Alertas de movimientos en cuentas
- **Criterios de aceptación:**
  - Notificación in-app y email para transacciones >umbral configurable
  - Resumen diario de transacciones
  - Confirmación de transacciones importadas

### RF-011.2: Alertas de Presupuesto

- **Descripción:** Avisos cuando se exceden límites de gasto
- **Criterios de aceptación:**
  - Alerta al alcanzar 80% del presupuesto por categoría
  - Alerta al exceder presupuesto
  - Alerta si balance de presupuesto no es cero
  - Recomendaciones de ajuste

### RF-011.3: Recordatorios de Pagos

- **Descripción:** Avisos de próximos vencimientos
- **Criterios de aceptación:**
  - Notificación 3 días antes de vencimiento de facturas recurrentes
  - Recordatorio de pagos pendientes entre usuarios (deudas)
  - Calendario de próximos pagos obligatorios

### RF-011.4: Notificaciones de Seguridad

- **Descripción:** Alertas de actividad sospechosa o cambios en cuenta
- **Criterios de aceptación:**
  - Nuevo inicio de sesión desde dispositivo desconocido
  - Cambio de contraseña exitoso
  - Múltiples intentos fallidos de login
  - Activación/desactivación de 2FA

### RF-011.5: Alertas de Inversiones

- **Descripción:** Notificaciones relacionadas con portafolio
- **Criterios de aceptación:**
  - Alertas de precios alcanzados (RF-009.6)
  - Notificación de dividendos recibidos
  - Alertas de desbalanceo de portafolio (>5% de objetivo)
  - Noticias importantes de activos en portafolio (opcional)

---

## RF-012: Configuración y Personalización

### RF-012.1: Preferencias de Usuario

- **Descripción:** Ajustes personalizados de la aplicación
- **Criterios de aceptación:**
  - Idioma (Español/Inglés) con cambio dinámico sin reload
  - Zona horaria
  - Formato de fecha (DD/MM/YYYY, MM/DD/YYYY)
  - Moneda principal
  - Tema (claro/oscuro/automático)

### RF-012.2: Configuración de Notificaciones

- **Descripción:** Control granular de alertas
- **Criterios de aceptación:**
  - Activar/desactivar por tipo de notificación
  - Canales: email, in-app, push (móvil)
  - Frecuencia de resúmenes (diario, semanal)
  - Horario de "no molestar"

### RF-012.3: Gestión de Privacidad

- **Descripción:** Control de datos personales y compartidos
- **Criterios de aceptación:**
  - Visibilidad de perfil en búsqueda de usuarios (para división de gastos)
  - Exportación completa de datos (GDPR compliance)
  - Eliminación definitiva de cuenta con período de gracia (30 días)

### RF-012.4: Backup y Restauración

- **Descripción:** Respaldo de información financiera
- **Criterios de aceptación:**
  - Backup automático diario
  - Exportación manual de backup completo (JSON cifrado)
  - Restauración desde archivo de backup
  - Sincronización multi-dispositivo

---

## Requisitos No Funcionales

### RNF-001: Performance

- Carga inicial < 2s (LCP)
- Respuesta de Server Actions < 500ms (p95)
- Optimistic updates en UI
- Edge runtime para rutas dinámicas
- Lazy loading de componentes pesados
- Virtualización de listas largas (TanStack Virtual)

### RNF-002: Seguridad

- Cifrado de datos sensibles en reposo (AES-256)
- HTTPS obligatorio con HSTS
- Headers de seguridad (CSP, X-Frame-Options, X-Content-Type-Options)
- Rate limiting en todos los endpoints
- Sanitización de inputs (XSS, SQL injection)
- Validación de schemas en cliente y servidor
- Tokens JWT con rotación
- API keys cifradas en variables de entorno

### RNF-003: Escalabilidad

- Arquitectura serverless-ready
- Database connection pooling (PgBouncer o Neon built-in)
- Caching estratégico (Vercel Edge Cache o Redis)
- CDN para assets estáticos (Vercel CDN)
- Optimización de queries con índices apropiados
- Paginación en listados (cursor-based)

### RNF-004: Accesibilidad

- WCAG 2.1 AA compliance
- Navegación completa por teclado
- Screen reader compatible (ARIA labels)
- Alto contraste disponible
- Focus visible en todos los elementos interactivos
- Textos alternativos en imágenes

### RNF-005: Testing

- Unit tests (Vitest) >80% coverage
- Integration tests (Playwright)
- E2E tests para flujos críticos:
  - Registro y autenticación
  - Creación de transacciones
  - Importación CSV
  - Cálculo de presupuesto
  - Actualización de precios de inversiones
- CI/CD con GitHub Actions
- Pruebas de carga (Artillery o k6)

### RNF-006: Monitoreo y Observabilidad

- Application Performance Monitoring (Sentry o similar)
- Logging estructurado
- Métricas de uso (PostHog, Plausible o Umami)
- Alertas de errores en producción
- Dashboard de salud del sistema

### RNF-007: Internacionalización

- Soporte completo para Español e Inglés
- Formato de números según locale (decimales, separadores)
- Formato de fechas según región
- Formato de moneda con símbolo apropiado
- Traducción de mensajes de error

---

## Modelo de Datos Propuesto (Drizzle Schema)

```typescript
// users
- id: uuid (PK)
- email: string (unique)
- password: string (hashed)
- name: string
- role: enum (admin, user)
- emailVerified: timestamp
- twoFactorEnabled: boolean
- language: enum (es, en)
- timezone: string
- currency: string
- createdAt: timestamp
- updatedAt: timestamp

// bank_accounts
- id: uuid (PK)
- userId: uuid (FK -> users)
- name: string
- type: enum (checking, savings, investment)
- bank: string
- currency: string
- initialBalance: bigint
- currentBalance: bigint
- icon: string
- color: string
- isActive: boolean
- createdAt: timestamp
- updatedAt: timestamp

// categories
- id: uuid (PK)
- userId: uuid (FK -> users)
- name: string
- type: enum (income, expense)
- icon: string
- color: string
- parentId: uuid (FK -> categories, nullable)
- isSystem: boolean
- createdAt: timestamp
- updatedAt: timestamp

// transactions
- id: uuid (PK)
- userId: uuid (FK -> users)
- accountId: uuid (FK -> bank_accounts)
- categoryId: uuid (FK -> categories)
- amount: bigint
- date: date
- payee: string (nullable)
- notes: text (nullable)
- isRecurring: boolean
- recurringId: uuid (FK -> recurring_transactions, nullable)
- createdAt: timestamp
- updatedAt: timestamp
- deletedAt: timestamp (nullable, soft delete)

// recurring_transactions
- id: uuid (PK)
- userId: uuid (FK -> users)
- accountId: uuid (FK -> bank_accounts)
- categoryId: uuid (FK -> categories)
- amount: bigint
- frequency: enum (daily, weekly, biweekly, monthly, yearly)
- startDate: date
- endDate: date (nullable)
- lastGenerated: date (nullable)
- isActive: boolean
- createdAt: timestamp
- updatedAt: timestamp

// subscriptions
- id: uuid (PK)
- userId: uuid (FK -> users)
- name: string
- amount: bigint
- frequency: enum (monthly, yearly)
- nextBillingDate: date
- accountId: uuid (FK -> bank_accounts)
- categoryId: uuid (FK -> categories)
- logo: string (nullable)
- cancelUrl: string (nullable)
- isActive: boolean
- createdAt: timestamp
- updatedAt: timestamp

// jobs
- id: uuid (PK)
- userId: uuid (FK -> users)
- company: string
- position: string
- startDate: date
- endDate: date (nullable)
- employmentType: enum (full_time, part_time, freelance)
- currentSalary: bigint
- salaryPeriod: enum (hourly, daily, biweekly, monthly, yearly)
- status: enum (active, inactive, ended)
- createdAt: timestamp
- updatedAt: timestamp

// salary_history
- id: uuid (PK)
- jobId: uuid (FK -> jobs)
- effectiveDate: date
- previousSalary: bigint
- newSalary: bigint
- percentageIncrease: decimal
- notes: text (nullable)
- createdAt: timestamp

// time_entries
- id: uuid (PK)
- userId: uuid (FK -> users)
- jobId: uuid (FK -> jobs)
- clockIn: timestamp
- clockOut: timestamp (nullable)
- totalHours: decimal (nullable)
- overtimeHours: decimal (nullable)
- notes: text (nullable)
- isApproved: boolean
- createdAt: timestamp
- updatedAt: timestamp

// vacation_balance
- id: uuid (PK)
- userId: uuid (FK -> users)
- jobId: uuid (FK -> jobs)
- accumulationRate: decimal
- currentBalance: decimal
- usedDays: decimal
- year: integer
- createdAt: timestamp
- updatedAt: timestamp

// vacation_requests
- id: uuid (PK)
- vacationBalanceId: uuid (FK -> vacation_balance)
- startDate: date
- endDate: date
- totalDays: decimal
- status: enum (pending, approved, rejected)
- createdAt: timestamp
- updatedAt: timestamp

// holidays
- id: uuid (PK)
- userId: uuid (FK -> users)
- name: string
- date: date
- type: enum (national, company)
- country: string
- createdAt: timestamp

// tax_forms
- id: uuid (PK)
- userId: uuid (FK -> users)
- year: integer
- filingStatus: enum (single, married, head_of_household)
- dependents: integer
- deductions: jsonb
- estimatedTax: bigint
- createdAt: timestamp
- updatedAt: timestamp

// budgets (Zero-Based Budget)
- id: uuid (PK)
- userId: uuid (FK -> users)
- month: date
- totalIncome: bigint
- totalAllocated: bigint
- balance: bigint (debe ser 0)
- createdAt: timestamp
- updatedAt: timestamp

// budget_allocations
- id: uuid (PK)
- budgetId: uuid (FK -> budgets)
- categoryId: uuid (FK -> categories)
- allocatedAmount: bigint
- spentAmount: bigint
- remainingAmount: bigint
- allowRollover: boolean
- priority: integer
- createdAt: timestamp
- updatedAt: timestamp

// budget_adjustments
- id: uuid (PK)
- budgetId: uuid (FK -> budgets)
- fromAllocationId: uuid (FK -> budget_allocations)
- toAllocationId: uuid (FK -> budget_allocations)
- amount: bigint
- reason: text
- createdAt: timestamp

// investments
- id: uuid (PK)
- userId: uuid (FK -> users)
- ticker: string
- name: string
- type: enum (stock, etf, crypto, bond, mutual_fund)
- quantity: decimal
- averageCostBasis: decimal
- currentPrice: decimal (actualizado vía API)
- sector: string (nullable)
- notes: text (nullable)
- createdAt: timestamp
- updatedAt: timestamp

// investment_transactions
- id: uuid (PK)
- investmentId: uuid (FK -> investments)
- userId: uuid (FK -> users)
- accountId: uuid (FK -> bank_accounts, nullable)
- type: enum (buy, sell, dividend, split)
- date: date
- quantity: decimal
- pricePerUnit: decimal
- commission: decimal
- totalAmount: decimal
- notes: text (nullable)
- createdAt: timestamp

// price_alerts
- id: uuid (PK)
- investmentId: uuid (FK -> investments)
- userId: uuid (FK -> users)
- targetPrice: decimal
- condition: enum (above, below)
- isActive: boolean
- triggeredAt: timestamp (nullable)
- createdAt: timestamp
- updatedAt: timestamp

// receipts
- id: uuid (PK)
- transactionId: uuid (FK -> transactions)
- userId: uuid (FK -> users)
- imageUrl: string
- ocrData: jsonb
- merchantName: string (nullable)
- totalAmount: bigint (nullable)
- purchaseDate: date (nullable)
- createdAt: timestamp

// receipt_items
- id: uuid (PK)
- receiptId: uuid (FK -> receipts)
- productName: string
- categoryId: uuid (FK -> categories, nullable)
- amount: bigint
- quantity: decimal
- unitPrice: decimal
- createdAt: timestamp

// shared_expenses
- id: uuid (PK)
- receiptId: uuid (FK -> receipts)
- createdByUserId: uuid (FK -> users)
- totalAmount: bigint
- splitType: enum (equal, custom)
- status: enum (pending, settled)
- createdAt: timestamp
- updatedAt: timestamp

// expense_shares
- id: uuid (PK)
- sharedExpenseId: uuid (FK -> shared_expenses)
- userId: uuid (FK -> users)
- amountOwed: bigint
- amountPaid: bigint
- status: enum (pending, paid)
- paidAt: timestamp (nullable)
- createdAt: timestamp

// notifications
- id: uuid (PK)
- userId: uuid (FK -> users)
- type: enum (transaction, budget, payment, security, investment)
- title: string
- message: text
- isRead: boolean
- createdAt: timestamp

// audit_logs
- id: uuid (PK)
- userId: uuid (FK -> users)
- action: string
- tableName: string
- recordId: uuid
- oldData: jsonb (nullable)
- newData: jsonb (nullable)
- ipAddress: string
- userAgent: string
- createdAt: timestamp
```

---

## Priorización de Desarrollo (Roadmap Sugerido)

### Fase 1: MVP Core (2-3 meses)

- RF-001: Autenticación completa con Better Auth
- RF-003: Gestión de cuentas bancarias
- RF-004: Gestión de categorías
- RF-005.1, 005.2: Transacciones manuales (CRUD básico)
- RF-010.1: Dashboard básico con KPIs esenciales
- RNF completos (seguridad, performance básica)

### Fase 2: Presupuesto & Análisis (1-2 meses)

- RF-008: Sistema de presupuesto de balance cero completo
- RF-005.4: Filtros avanzados
- RF-010.2, 010.3: Reportes de presupuesto y gastos
- RF-011.2: Alertas de presupuesto

### Fase 3: Automatización & Productividad (1-2 meses)

- RF-005.3: Importación CSV
- RF-005.5: Transacciones recurrentes
- RF-006: Gestión de suscripciones completa
- RF-011.1, 011.3: Notificaciones de transacciones y pagos

### Fase 4: Empleo & Nómina (2 meses)

- RF-002: Módulo completo de trabajos y nómina
- RF-002.7: Calculadora de ingreso neto
- RF-010.5: Reporte de impuestos
- Integración con presupuesto (ingresos proyectados)

### Fase 5: Inversiones (2 meses)

- RF-009: Módulo completo de inversiones
- Integración con APIs de precios
- RF-011.5: Alertas de inversiones
- RF-010.6: Reporte de Net Worth

### Fase 6: Recibos & Gastos Compartidos (1-2 meses)

- RF-007: Sistema OCR y procesamiento de recibos
- División de gastos entre usuarios
- Tracking de deudas

### Fase 7: Optimizaciones & Features Avanzadas (continuo)

- Mejoras de UX/UI
- Optimización de performance
- Testing exhaustivo
- Documentación
- Features adicionales según feedback

---

## Consideraciones Técnicas Adicionales

### Manejo de Precisión Financiera

```typescript
import Decimal from 'decimal.js'

// Configuración global
Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP })

// Almacenamiento en DB: BigInt (centavos)
// Ejemplo: $123.45 → 12345 (BigInt)

// Helper functions
export const dollarsToCents = (dollars: number): bigint => {
  return BigInt(new Decimal(dollars).times(100).toFixed(0))
}

export const centsToDollars = (cents: bigint): number => {
  return new Decimal(cents.toString()).div(100).toNumber()
}
```

### Rate Limiting de APIs de Inversiones

```typescript
// Límites típicos (tier gratuito):
// Alpha Vantage: 25 requests/día
// CoinGecko: 10-50 calls/minuto
// Finnhub: 60 calls/minuto

// Estrategia:
// - Cache de 15 minutos para acciones
// - Cache de 5 minutos para crypto
// - Batch requests cuando sea posible
// - Fallback a precios manuales si se excede límite
```

### Cron Jobs para Automatización

```typescript
// Vercel Cron o similar

// Diario a las 00:00 UTC
// - Generar transacciones recurrentes del día
// - Verificar alertas de suscripciones (7 días antes)
// - Backup automático de datos

// Cada 15 minutos (horario mercado USA: 9:30-16:00 EST)
// - Actualizar precios de acciones/ETFs

// Cada 5 minutos (24/7)
// - Actualizar precios de criptomonedas

// Mensualmente (día 1 a las 00:00)
// - Crear nuevo presupuesto base para el mes
// - Rollover de presupuestos no gastados
// - Generar reportes mensuales
```

---

¿Necesitas que desarrolle alguna sección adicional o que profundice en algún aspecto específico?
