import type { Metadata } from "next";
import { ProductDetail } from "./ProductDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Produit — LADTC`,
    description: `Détail du produit ${id}`,
  };
}

/**
 * Public product detail page with size selector, quantity, and add-to-cart button.
 */
export default async function ProductDetailPage({ params }: Props): Promise<React.ReactNode> {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <ProductDetail id={id} />
    </div>
  );
}
