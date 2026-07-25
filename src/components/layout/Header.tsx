import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Package, Heart, User, LogOut, ChevronDown, Check } from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/use-products';
import { useDynamicMenu } from '@/hooks/use-dynamic-menu';
import { getSeoSlug } from '@/lib/category-seo';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { DonationModal } from '@/components/donations/DonationModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { itemCount, setIsOpen } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: dbCategories = [] } = useCategories();
  const { data: customMenu } = useDynamicMenu('header');
  const location = useLocation();


  const shopCategories = [
    { label: 'All Products', href: '/products' },
    ...dbCategories.map((cat) => ({
      label: cat.name,
      href: `/category/${getSeoSlug(cat.slug)}`,
    })),
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card-strong border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-xl md:text-2xl font-display font-bold text-gradient-dragon">
              DFSA
            </span>
            <span className="hidden sm:inline text-xs text-muted-foreground border-l border-border pl-3">
              Dragon Fruit<br />Farming Africa
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-2 xl:gap-4 text-sm xl:text-base">
            <Link to="/" className="animated-underline font-medium text-foreground/80 hover:text-foreground transition-colors">Home</Link>
            
            {/* Shop dropdown with category links */}
            <DropdownMenu>
              <DropdownMenuTrigger className="animated-underline font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1 outline-none">
                Shop <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {shopCategories.map((cat) => (
                  <DropdownMenuItem key={cat.href} asChild>
                    <Link to={cat.href} className="w-full cursor-pointer">
                      {cat.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Education dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="animated-underline font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1 outline-none">
                Education <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuItem asChild><Link to="/education" className="w-full cursor-pointer font-semibold">All Education Resources</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/history-of-dragon-fruit" className="w-full cursor-pointer">History & Origins</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/dragon-fruit-global-production" className="w-full cursor-pointer">Global Production</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/largest-dragon-fruit-record" className="w-full cursor-pointer">Record Sizes</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/dragon-fruit-research-benefits" className="w-full cursor-pointer">Research & Science</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/dragon-fruit-environmental-benefits" className="w-full cursor-pointer">Environmental Benefits</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/dragon-fruit-carbon-and-radiation-claims" className="w-full cursor-pointer">Carbon & Radiation Claims</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/dragon-fruit-industry-growth" className="w-full cursor-pointer">Industry Growth</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/africa-fruit-and-vegetable-markets" className="w-full cursor-pointer">Africa Markets Directory</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/education/1-hectare-dragon-fruit-farm-cost" className="w-full cursor-pointer font-semibold text-primary">1 Hectare Farm Cost Guide</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/education/commercial-orders" className="w-full cursor-pointer font-semibold text-primary">Commercial Orders</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/blog" className="animated-underline font-medium text-foreground/80 hover:text-foreground transition-colors">Blog</Link>
            <Link to="/directory" className="animated-underline font-medium text-foreground/80 hover:text-foreground transition-colors">Directory</Link>


            <Link to="/consultations" className="animated-underline font-medium text-foreground/80 hover:text-foreground transition-colors">Consult</Link>
            <Link to="/association" className="animated-underline font-medium text-foreground/80 hover:text-foreground transition-colors">Association</Link>
            <Link to="/about" className="animated-underline font-medium text-foreground/80 hover:text-foreground transition-colors">About</Link>
            <Link to="/contact" className="animated-underline font-medium text-foreground/80 hover:text-foreground transition-colors">Contact</Link>
            {customMenu?.items?.map((item) => (
              <Link
                key={item.url}
                to={item.url}
                target={item.target}
                className="animated-underline font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2 lg:gap-3">
            <DonationModal 
              trigger={
                <Button variant="ghost" size="sm" className="hidden lg:flex gap-1 text-pink-500 hover:text-pink-600 hover:bg-pink-500/10">
                  <Heart className="h-4 w-4 fill-current" />
                  Donate
                </Button>
              }
            />
            
            <Button variant="ghost" size="icon" className="hidden lg:flex" asChild>
              <Link to="/my-orders" title="My Orders">
                <Package className="h-5 w-5" />
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Button>

            {/* Auth buttons */}
            {user ? (
              <div className="hidden lg:flex items-center gap-2">
                {isAdmin && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin">Admin</Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={signOut} className="gap-1">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="default" size="sm" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-card-strong border-t"
          >
            <nav className="flex flex-col p-4 gap-4">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="font-medium py-2">Home</Link>
              
              {/* Mobile shop categories */}
              <div className="border-l-2 border-primary/30 pl-4 space-y-2">
                <span className="font-semibold text-sm text-primary uppercase tracking-wide">Shop Categories</span>
                {shopCategories.map((cat) => (
                  <Link
                    key={cat.href}
                    to={cat.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-1 text-sm text-foreground/80 hover:text-primary transition-colors"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>

              <Link to="/blog" onClick={() => setMobileMenuOpen(false)} className="font-medium py-2">Blog</Link>
              
              {/* Mobile education links */}
              <div className="border-l-2 border-primary/30 pl-4 space-y-2">
                <span className="font-semibold text-sm text-primary uppercase tracking-wide">Education</span>
                <Link key="education-hub" to="/education" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-sm font-semibold text-foreground/80 hover:text-primary transition-colors">All Education Resources</Link>
                {[
                  { href: '/history-of-dragon-fruit', label: 'History & Origins' },
                  { href: '/dragon-fruit-global-production', label: 'Global Production' },
                  { href: '/largest-dragon-fruit-record', label: 'Record Sizes' },
                  { href: '/dragon-fruit-research-benefits', label: 'Research & Science' },
                  { href: '/dragon-fruit-environmental-benefits', label: 'Environmental Benefits' },
                  { href: '/dragon-fruit-carbon-and-radiation-claims', label: 'Carbon & Radiation' },
                  { href: '/dragon-fruit-industry-growth', label: 'Industry Growth' },
                  { href: '/africa-fruit-and-vegetable-markets', label: 'Africa Markets' },
                  { href: '/education/1-hectare-dragon-fruit-farm-cost', label: '💰 1 Hectare Farm Cost Guide' },
                  { href: '/education/commercial-orders', label: '🌱 Commercial Orders' },
                ].map((item) => (
                  <Link key={item.href} to={item.href} onClick={() => setMobileMenuOpen(false)} className="block py-1 text-sm text-foreground/80 hover:text-primary transition-colors">{item.label}</Link>
                ))}
              </div>

              <Link to="/directory" onClick={() => setMobileMenuOpen(false)} className="font-medium py-2">Directory</Link>

              <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)} className="font-medium py-2">My Orders</Link>
              <Link to="/consultations" onClick={() => setMobileMenuOpen(false)} className="font-medium py-2">Consultations</Link>
              <Link to="/association" onClick={() => setMobileMenuOpen(false)} className="font-medium py-2">Association</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="font-medium py-2">About</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="font-medium py-2">Contact</Link>
              
              {/* Mobile Auth */}
              <div className="border-t pt-4 mt-2">
                {user ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="font-medium py-2 block text-primary">
                        Admin Dashboard
                      </Link>
                    )}
                    <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="font-medium py-2 text-destructive">
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" asChild>
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                    </Button>
                    <Button className="flex-1" asChild>
                      <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
