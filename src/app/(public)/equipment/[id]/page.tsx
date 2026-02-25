import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import { ProductDetail } from "./ProductDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { name: true, description: true },
    });

    const title = product?.name || "Produit";
    const description = product?.description || siteConfig.description;

    return {
      title: `${title} | ${siteConfig.name}`,
      description,
      openGraph: {
        title: `${title} | ${siteConfig.name}`,
        description,
        url: `${siteConfig.url}/equipment/${id}`,
        siteName: siteConfig.fullName,
        type: "website",
        images: [
          {
            url: siteConfig.ogImage,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
    };
  } catch {
    return {
      title: `Produit | ${siteConfig.name}`,
      description: siteConfig.description,
    };
  }
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
