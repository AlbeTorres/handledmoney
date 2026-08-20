# 🔍 Auditoría del Dashboard — Contra Patrones del Repo

Análisis actualizado comparando el código del dashboard contra las convenciones y mecanismos **ya existentes** en el repositorio.

---

## Resumen Ejecutivo

| Severidad | Cantidad | Descripción |
|-----------|----------|-------------|
| 🔴 Crítico | 8 | Ignora mecanismos existentes, rompe escala, leak de datos |
| 🟠 Alto | 8 | Viola patrones, SRP, rendimiento |
| 🟡 Medio | 7 | Duplicación, inconsistencia, mantenibilidad |
| 🔵 Bajo | 5 | Code smell, convenciones |

---

## 🔴 PROBLEMAS CRÍTICOS

### C1. Suma transacciones para calcular balance cuando `bankAccountsTable.balance` ya lo tiene
**Archivo:** [`finance-data.ts`](file:///d:/Work/Proyects/handledmoney/src/lib/finance-data.ts#L148-L175)

**El repo ya resuelve esto:** Tu schema en [`db/schema.ts:160`](file:///d:/Work/Proyects/handledmoney/src/db/schema.ts#L160) define:
```typescript
balance: numeric('balance', { precision: 10, scale: 2 }).default('0').notNull(),
transactionsCount: integer('transactions_count').default(0).notNull(),
```

Y en [`transaction.ts:47-55`](file:///d:/Work/Proyects/handledmoney/src/repository/transaction.ts#L47-L55), **cada** `createTransaction`, `updateTransaction`, `deleteTransaction` y `createTransactionsBulk` actualiza atómicamente `bankAccountsTable.balance` con SQL:
```typescript
balance: sql`${bankAccountsTable.balance} ${sql.raw(sign)} ${String(amount)}`
```

**Lo que hace el dashboard:** Ignora `balance` por completo. Trae TODAS las transacciones del período y las suma en JavaScript. El campo `balance` de la cuenta se lee en [`mapAccounts`](file:///d:/Work/Proyects/handledmoney/src/lib/finance-data.ts#L148-L175) pero solo para mostrar el saldo de la cuenta, **no** para los KPIs del dashboard. La lógica del dashboard está recalculando totales que la DB ya tiene pre-computados.

**Impacto:** Carga miles de transacciones innecesariamente. El balance ya está disponible en la tabla `bank_account` sin costo.

---

### C2. Fetch de TODAS las transacciones sin selección de columnas
**Archivo:** [`repository/dashboard.ts:29-36`](file:///d:/Work/Proyects/handledmoney/src/repository/dashboard.ts#L29-L36)

**El repo ya sabe hacer select parcial.** En [`transaction.ts:228-239`](file:///d:/Work/Proyects/handledmoney/src/repository/transaction.ts#L228-L239):
```typescript
// Tu patrón existente — select solo lo necesario:
const transactions = await db.select({
  id: transactionsTable.id,
  amount: transactionsTable.amount,
  payee: transactionsTable.payee,
  // ...solo campos necesarios
}).from(transactionsTable)
```

**Lo que hace el dashboard:**
```typescript
// Trae TODAS las columnas: id, amount, payee, notes, date, accountId, 
// categoryId, type, userId, createdAt, updatedAt, deletedAt
db.query.transactionsTable.findMany({ where: ... })
```

De esas columnas, `buildDashboardViewModel` solo necesita: `categoryId`, `type`, `amount`, `date`. Está trayendo 8 columnas extra por cada transacción.

**Peor aún:** Para el dashboard, ni siquiera necesita rows individuales. La query correcta sería:
```sql
SELECT category_id, type, SUM(amount::numeric) as total
FROM transaction
WHERE user_id = $1 AND date >= $2 AND date < $3
GROUP BY category_id, type
```

Esto convertiría miles de rows en unas pocas decenas.

---

### C3. No reutiliza `getBankAccountsByUser` ni `getCategoriesByUserId`
**Archivo:** [`repository/dashboard.ts:19-37`](file:///d:/Work/Proyects/handledmoney/src/repository/dashboard.ts#L19-L37)

**Funciones existentes que ignora:**

| Ya existe en el repo | Lo que hace el dashboard |
|---|---|
| [`getBankAccountsByUser(userId)`](file:///d:/Work/Proyects/handledmoney/src/repository/account.ts#L37-L48) — filtra `deletedAt IS NULL` | Duplica la misma query inline |
| [`getCategoriesByUserId(userId)`](file:///d:/Work/Proyects/handledmoney/src/repository/categories.ts#L8-L23) — filtra `archivedAt IS NULL` y ordena por `order` | Hace `findMany({ where: eq(userId) })` **sin filtrar archivedAt** |
| [`getCurrentBudget(userId)`](file:///d:/Work/Proyects/handledmoney/src/repository/budget.ts#L139-L140) | Duplica la query a `currentBudgetsTable` |
| [`getBudgetById(id, userId)`](file:///d:/Work/Proyects/handledmoney/src/repository/budget.ts#L84-L88) — con `with: { groups: { orderBy, with: { items: { with: { category } } } } }` | Duplica pero **sin el orderBy** y **sin la relación category** |

**El más grave:** Las categorías archivadas (`archivedAt IS NOT NULL`) se muestran en el dashboard porque no se filtra. Tu repo de categorías ya maneja esto.

---

### C4. `console.log(snapshot)` — leak de datos financieros en producción
**Archivo:** [`get-dashboard.ts:26`](file:///d:/Work/Proyects/handledmoney/src/actions/dashboard/get-dashboard.ts#L26)

```typescript
console.log(snapshot)
```

**Tu patrón existente** usa `console.error` solo para errores (ej: [`account.ts:33`](file:///d:/Work/Proyects/handledmoney/src/repository/account.ts#L33): `console.error('Error creating account:', error)`). El dashboard logea **datos de negocio completos** (transacciones, balances, categorías) en cada request.

**Impacto:** Datos financieros sensibles en logs de producción. Con usuarios activos = gigabytes de logs innecesarios.

---

### C5. Parsing de searchParams sin usar `parseDashboardPeriod`
**Archivo:** [`page.tsx:14-16`](file:///d:/Work/Proyects/handledmoney/src/app/(financeapp)/dashboard/page.tsx#L14-L16)

```typescript
const selectedmode = (mode as 'monthly' | 'annual') ?? 'monthly'
const selectedyear = year !== undefined ? Number(year) : new Date().getFullYear()
const selectedmonth = month !== undefined ? Number(month) : new Date().getMonth()
```

**Ya existe la solución en el mismo codebase:** [`parseDashboardPeriod`](file:///d:/Work/Proyects/handledmoney/src/lib/finance-data.ts#L347-L364) fue escrito exactamente para esto, con validación regex de año, validación de rango de mes, y fallback seguro al mes actual.

**Problemas concretos:**
1. `mode as 'monthly' | 'annual'` — cast de TypeScript que no valida en runtime. `?mode=exploit` pasa sin error.
2. `Number('abc')` → `NaN` → `Date.UTC(NaN, ...)` → `Invalid Date` → query devuelve 0 rows silenciosamente
3. `Number('99')` como month → `Date.UTC(2024, 99, 1)` → fecha en 2032, query absurda
4. `new Date().getFullYear()` / `getMonth()` usa hora **local** del servidor, pero `utcRange()` usa `Date.UTC` → inconsistencia de timezone

---

### C6. La action del dashboard NO sigue el patrón de respuesta del repo
**Archivo:** [`get-dashboard.ts`](file:///d:/Work/Proyects/handledmoney/src/actions/dashboard/get-dashboard.ts)

**Tu patrón de actions:**
```typescript
// Patrón estándar en tu repo (get-account.ts, create-transaction.ts, etc.):
return { success: true, status: 200, message: 'Fetched', data: result }
return { success: false, status: 401, message: 'Unauthorized', data: null }
return { success: false, status: 500, message: 'Error', data: null }
```

**Lo que hace el dashboard:**
```typescript
return { ok: true, data: viewModel }
return { ok: false, code: 'UNAUTHENTICATED' }
```

Usa `ok`/`code` en lugar de `success`/`status`/`message`. Rompe la consistencia de la API y hace que cualquier error handler genérico no funcione con este endpoint.

---

### C7. El action no llama `revalidatePath` (inconsistente pero no necesariamente malo)

**Tu patrón de actions para mutación:** Todos los actions que cambian datos llaman `revalidatePath`:
- [`create-transaction.ts:46`](file:///d:/Work/Proyects/handledmoney/src/actions/transaction/create-transaction.ts#L46): `revalidatePath('/transaction')`
- Y así con cada create/update/delete

Esto es correcto: el dashboard es un read, no necesita `revalidatePath`. **Pero** como tampoco usa `unstable_cache` ni ningún mecanismo de cache, cada visita ejecuta 5+ queries desde cero. Tu repo no tiene Redis ni cache layer todavía.

---

### C8. `finance-data.ts` es un archivo monolito de 365 líneas con múltiples responsabilidades
**Archivo:** [`finance-data.ts`](file:///d:/Work/Proyects/handledmoney/src/lib/finance-data.ts)

**Responsabilidades mezcladas en un solo archivo:**
1. **Definición de 10+ tipos** (lines 4-92) — deberían estar en un archivo de tipos o interfaces
2. **Parsing/validación de período** (lines 333-364) — lógica de URL/input parsing
3. **Formateo de moneda** (`formatCurrency`, line 139) — duplica `formatMoney` de [`utils.ts`](file:///d:/Work/Proyects/handledmoney/src/lib/utils.ts#L16-L31)
4. **Transformación de datos** (`buildDashboardViewModel`, line 177) — 150+ líneas de lógica de negocio
5. **Helper functions** (`finiteNumber`, `categoryStatus`, `toCategoryRow`, `mapAccounts`)

**Tu convención:** Tipos van en interfaces o en el propio schema. Utils sueltas van en `utils.ts`. El archivo `finance-data.ts` no sigue ninguna de estas convenciones.

---

## 🟠 PROBLEMAS ALTOS

### A1. `buildDashboardViewModel` — función de 155 líneas con SRP violado
**Archivo:** [`finance-data.ts:177-331`](file:///d:/Work/Proyects/handledmoney/src/lib/finance-data.ts#L177-L331)

Esta función hace **todo a la vez:**
1. Filtrar transacciones por fecha (debería ser responsabilidad del repo/query)
2. Agregar totales por categoría (debería ser SQL)
3. Detectar transacciones sin categoría
4. Construir grupos planificados vs reales
5. Detectar grupos/categorías no planificados
6. Calcular KPIs (income, expense, net, available)
7. Generar datos de gráfica de tendencia mensual
8. Generar datos de gráfica budget vs actual
9. Generar datos de gráfica expense by group
10. Mapear cuentas y calcular balance agregado
11. Generar flags de estado vacío

**Tu patrón en el repo:** [`getBudgetWithActuals`](file:///d:/Work/Proyects/handledmoney/src/repository/budget.ts#L90-L115) y [`getCurrentBudgetComparison`](file:///d:/Work/Proyects/handledmoney/src/repository/budget.ts#L147-L236) hacen transformaciones similares pero en el repository, más cerca de la data, y cada función tiene una responsabilidad clara.

---

### A2. Doble query secuencial para budget (waterfall)
**Archivo:** [`repository/dashboard.ts:38-43`](file:///d:/Work/Proyects/handledmoney/src/repository/dashboard.ts#L38-L43)

```typescript
// Primero: 4 queries en paralelo
const [selection, categories, accounts, transactions] = await Promise.all([...])
// Después: 1 query secuencial que espera a que las 4 terminen
const budget = selection?.budgetId ? await db.query.budgetsTable.findFirst({...}) : null
```

Ya existe [`getBudgetById(id, userId)`](file:///d:/Work/Proyects/handledmoney/src/repository/budget.ts#L84-L88) que hace exactamente esta query. Debería usar esa función Y paralelizarla mejor — el budget se podría obtener en paralelo si se restructura.

---

### A3. Procesamiento O(n²) para categorías no planificadas
**Archivo:** [`finance-data.ts:236-238`](file:///d:/Work/Proyects/handledmoney/src/lib/finance-data.ts#L236-L238)

```typescript
const kind = category?.type ??
  transactions.find(t => t.categoryId === categoryId)?.type
```

Para cada categoría sin plan, busca linealmente en TODAS las transacciones. Con 100 categorías y 10,000 transacciones = 1,000,000 iteraciones.

Tu propio repo resuelve esto con Maps: [`getCurrentBudgetComparison`](file:///d:/Work/Proyects/handledmoney/src/repository/budget.ts#L176-L185) construye `actualByCategory` como `Map` y hace lookups O(1).

---

### A4. Triple iteración sobre transacciones para monthly trend
**Archivo:** [`finance-data.ts:291-307`](file:///d:/Work/Proyects/handledmoney/src/lib/finance-data.ts#L291-L307)

En modo anual: 12 meses × 3 iteraciones (filter por mes, filter income, filter expense) = O(36n). Debería ser un solo loop que agrupa por `(mes, tipo)`.

---

### A5. `formatCurrency` hardcodea USD cuando el repo soporta multi-currency
**Archivo:** [`finance-data.ts:141`](file:///d:/Work/Proyects/handledmoney/src/lib/finance-data.ts#L141)

```typescript
new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
```

Tu schema: [`bankAccountsTable.currency`](file:///d:/Work/Proyects/handledmoney/src/db/schema.ts#L159) = `varchar('currency').default('USD')`. Los usuarios pueden tener cuentas en EUR, MXN, etc.

Ya existe [`formatMoney(amount, currency)`](file:///d:/Work/Proyects/handledmoney/src/lib/utils.ts#L16-L31) en `utils.ts` que acepta el código de moneda. `formatCurrency` en `finance-data.ts` es una versión peor de una función que ya existe.

---

### A6. Categorías archivadas se incluyen en el dashboard
**Archivo:** [`repository/dashboard.ts:23-25`](file:///d:/Work/Proyects/handledmoney/src/repository/dashboard.ts#L23-L25)

```typescript
db.query.categoriesTable.findMany({
  where: eq(categoriesTable.userId, userId),
  // ⚠️ No filtra archivedAt
})
```

Tu patrón en [`categories.ts:10-12`](file:///d:/Work/Proyects/handledmoney/src/repository/categories.ts#L10-L12):
```typescript
// Tu convención existente:
sql`${categoriesTable.archivedAt} IS NULL`
```

Las categorías archivadas aparecerán en el dashboard cuando no deberían.

---

### A7. Error handling silencioso — catch sin logging
**Archivo:** [`get-dashboard.ts:28-29`](file:///d:/Work/Proyects/handledmoney/src/actions/dashboard/get-dashboard.ts#L28-L29)

```typescript
} catch {
  return { ok: false, code: 'UNAVAILABLE' }
}
```

**Tu patrón:** Cada catch en el repo logea con `console.error('Error doing X:', error)`:
- [`account.ts:33`](file:///d:/Work/Proyects/handledmoney/src/repository/account.ts#L33), [`account.ts:47`](file:///d:/Work/Proyects/handledmoney/src/repository/account.ts#L47), [`transaction.ts:100`](file:///d:/Work/Proyects/handledmoney/src/repository/transaction.ts#L100), [`categories.ts:21`](file:///d:/Work/Proyects/handledmoney/src/repository/categories.ts#L21)

El dashboard atrapa el error y **no logea nada**. Imposible debuggear.

---

### A8. El `available` KPI es idéntico a `netPlanned` — probablemente un bug
**Archivo:** [`finance-data.ts:287-289`](file:///d:/Work/Proyects/handledmoney/src/lib/finance-data.ts#L287-L289)

```typescript
netPlanned: incomePlanned - expensePlanned,  // línea 287
netActual: incomeActual - expenseActual,      // línea 288
available: incomePlanned - expensePlanned,    // línea 289 ← IDÉNTICO a netPlanned
```

Si `available` significa "cuánto queda disponible para gastar", debería ser `incomePlanned - expenseActual` (presupuesto menos lo ya gastado). Tal como está, es un campo redundante.

---

## 🟡 PROBLEMAS MEDIOS

### M1. DashboardPeriod exportado dos veces
**Archivos:** [`finance-data.ts:4`](file:///d:/Work/Proyects/handledmoney/src/lib/finance-data.ts#L4) y [`schema.ts:360`](file:///d:/Work/Proyects/handledmoney/src/lib/schema.ts#L360)

Ambos archivos exportan `type DashboardPeriod = z.infer<typeof DashboardPeriodSchema>`. Los importadores usan diferentes fuentes. Una sola fuente de verdad (schema.ts) es suficiente.

### M2. Dos funciones de formateo de moneda
[`formatCurrency`](file:///d:/Work/Proyects/handledmoney/src/lib/finance-data.ts#L139-L146) (finance-data.ts) vs [`formatMoney`](file:///d:/Work/Proyects/handledmoney/src/lib/utils.ts#L16-L31) (utils.ts). APIs diferentes, bugs independientes. Solo debería existir la de utils.ts.

### M3. `fmtDate` usa timezone local del servidor
**Archivo:** [`utils.ts:33-40`](file:///d:/Work/Proyects/handledmoney/src/lib/utils.ts#L33-L40)

No especifica `timeZone: 'UTC'` mientras que todas las queries de fecha usan `Date.UTC`. Una transacción del "31 de enero UTC" puede mostrarse como "30 de enero" según la timezone del servidor.

### M4. Mezcla de español e inglés en propiedades del ViewModel
**Archivo:** [`finance-data.ts:86-87`](file:///d:/Work/Proyects/handledmoney/src/lib/finance-data.ts#L86-L87)

```typescript
budgetVsActual: Array<{ label: string; estimado: number; real: number }>
monthlyTrend: Array<{ label: string; ingreso: number; gasto: number }>
```

`estimado`, `real`, `ingreso`, `gasto` en español mientras todo el codebase usa inglés.

### M5. Tipos union `string | number | null` sin normalización en boundary
**Archivo:** [`finance-data.ts:61,70`](file:///d:/Work/Proyects/handledmoney/src/lib/finance-data.ts#L61)

```typescript
plannedAmount: string | number | null
amount: string | number | null
```

En tu repo, la conversión se hace en el boundary: [`transaction.ts:40`](file:///d:/Work/Proyects/handledmoney/src/repository/transaction.ts#L40) hace `amount: String(amount)` al escribir, y `parseFloat(existing.amount ?? '0')` al leer. El snapshot debería normalizar a `number` en el repository, no forzar a `finiteNumber()` en 12+ lugares del código de presentación.

### M6. `getIconComponent` hace búsqueda lineal O(n) por call
**Archivo:** [`utils.ts:42-45`](file:///d:/Work/Proyects/handledmoney/src/lib/utils.ts#L42-L45)

```typescript
const iconData = ICONS.find(i => i.name === (iconName || 'account_balance'))
```

Debería ser un `Map<string, Icon>` inicializado una vez.

### M7. No hay ningún mecanismo de caching en el dashboard
Cada visita = 5+ queries a DB + procesamiento JS pesado. El repo no tiene Redis ni `unstable_cache`. Los dashboards son candidatos ideales para cache de corta duración (30-60 segundos) porque los datos no cambian en cada request.

---

## 🔵 PROBLEMAS BAJOS

### B1. Variables sin camelCase en page.tsx
`selectedmode`, `selectedyear`, `selectedmonth` → deberían ser `selectedMode`, `selectedYear`, `selectedMonth`.

### B2. Period no viaja junto al snapshot
El `period` se pasa como parámetro separado a `buildDashboardViewModel` en lugar de incluirlo en `DashboardSnapshot`. Context splitting.

### B3. `utcRange` no protege contra `month === undefined` en modo monthly
Cae silenciosamente a month 0 (enero).

### B4. Error de la page no distingue tipos de error
`UNAUTHENTICATED` debería redirigir a login, no mostrar "No se pudieron cargar los datos".

### B5. Texto de error hardcodeado en español sin i18n
Tu repo tiene estructura de i18n en [`lib/i18n/`](file:///d:/Work/Proyects/handledmoney/src/lib/i18n) pero el error del dashboard está hardcodeado.

---

## 📊 Resumen de Violaciones por Patrón del Repo

| Patrón establecido en tu repo | Lo que hace el dashboard |
|---|---|
| `bankAccountsTable.balance` se mantiene atómicamente | Ignora balance, suma transacciones en JS |
| Select parcial con `.select({...})` | `findMany()` sin `.columns()` — trae todo |
| Funciones de repo reutilizables (`getBankAccountsByUser`, etc.) | Duplica queries inline |
| `archivedAt IS NULL` para categorías | No filtra — muestra categorías archivadas |
| Tipos en `schema.ts` o interfaces | Re-exporta tipos y crea 10+ tipos locales |
| Funciones de formateo en `utils.ts` | Crea `formatCurrency` aparte |
| `{ success, status, message, data }` response shape | `{ ok, code }` response shape |
| `console.error` solo para errores | `console.log` de datos de negocio |
| `parseDashboardPeriod` para validar input | Cast inline sin validación |
| `revalidatePath` + queries directas | Server Action como wrapper de read |

---

## 🎯 Prioridades de Corrección

| Prioridad | Issues | Esfuerzo | Resultado |
|-----------|--------|----------|-----------|
| **P0 — Hoy** | C4 (console.log), C5 (usar parseDashboardPeriod), A7 (logear errors) | ~30 min | Seguridad + debugging |
| **P1 — Esta semana** | C3 (reusar repos existentes), C2 (SQL aggregation), A6 (filtrar archivedAt), C6 (response shape) | ~3h | Correctitud + patrones |
| **P2 — Sprint** | C1 (usar balance en vez de sumar txns), C8 (partir finance-data.ts), A1-A4 (SRP + O(n²)) | ~6h | Rendimiento + mantenibilidad |
| **P3 — Backlog** | M2 (unificar formateo), M7 (caching), A5 (multi-currency) | ~4h | Escalabilidad |

> [!IMPORTANT]
> El punto más importante: **el dashboard ignora que tu repo ya mantiene `bankAccountsTable.balance` actualizado atómicamente.** Toda la lógica de traer transacciones y sumarlas es innecesaria para los totales de cuentas. Para los KPIs del budget, deberías usar SQL `GROUP BY` y traer solo los totales agregados, no las transacciones individuales.
