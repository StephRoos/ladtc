"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteProduct } from "@/hooks/use-products";
import type { Product } from "@/types";

interface ProductTableProps {
  products: Product[];
  isLoading?: boolean;
}

/**
 * Products table for admin management with edit and delete actions.
 */
export function ProductTable({
  products,
  isLoading = false,
}: ProductTableProps): React.ReactNode {
  const deleteProduct = useDeleteProduct();

  if (isLoading) {
    return (
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((__, j) => (
                  <TableCell key={j}>
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-md border border-border p-8 text-center text-muted-foreground">
        Aucun produit trouvé.
      </div>
    );
  }

  async function handleDelete(id: string, name: string): Promise<void> {
    if (!confirm(`Supprimer le produit « ${name} » ?`)) return;
    await deleteProduct.mutateAsync(id);
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="relative h-10 w-10 overflow-hidden rounded bg-muted">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      —
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.price.toFixed(2)} €</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                {product.active ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border text-xs">
                    Actif
                  </Badge>
                ) : (
                  <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 border text-xs">
                    Inactif
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/products/${product.id}`}>Modifier</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(product.id, product.name)}
                    disabled={deleteProduct.isPending}
                  >
                    Supprimer
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
