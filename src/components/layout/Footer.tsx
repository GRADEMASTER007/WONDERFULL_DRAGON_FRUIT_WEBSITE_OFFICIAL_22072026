import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export const Footer = () => {
  const { user, isAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'subscribers'), {
        email,
        createdAt: serverTimestamp(),
        source: 'footer_newsletter'
      });
      toast({
        title: "Subscribed Successfully",
        description: "Thank you for subscribing to our newsletter!",
      });
      setEmail('');
    } catch (error) {
      console.error("Error subscribing:", error);
      toast({
        title: "Subscription Failed",
        description: "There was an error subscribing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-dragon-dark text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <h3 className="font-display text-2xl font-bold text-gradient-tropical mb-2">DFSA</h3>
            <p className="text-sm text-white/70 mb-2">Dragon Fruit Farming Africa</p>
            <p className="text-xs text-white/50">Dragon Fruit South Africa & Healthy Fields</p>
            <p className="text-xs text-white/50 mt-1 mb-6">Since 2008</p>

            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h4 className="font-semibold mb-2 text-dragon-lime text-sm">Subscribe to our Newsletter</h4>
              <p className="text-xs text-white/60 mb-4">Get the latest farming tips and updates delivered to your inbox.</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-9 text-sm"
                />
                <Button type="submit" size="sm" disabled={loading} className="bg-dragon-lime text-dragon-dark hover:bg-dragon-lime/90 h-9">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe'}
                </Button>
              </form>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-dragon-lime">Quick Links</h4>
            <nav aria-label="Footer navigation">
              <ul className="space-y-2 text-white/70 text-sm">
                <li><Link to="/products" className="hover:text-white transition-colors">Shop Cultivars</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">Farming Blog</Link></li>
                <li><Link to="/consultations" className="hover:text-white transition-colors">Book Consultation</Link></li>
                <li><Link to="/rooting-services" className="hover:text-white transition-colors">Rooting Services</Link></li>
                <li><Link to="/association" className="hover:text-white transition-colors">Join Association</Link></li>
                <li><Link to="/directory" className="hover:text-white transition-colors">Business Directory</Link></li>
              </ul>
            </nav>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-dragon-lime">Resources</h4>
            <nav aria-label="Resources navigation">
              <ul className="space-y-2 text-white/70 text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">About DFSA</Link></li>
                <li><Link to="/business-resources" className="hover:text-white transition-colors">Business Resources</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </nav>
            <h4 className="font-semibold mt-4 mb-2 text-dragon-lime">Countries We Serve</h4>
            <ul className="space-y-1 text-white/70 text-xs">
              <li><Link to="/dragon-fruit-botswana" className="hover:text-white transition-colors">🇧🇼 Dragon Fruit Botswana</Link></li>
              <li><Link to="/dragon-fruit-zimbabwe" className="hover:text-white transition-colors">🇿🇼 Dragon Fruit Zimbabwe</Link></li>
              <li><Link to="/dragon-fruit-namibia" className="hover:text-white transition-colors">🇳🇦 Dragon Fruit Namibia</Link></li>
              <li>South Africa • Zambia</li>
              <li>Uganda • Malawi</li>
              <li className="text-dragon-pink">Worldwide Export</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-dragon-lime">Contact</h4>
            <ul className="space-y-2 text-white/70 text-sm">
              <li><a href="mailto:admin@proagrisa.co.za">admin@proagrisa.co.za</a></li>
              <li><a href="tel:+27834474639">+27 83 447 4639</a></li>
              <li><a href="tel:+13517772848">+1 351 777 2848</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-white/50 text-sm">
          <span>© 2026 Dragon Fruit Farming Africa (DFSA). Since 2008. All rights reserved.</span>
          {isAdmin && (
            <Link 
              to="/admin" 
              className="text-dragon-pink hover:text-white transition-colors text-xs"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
};
