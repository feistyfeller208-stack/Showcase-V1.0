export enum CatalogTheme {
  MINIMALIST = 'minimalist',
  GALLERY = 'gallery',
  CLASSIC = 'classic',
  MODERN = 'modern',
  BOLD = 'bold'
}

export interface CatalogItem {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
  notes?: string;
}

export interface CatalogThemeConfig {
  primaryColor: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  font: 'font-sans' | 'font-serif' | 'font-mono';
  fontSizeHeading?: 'text-2xl' | 'text-3xl' | 'text-4xl';
  fontSizeBody?: 'text-sm' | 'text-base' | 'text-lg';
  cardStyle?: 'rounded' | 'shadow' | 'border' | 'flat';
  spacing?: 'compact' | 'comfortable' | 'spacious';
  logoStyle?: 'circle' | 'square' | 'hidden';
  backgroundPattern?: 'none' | 'dots' | 'grid' | 'waves';
}

export interface CatalogEngagementStats {
  views: number;
  itemClicks: number;
  callClicks: number;
  whatsappClicks: number;
  directionClicks: number;
}

export interface Catalog {
  id: string;
  userId: string;
  businessId: string;
  businessName: string;
  slug: string;
  description: string;
  logoUrl?: string;
  template: CatalogTheme;
  theme: CatalogThemeConfig;
  items: CatalogItem[];
  whatsappNumber?: string;
  phoneNumber?: string;
  address?: string;
  isActive: boolean;
  createdAt: number;
  lastUpdated: number;
  engagementStats?: CatalogEngagementStats;
  shareStats?: {
    whatsapp: number;
    facebook: number;
    twitter: number;
    copy: number;
  };
}