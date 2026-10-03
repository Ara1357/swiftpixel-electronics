export type Product = {
  id: number;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  brand: string;
  sku: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  stock: number;
  warranty: string;
  seller: string;
  sellerRating: number;
  description: string;
  specs: { label: string; value: string }[];
  images: string[];
  badge?: string;
  tags: string[];
};

export const categories = [
  { name: "Smartphones", slug: "smartphones", icon: "smartphone", count: "2,480+", tone: "cyan" },
  { name: "Laptops", slug: "laptops", icon: "laptop", count: "1,180+", tone: "navy" },
  { name: "Components", slug: "components", icon: "cpu", count: "3,920+", tone: "orange" },
  { name: "Accessories", slug: "accessories", icon: "cable", count: "6,400+", tone: "purple" },
  { name: "Audio", slug: "audio", icon: "headphones", count: "890+", tone: "green" },
  { name: "Networking", slug: "networking", icon: "wifi", count: "540+", tone: "blue" },
];

export const products: Product[] = [
  {
    id: 1,
    slug: "pixel-pro-x1-smartphone",
    name: "Pixel Pro X1 Smartphone",
    category: "Smartphones",
    categorySlug: "smartphones",
    brand: "Swift Mobile",
    sku: "SPX1-256-BLK",
    price: 389000,
    compareAt: 429000,
    rating: 4.8,
    reviews: 126,
    stock: 18,
    warranty: "24 months",
    seller: "SwiftPixel Official",
    sellerRating: 4.9,
    description: "A flagship smartphone with a vivid 6.7-inch OLED display, pro-grade camera system and all-day battery built for fast, focused work.",
    specs: [
      { label: "Display", value: "6.7\" OLED, 120Hz" },
      { label: "Memory", value: "12GB RAM / 256GB" },
      { label: "Camera", value: "50MP triple camera" },
      { label: "Battery", value: "5,000mAh fast charge" },
    ],
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=85",
    ],
    badge: "Top rated",
    tags: ["latest", "bestseller", "smartphone"],
  },
  {
    id: 2,
    slug: "orbitbook-air-14",
    name: "OrbitBook Air 14\"",
    category: "Laptops",
    categorySlug: "laptops",
    brand: "Orbit",
    sku: "ORB-A14-I7",
    price: 785000,
    compareAt: 860000,
    rating: 4.7,
    reviews: 89,
    stock: 9,
    warranty: "18 months",
    seller: "Circuit House",
    sellerRating: 4.7,
    description: "An ultra-light productivity laptop with a color-accurate display, quiet thermals and a full day of battery life.",
    specs: [
      { label: "Processor", value: "Intel Core i7 · 13th Gen" },
      { label: "Memory", value: "16GB / 512GB SSD" },
      { label: "Display", value: "14\" 2.8K IPS" },
      { label: "Weight", value: "1.24kg" },
    ],
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=85",
    ],
    badge: "Deal",
    tags: ["deal", "laptop", "new"],
  },
  {
    id: 3,
    slug: "makerboard-m7-development-kit",
    name: "MakerBoard M7 Development Kit",
    category: "Components",
    categorySlug: "components",
    brand: "MakerLab",
    sku: "ML-M7-DEVKIT",
    price: 48500,
    compareAt: 53000,
    rating: 4.9,
    reviews: 214,
    stock: 42,
    warranty: "12 months",
    seller: "ProtoParts NG",
    sellerRating: 4.8,
    description: "A flexible microcontroller development kit with Wi-Fi, Bluetooth and rich I/O for prototypes, automation and connected builds.",
    specs: [
      { label: "Chipset", value: "M7 dual-core 240MHz" },
      { label: "Connectivity", value: "Wi-Fi 6 / Bluetooth 5.3" },
      { label: "I/O", value: "34 GPIO · 12-bit ADC" },
      { label: "Voltage", value: "5V USB-C input" },
    ],
    images: [
      "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=85",
    ],
    badge: "Builder pick",
    tags: ["component", "maker", "bestseller"],
  },
  {
    id: 4,
    slug: "sonicbeam-anc-headphones",
    name: "SonicBeam ANC Headphones",
    category: "Audio",
    categorySlug: "audio",
    brand: "SonicBeam",
    sku: "SB-ANC-900",
    price: 119000,
    compareAt: 145000,
    rating: 4.6,
    reviews: 64,
    stock: 27,
    warranty: "12 months",
    seller: "Sound Select",
    sellerRating: 4.6,
    description: "Immersive over-ear sound with adaptive noise cancellation, low-latency mode and a comfortable all-day fit.",
    specs: [
      { label: "Playback", value: "Up to 42 hours" },
      { label: "Connection", value: "Bluetooth 5.3 · USB-C" },
      { label: "Modes", value: "ANC · transparency · gaming" },
      { label: "Microphones", value: "4-mic beamforming" },
    ],
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=85",
    ],
    badge: "-18%",
    tags: ["audio", "deal", "bestseller"],
  },
  {
    id: 5,
    slug: "vectorhub-ax3000-router",
    name: "VectorHub AX3000 Mesh Router",
    category: "Networking",
    categorySlug: "networking",
    brand: "VectorHub",
    sku: "VH-AX3000-2PK",
    price: 168000,
    compareAt: 189000,
    rating: 4.5,
    reviews: 41,
    stock: 13,
    warranty: "18 months",
    seller: "Network Works",
    sellerRating: 4.7,
    description: "Whole-home Wi-Fi coverage with simple app setup, intelligent roaming and reliable speeds for busy connected spaces.",
    specs: [
      { label: "Standard", value: "Wi-Fi 6 AX3000" },
      { label: "Coverage", value: "Up to 450m², 2-pack" },
      { label: "Ports", value: "4x Gigabit Ethernet" },
      { label: "Security", value: "WPA3 + guest network" },
    ],
    images: [
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1606904825846-647eb07f5be6?auto=format&fit=crop&w=900&q=85",
    ],
    tags: ["networking", "home-office"],
  },
  {
    id: 6,
    slug: "voltcraft-smart-soldering-station",
    name: "VoltCraft Smart Soldering Station",
    category: "Components",
    categorySlug: "components",
    brand: "VoltCraft",
    sku: "VC-TS1000",
    price: 92000,
    compareAt: 110000,
    rating: 4.8,
    reviews: 77,
    stock: 7,
    warranty: "12 months",
    seller: "ProtoParts NG",
    sellerRating: 4.8,
    description: "Precision temperature control, fast heat-up and a compact footprint for careful bench work and repair workflows.",
    specs: [
      { label: "Temperature", value: "100–480°C digital" },
      { label: "Heat-up", value: "8 seconds to 350°C" },
      { label: "Input", value: "220–240V AC" },
      { label: "Included", value: "Stand, tips, sponge" },
    ],
    images: [
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1581092919535-7146ff1a5904?auto=format&fit=crop&w=900&q=85",
    ],
    badge: "Low stock",
    tags: ["component", "tools", "builder"],
  },
  {
    id: 7,
    slug: "swiftpixel-usbc-power-dock",
    name: "SwiftPixel USB-C Power Dock",
    category: "Accessories",
    categorySlug: "accessories",
    brand: "SwiftPixel",
    sku: "SP-DOCK-12",
    price: 67500,
    compareAt: 79000,
    rating: 4.7,
    reviews: 52,
    stock: 31,
    warranty: "24 months",
    seller: "SwiftPixel Official",
    sellerRating: 4.9,
    description: "A compact desktop dock with fast power delivery, dual display support and one-cable convenience for modern setups.",
    specs: [
      { label: "Power", value: "100W PD passthrough" },
      { label: "Display", value: "2x HDMI 2.0" },
      { label: "Ports", value: "USB-C, 3x USB-A, SD" },
      { label: "Compatibility", value: "Windows, macOS, Linux" },
    ],
    images: [
      "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=85&sat=-30",
    ],
    badge: "Swift pick",
    tags: ["accessory", "deal", "desk"],
  },
  {
    id: 8,
    slug: "aerocharge-65w-gan-adapter",
    name: "AeroCharge 65W GaN Adapter",
    category: "Accessories",
    categorySlug: "accessories",
    brand: "AeroCharge",
    sku: "AC-GAN-65W",
    price: 39500,
    compareAt: 46000,
    rating: 4.4,
    reviews: 33,
    stock: 55,
    warranty: "12 months",
    seller: "Charge Lab",
    sellerRating: 4.5,
    description: "A travel-friendly GaN charger with dual USB-C outputs for laptops, phones and everyday carry kits.",
    specs: [
      { label: "Output", value: "65W max USB-C PD" },
      { label: "Ports", value: "2x USB-C + USB-A" },
      { label: "Protection", value: "Over-voltage + thermal" },
      { label: "Size", value: "42% smaller than standard" },
    ],
    images: [
      "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=85&sat=-50",
      "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=85&sat=-70",
    ],
    tags: ["accessory", "travel", "power"],
  },
];

export const testimonials = [
  { quote: "Finally, a place where the part specs are as clear as the price. My prototype shipped the same day.", name: "Amina Yusuf", role: "Hardware builder", initials: "AY" },
  { quote: "The seller verification and warranty details make buying components for our studio much easier.", name: "Kelechi Nwosu", role: "Studio operations", initials: "KN" },
  { quote: "SwiftPixel feels built for people who actually care about the details. The deals are a bonus.", name: "Tunde Adeyemi", role: "Product designer", initials: "TA" },
];

export const formatNaira = (value: number) => `₦${value.toLocaleString("en-NG")}`;

export const getProduct = (slug: string) => products.find(product => product.slug === slug);
