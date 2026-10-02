# Maps React Application (`maps-react`)

Aplicación de gestión y visualización geoespacial desarrollada en React, Vite y Leaflet para el ecosistema KEUKEN UWS.

---

## 🗺️ Módulos y Modos de Operación

La aplicación implementa un patrón de estrategia (`strategy.ts`) para alternar dinámicamente entre distintos modos de trabajo:

1. **Seller Observer (`sellerObserver`)**:
   - Monitoreo en tiempo real de vendedores y puntos de venta.
   - Trazado de rutas, cálculo de distancias y visualización de órdenes.
   - Gestión y asignación de geozonas.

2. **Driver Observer (`driverObserver`)**:
   - Monitoreo y seguimiento de recorridos de choferes.
   - Línea de tiempo y animación de trayectos históricos (*snaking routes*).

3. **Planner (`planner`)**:
   - Planificación logística y distribución territorial.
   - Creación y edición de borradores (*drafts*), geozonas y carteras de clientes.

4. **Manager (`manager`)**:
   - Panel de administración y parametrización de motivos de no visita, exclusión de clientes y permisos.

5. **Configuration (`configuration`)**:
   - Configuración general de perfiles, temas y preferencias de usuario.

---

## 🛠️ Stack Tecnológico

- **Core:** React 18, React Router 7, TypeScript.
- **Build Tool:** Vite 7 + `@tailwindcss/vite` (Tailwind CSS v4).
- **Mapas & Canvas:** Leaflet 1.9, `leaflet-markers-canvas`, `leaflet-draw`, `leaflet-arrowheads`.
- **Componentes UI:** `@repo/ui`, DevExtreme React (`@repo/devextreme`).
- **Estado Global:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`).
- **Formularios & Validación:** React Hook Form + Yup.
- **Peticiones HTTP:** Axios con control de concurrencia (`p-limit`) y abort controllers.

---

## 🚀 Puesta en Marcha

### Requisitos previos
Instalar dependencias desde la raíz del monorepo:
```bash
pnpm install
```

### Variables de Entorno
Crea un archivo `.env` en la raíz de `apps/maps-react` tomando como base `.env.example`:
```env
VITE_API_URL=http://dev.epekuen.com.ar:9001
VITE_PROXY_URL=http://dev.epekuen.com.ar:9001
```

### Scripts Disponibles

| Comando | Descripción |
| :--- | :--- |
| `pnpm --filter maps-react dev` | Inicia el servidor de desarrollo local con HMR. |
| `pnpm --filter maps-react build` | Compila TypeScript y genera el bundle optimizado para producción en `dist/`. |
| `pnpm --filter maps-react lint` | Ejecuta ESLint para analizar errores de código y estilo. |
| `pnpm --filter maps-react preview` | Previsualiza localmente el build de producción. |
