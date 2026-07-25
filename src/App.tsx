import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { RouteTracker } from "@/components/analytics/RouteTracker";
import { CookieConsentBanner } from "@/components/consent/CookieConsentBanner";
import Index from "./pages/Index";
import Products from "./pages/Products";
import CategoryPage from "./pages/CategoryPage";
import ProductDetail from "./pages/ProductDetail";
import Contact from "./pages/Contact";
import About from "./pages/About";
import BusinessResources from "./pages/BusinessResources";
import ConsultationServices from "./pages/ConsultationServices";
import RootingServices from "./pages/RootingServices";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminProductAudit from "./pages/admin/ProductAudit";
import AdminApiIntegrations from "./pages/admin/ApiIntegrations";
import AdminCategories from "./pages/admin/Categories";
import AdminOrders from "./pages/admin/Orders";
import AdminCustomers from "./pages/admin/Customers";
import AdminEnquiries from "./pages/admin/Enquiries";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminAI from "./pages/admin/AIAssistant";
import AdminAIImages from "./pages/admin/AIImageGenerator";
import AdminCatalogue from "./pages/admin/CatalogueManager";
import AdminSEO from "./pages/admin/SEOManager";
import AdminSettings from "./pages/admin/Settings";
import AdminKnowledgeBase from "./pages/admin/KnowledgeBase";
import AdminCodeAudit from "./pages/admin/CodeAudit";
import AdminWebhooks from "./pages/admin/WebhookTester";
import AdminAIControl from "./pages/admin/AIControlPanel";
import AdminAPIVault from "./pages/admin/APIKeyVault";
import AdminWhatsApp from "./pages/admin/WhatsAppInbox";
import AdminSocialInbox from "./pages/admin/SocialInbox";
// AIModelConfig removed - superseded by AIConfiguration
import AdminChatSettings from "./pages/admin/ChatSettings";
import AdminShippingRates from "./pages/admin/ShippingRates";
import AdminAIProviders from "./pages/admin/AIProviderDashboard";
import AdminAIConfiguration from "./pages/admin/AIConfiguration";
import AdminAIDiagnostics from "./pages/admin/AIDiagnostics";
import Blog from "./pages/Blog";
import BlogPostDetail from "./pages/BlogPostDetail";
import BusinessDirectory from "./pages/BusinessDirectory";
import BusinessRegister from "./pages/BusinessRegister";
import BusinessDetail from "./pages/BusinessDetail";
import PageDetail from "./pages/PageDetail";
import Association from "./pages/Association";
import DragonFruitBotswana from "./pages/DragonFruitBotswana";
import DragonFruitZimbabwe from "./pages/DragonFruitZimbabwe";
import DragonFruitNamibia from "./pages/DragonFruitNamibia";
import HistoryOfDragonFruit from "./pages/HistoryOfDragonFruit";
import DragonFruitGlobalProduction from "./pages/DragonFruitGlobalProduction";
import LargestDragonFruitRecord from "./pages/LargestDragonFruitRecord";
import DragonFruitResearchBenefits from "./pages/DragonFruitResearchBenefits";
import DragonFruitEnvironmentalBenefits from "./pages/DragonFruitEnvironmentalBenefits";
import DragonFruitCarbonRadiation from "./pages/DragonFruitCarbonRadiation";
import DragonFruitIndustryGrowth from "./pages/DragonFruitIndustryGrowth";
import AfricaFruitMarkets from "./pages/AfricaFruitMarkets";
import CommercialOrders from "./pages/CommercialOrders";
import Education from "./pages/Education";
import OneHectareCost from "./pages/OneHectareCost";
import AdminBlogPosts from "./pages/admin/BlogPosts";
import AdminPages from "./pages/admin/Pages";
import AdminMenus from "./pages/admin/Menus";
import AdminBusinessListings from "./pages/admin/BusinessListings";
import AdminAIAgents from "./pages/admin/AIAgents";
import AdminSitemapSubmission from "./pages/admin/SitemapSubmission";
import AdminRobotsAudit from "./pages/admin/RobotsAudit";
import AdminPromoCodes from "./pages/admin/PromoCodes";
import AdminQuotations from "./pages/admin/Quotations";
import AdminSEOValidator from "./pages/admin/SEOValidator";
import AdminGeoContent from "./pages/admin/GeoContentGenerator";
import Terms from "./pages/Terms";
import AfricaHub from "./pages/africa/AfricaHub";
import AfricaCountry from "./pages/africa/AfricaCountry";
import AdminAgriIntelligence from "./pages/admin/AgriIntelligence";
import AdminSubscriptions from "./pages/admin/Subscriptions";
import { useEffect } from "react";
import { verifyFirestoreConnection } from "@/lib/firebase";

