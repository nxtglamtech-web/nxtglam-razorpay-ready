export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
}

export const PRODUCTS: Product[] = [
  { id: 'glow-facewash', name: 'Glow Facewash', description: 'A brightening, low-foam cleanse for everyday glow.', priceInCents: 49900 },
  { id: 'acne-facewash', name: 'Acne Facewash', description: 'A gentle clarifying cleanse for calm, balanced skin.', priceInCents: 54900 },
  { id: 'moisturising-facewash', name: 'Moisturising Facewash', description: 'A creamy daily cleanse that leaves skin soft and comfortable.', priceInCents: 49900 },
  { id: 'oil-control-facewash', name: 'Oil Control Facewash', description: 'A fresh, balanced cleanse for shine-prone skin.', priceInCents: 54900 },
  { id: 'vitamin-c-serum', name: 'Vitamin C Serum', description: 'Shield, radiant, protect with a concentrated vitamin C glow.', priceInCents: 99900 },
  { id: 'de-pigmentation-serum', name: 'De-Pigmentation Serum', description: 'Restore, replenish, revive with targeted brightening actives.', priceInCents: 99900 },
  { id: 'body-butter', name: 'Body Butter', description: 'Rich, cushiony moisture for smooth skin from head to toe.', priceInCents: 69900 },
  { id: 'spf-50-sunscreen', name: 'SPF 50+ Sunscreen', description: 'Daily broad-spectrum protection with a comfortable finish.', priceInCents: 79900 },
]

export function getProduct(id: string) {
  return PRODUCTS.find((product) => product.id === id)
}
