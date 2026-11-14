
export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
}

export const PRODUCTS: Product[] = [
  { id: 'skin-brightening-facewash', name: 'Skin Brightening Face Wash', description: 'A refreshing daily face wash.', priceInCents: 39900 },
  { id: 'fresh-burst-moisturising-facewash', name: 'Fresh-Burst Moisturising Face Wash', description: 'A refreshing moisturising cleanse.', priceInCents: 39900 },
  { id: 'oil-control-facewash', name: 'Oil Control Face Wash', description: 'A refreshing cleanse for oil control.', priceInCents: 39900 },
  { id: 'insta-glow-facewash', name: 'Insta Glow Face Wash', description: 'A refreshing face wash for glow.', priceInCents: 39900 },
  { id: 'extraa-moisturising-body-lotion', name: 'Extraa Moisturising Body Lotion', description: 'Daily moisturising body care.', priceInCents: 59900 },
  { id: 'vitamin-c-serum', name: 'Vitamin-C Serum', description: 'Vitamin C skincare serum.', priceInCents: 45000 },
  { id: 'de-pigmentation-serum', name: 'De-Pigmentation Serum', description: 'Targeted skincare serum.', priceInCents: 45000 },
  { id: 'sunscreen', name: 'Sunscreen', description: 'Daily sun care for your skincare routine.', priceInCents: 100 },
]

export function getProduct(id: string) {
  return PRODUCTS.find((product) => product.id === id)
}
