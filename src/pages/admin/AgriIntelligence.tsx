import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, getDocs, getCountFromServer, query, orderBy, limit as limitFn } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { Loader2, RefreshCw, Rss } from 'lucide-react';

export default function AgriIntelligence() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: sources = [], refetch: refetchSources } = useQuery({
    queryKey: ['agri-feed-sources'],
    queryFn: async () => {
      const q = query(collection(db, 'agri_feed_sources'), orderBy('name'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
  });

  const { data: items = [], refetch: refetchItems } = useQuery({
    queryKey: ['agri-feed-items-admin'],
    queryFn: async () => {
      const q = query(collection(db, 'agri_feed_items'), orderBy('published_at', 'desc'), limitFn(20));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
  });

  const { data: counts } = useQuery({
    queryKey: ['agri-counts'],
    queryFn: async () => {
      const tables = ['agri_markets','agri_buyers','agri_government_bodies','agri_organizations','agri_processing_facilities','agri_feed_items','agri_dragon_fruit_prices'];
      const out: Record<string, number> = {};
      for (const t of tables) {
        const snap = await getCountFromServer(collection(db, t));
        out[t] = snap.data().count;
      }
      return out;
    },
  });

  async function refreshFeeds() {
    setRefreshing(true);
    try {
      const res = await fetch('/api/agri-feed-refresh', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to refresh feeds');
      toast({ title: 'Feeds refreshed', description: `${data?.summary?.length ?? 0} sources processed.` });
      await Promise.all([refetchSources(), refetchItems()]);
    } catch (e: any) {
      toast({ title: 'Refresh failed', description: e.message, variant: 'destructive' });
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Agri Intelligence</h1>
            <p className="text-muted-foreground">Africa-wide markets, buyers, government bodies & live news feeds.</p>
          </div>
          <Button onClick={refreshFeeds} disabled={refreshing}>
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh RSS feeds
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {counts && Object.entries(counts).map(([k, v]) => (
            <Card key={k} className="p-4">
              <div className="text-xs text-muted-foreground capitalize">{k.replace('agri_','').replace(/_/g,' ')}</div>
              <div className="text-2xl font-bold">{v}</div>
            </Card>
          ))}
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Rss className="h-4 w-4" /> Feed sources</h2>
          <div className="space-y-2">
            {sources.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between text-sm border-b py-2 last:border-0">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.url}</div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>{s.fetch_status ?? '—'}</div>
                  <div>{s.last_fetched_at ? new Date(s.last_fetched_at).toLocaleString() : 'never'}</div>
                </div>
              </div>
            ))}
            {!sources.length && <p className="text-sm text-muted-foreground">No feed sources configured.</p>}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Latest cached items</h2>
          <ul className="space-y-2">
            {items.map((it: any) => (
              <li key={it.id} className="text-sm border-b pb-2 last:border-0">
                <a href={it.link} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-primary">{it.title}</a>
                <div className="text-xs text-muted-foreground">{it.country_scope} · {it.published_at ? new Date(it.published_at).toLocaleDateString() : ''}</div>
              </li>
            ))}
            {!items.length && <p className="text-sm text-muted-foreground">No items cached. Click "Refresh RSS feeds".</p>}
          </ul>
        </Card>
      </div>
  );
}
