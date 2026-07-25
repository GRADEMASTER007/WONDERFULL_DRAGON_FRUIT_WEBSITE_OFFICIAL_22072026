import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import type { Product, Category } from '@/types/product';

// Filter out products whose promo period has ended
function filterExpiredPromos(products: any[]): Product[] {
  const now = new Date();
  return products.filter((p) => {
    // If product has a promo_end_date and it's passed, hide it
    if (p.promo_end_date && new Date(p.promo_end_date) < now) {
      return false;
    }
    return true;
  });
}

// Check if a product is currently in its promo period
export function isInPromoPeriod(product: any): boolean {
  if (!product.promo_start_date && !product.promo_end_date) return false;
  const now = new Date();
  if (product.promo_start_date && new Date(product.promo_start_date) > now) return false;
  if (product.promo_end_date && new Date(product.promo_end_date) < now) return false;
  return true;
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<Product[]> => {
      const q = query(
        collection(db, 'products'),
        where('is_active', '==', true),
        orderBy('created_at', 'desc')
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      return filterExpiredPromos(data);
    },
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async (): Promise<Product[]> => {
      const q = query(
        collection(db, 'products'),
        where('is_active', '==', true),
        where('is_featured', '==', true),
        orderBy('created_at', 'desc'),
        limit(8)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      return filterExpiredPromos(data);
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async (): Promise<Product | null> => {
      const q = query(
        collection(db, 'products'),
        where('slug', '==', slug),
        where('is_active', '==', true),
        limit(1)
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;
      
      const docData = snap.docs[0];
      const data = { id: docData.id, ...docData.data() } as any;
      
      // If promo ended, treat as unavailable
      if (data?.promo_end_date && new Date(data.promo_end_date) < new Date()) {
        return null;
      }
      
      return data;
    },
    enabled: !!slug,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      const q = query(
        collection(db, 'categories'),
        where('is_active', '==', true),
        orderBy('sort_order', 'asc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    },
  });
}

export function useProductsByCategory(categorySlug: string) {
  return useQuery({
    queryKey: ['products', 'category', categorySlug],
    queryFn: async (): Promise<Product[]> => {
      // First find category
      const catQ = query(
        collection(db, 'categories'),
        where('slug', '==', categorySlug),
        limit(1)
      );
      const catSnap = await getDocs(catQ);
      if (catSnap.empty) throw new Error('Category not found');
      
      const categoryId = catSnap.docs[0].id;
      
      const q = query(
        collection(db, 'products'),
        where('is_active', '==', true),
        where('category_id', '==', categoryId),
        orderBy('created_at', 'desc')
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      return filterExpiredPromos(data);
    },
    enabled: !!categorySlug,
  });
}
