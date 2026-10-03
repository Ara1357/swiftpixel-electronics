import { Toaster, toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Route, Switch, useLocation, useRoute } from "wouter";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  BarChart3,
  Box,
  Cable,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  Clock3,
  Cpu,
  CreditCard,
  Eye,
  Facebook,
  Filter,
  Grid2X2,
  Headphones,
  Heart,
  Instagram,
  Laptop,
  LayoutDashboard,
  List,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  Package,
  Phone,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  SearchCheck,
  Send,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  SlidersHorizontal,
  Star,
  Store,
  Trash2,
  Truck,
  Twitter,
  UserRound,
  WalletCards,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { startLogin } from "./const";
import { trpc } from "./lib/trpc";
import { categories, formatNaira, getProduct, products, testimonials, type Product } from "@shared/catalog";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from "./pages/NotFound";

const HERO_IMAGE = "/manus-storage/async-images/i11jqaN955iH7X852LTZoE/image-2.webp";
const MARK_IMAGE = "/manus-storage/async-images/i11jqaN955iH7X852LTZoE/image-1.webp";

const iconByName: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  laptop: Laptop,
  cpu: Cpu,
  cable: Cable,
  headphones: Headphones,
  wifi: Wifi,
};

type CartItem = { product: Product; quantity: number };
type MarketplaceContextValue = {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCart: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
};

import { createContext, useContext } from "react";
const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);
const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) throw new Error("Marketplace context is not available");
  return context;
};

function go(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <a className={`brand ${inverse ? "brand-inverse" : ""}`} href="/" onClick={event => { event.preventDefault(); go("/"); }}>
      <span className="brand-mark"><img src={MARK_IMAGE} alt="" /></span>
      <span>
        <strong>SwiftPixel</strong>
        <small>Electronics</small>
      </span>
    </a>
  );
}

function StatusChip({ children, tone = "neutral", icon }: { children: ReactNode; tone?: "neutral" | "success" | "orange" | "cyan" | "danger"; icon?: ReactNode }) {
  return <span className={`status-chip status-${tone}`}>{icon}{children}</span>;
}

function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addToCart } = useMarketplace();
  const [saved, setSaved] = useState(false);
  const discounted = product.compareAt && product.compareAt > product.price;
  const discount = discounted ? Math.round((1 - product.price / product.compareAt!) * 100) : 0;
  return (
    <article className={`product-card ${compact ? "product-card-compact" : ""}`}>
      <div className="product-media">
        <a href={`/products/${product.slug}`} onClick={event => { event.preventDefault(); go(`/products/${product.slug}`); }}>
          <img src={product.images[0]} alt={product.name} loading="lazy" />
        </a>
        {product.badge && <span className={`product-badge ${product.badge === "Low stock" ? "product-badge-warn" : ""}`}>{product.badge}</span>}
        {discount > 0 && <span className="discount-pill">-{discount}%</span>}
        <button aria-label={saved ? "Remove from wishlist" : "Add to wishlist"} className={`icon-button save-button ${saved ? "is-saved" : ""}`} onClick={() => { setSaved(!saved); toast(saved ? "Removed from saved items" : "Saved for later"); }}><Heart size={16} fill={saved ? "currentColor" : "none"} /></button>
      </div>
      <div className="product-card-body">
        <div className="eyebrow">{product.brand} · {product.category}</div>
        <a href={`/products/${product.slug}`} className="product-title" onClick={event => { event.preventDefault(); go(`/products/${product.slug}`); }}>{product.name}</a>
        <div className="rating-row"><span className="star-row"><Star size={14} fill="currentColor" /> {product.rating}</span><span className="muted">({product.reviews})</span></div>
        <div className="price-row"><strong>{formatNaira(product.price)}</strong>{discounted && <del>{formatNaira(product.compareAt!)}</del>}</div>
        {!compact && <div className="seller-row"><BadgeCheck size={14} /> {product.seller}<span className="dot-separator">·</span>{product.stock < 10 ? <span className="stock-low">Only {product.stock} left</span> : <span className="stock-ok">In stock</span>}</div>}
        <button className="button button-dark card-add" onClick={() => { addToCart(product); toast.success("Added to cart", { description: product.name }); }}><ShoppingBag size={15} /> Add to cart</button>
      </div>
    </article>
  );
}

function SectionHeading({ eyebrow, title, copy, action }: { eyebrow?: string; title: string; copy?: string; action?: ReactNode }) {
  return <div className="section-heading"><div><div className="section-eyebrow">{eyebrow}</div><h2>{title}</h2>{copy && <p>{copy}</p>}</div>{action}</div>;
}

function Header() {
  const [location] = useLocation();
  const { cartCount } = useMarketplace();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const submitSearch = (event: React.FormEvent) => { event.preventDefault(); go(`/products?q=${encodeURIComponent(search)}`); setMobileOpen(false); };
  return (
    <header className="site-header">
      <div className="utility-bar"><div className="container utility-inner"><span>Trusted electronics. Clear specs. Faster builds.</span><div className="utility-links"><a href="/contact" onClick={e => { e.preventDefault(); go("/contact"); }}>Help center</a><span>·</span><a href="https://wa.me/09126903370" target="_blank" rel="noreferrer">WhatsApp support</a></div></div></div>
      <div className="container nav-row">
        <Brand />
        <form className="search-box" onSubmit={submitSearch}><Search size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search phones, laptops, components..." aria-label="Search products" /><kbd>⌘ K</kbd></form>
        <nav className="main-nav" aria-label="Primary navigation"><a className={location === "/products" ? "active" : ""} href="/products" onClick={e => { e.preventDefault(); go("/products"); }}>Browse</a><a href="/products?sort=deal" onClick={e => { e.preventDefault(); go("/products?sort=deal"); }}>Deals</a><a href="/seller" onClick={e => { e.preventDefault(); go("/seller"); }}>Sell on SwiftPixel</a></nav>
        <div className="nav-actions"><a className="nav-action" href="/account" onClick={e => { e.preventDefault(); go("/account"); }}><UserRound size={19} /><span>Account</span></a><a className="cart-action" href="/cart" onClick={e => { e.preventDefault(); go("/cart"); }}><ShoppingBag size={20} /><span>Cart</span>{cartCount > 0 && <b>{cartCount}</b>}</a><button className="mobile-menu icon-button" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">{mobileOpen ? <X /> : <Menu />}</button></div>
      </div>
      <div className={`mobile-nav ${mobileOpen ? "open" : ""}`}><form className="search-box" onSubmit={submitSearch}><Search size={18} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search products" /></form><a href="/products" onClick={e => { e.preventDefault(); go("/products"); setMobileOpen(false); }}>Browse products</a><a href="/products?sort=deal" onClick={e => { e.preventDefault(); go("/products?sort=deal"); setMobileOpen(false); }}>Deals & drops</a><a href="/seller" onClick={e => { e.preventDefault(); go("/seller"); setMobileOpen(false); }}>Sell on SwiftPixel</a></div>
    </header>
  );
}

