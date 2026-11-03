export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
}

export const PRODUCTS: Product[] = [
  { id: 'sunscreen', name: 'Sunscreen', description: 'Daily skincare protection.', priceInCents: 44900 },
  { id: 'instant-glow-facewash', name: 'Instant Glow Face Wash', description: 'A refreshing face wash for instant glow.', priceInCents: 39900 },
  { id: 'body-butter', name: 'Body Butter', description: 'Rich moisture for soft, smooth skin.', priceInCents: 59900 },
  { id: 'moisturising-facewash', name: 'Moisturising Face Wash', description: 'A gentle moisturising daily cleanse.', priceInCents: 39900 },
  { id: 'even-skin-facewash', name: 'Even Skin Face Wash', description: 'A daily cleanse for an even-looking complexion.', priceInCents: 39900 },
  { id: 'oil-control-facewash', name: 'Oil Control Face Wash', description: 'A refreshing cleanse for oil control.', priceInCents: 39900 },
]

export function getProduct(id: string) {
  return PRODUCTS.find((product) => product.id === id)
}
