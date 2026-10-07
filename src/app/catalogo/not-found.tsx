import Link from "next/link";

export default function CatalogNotFound() {
  return (
    <main className="py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Ese grado no esta en el catalogo</h1>
      <p className="mt-3 text-steel-300">Revisa el codigo o busca por equivalencia (por ejemplo 1.2344 o SKD11).</p>
      <Link href="/catalogo" className="btn btn-primary mt-8">
        Ver el catalogo
      </Link>
    </main>
  );
}