function Footer() {
  return <footer className="site-footer"><div className="container footer-top"><div className="footer-brand"><Brand inverse /><p>Powering the next thing you build, listen to, or take everywhere.</p><div className="footer-social"><a href="https://facebook.com" aria-label="Facebook"><Facebook size={17} /></a><a href="https://instagram.com" aria-label="Instagram"><Instagram size={17} /></a><a href="https://twitter.com" aria-label="Twitter"><Twitter size={17} /></a></div></div><div><h4>Shop</h4><a href="/products?category=smartphones">Smartphones</a><a href="/products?category=laptops">Laptops</a><a href="/products?category=components">Components</a><a href="/products?category=accessories">Accessories</a></div><div><h4>Support</h4><a href="/contact">Contact & help</a><a href="/account">Track an order</a><a href="/seller">Sell on SwiftPixel</a><a href="/contact">Shipping & returns</a></div><div className="footer-contact"><h4>Talk to a human</h4><a href="tel:07077106232"><Phone size={15} /> 07077106232</a><a href="https://wa.me/09126903370"><MessageCircle size={15} /> 09126903370</a><a href="mailto:alliridwan36@gmail.com"><Mail size={15} /> alliridwan36@gmail.com</a><div className="trust-line"><ShieldCheck size={15} /> Secure checkout · verified sellers</div></div></div><div className="container footer-bottom"><span>© 2026 SwiftPixel Electronics. Built for curious minds.</span><span>Privacy · Terms · Seller policy</span></div></footer>;
}

function Shell({ children }: { children: ReactNode }) {
  return <><Header /><main>{children}</main><Footer /><a className="support-fab" href="https://wa.me/09126903370" target="_blank" rel="noreferrer"><MessageCircle size={19} /> <span>Need help?</span></a></>;
}

function HomePage() {
  const { addToCart } = useMarketplace();
  const featuredQuery = trpc.catalog.featured.useQuery(undefined, { staleTime: 60000, retry: false });
  const featuredProducts = featuredQuery.data?.items ?? products;
  return <div className="home-page">
    <section className="hero-section"><div className="container hero-grid"><div className="hero-copy"><StatusChip tone="cyan" icon={<Zap size={14} />}>The electronics marketplace for real builders</StatusChip><h1>Good gear.<br /><span>Clear signal.</span></h1><p>From everyday upgrades to the tiny parts behind big ideas, find electronics that come with the specs, support, and confidence to move you forward.</p><div className="hero-actions"><button className="button button-orange" onClick={() => go("/products")}>Explore the catalog <ArrowRight size={17} /></button><button className="button button-ghost-light" onClick={() => go("/products?category=components")}>Shop components <ArrowUpRight size={16} /></button></div><div className="hero-proof"><div className="avatar-stack"><span>AY</span><span>KN</span><span>TA</span></div><div><strong>4.8/5 from curious buyers</strong><small>Verified reviews across the marketplace</small></div></div></div><div className="hero-visual"><img src={HERO_IMAGE} alt="Electronics and components arranged for a product marketplace" /><div className="hero-float-card float-card-one"><span className="float-icon cyan"><ShieldCheck size={16} /></span><div><strong>Verified sellers</strong><small>Quality you can trace</small></div></div><div className="hero-float-card float-card-two"><span className="float-icon orange"><Truck size={16} /></span><div><strong>Fast dispatch</strong><small>Across Nigeria</small></div></div></div></div><div className="hero-grid-lines" /></section>
    <section className="trust-strip"><div className="container trust-grid"><div><ShieldCheck size={19} /><span><strong>Verified sellers</strong><small>Every listing has a signal</small></span></div><div><Truck size={19} /><span><strong>Delivery that keeps moving</strong><small>Track every order</small></span></div><div><RotateIcon /><span><strong>Warranty-backed picks</strong><small>Buy with a little more calm</small></span></div><div><LockKeyhole size={19} /><span><strong>Secure checkout</strong><small>Your details stay yours</small></span></div></div></section>
    <section className="container section-block"><SectionHeading eyebrow="Browse by signal" title="Find your next essential" copy="Curated categories for the everyday upgrade and the weekend build." action={<button className="text-link" onClick={() => go("/products")}>View all categories <ArrowRight size={15} /></button>} /><div className="category-grid">{categories.map(category => { const Icon = iconByName[category.icon] || Cpu; return <button key={category.slug} className={`category-card category-${category.tone}`} onClick={() => go(`/products?category=${category.slug}`)}><span className="category-icon"><Icon size={23} /></span><span><strong>{category.name}</strong><small>{category.count} products</small></span><ArrowUpRight size={17} /></button>; })}</div></section>
    <section className="container section-block"><SectionHeading eyebrow="The weekly shortlist" title="Good deals, no guesswork" copy="A quick rail of customer favorites and builder-approved upgrades." action={<button className="text-link" onClick={() => go("/products?sort=deal")}>See all deals <ArrowRight size={15} /></button>} /><div className="product-rail">{featuredProducts.slice(0, 4).map(product => <ProductCard key={product.id} product={product} />)}</div></section>
    <section className="container promo-section"><div className="promo-copy"><StatusChip tone="orange" icon={<Zap size={14} />}>Build week is live</StatusChip><h2>Make room for better ideas.</h2><p>Save up to 25% on components, tools, and the small upgrades that make a big difference at the bench.</p><button className="button button-dark" onClick={() => go("/products?category=components")}>Shop build week <ArrowRight size={16} /></button></div><div className="promo-specs"><div><span>01</span><strong>Pick a lane</strong><small>Components, tools or desk setup</small></div><div><span>02</span><strong>Check the signal</strong><small>Specs, rating and seller history</small></div><div><span>03</span><strong>Get moving</strong><small>Fast dispatch, clear tracking</small></div></div></section>
    <section className="container section-block testimonials-section"><SectionHeading eyebrow="From the community" title="People who care about the details" /><div className="testimonial-grid">{testimonials.map(testimonial => <figure key={testimonial.name} className="testimonial-card"><div className="quote-mark">“</div><blockquote>{testimonial.quote}</blockquote><figcaption><span className="initial-avatar">{testimonial.initials}</span><span><strong>{testimonial.name}</strong><small>{testimonial.role}</small></span><span className="testimonial-stars"><Star size={13} fill="currentColor" /> 5.0</span></figcaption></figure>)}</div></section>
    <Newsletter />
  </div>;
}

