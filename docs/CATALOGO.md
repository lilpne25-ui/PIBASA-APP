# Catalogo tecnico — modelo de dominio (Atomo 2)

## Modelo
```
SteelFamily 1─* SteelGrade 1─* SteelVariant
                    │  ├─* GradeEquivalence  (DIN/W.Nr, JIS, UNS, AISI...)
                    │  └─* GradeApplication *─1 UsageApplication
```
- **SteelGrade**: designacion comercial (`D2`, `H13`, `1045`), `slug`, familia, densidad (g/cm3, para peso teorico), dureza (HB recocido, HRC de trabajo), calificaciones relativas 1-5 (desgaste, tenacidad, maquinabilidad), notas de tratamiento termico y `chemicalComposition` (JSONB).
- **SteelVariant**: medida estandar suministrable = grado + forma (`PLATE`, `ROUND_BAR`, `SQUARE_BAR`, `FLAT_BAR`, `TUBE`) + condicion (`HOT_ROLLED`, `COLD_DRAWN`, `GROUND`, `ANNEALED`) + dimensiones en **mm** (`Decimal`). `dimensionKey` (unico) lo genera el dominio para evitar duplicados con columnas NULL.
- **Sin precios**: la lista de precios y el calculo de la cotizacion son del Atomo 4.
- **JSONB** solo en `chemicalComposition` (varia por grado, no se consulta por elemento). Todo lo demas es relacional.

## Dominio puro (`src/domain/catalog/shapes.ts`)
Validacion de dimensiones por forma, `dimensionKey`, `crossSectionAreaMm2`, `theoreticalWeightKg`, `weightPerMeterKg`, `inchToMm`, `dimensionLabel`. Peso teorico = area (mm2) x largo (mm) / 1e6 x densidad. Es teorico: la tolerancia real cambia el peso.

## Datos de ejemplo
Todo lo cargado por `npm run db:seed:catalog` lleva `dataSource = EXAMPLE`: valores tipicos de referencia, **no son datos de Pibasa** ni fichas de un fabricante (equivalencias, dureza, composicion, densidad y el surtido de medidas se deben validar). La carga es idempotente y **no sobreescribe** grados marcados `VERIFIED`. La UI (Atomo 3) debe mostrar un aviso mientras el dato sea `EXAMPLE`.
Para pasar a datos reales: Pibasa entrega su lista de grados/medidas; se cargan como `VERIFIED` (via panel admin, Atomo 9, o un seed de importacion).

## API (autenticada; el catalogo publico se decide en el Atomo 3)
- `GET /api/catalog/grades?family=&shape=&q=` (permiso `catalog.view`; `q` busca en codigo, nombre y equivalencias).
- `GET /api/catalog/grades/:slug` — detalle con equivalencias, aplicaciones, composicion y medidas con peso por metro.
- Escritura: reservada a `catalog.edit` (sin endpoints todavia; Atomo 9).

## Catalogo publico (Atomo 3)
- Paginas SSR sin login: `/catalogo` (listado, filtros por familia, forma y busqueda por codigo/nombre/equivalencia) y `/catalogo/[slug]` (propiedades, composicion, equivalencias, aplicaciones y medidas con kg/m).
- Usan el **DTO publico** (`PublicGradeCard` / `PublicGradeSheet`), nunca el modelo interno. Sin precios.
- Aviso "Datos de ejemplo" visible mientras `dataSource = EXAMPLE`; ademas `noindex` y sitemap vacio hasta verificar.
- CTA "Solicitar cotizacion": placeholder hacia WhatsApp (`NEXT_PUBLIC_WHATSAPP_NUMBER`) hasta que exista el cotizador (Atomo 4+).
- Detalle de seguridad: `docs/SEGURIDAD-ATOMO3.md`.