const queryClient = new QueryClient();

import { useCatalogBroadcastListener } from "@/hooks/use-catalog-refresh";

const CatalogBroadcastBridge = () => {
  useCatalogBroadcastListener();
  return null;
};

const App = () => {
  useEffect(() => {
    verifyFirestoreConnection();
  }, []);
  
  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CatalogBroadcastBridge />
            <RouteTracker />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/business-resources" element={<BusinessResources />} />
              <Route path="/consultations" element={<ConsultationServices />} />
              <Route path="/rooting-services" element={<RootingServices />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPostDetail />} />
              <Route path="/directory" element={<BusinessDirectory />} />
              <Route path="/directory/register" element={<BusinessRegister />} />
              <Route path="/directory/:slug" element={<BusinessDetail />} />
              <Route path="/page/:slug" element={<PageDetail />} />
              <Route path="/association" element={<Association />} />
              <Route path="/dragon-fruit-botswana" element={<DragonFruitBotswana />} />
              <Route path="/dragon-fruit-zimbabwe" element={<DragonFruitZimbabwe />} />
              <Route path="/dragon-fruit-namibia" element={<DragonFruitNamibia />} />
              <Route path="/history-of-dragon-fruit" element={<HistoryOfDragonFruit />} />
              <Route path="/dragon-fruit-global-production" element={<DragonFruitGlobalProduction />} />
              <Route path="/largest-dragon-fruit-record" element={<LargestDragonFruitRecord />} />
              <Route path="/dragon-fruit-research-benefits" element={<DragonFruitResearchBenefits />} />
              <Route path="/dragon-fruit-environmental-benefits" element={<DragonFruitEnvironmentalBenefits />} />
              <Route path="/dragon-fruit-carbon-and-radiation-claims" element={<DragonFruitCarbonRadiation />} />
              <Route path="/dragon-fruit-industry-growth" element={<DragonFruitIndustryGrowth />} />
              <Route path="/africa-fruit-and-vegetable-markets" element={<AfricaFruitMarkets />} />
              <Route path="/education" element={<Education />} />
              <Route path="/education/commercial-orders" element={<CommercialOrders />} />
              <Route path="/education/1-hectare-dragon-fruit-farm-cost" element={<OneHectareCost />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/terms-and-services" element={<Terms />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="product-audit" element={<AdminProductAudit />} />
                <Route path="api-integrations" element={<AdminApiIntegrations />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="enquiries" element={<AdminEnquiries />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="ai" element={<AdminAI />} />
                <Route path="ai-agents" element={<AdminAIAgents />} />
                <Route path="ai-images" element={<AdminAIImages />} />
                <Route path="catalogue" element={<AdminCatalogue />} />
                <Route path="seo" element={<AdminSEO />} />
                <Route path="knowledge-base" element={<AdminKnowledgeBase />} />
                <Route path="code-audit" element={<AdminCodeAudit />} />
                <Route path="webhooks" element={<AdminWebhooks />} />
                <Route path="ai-control" element={<AdminAIControl />} />
                <Route path="api-vault" element={<AdminAPIVault />} />
                <Route path="whatsapp" element={<AdminWhatsApp />} />
                <Route path="social-inbox" element={<AdminSocialInbox />} />
                {/* ai-models route removed - redirected to ai-config */}
                <Route path="chat-settings" element={<AdminChatSettings />} />
                <Route path="shipping-rates" element={<AdminShippingRates />} />
                <Route path="ai-providers" element={<AdminAIProviders />} />
                <Route path="ai-config" element={<AdminAIConfiguration />} />
                <Route path="ai-diagnostics" element={<AdminAIDiagnostics />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="blog-posts" element={<AdminBlogPosts />} />
                <Route path="pages" element={<AdminPages />} />
                <Route path="menus" element={<AdminMenus />} />
                <Route path="business-listings" element={<AdminBusinessListings />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
                <Route path="sitemap" element={<AdminSitemapSubmission />} />
                <Route path="robots-audit" element={<AdminRobotsAudit />} />
                <Route path="promo-codes" element={<AdminPromoCodes />} />
                <Route path="quotations" element={<AdminQuotations />} />
                <Route path="seo-validator" element={<AdminSEOValidator />} />
                <Route path="geo-content" element={<AdminGeoContent />} />
                <Route path="agri-intelligence" element={<AdminAgriIntelligence />} />
              </Route>

              {/* Africa-wide markets & intelligence */}
              <Route path="/africa" element={<AfricaHub />} />
              <Route path="/africa/:country" element={<AfricaCountry />} />


              <Route path="*" element={<NotFound />} />
            </Routes>
            <FloatingWhatsApp />
            <CookieConsentBanner />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);
};

export default App;