function RotateIcon() { return <RefreshCw size={19} />; }

function Newsletter() {
  const [email, setEmail] = useState("");
  const subscribe = trpc.newsletter.subscribe.useMutation();
  return <section className="container newsletter-section"><div><div className="section-eyebrow">Stay in the loop</div><h2>Useful drops, not inbox noise.</h2><p>New gear, component arrivals, and smart deals. One useful note when it matters.</p></div><form onSubmit={async event => { event.preventDefault(); try { const result = await subscribe.mutateAsync({ email }); toast.success(result.message, { description: email ? `Updates will go to ${email}` : "Thanks for subscribing" }); setEmail(""); } catch { toast.error("Please enter a valid email"); } }}><input type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" aria-label="Email for newsletter" /><button className="button button-orange" type="submit" disabled={subscribe.isPending}>Subscribe <Send size={15} /></button></form></section>;
}

function ProductsPage() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "all");
  const [sort, setSort] = useState(params.get("sort") || "featured");
  const [onlyStock, setOnlyStock] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(900000);
  const [minRating, setMinRating] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const catalogQuery = trpc.catalog.list.useQuery({ query: search || undefined, category, minPrice, maxPrice, minRating, inStock: onlyStock, sort: sort as "featured" | "deal" | "price-low" | "price-high" | "newest" | "rating", limit: 50 }, { staleTime: 30000, retry: false });
  const catalogItems = catalogQuery.data?.items?.length ? catalogQuery.data.items : products;
  useEffect(() => { const next = new URLSearchParams(); if (search) next.set("q", search); if (category !== "all") next.set("category", category); if (sort !== "featured") next.set("sort", sort); if (onlyStock) next.set("stock", "1"); if (minRating) next.set("rating", String(minRating)); if (minPrice) next.set("min", String(minPrice)); if (maxPrice !== 900000) next.set("max", String(maxPrice)); window.history.replaceState({}, "", `/products${next.toString() ? `?${next}` : ""}`); }, [category, maxPrice, minPrice, minRating, onlyStock, search, sort]);
  const visibleProducts = useMemo(() => {
    let result = catalogItems.filter(product => {
      const matchesSearch = !search || `${product.name} ${product.brand} ${product.category} ${product.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || product.categorySlug === category;
      return matchesSearch && matchesCategory && product.price >= minPrice && product.price <= maxPrice && product.rating >= minRating && (!onlyStock || product.stock > 0);
    });
    if (sort === "price-low") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-high") result = [...result].sort((a, b) => b.price - a.price);
    if (sort === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
    if (sort === "newest") result = [...result].reverse();
    if (sort === "deal") result = [...result].sort((a, b) => (b.compareAt ? b.compareAt - b.price : 0) - (a.compareAt ? a.compareAt - a.price : 0));
    return result;
  }, [catalogItems, category, maxPrice, minPrice, minRating, onlyStock, search, sort]);
  return <div className="browse-page container"><div className="breadcrumbs"><a href="/" onClick={e => { e.preventDefault(); go("/"); }}>Home</a><ChevronRight size={14} /><span>Browse products</span></div><div className="browse-head"><div><div className="section-eyebrow">The catalog</div><h1>Shop the signal.</h1><p>Find the right gear by what it does, how it’s rated, and who stands behind it.</p></div><button className="button button-outline mobile-filter-button" onClick={() => setFiltersOpen(!filtersOpen)}><Filter size={16} /> Filters</button></div><div className="browse-layout"><aside className={`filter-panel ${filtersOpen ? "open" : ""}`}><div className="filter-head"><strong>Refine results</strong><button className="icon-button" onClick={() => setFiltersOpen(false)}><X size={17} /></button></div><label className="filter-label">Category</label><div className="filter-options">{[{ slug: "all", name: "All products" }, ...categories].map(item => <button key={item.slug} className={category === item.slug ? "selected" : ""} onClick={() => setCategory(item.slug)}><span>{item.name}</span><small>{item.slug === "all" ? products.length : products.filter(product => product.categorySlug === item.slug).length}</small></button>)}</div><label className="filter-label">Price range</label><div className="price-inputs"><input type="number" value={minPrice} onChange={e => setMinPrice(Number(e.target.value))} aria-label="Minimum price" /><span>to</span><input type="number" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} aria-label="Maximum price" /></div><label className="filter-label">Minimum rating</label><div className="rating-filter">{[0, 4, 4.5].map(rating => <button key={rating} className={minRating === rating ? "selected" : ""} onClick={() => setMinRating(rating)}>{rating === 0 ? "Any rating" : <><Star size={13} fill="currentColor" /> {rating} & up</>}</button>)}</div><label className="check-row"><input type="checkbox" checked={onlyStock} onChange={e => setOnlyStock(e.target.checked)} /><span>In stock only</span></label><button className="reset-link" onClick={() => { setCategory("all"); setSearch(""); setSort("featured"); setOnlyStock(false); setMinPrice(0); setMaxPrice(900000); setMinRating(0); }}>Reset filters</button></aside><section className="results-section"><div className="results-toolbar"><span><strong>{visibleProducts.length}</strong> results{search && <> for “{search}”</>}</span><div className="toolbar-actions"><div className="view-toggle"><button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} aria-label="Grid view"><Grid2X2 size={16} /></button><button className={view === "list" ? "active" : ""} onClick={() => setView("list")} aria-label="List view"><List size={17} /></button></div><select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort products"><option value="featured">Sort: Featured</option><option value="deal">Best deals</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="newest">Newest</option><option value="rating">Best rating</option></select></div></div>{visibleProducts.length ? <div className={`product-grid ${view === "list" ? "list-view" : ""}`}>{visibleProducts.map(product => <ProductCard key={product.id} product={product} compact={view === "list"} />)}</div> : <div className="empty-state"><SearchCheck size={34} /><h3>No products on this signal</h3><p>Try a wider price range or a different category.</p><button className="button button-dark" onClick={() => { setCategory("all"); setSearch(""); }}>Clear filters</button></div>}</section></div></div>;
}

function ProductDetailPage() {
  const [, params] = useRoute("/products/:slug");
  const detailQuery = trpc.catalog.bySlug.useQuery({ slug: params?.slug || "" }, { enabled: Boolean(params?.slug), staleTime: 30000, retry: false });
  const product = detailQuery.data?.product ?? getProduct(params?.slug || "");
  const { addToCart } = useMarketplace();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewFilter, setReviewFilter] = useState("all");
  const [saved, setSaved] = useState(false);
  if (!product) return <NotFound />;
  const discount = product.compareAt ? Math.round((1 - product.price / product.compareAt) * 100) : 0;
  const related = products.filter(item => item.id !== product.id && (item.categorySlug === product.categorySlug || item.tags.some(tag => product.tags.includes(tag)))).slice(0, 4);
  return <div className="detail-page container"><div className="breadcrumbs"><a href="/" onClick={e => { e.preventDefault(); go("/"); }}>Home</a><ChevronRight size={14} /><a href={`/products?category=${product.categorySlug}`} onClick={e => { e.preventDefault(); go(`/products?category=${product.categorySlug}`); }}>{product.category}</a><ChevronRight size={14} /><span>{product.name}</span></div><div className="detail-layout"><section className="gallery"><div className="gallery-main"><img src={product.images[activeImage]} alt={product.name} /><span className="zoom-hint"><Eye size={14} /> Hover to inspect</span></div><div className="gallery-thumbs">{product.images.map((image, index) => <button key={image} className={activeImage === index ? "active" : ""} onClick={() => setActiveImage(index)}><img src={image} alt={`${product.name} view ${index + 1}`} /></button>)}</div></section><section className="detail-copy"><div className="eyebrow">{product.brand} · SKU {product.sku}</div><h1>{product.name}</h1><div className="detail-rating"><span className="star-row"><Star size={15} fill="currentColor" /> {product.rating}</span><a href="#reviews">{product.reviews} customer reviews</a><StatusChip tone="success" icon={<BadgeCheck size={13} />}>Verified listing</StatusChip></div><p className="detail-description">{product.description}</p><div className="detail-price"><strong>{formatNaira(product.price)}</strong>{product.compareAt && <del>{formatNaira(product.compareAt)}</del>}{discount > 0 && <StatusChip tone="orange">Save {discount}%</StatusChip>}</div><div className="buy-box"><div className="stock-line"><span className="stock-dot" />{product.stock < 10 ? `Only ${product.stock} units left` : "In stock and ready to dispatch"}<span className="delivery-note"><Truck size={14} /> Delivery available</span></div><div className="buy-actions"><div className="quantity-stepper"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={15} /></button><strong>{quantity}</strong><button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}><Plus size={15} /></button></div><button className="button button-orange grow" onClick={() => { addToCart(product, quantity); toast.success("Added to cart", { description: `${quantity} × ${product.name}` }); }}>Add to cart <ShoppingBag size={17} /></button><button className={`icon-button wishlist-button ${saved ? "is-saved" : ""}`} onClick={() => { setSaved(!saved); toast(saved ? "Removed from wishlist" : "Saved to wishlist"); }} aria-label="Wishlist"><Heart size={19} fill={saved ? "currentColor" : "none"} /></button></div><button className="buy-now-link" onClick={() => { addToCart(product, quantity); go("/cart"); }}>Buy now <ArrowRight size={15} /></button></div><div className="seller-card"><div className="seller-avatar">{product.seller.slice(0, 2).toUpperCase()}</div><div><small>Sold by</small><strong>{product.seller} <BadgeCheck size={14} /></strong><span><Star size={12} fill="currentColor" /> {product.sellerRating} seller rating</span></div><button className="text-link">View store <ArrowUpRight size={14} /></button></div><div className="detail-benefits"><div><ShieldCheck size={17} /><span><strong>{product.warranty} warranty</strong><small>Warranty-backed purchase</small></span></div><div><RotateIcon /><span><strong>7-day returns</strong><small>Simple return policy</small></span></div><div><LockKeyhole size={17} /><span><strong>Secure checkout</strong><small>Your payment stays protected</small></span></div></div></section></div><section className="spec-review-grid"><div className="spec-panel"><div className="section-eyebrow">At a glance</div><h2>Built to be understood.</h2><p>Every product page keeps the details close, so you can decide with the full picture.</p><div className="spec-list">{product.specs.map(spec => <div key={spec.label}><span>{spec.label}</span><strong>{spec.value}</strong></div>)}</div></div><div className="review-panel" id="reviews"><div className="section-eyebrow">Customer signal</div><div className="review-summary"><div><strong>{product.rating}</strong><span className="star-row"><Star size={15} fill="currentColor" /> Excellent</span></div><span className="muted">Based on {product.reviews} verified reviews</span></div><div className="review-filter-row">{["all", "5", "4", "3"].map(filter => <button key={filter} className={reviewFilter === filter ? "active" : ""} onClick={() => setReviewFilter(filter)}>{filter === "all" ? "All reviews" : `${filter} stars`}</button>)}</div><div className="review-item"><div className="review-avatar">JM</div><div><div className="review-top"><strong>Joseph M.</strong><span className="star-row"><Star size={12} fill="currentColor" /> 5.0</span><small>Verified purchase</small></div><p>Exactly as described and the packaging was careful. The seller answered my spec question quickly.</p></div></div><div className="review-item"><div className="review-avatar">SA</div><div><div className="review-top"><strong>Sade A.</strong><span className="star-row"><Star size={12} fill="currentColor" /> 4.0</span><small>Verified purchase</small></div><p>Good value and delivery updates were clear. I would buy from this store again.</p></div></div></div></section><section className="section-block related-section"><SectionHeading eyebrow="Keep exploring" title="You might also need" /><div className="product-rail">{related.map(item => <ProductCard key={item.id} product={item} compact />)}</div></section></div>;
}

function CartPage() {
  const { cart, cartCount, cartTotal, updateCart, removeFromCart, clearCart } = useMarketplace();
  const createOrder = trpc.orders.create.useMutation();
  const [step, setStep] = useState(1);
  const [payment, setPayment] = useState("card");
  const [coupon, setCoupon] = useState("");
  const shipping = cartTotal > 250000 ? 0 : cart.length ? 3500 : 0;
  const tax = Math.round(cartTotal * 0.015);
  const total = cartTotal + shipping + tax;
  if (!cart.length) return <div className="container empty-cart"><div className="empty-illustration"><ShoppingBag size={37} /></div><div className="section-eyebrow">Your cart is quiet</div><h1>Nothing here yet.</h1><p>Start with a smart upgrade or a tiny part for your next big idea.</p><button className="button button-orange" onClick={() => go("/products")}>Explore the catalog <ArrowRight size={16} /></button></div>;
  const completeOrder = async (event?: React.FormEvent) => {
    event?.preventDefault();
    try {
      const response = await createOrder.mutateAsync({ paymentMethod: payment as "card" | "transfer" | "cod" | "mobile", shippingAddress: "Guest checkout address captured in the delivery form", items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity })) });
      clearCart();
      go(`/orders/${response.orderNumber}`);
      toast.success("Order received", { description: response.persisted ? "Your order is saved and ready for confirmation." : "Your order is queued for confirmation." });
    } catch {
      toast.error("Order could not be placed", { description: "Please check stock and try again." });
    }
  };
  return <div className="cart-page container"><div className="breadcrumbs"><a href="/" onClick={e => { e.preventDefault(); go("/"); }}>Home</a><ChevronRight size={14} /><span>Cart & checkout</span></div><div className="checkout-head"><div><div className="section-eyebrow">Secure checkout</div><h1>Ready when you are.</h1></div><div className="checkout-steps">{["Cart", "Delivery", "Review"].map((label, index) => <div key={label} className={step >= index + 1 ? "current" : ""}><span>{index + 1}</span>{label}</div>)}</div></div><div className="cart-layout"><section className="cart-main"><div className="cart-panel"><div className="panel-heading"><strong>{cartCount} items in your cart</strong><span>Prices in Nigerian Naira</span></div>{cart.map(item => <div className="cart-item" key={item.product.id}><img src={item.product.images[0]} alt={item.product.name} /><div className="cart-item-info"><a href={`/products/${item.product.slug}`} onClick={e => { e.preventDefault(); go(`/products/${item.product.slug}`); }}>{item.product.name}</a><small>{item.product.brand} · {item.product.sku}</small><StatusChip tone="success" icon={<Check size={12} />}>In stock</StatusChip></div><div className="cart-item-price"><strong>{formatNaira(item.product.price * item.quantity)}</strong><span>{formatNaira(item.product.price)} each</span></div><div className="quantity-stepper compact-stepper"><button onClick={() => updateCart(item.product.id, item.quantity - 1)}><Minus size={14} /></button><strong>{item.quantity}</strong><button onClick={() => updateCart(item.product.id, item.quantity + 1)}><Plus size={14} /></button></div><button className="icon-button remove-item" onClick={() => removeFromCart(item.product.id)} aria-label={`Remove ${item.product.name}`}><Trash2 size={16} /></button></div>)}</div>{step > 1 && <form className="checkout-form" onSubmit={completeOrder}><div className="panel-heading"><strong>Delivery details</strong><span>We only use this to deliver your order</span></div><div className="form-grid"><label>Full name<input required placeholder="Your full name" /></label><label>Phone number<input required placeholder="0707 710 6232" /></label><label className="span-2">Email address<input type="email" required placeholder="you@example.com" /></label><label className="span-2">Street address<input required placeholder="House number, street and landmark" /></label><label>City<input required placeholder="Lagos" /></label><label>State<select defaultValue="Lagos"><option>Lagos</option><option>Abuja</option><option>Rivers</option><option>Oyo</option><option>Kaduna</option></select></label></div><div className="shipping-options"><strong>Shipping method</strong><label className="radio-card selected"><input type="radio" name="shipping" defaultChecked /><span><Truck size={17} /><b>Standard delivery</b><small>2–4 business days</small></span><strong>{shipping ? formatNaira(shipping) : "Free"}</strong></label><label className="radio-card"><input type="radio" name="shipping" /><span><Zap size={17} /><b>Priority dispatch</b><small>Next business day in Lagos</small></span><strong>{formatNaira(8500)}</strong></label></div><div className="payment-options"><strong>Payment method</strong><div className="payment-grid">{[{ id: "card", label: "Card", icon: CreditCard }, { id: "transfer", label: "Bank transfer", icon: Banknote }, { id: "cod", label: "Cash on delivery", icon: WalletCards }, { id: "mobile", label: "Mobile money", icon: Smartphone }].map(option => { const Icon = option.icon; return <button type="button" key={option.id} className={`payment-card ${payment === option.id ? "selected" : ""}`} onClick={() => setPayment(option.id)}><Icon size={18} /><span>{option.label}</span>{payment === option.id && <Check size={14} />}</button>; })}</div>{payment !== "card" && <div className="manual-note"><CircleHelp size={16} /><span>{payment === "transfer" ? "Transfer instructions will appear after you place the order." : payment === "mobile" ? "A payment prompt will be sent after order review." : "Pay in cash when your order arrives. Please keep the exact amount ready."}</span></div>}</div></form>}{step === 1 && <button className="button button-orange checkout-next" onClick={() => setStep(2)}>Continue to delivery <ArrowRight size={16} /></button>}{step === 2 && <button className="button button-orange checkout-next" onClick={() => setStep(3)}>Review order <ArrowRight size={16} /></button>}{step === 3 && <div className="review-submit"><div><strong>One last look.</strong><span>{cartCount} items · {payment === "card" ? "Card checkout" : payment === "transfer" ? "Bank transfer" : payment === "cod" ? "Cash on delivery" : "Mobile money"}</span></div><button className="button button-orange" onClick={completeOrder}>Place order <Check size={16} /></button></div>}</section><aside className="summary-card"><div className="panel-heading"><strong>Order summary</strong><span><LockKeyhole size={13} /> secure</span></div><div className="summary-lines"><div><span>Subtotal</span><strong>{formatNaira(cartTotal)}</strong></div><div><span>Shipping</span><strong>{shipping ? formatNaira(shipping) : "Free"}</strong></div><div><span>Tax</span><strong>{formatNaira(tax)}</strong></div></div><form className="coupon-row" onSubmit={e => { e.preventDefault(); if (coupon.toUpperCase() === "SIGNAL10") toast.success("Coupon applied", { description: "10% off your order" }); else toast("Try SIGNAL10 for 10% off"); }}><input value={coupon} onChange={e => setCoupon(e.target.value)} placeholder="Promo code" /><button type="submit">Apply</button></form><div className="summary-total"><span>Total</span><strong>{formatNaira(total)}</strong></div><div className="summary-trust"><div><ShieldCheck size={15} /> Buyer protection included</div><div><Truck size={15} /> Delivery tracking included</div></div></aside></div></div>;
}

function AccountPage() {
  const [tab, setTab] = useState("overview");
  const tabs = [{ id: "overview", label: "Overview", icon: LayoutDashboard }, { id: "orders", label: "Orders", icon: Package }, { id: "saved", label: "Saved items", icon: Heart }, { id: "settings", label: "Settings", icon: Settings }];
  return <div className="container account-page"><div className="account-welcome"><div><div className="section-eyebrow">Your control room</div><h1>Good to see you, builder.</h1><p>Keep your orders, saved gear, and delivery details in one place.</p></div><button className="button button-dark" onClick={() => { try { startLogin(); } catch { toast("Sign-in is available from the live Preview"); } }}><UserRound size={16} /> Sign in with Manus</button></div><div className="account-layout"><aside className="account-nav"><div className="profile-mini"><span className="profile-avatar">SP</span><div><strong>Guest account</strong><small>Sign in to unlock your dashboard</small></div></div>{tabs.map(tabItem => { const Icon = tabItem.icon; return <button key={tabItem.id} className={tab === tabItem.id ? "active" : ""} onClick={() => setTab(tabItem.id)}><Icon size={16} />{tabItem.label}</button>; })}<div className="account-help"><CircleHelp size={17} /><strong>Need a hand?</strong><p>Talk to support on WhatsApp or email.</p><a href="/contact" onClick={e => { e.preventDefault(); go("/contact"); }}>Open help center <ArrowRight size={14} /></a></div></aside><section className="account-content">{tab === "overview" && <><div className="account-stat-grid"><div><span>Open orders</span><strong>02</strong><small>One dispatching today</small></div><div><span>Saved items</span><strong>08</strong><small>Three price drops</small></div><div><span>Swift credits</span><strong>₦0</strong><small>Earn on every review</small></div></div><div className="panel-heading"><strong>Recent orders</strong><button className="text-link" onClick={() => setTab("orders")}>View all <ArrowRight size={14} /></button></div><OrderRow order="SPX-402981" status="Shipped" date="03 Oct 2026" total="₦168,000" item="VectorHub AX3000 Mesh Router" /><OrderRow order="SPX-401772" status="Delivered" date="28 Sep 2026" total="₦48,500" item="MakerBoard M7 Development Kit" /><div className="account-callout"><div className="callout-icon"><Store size={20} /></div><div><div className="section-eyebrow">Have gear to share?</div><h3>Sell on SwiftPixel</h3><p>Reach curious buyers with a storefront that makes specs easy to trust.</p></div><button className="button button-outline" onClick={() => go("/seller")}>Open seller hub <ArrowUpRight size={15} /></button></div></>}{tab === "orders" && <div className="tab-panel"><div className="panel-heading"><strong>Order history</strong><span>Last 90 days</span></div><OrderRow order="SPX-402981" status="Shipped" date="03 Oct 2026" total="₦168,000" item="VectorHub AX3000 Mesh Router" /><OrderRow order="SPX-401772" status="Delivered" date="28 Sep 2026" total="₦48,500" item="MakerBoard M7 Development Kit" /><OrderRow order="SPX-398241" status="Delivered" date="11 Sep 2026" total="₦119,000" item="SonicBeam ANC Headphones" /></div>}{tab === "saved" && <div className="tab-panel"><div className="panel-heading"><strong>Saved for later</strong><span>8 items</span></div><div className="saved-grid">{products.slice(2, 6).map(product => <ProductCard key={product.id} product={product} compact />)}</div></div>}{tab === "settings" && <div className="tab-panel settings-panel"><div className="panel-heading"><strong>Profile & preferences</strong><span>Changes save automatically</span></div><label>Full name<input defaultValue="Guest buyer" /></label><label>Email address<input defaultValue="alliridwan36@gmail.com" /></label><label>Phone number<input defaultValue="07077106232" /></label><div className="settings-row"><div><strong>Order updates</strong><small>Get notifications when an order moves</small></div><button className="toggle active" aria-label="Order updates enabled"><span /></button></div><div className="settings-row"><div><strong>Deal drops</strong><small>Occasional updates on useful price changes</small></div><button className="toggle active" aria-label="Deal drops enabled"><span /></button></div><button className="button button-dark" onClick={() => toast.success("Profile preferences saved")}>Save preferences <Check size={15} /></button></div>}</section></div></div>;
}

function OrderRow({ order, status, date, total, item }: { order: string; status: string; date: string; total: string; item: string }) { return <div className="order-row"><div className="order-icon"><Package size={17} /></div><div className="order-main"><strong>{order}</strong><span>{item}</span><small>{date}</small></div><StatusChip tone={status === "Delivered" ? "success" : "cyan"} icon={status === "Delivered" ? <Check size={12} /> : <Truck size={12} />}>{status}</StatusChip><strong className="order-total">{total}</strong><button className="icon-button"><ArrowUpRight size={16} /></button></div>; }

function ContactPage() {
  const [sent, setSent] = useState(false);
  const support = trpc.support.submit.useMutation();
  return <div className="container contact-page"><div className="contact-hero"><div><div className="section-eyebrow">Support, without the runaround</div><h1>Talk to the people behind the signal.</h1><p>Questions about a product, an order, or becoming a seller? We’ll point you in the right direction.</p></div><div className="contact-orbit"><MessageCircle size={26} /><span>Usually replies<br /><strong>within 10 min</strong></span></div></div><div className="contact-layout"><div className="contact-cards"><a href="https://wa.me/09126903370" className="contact-card whatsapp"><span><MessageCircle size={21} /></span><div><small>WhatsApp support</small><strong>09126903370</strong><p>Quick questions, order updates, and product checks.</p></div><ArrowUpRight size={16} /></a><a href="tel:07077106232" className="contact-card phone"><span><Phone size={21} /></span><div><small>Call the support desk</small><strong>07077106232</strong><p>Mon–Sat · 8:00am–6:00pm</p></div><ArrowUpRight size={16} /></a><a href="mailto:alliridwan36@gmail.com" className="contact-card email"><span><Mail size={21} /></span><div><small>Send an email</small><strong>alliridwan36@gmail.com</strong><p>We’ll reply with the details you need.</p></div><ArrowUpRight size={16} /></a></div><form className="support-form" onSubmit={async event => { event.preventDefault(); const form = new FormData(event.currentTarget); try { await support.mutateAsync({ name: String(form.get("name") || "Customer"), email: String(form.get("email") || ""), topic: String(form.get("topic") || "General support"), message: String(form.get("message") || "") }); setSent(true); } catch { toast.error("Please check your message details"); } }}><div className="section-eyebrow">Send a message</div><h2>What can we help you solve?</h2>{sent ? <div className="success-state"><div className="success-icon"><Check size={21} /></div><h3>Message received.</h3><p>Thanks for reaching out. Our support desk will reply shortly.</p><button type="button" className="button button-outline" onClick={() => setSent(false)}>Send another message</button></div> : <><div className="form-grid"><label>Your name<input required name="name" placeholder="e.g. Ada Lovelace" /></label><label>Email address<input required name="email" type="email" placeholder="you@example.com" /></label><label className="span-2">How can we help?<select name="topic" defaultValue=""><option value="" disabled>Select a topic</option><option>Product question</option><option>Order & delivery</option><option>Returns & warranty</option><option>Sell on SwiftPixel</option></select></label><label className="span-2">Message<textarea required name="message" placeholder="Tell us what you’re working on..." rows={5} /></label></div><button className="button button-orange" type="submit" disabled={support.isPending}>Send message <Send size={15} /></button></>}</form></div><section className="faq-strip"><div><div className="section-eyebrow">Quick answers</div><h2>Before you reach out.</h2></div><div className="faq-list"><details><summary>How do I track an order? <ChevronDown size={16} /></summary><p>Open your account area or use the tracking number in your order confirmation. Our team can also help on WhatsApp.</p></details><details><summary>Are sellers verified? <ChevronDown size={16} /></summary><p>Seller identity and store performance are reviewed before verification. Look for the verified badge on product and seller cards.</p></details><details><summary>How do warranties work? <ChevronDown size={16} /></summary><p>Each listing shows its warranty period. Contact support with your order number if you need help with a claim.</p></details></div></section></div>;
}

function OrderConfirmationPage() {
  const [, params] = useRoute("/orders/:orderNumber");
  const orderNumber = params?.orderNumber || "SPX-402981";
  return <div className="container confirmation-page"><div className="confirmation-card"><div className="success-icon large"><Check size={28} /></div><div className="section-eyebrow">Order received</div><h1>Good choice. We’re on it.</h1><p>Your order <strong>{orderNumber}</strong> is now in the queue. We’ll send the next update as soon as it dispatches.</p><div className="confirmation-meta"><div><span>Payment status</span><strong>Pending confirmation</strong></div><div><span>Estimated delivery</span><strong>2–4 business days</strong></div><div><span>Support</span><strong>07077106232</strong></div></div><div className="confirmation-actions"><button className="button button-orange" onClick={() => go("/account")}>View order history <ArrowRight size={15} /></button><button className="button button-outline" onClick={() => go("/products")}>Keep shopping</button></div></div><div className="timeline"><div className="timeline-item active"><span><Check size={13} /></span><div><strong>Order placed</strong><small>Just now</small></div></div><div className="timeline-line" /><div className="timeline-item"><span>2</span><div><strong>Confirmed by seller</strong><small>Usually within a few hours</small></div></div><div className="timeline-line" /><div className="timeline-item"><span>3</span><div><strong>On the way</strong><small>Tracking will be shared here</small></div></div></div></div>;
}

function SellerPage() {
  return <div className="container workspace-page"><div className="workspace-head"><div><StatusChip tone="cyan" icon={<Store size={13} />}>Seller workspace</StatusChip><h1>Make your store easy to trust.</h1><p>List better, see your signal, and keep customers moving.</p></div><button className="button button-orange" onClick={() => toast.success("Listing flow ready", { description: "Connect your seller account to add a product." })}><Plus size={16} /> Add product</button></div><div className="workspace-stats"><div><span>Store status</span><strong><span className="green-dot" /> Pending review</strong><small>Verification usually takes 1–2 days</small></div><div><span>Views this month</span><strong>2,438</strong><small><span className="trend-up">+18.4%</span> vs last month</small></div><div><span>Orders to dispatch</span><strong>14</strong><small>4 due today</small></div><div><span>Store rating</span><strong>4.8 <Star size={16} fill="currentColor" /></strong><small>From 126 verified reviews</small></div></div><div className="workspace-grid"><section className="workspace-panel"><div className="panel-heading"><strong>Your product signal</strong><button className="text-link">Manage listings <ArrowRight size={14} /></button></div>{products.slice(0, 4).map(product => <div className="listing-row" key={product.id}><img src={product.images[0]} alt="" /><div><strong>{product.name}</strong><small>{product.stock} in stock · {product.reviews} reviews</small></div><span>{formatNaira(product.price)}</span><StatusChip tone={product.stock < 10 ? "orange" : "success"}>{product.stock < 10 ? "Low stock" : "Live"}</StatusChip><button className="icon-button"><MoreIcon /></button></div>)}</section><section className="workspace-panel seller-tips"><div className="section-eyebrow">Store playbook</div><h2>Small signals, bigger confidence.</h2><p>Improve your listing quality with the things buyers actually look for.</p><div className="tip-row"><SearchCheck size={17} /><span><strong>Add complete specs</strong><small>Listings with clear specs convert better.</small></span></div><div className="tip-row"><BadgeCheck size={17} /><span><strong>Keep your warranty visible</strong><small>Make the post-purchase promise clear.</small></span></div><div className="tip-row"><BarChart3 size={17} /><span><strong>Watch your response time</strong><small>Fast answers build repeat buyers.</small></span></div><button className="button button-outline">Open seller guide <ArrowUpRight size={15} /></button></section></div><div className="workspace-banner"><div><div className="section-eyebrow">Payouts</div><h2>Keep the back office simple.</h2><p>Commission summaries and payment status live beside your orders, not in a spreadsheet maze.</p></div><button className="button button-dark">View commissions <ArrowRight size={15} /></button></div></div>;
}

function MoreIcon() { return <span className="more-dots">•••</span>; }

function AdminPage() {
  return <div className="container workspace-page"><div className="workspace-head"><div><StatusChip tone="orange" icon={<ShieldAlertIcon />}>Admin control room</StatusChip><h1>Keep the marketplace moving.</h1><p>A calm view of sales, trust, inventory, and the next action.</p></div><button className="button button-outline"><Settings size={16} /> Platform settings</button></div><div className="workspace-stats admin-stats"><div><span>Total sales</span><strong>₦18.4m</strong><small><span className="trend-up">+12.8%</span> this month</small></div><div><span>Active users</span><strong>8,294</strong><small><span className="trend-up">+6.2%</span> this month</small></div><div><span>Pending orders</span><strong>126</strong><small>18 need attention today</small></div><div><span>Top products</span><strong>42</strong><small>Across 6 categories</small></div></div><div className="admin-grid"><section className="analytics-card"><div className="panel-heading"><div><div className="section-eyebrow">Revenue pulse</div><strong>Sales are moving up and to the right.</strong></div><select defaultValue="30"><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></div><div className="chart-placeholder"><div className="chart-grid-lines"><span /><span /><span /><span /></div><svg viewBox="0 0 700 220" preserveAspectRatio="none" aria-label="Sales trend chart"><path d="M0 180 C70 165 80 178 135 140 S210 150 265 110 S330 125 390 96 S470 92 515 62 S620 74 700 28" fill="none" stroke="#ff7337" strokeWidth="4" strokeLinecap="round" /><path d="M0 180 C70 165 80 178 135 140 S210 150 265 110 S330 125 390 96 S470 92 515 62 S620 74 700 28 L700 220 L0 220Z" fill="url(#chartFill)" opacity=".18" /><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff7337" /><stop offset="1" stopColor="#ff7337" stopOpacity="0" /></linearGradient></defs></svg></div><div className="chart-labels"><span>Sep 04</span><span>Sep 11</span><span>Sep 18</span><span>Sep 25</span><span>Oct 03</span></div></section><section className="moderation-card"><div className="panel-heading"><strong>Needs a decision</strong><span>Today</span></div><div className="moderation-item"><span className="moderation-icon orange"><Package size={16} /></span><div><strong>18 orders need attention</strong><small>Dispatch window closes in 6 hours</small></div><ArrowRight size={15} /></div><div className="moderation-item"><span className="moderation-icon cyan"><Store size={16} /></span><div><strong>7 seller applications</strong><small>Ready for verification</small></div><ArrowRight size={15} /></div><div className="moderation-item"><span className="moderation-icon purple"><Eye size={16} /></span><div><strong>12 listings in review</strong><small>New products waiting for approval</small></div><ArrowRight size={15} /></div><button className="button button-dark full-width">Open moderation queue</button></section></div><div className="admin-lower"><section className="workspace-panel"><div className="panel-heading"><strong>Top products</strong><button className="text-link">View report <ArrowRight size={14} /></button></div>{products.slice(0, 5).map((product, index) => <div className="admin-product-row" key={product.id}><span className="rank">0{index + 1}</span><img src={product.images[0]} alt="" /><div><strong>{product.name}</strong><small>{product.reviews} reviews · {product.seller}</small></div><span className="admin-sales">{formatNaira(product.price * (index + 4))}</span><span className="trend-up">+{index + 7}%</span></div>)}</section><section className="workspace-panel admin-actions"><div className="section-eyebrow">Quick actions</div><h2>What needs your eye?</h2><button><UsersIcon /><span><strong>Manage users</strong><small>8,294 active records</small></span><ArrowRight size={14} /></button><button><Store size={17} /><span><strong>Verify sellers</strong><small>7 applications waiting</small></span><ArrowRight size={14} /></button><button><Package size={17} /><span><strong>Review products</strong><small>12 pending approval</small></span><ArrowRight size={14} /></button><button><ReceiptText size={17} /><span><strong>Financial report</strong><small>Export this month’s data</small></span><ArrowRight size={14} /></button></section></div></div>;
}

function ShieldAlertIcon() { return <ShieldCheck size={13} />; }
function UsersIcon() { return <UserRound size={17} />; }

function AppRouter() {
  return <Switch><Route path="/" component={HomePage} /><Route path="/products" component={ProductsPage} /><Route path="/products/:slug" component={ProductDetailPage} /><Route path="/cart" component={CartPage} /><Route path="/account" component={AccountPage} /><Route path="/contact" component={ContactPage} /><Route path="/orders/:orderNumber" component={OrderConfirmationPage} /><Route path="/seller" component={SellerPage} /><Route path="/admin" component={AdminPage} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

function App() {
  const [cart, setCart] = useState<CartItem[]>(() => { try { return JSON.parse(localStorage.getItem("swiftpixel-cart") || "[]"); } catch { return []; } });
  const [location] = useLocation();
  useEffect(() => { localStorage.setItem("swiftpixel-cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { const onPop = () => setCart(current => [...current]); window.addEventListener("popstate", onPop); return () => window.removeEventListener("popstate", onPop); }, []);
  useEffect(() => {
    const path = location.split("?")[0];
    const privateRoute = ["/account", "/orders/", "/seller", "/admin"].some(prefix => path === prefix || path.startsWith(prefix));
    const metadata = path === "/" ? { title: "SwiftPixel Electronics — Good gear. Clear signal.", description: "A trusted electronics marketplace for smart buyers, builders, and growing businesses." } : path === "/products" ? { title: "Shop the signal — SwiftPixel Electronics", description: "Browse verified smartphones, laptops, components, audio, networking, and accessories." } : path.startsWith("/products/") ? { title: "Product details — SwiftPixel Electronics", description: "See clear specifications, verified seller details, warranty, delivery, and reviews." } : path === "/cart" ? { title: "Cart & checkout — SwiftPixel Electronics", description: "Review your SwiftPixel order, delivery, payment method, and total." } : path === "/contact" ? { title: "Contact SwiftPixel Electronics", description: "Reach SwiftPixel support by phone, WhatsApp, or email." } : path.startsWith("/orders/") ? { title: "Order confirmation — SwiftPixel Electronics", description: "Track your SwiftPixel order status and delivery details." } : path === "/seller" ? { title: "Seller workspace — SwiftPixel Electronics", description: "Manage your SwiftPixel listings, inventory, orders, and seller signal." } : path === "/admin" ? { title: "Admin control room — SwiftPixel Electronics", description: "Monitor marketplace sales, moderation, sellers, orders, and platform health." } : { title: "Page not found — SwiftPixel Electronics", description: "The SwiftPixel page you requested could not be found." };
    document.title = metadata.title;
    const ensureMeta = (selector: string, attributes: Record<string, string>) => {
      let element = document.head.querySelector<HTMLMetaElement>(selector);
      if (!element) { element = document.createElement("meta"); document.head.appendChild(element); }
      Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
    };
    ensureMeta('meta[name="description"]', { name: "description", content: metadata.description });
    ensureMeta('meta[property="og:title"]', { property: "og:title", content: metadata.title });
    ensureMeta('meta[property="og:description"]', { property: "og:description", content: metadata.description });
    ensureMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    ensureMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary" });
    ensureMeta('meta[name="robots"]', { name: "robots", content: privateRoute ? "noindex, nofollow, noarchive" : "index, follow" });
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = `${window.location.origin}${path}`;
  }, [location]);
  const value = useMemo<MarketplaceContextValue>(() => ({ cart, addToCart: (product, quantity = 1) => setCart(items => { const existing = items.find(item => item.product.id === product.id); return existing ? items.map(item => item.product.id === product.id ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) } : item) : [...items, { product, quantity }]; }), updateCart: (productId, quantity) => setCart(items => quantity <= 0 ? items.filter(item => item.product.id !== productId) : items.map(item => item.product.id === productId ? { ...item, quantity: Math.min(item.product.stock, quantity) } : item)), removeFromCart: productId => setCart(items => items.filter(item => item.product.id !== productId)), clearCart: () => setCart([]), cartCount: cart.reduce((total, item) => total + item.quantity, 0), cartTotal: cart.reduce((total, item) => total + item.product.price * item.quantity, 0) }), [cart]);
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><MarketplaceContext.Provider value={value}><Toaster position="bottom-right" richColors /><Shell><AppRouter /></Shell></MarketplaceContext.Provider></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
