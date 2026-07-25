import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit as limitFn } from 'firebase/firestore';

export function useAgriMarkets(countryId?: string) {
  return useQuery({
    queryKey: ['agri-markets', countryId],
    enabled: !!countryId,
    queryFn: async () => {
      const q = query(
        collection(db, 'agri_markets'),
        where('country_id', '==', countryId),
        where('is_active', '==', true),
        orderBy('sort_order', 'asc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    },
  });
}

export function useAgriBuyers(countryId?: string) {
  return useQuery({
    queryKey: ['agri-buyers', countryId],
    enabled: !!countryId,
    queryFn: async () => {
      const q = query(
        collection(db, 'agri_buyers'),
        where('country_id', '==', countryId),
        where('is_active', '==', true),
        orderBy('sort_order', 'asc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    },
  });
}

export function useAgriGov(countryId?: string) {
  return useQuery({
    queryKey: ['agri-gov', countryId],
    enabled: !!countryId,
    queryFn: async () => {
      const q = query(
        collection(db, 'agri_government_bodies'),
        where('country_id', '==', countryId),
        where('is_active', '==', true),
        orderBy('sort_order', 'asc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    },
  });
}

export function useAgriOrgs(countryId?: string) {
  return useQuery({
    queryKey: ['agri-orgs', countryId],
    enabled: !!countryId,
    queryFn: async () => {
      const q = query(
        collection(db, 'agri_organizations'),
        where('country_id', '==', countryId),
        where('is_active', '==', true),
        orderBy('sort_order', 'asc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    },
  });
}

export function useAgriProcessing(countryId?: string) {
  return useQuery({
    queryKey: ['agri-processing', countryId],
    enabled: !!countryId,
    queryFn: async () => {
      const q = query(
        collection(db, 'agri_processing_facilities'),
        where('country_id', '==', countryId),
        where('is_active', '==', true)
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    },
  });
}

export function useDragonFruitPrices(limit = 30) {
  return useQuery({
    queryKey: ['agri-prices', limit],
    queryFn: async () => {
      const q = query(
        collection(db, 'agri_dragon_fruit_prices'),
        orderBy('recorded_at', 'desc'),
        limitFn(limit)
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    },
  });
}

export function useAgriFeedItems(scope?: string, limit = 30) {
  return useQuery({
    queryKey: ['agri-feed', scope, limit],
    queryFn: async () => {
      let q = query(
        collection(db, 'agri_feed_items'),
        orderBy('published_at', 'desc'),
        limitFn(limit)
      );
      
      if (scope) {
        q = query(
          collection(db, 'agri_feed_items'),
          where('country_scope', 'in', [scope, 'global']),
          orderBy('published_at', 'desc'),
          limitFn(limit)
        );
      }
      
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    },
  });
}

export function useAgriMarket(countryId?: string, slug?: string) {
  return useQuery({
    queryKey: ['agri-market', countryId, slug],
    enabled: !!countryId && !!slug,
    queryFn: async () => {
      const q = query(
        collection(db, 'agri_markets'),
        where('country_id', '==', countryId),
        where('slug', '==', slug),
        where('is_active', '==', true),
        limitFn(1)
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
    },
  });
}
