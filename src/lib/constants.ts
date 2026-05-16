import { DressCategory } from "@/types/domain";

export const BUSINESS_INFO = {
  name: "Veil & Verses",
  address: "3890 Lake Arrowhead Blvd, Fremont, CA 94555",
  website: "veilverses.com",
  city: "Fremont, CA",
  primaryColor: "#C9A84C",
} as const;

export interface CategoryContent {
  category: DressCategory;
  description: string;
  slug: string;
}

export const CATEGORY_CONTENT: CategoryContent[] = [
  {
    category: "Bridal",
    slug: "bridal",
    description: "Timeless couture gowns, chapel veils, and bespoke styling for your ceremony.",
  },
  {
    category: "Quinceanera",
    slug: "quinceanera",
    description: "Regal ballgowns and sparkling details crafted for your grand entrance.",
  },
  {
    category: "Prom & Formal",
    slug: "prom-formal",
    description: "Modern silhouettes and statement finishes for unforgettable formal nights.",
  },
  {
    category: "Evening",
    slug: "evening",
    description: "Elegant eveningwear with luxurious fabrics and refined tailoring.",
  },
];
