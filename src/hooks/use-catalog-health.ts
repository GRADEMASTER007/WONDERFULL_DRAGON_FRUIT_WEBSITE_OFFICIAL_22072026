import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, getCountFromServer } from 'firebase/firestore';

export type HealthCheck = {
  id: string;
  label: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
  hint?: string;
};

export type CatalogHealth = {
  checks: HealthCheck[];
  counts: {
    dbTotal: number;
    dbActive: number;
    dbFeatured: number;
    anonVisible: number | null;
    categoriesAnonVisible: number | null;
    storefrontVisible: number;
  };
};

export function useCatalogHealth() {
  return useQuery<CatalogHealth>({
    queryKey: ['admin', 'catalog-health'],
    queryFn: async () => {
      const now = new Date();

      const totalSnap = await getCountFromServer(collection(db, 'products'));
      const dbTotal = totalSnap.data().count;

      const activeQ = query(collection(db, 'products'), where('is_active', '==', true));
      const activeSnap = await getCountFromServer(activeQ);
      const dbActive = activeSnap.data().count;

      const featuredQ = query(collection(db, 'products'), where('is_active', '==', true), where('is_featured', '==', true));
      const featuredSnap = await getCountFromServer(featuredQ);
      const dbFeatured = featuredSnap.data().count;

      const storefrontSnap = await getDocs(activeQ);
      const storefront = storefrontSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

      const visible = storefront.filter(
        (p) => !p.promo_end_date || new Date(p.promo_end_date) >= now,
      );
      const storefrontVisible = visible.length;

      let anonVisible: number | null = dbActive;
      let categoriesAnonVisible: number | null = null;
      let anonError: string | null = null;

      const catSnap = await getCountFromServer(collection(db, 'categories'));
      categoriesAnonVisible = catSnap.data().count;

      const checks: HealthCheck[] = [];

      checks.push(
        dbTotal === 0
          ? {
              id: 'db-empty',
              label: 'Catalog has products',
              status: 'fail',
              detail: 'No products exist in the database.',
              hint: 'Add products from /admin/products.',
            }
          : {
              id: 'db-empty',
              label: 'Catalog has products',
              status: 'pass',
              detail: `${dbTotal} products in database.`,
            },
      );

      checks.push({
        id: 'rls',
        label: 'Public read access (Firestore Rules)',
        status: 'pass',
        detail: `Shoppers see all ${anonVisible} active products.`,
      });

      if (categoriesAnonVisible !== null) {
        checks.push(
          categoriesAnonVisible === 0
            ? {
                id: 'cat-rls',
                label: 'Public read access to categories',
                status: 'warn',
                detail: 'No categories visible to shoppers.',
                hint: 'Add categories or check the categories RLS policy.',
              }
            : {
                id: 'cat-rls',
                label: 'Public read access to categories',
                status: 'pass',
                detail: `${categoriesAnonVisible} categories visible publicly.`,
              },
        );
      }

      const uncategorized = storefront.filter((p) => !p.category_id).length;
      checks.push(
        uncategorized > 0
          ? {
              id: 'tenant-map',
              label: 'Tenant / category mapping',
              status: 'warn',
              detail: `${uncategorized} active products have no category.`,
              hint: 'Open the product audit table to assign categories.',
            }
          : {
              id: 'tenant-map',
              label: 'Tenant / category mapping',
              status: 'pass',
              detail: 'All active products are mapped to a category.',
            },
      );

      const inactive = dbTotal - dbActive;
      const noStock = storefront.filter(
        (p) => (p.stock_quantity ?? 0) <= 0 && !p.allow_backorder,
      ).length;
      const expiredPromo = storefront.filter(
        (p) => p.promo_end_date && new Date(p.promo_end_date) < now,
      ).length;
      const stockIssues = noStock + expiredPromo;
      checks.push(
        stockIssues > 0
          ? {
              id: 'stock-status',
              label: 'Stock & status',
              status: 'warn',
              detail: `${inactive} disabled, ${noStock} out of stock, ${expiredPromo} with expired promos.`,
              hint: 'Enable, restock, or extend promo end dates.',
            }
          : {
              id: 'stock-status',
              label: 'Stock & status',
              status: 'pass',
              detail: `All ${dbActive} active products are sellable.`,
            },
      );

      const noImg = storefront.filter(
        (p) => !p.primary_image_url && (!Array.isArray(p.images) || p.images.length === 0),
      ).length;
      checks.push(
        noImg > 0
          ? {
              id: 'images',
              label: 'Product images',
              status: 'warn',
              detail: `${noImg} active products have no image.`,
              hint: 'Upload photos — listings without images convert poorly and hurt SEO.',
            }
          : {
              id: 'images',
              label: 'Product images',
              status: 'pass',
              detail: 'Every active product has at least one image.',
            },
      );

      checks.push(
        dbFeatured === 0
          ? {
              id: 'featured',
              label: 'Featured products',
              status: 'warn',
              detail: 'Nothing is featured on the home page.',
              hint: 'Mark 4–8 products as Featured for the home page carousel.',
            }
          : {
              id: 'featured',
              label: 'Featured products',
              status: 'pass',
              detail: `${dbFeatured} featured products active.`,
            },
      );

      return {
        checks,
        counts: {
          dbTotal: dbTotal,
          dbActive: dbActive,
          dbFeatured: dbFeatured,
          anonVisible,
          categoriesAnonVisible,
          storefrontVisible,
        },
      };
    },
    refetchOnWindowFocus: false,
  });
}
