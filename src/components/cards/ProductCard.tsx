import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

/**
 * Product card component — displays image, name, price, and a "Voir" button.
 */
export function ProductCard({ product }: ProductCardProps): React.ReactNode {
  return (
    <Link href={`/equipment/${product.id}`} className="group block">
      <Card className="h-full overflow-hidden border-border bg-card transition-all duration-200 group-hover:border-primary/40">
        {/* Product image */}
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-muted-foreground"
              >
                <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </div>
          )}
        </div>

        <CardHeader className="pb-2">
          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </CardHeader>

        <CardContent className="flex items-center justify-between">
          <p className="text-xl font-semibold text-primary">
            {product.price.toFixed(2)} €
          </p>
          <Button size="sm" variant="ghost">
            Voir
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
