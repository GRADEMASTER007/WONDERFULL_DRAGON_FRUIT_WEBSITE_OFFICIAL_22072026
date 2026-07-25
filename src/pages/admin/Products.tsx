import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { MultiImageUpload } from '@/components/admin/MultiImageUpload';
import { useCategories } from '@/hooks/use-products';
import { CatalogRefreshButton } from '@/components/admin/CatalogRefreshButton';

interface ProductForm {
  name: string;
  sku: string;
  slug: string;
  short_description: string;
  description: string;
  category_id: string | null;
  price_zar: string;
  compare_at_price_zar: string;
  stock_quantity: string;
  primary_image_url: string;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  promo_start_date: string;
  promo_end_date: string;
}

const emptyForm: ProductForm = {
  name: '',
  sku: '',
  slug: '',
  short_description: '',
  description: '',
  category_id: null,
  price_zar: '',
  compare_at_price_zar: '',
  stock_quantity: '0',
  primary_image_url: '',
  images: [],
  is_active: true,
  is_featured: false,
  promo_start_date: '',
  promo_end_date: '',
};

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: categories } = useCategories();

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const q = query(collection(db, 'products'), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      // Set primary image from images array if not set
      const primaryImage = data.primary_image_url || data.images[0] || null;
      
      const payload = {
        name: data.name,
        sku: data.sku,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        short_description: data.short_description || null,
        description: data.description || null,
        category_id: data.category_id || null,
        price_zar: parseFloat(data.price_zar) || 0,
        compare_at_price_zar: data.compare_at_price_zar ? parseFloat(data.compare_at_price_zar) : null,
        stock_quantity: parseInt(data.stock_quantity) || 0,
        primary_image_url: primaryImage,
        images: data.images,
        is_active: data.is_active,
        is_featured: data.is_featured,
        promo_start_date: data.promo_start_date || null,
        promo_end_date: data.promo_end_date || null,
      };

      if (editingId) {
        const docRef = doc(db, 'products', editingId);
        await updateDoc(docRef, {
          ...payload,
          updated_at: serverTimestamp()
        });
      } else {
        const newDocRef = doc(collection(db, 'products'));
        await setDoc(newDocRef, {
          ...payload,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setIsOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      toast.success(editingId ? 'Product updated!' : 'Product created!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, 'products', id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const generateDescription = async () => {
    if (!form.name) {
      toast.error('Please enter a product name first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: `Create a compelling product description for ${form.name}. ${form.short_description || ''}`,
            systemInstruction: 'You are an expert e-commerce copywriter. Write a concise, engaging product description.'
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate');
      }

      const data = await response.json();
      setForm((prev) => ({ ...prev, description: data.content }));
      toast.success('Description generated!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingId(product.id);
    const productImages = Array.isArray(product.images) ? product.images : [];
    setForm({
      name: product.name,
      sku: product.sku,
      slug: product.slug,
      short_description: product.short_description || '',
      description: product.description || '',
      category_id: product.category_id || null,
      price_zar: product.price_zar?.toString() || '',
      compare_at_price_zar: product.compare_at_price_zar?.toString() || '',
      stock_quantity: product.stock_quantity?.toString() || '0',
      primary_image_url: product.primary_image_url || '',
      images: productImages as string[],
      is_active: product.is_active ?? true,
      is_featured: product.is_featured ?? false,
      promo_start_date: product.promo_start_date ? new Date(product.promo_start_date).toISOString().slice(0, 16) : '',
      promo_end_date: product.promo_end_date ? new Date(product.promo_end_date).toISOString().slice(0, 16) : '',
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku || !form.price_zar) {
      toast.error('Please fill in required fields');
      return;
    }
    saveMutation.mutate(form);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(value);
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    const category = categories?.find((c) => c.id === categoryId);
    return category?.name || null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-2">
          <CatalogRefreshButton variant="outline" />
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setEditingId(null);
            setForm(emptyForm);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="btn-sunset">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Product' : 'Add Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="auto-generated-from-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category_id">Category</Label>
                  <Select
                    value={form.category_id || 'none'}
                    onValueChange={(value) => setForm({ ...form, category_id: value === 'none' ? null : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Input
                  id="short_description"
                  value={form.short_description}
                  onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateDescription}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-1" />
                    )}
                    Generate with AI
                  </Button>
                </div>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_zar">Price (ZAR) *</Label>
                  <Input
                    id="price_zar"
                    type="number"
                    step="0.01"
                    value={form.price_zar}
                    onChange={(e) => setForm({ ...form, price_zar: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compare_at_price_zar">Compare Price</Label>
                  <Input
                    id="compare_at_price_zar"
                    type="number"
                    step="0.01"
                    value={form.compare_at_price_zar}
                    onChange={(e) => setForm({ ...form, compare_at_price_zar: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={form.stock_quantity}
                    onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Product Images</Label>
                <MultiImageUpload
                  value={form.images}
                  onChange={(urls) => {
                    setForm({ 
                      ...form, 
                      images: urls,
                      primary_image_url: urls[0] || '' 
                    });
                  }}
                  maxImages={10}
                />
              </div>

              {/* Promotional Period */}
              <div className="p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 space-y-3">
                <h4 className="text-sm font-medium text-primary">📅 Promotional Period (Optional)</h4>
                <p className="text-xs text-muted-foreground">Set dates to control when the promotional price applies. Product becomes unavailable after the end date.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="promo_start_date">Promo Start</Label>
                    <Input
                      id="promo_start_date"
                      type="datetime-local"
                      value={form.promo_start_date}
                      onChange={(e) => setForm({ ...form, promo_start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="promo_end_date">Promo End</Label>
                    <Input
                      id="promo_end_date"
                      type="datetime-local"
                      value={form.promo_end_date}
                      onChange={(e) => setForm({ ...form, promo_end_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <span>Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                    className="rounded"
                  />
                  <span>Featured</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="btn-sunset" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.primary_image_url && (
                        <img
                          src={product.primary_image_url}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.is_featured && (
                          <span className="text-xs text-primary">Featured</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                  <TableCell>
                    {getCategoryName(product.category_id) || (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(product.price_zar)}</TableCell>
                  <TableCell>
                    <span className={product.stock_quantity < 5 ? 'text-red-500 font-medium' : ''}>
                      {product.stock_quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.is_active
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {product.is_active ? 'Active' : 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Delete this product?')) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </div>
  );
}
