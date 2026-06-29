"use client";

import type { Product } from "@/types";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/Button";

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-border-subtle rounded-card">
        <p className="text-heading-3 font-bold text-text-primary mb-2">
          Tidak ada produk
        </p>
        <p className="text-body text-text-muted mb-4">
          Coba kata kunci atau kategori lain
        </p>
        <Button variant="primary" size="md">
          Lihat Semua Produk
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
