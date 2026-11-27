
export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  image: string
  galleryImages?: string[]
  howToUseImage?: string
  tagline: string
  quantity: string
  benefits: string[]
  ingredients: string[]
  usage: string
}

export const PRODUCTS: Product[] = [
  {
    id: 'skin-brightening-facewash',
    name: 'Skin Brightening Face Wash',
    description: `Give your skin a fresh start with a gentle cleanser designed for oily and blemish-prone skin. Formulated with Potassium Azeloyl Diglycinate and a mild glucoside cleansing system, it helps remove excess surface oil, dirt and impurities without stripping away essential moisture. Enriched with Glycerin and Sorbitol to help maintain skin hydration, it leaves your skin feeling clean, soft, balanced and refreshed after every wash.

A gentle blend of Potassium Azeloyl Diglycinate, Coco-Glucoside and Lauryl Glucoside, complemented by Glycerin, Sorbitol and Sodium Lactate to help cleanse, condition and maintain skin moisture.`,
    priceInCents: 25100,
    image: '/products/skin-brightening-facewash.jpeg',
    galleryImages: ['/products/skin-brightening-facewash.jpeg', '/products/skin-brightening-facewash-back.jpeg', '/products/skin-brightening-how-to-use.jpeg', '/products/skin-brightening-details.jpeg'],
    howToUseImage: '/products/skin-brightening-how-to-use.jpeg',
    tagline: 'Gentle Cleansing',
    quantity: '100ml',
    benefits: [
      'Helps remove excess surface oil, dirt and impurities',
      'Helps maintain skin hydration',
      'Leaves skin feeling clean, soft and balanced',
      'Designed for oily and blemish-prone skin'
    ],
    ingredients: [
      'Potassium Azeloyl Diglycinate',
      'Coco-Glucoside',
      'Lauryl Glucoside',
      'Glycerin',
      'Sorbitol',
      'Sodium Lactate'
    ],
    usage: 'Use as directed on the product label. Avoid contact with eyes.'
  },
  {
    id: 'fresh-burst-moisturising-facewash',
    name: 'Freshburst Face Wash',
    description: `Give your skin a refreshing daily cleanse. NXTGLAM Control Face Wash gently removes surface impurities and excess oil without leaving your skin feeling dry or tight. Enriched with Propanediol, Panthenol and Glycerin, it helps maintain skin moisture, while Walnut Shell Powder and Cellulose provide gentle exfoliation to smooth away dead skin cells. The result is skin that feels clean, soft, smooth and refreshed.

A skin-loving blend of Panthenol, Glycerin and Propanediol to help maintain hydration, combined with Salicylic Acid, Walnut Shell Powder and Cellulose to cleanse, exfoliate and refine the skin's feel.`,
    priceInCents: 25100,
    image: '/products/fresh-burst-moisturising-facewash.jpeg',
    galleryImages: ['/products/fresh-burst-moisturising-facewash.jpeg', '/products/fresh-burst-facewash-back.jpeg', '/products/fresh-burst-how-to-use.jpeg', '/products/fresh-burst-details.jpeg'],
    howToUseImage: '/products/fresh-burst-how-to-use.jpeg',
    tagline: 'Deep Cleansing',
    quantity: '100ml',
    benefits: [
      'Gently removes surface impurities and excess oil',
      'Helps maintain skin moisture',
      'Provides gentle exfoliation',
      'Leaves skin feeling clean, soft and refreshed'
    ],
    ingredients: [
      'Propanediol',
      'Panthenol',
      'Glycerin',
      'Salicylic Acid',
      'Walnut Shell Powder',
      'Cellulose'
    ],
    usage: 'Use as directed on the product label. Avoid contact with eyes.'
  },
  {
    id: 'oil-control-facewash',
    name: 'Oil Control Face Wash',
    description: `Give your skin the perfect balance of freshness and care. NXTGLAM Control Face Wash gently cleanses away excess oil, surface impurities and daily buildup without leaving your skin feeling dry or tight. Enriched with Niacinamide, Zinc PCA and Salicylic Acid, it helps control excess oil and keep skin feeling fresh and clean. Walnut Shell Powder provides gentle exfoliation, while Glycerin and Honey help maintain skin moisture, leaving your skin feeling smooth, refreshed and balanced.

A powerful blend of Niacinamide, Zinc PCA and Salicylic Acid to help manage excess oil and cleanse pores, complemented by Glycerin and Honey to help maintain moisture. Walnut Shell Powder adds gentle exfoliation for a smoother, refreshed skin feel.`,
    priceInCents: 25100,
    image: '/products/oil-control-facewash.jpeg',
    galleryImages: ['/products/oil-control-facewash.jpeg', '/products/oil-control-facewash-back.jpeg', '/products/oil-control-how-to-use.jpeg', '/products/oil-control-details.jpeg'],
    howToUseImage: '/products/oil-control-how-to-use.jpeg',
    tagline: 'Oil Control',
    quantity: '100ml',
    benefits: [
      'Helps control excess oil',
      'Cleanses surface impurities and daily buildup',
      'Helps maintain skin moisture',
      'Provides gentle exfoliation',
      'Leaves skin feeling fresh and balanced'
    ],
    ingredients: [
      'Niacinamide',
      'Zinc PCA',
      'Salicylic Acid',
      'Walnut Shell Powder',
      'Glycerin',
      'Honey'
    ],
    usage: 'Use as directed on the product label. Avoid contact with eyes.'
  },
  {
    id: 'insta-glow-facewash',
    name: 'Insta Glow Face Wash',
    description: `Reveal your skin's natural radiance with this refreshing, gentle exfoliating cleanser. Enriched with Niacinamide and Vitamin C, it helps improve the appearance of dull skin and promotes a brighter, healthy-looking glow. The goodness of Green Tea and Licorice Extracts helps care for your skin, while Walnut and Apricot Shell Powders gently exfoliate dead skin cells. With Glycerin and Vitamin E to help maintain skin moisture, it leaves your skin feeling clean, soft, smooth and refreshed.

A skin-loving blend of Niacinamide, Vitamin C, Green Tea Extract, Licorice Extract, Glycerin and Vitamin E, complemented by gentle exfoliating particles from Walnut and Apricot Shell Powders.`,
    priceInCents: 25100,
    image: '/products/insta-glow-facewash.jpeg',
    galleryImages: ['/products/insta-glow-facewash.jpeg', '/products/insta-glow-facewash-back.jpeg', '/products/insta-glow-how-to-use.jpeg', '/products/insta-glow-details.jpeg'],
    tagline: 'Brighten & Glow',
    quantity: '100ml',
    benefits: [
      'Helps improve the appearance of dull skin',
      'Promotes a brighter, healthy-looking glow',
      'Provides gentle exfoliation',
      'Helps maintain skin moisture',
      'Leaves skin feeling clean, soft and refreshed'
    ],
    ingredients: [
      'Niacinamide',
      'Vitamin C',
      'Green Tea Extract',
      'Licorice Extract',
      'Walnut Shell Powder',
      'Apricot Shell Powder',
      'Glycerin',
      'Vitamin E'
    ],
    usage: 'Use as directed on the product label. Avoid contact with eyes.'
  },
  {
    id: 'extraa-moisturising-body-lotion',
    name: 'Extra Moisturising Body Lotion',
    description: `Give your skin the nourishment it deserves. NXTGLAM Extra Moisturising Body Lotion deeply nourishes and comforts dry skin, leaving it feeling soft, smooth and hydrated for up to 24 hours. Its lightweight, easily spreadable formula helps soothe skin tightness and protect against everyday dryness, keeping your skin moisturised, supple and comfortable throughout the day.

Enriched with the goodness of Coconut Oil, Almond Oil, Beeswax, Cocoa Butter and Shea Butter, this nourishing blend helps replenish moisture, soften dry skin and maintain lasting hydration. Thoughtfully formulated with Phenoxyethanol and Ethylhexylglycerin as preservatives.`,
    priceInCents: 49900,
    image: '/products/extraa-moisturising-body-lotion.jpeg',
    galleryImages: ['/products/extraa-moisturising-body-lotion.jpeg', '/products/extraa-moisturising-body-lotion-back.jpeg', '/products/body-lotion-how-to-use.jpeg', '/products/body-lotion-details.jpeg'],
    howToUseImage: '/products/body-lotion-how-to-use.jpeg',
    tagline: '24-Hour Moisture',
    quantity: '250ml',
    benefits: [
      'Deeply nourishes and comforts dry skin',
      'Helps maintain hydration for up to 24 hours',
      'Helps soothe skin tightness',
      'Helps protect against everyday dryness',
      'Leaves skin feeling soft, smooth and supple'
    ],
    ingredients: [
      'Coconut Oil',
      'Almond Oil',
      'Beeswax',
      'Cocoa Butter',
      'Shea Butter',
      'Phenoxyethanol',
      'Ethylhexylglycerin'
    ],
    usage: 'Apply as directed on the product label.'
  },
  {
    id: 'vitamin-c-serum',
    name: 'Vitamin C Serum',
    description: `Reveal your skin's natural radiance with Radiant Shield Pro, a lightweight, antioxidant-rich serum designed to brighten, hydrate and revitalise your skin. Powered by Ethyl Ascorbic Acid (Vitamin C), Ferulic Acid and Vitamin E, it helps defend against everyday environmental stressors while improving the appearance of dullness and uneven skin tone. Enriched with Melazero, Aquaxyl, Hyaluronic Acid and Glycerin, it helps reduce the appearance of pigmentation, replenish moisture and support a healthy-looking glow. Experience skin that feels hydrated, refreshed and visibly radiant.

A powerful blend of Vitamin C, Ferulic Acid and Vitamin E for antioxidant care, complemented by Melazero, Green Tea Extract, Aquaxyl, Hyaluronic Acid and Glycerin to support skin hydration, radiance and an even-looking complexion.`,
    priceInCents: 44900,
    image: '/products/vitamin-c-serum.jpeg',
    galleryImages: ['/products/vitamin-c-serum.jpeg', '/products/vitamin-c-serum-how-to-use.jpeg'],
    tagline: 'Brighten & Revitalise',
    quantity: '10ml',
    benefits: [
      'Helps improve the appearance of dullness',
      'Supports a healthy-looking glow',
      'Helps reduce the appearance of pigmentation',
      'Helps replenish skin moisture',
      'Provides antioxidant care'
    ],
    ingredients: [
      'Ethyl Ascorbic Acid (Vitamin C)',
      'Ferulic Acid',
      'Vitamin E',
      'Melazero',
      'Green Tea Extract',
      'Aquaxyl',
      'Hyaluronic Acid',
      'Glycerin'
    ],
    usage: 'Use as directed on the product label. Patch test before use.'
  },
  {
    id: 'de-pigmentation-serum',
    name: 'Tone Perfect Serum',
    description: `Reveal a brighter, more even-looking complexion with our advanced multi-action brightening serum. Powered by Vitamin C, Niacinamide, Kojic Acid, Alpha Arbutin and Tranexamic Acid, this potent formula helps reduce the appearance of dark spots, pigmentation and uneven skin tone. Enriched with Glutathione and Ferulic Acid for antioxidant care, alongside Sodium Hyaluronate and Pentavitin to replenish moisture and maintain skin hydration. Finished with Vitamin E and nourishing Olive and Almond Esters, it leaves your skin feeling soft, smooth, hydrated and visibly radiant.

A powerful combination of Vitamin C, Niacinamide, Kojic Acid, Alpha Arbutin, PAD and Tranexamic Acid, complemented by Glutathione, Ferulic Acid, Vitamin E and skin-hydrating ingredients for a brighter, smoother and more even-looking complexion.`,
    priceInCents: 44900,
    image: '/products/de-pigmentation-serum.jpeg',
    galleryImages: ['/products/de-pigmentation-serum.jpeg', '/products/tone-perfect-serum-how-to-use.jpeg'],
    tagline: 'Fade Dark Spots',
    quantity: '10ml',
    benefits: [
      'Helps reduce the appearance of dark spots',
      'Helps improve the appearance of uneven skin tone',
      'Provides antioxidant care',
      'Helps replenish skin moisture',
      'Leaves skin feeling soft, smooth and hydrated'
    ],
    ingredients: [
      'Vitamin C',
      'Niacinamide',
      'Kojic Acid',
      'Alpha Arbutin',
      'PAD',
      'Tranexamic Acid',
      'Glutathione',
      'Ferulic Acid',
      'Sodium Hyaluronate',
      'Pentavitin',
      'Vitamin E',
      'Olive Esters',
      'Almond Esters'
    ],
    usage: 'Use as directed on the product label. Patch test before use.'
  },
  {
    id: 'sunscreen',
    name: 'Sunscreen',
    description: `Meet your everyday sun-care essential. This lightweight sunscreen helps protect your skin from UV exposure while keeping it soft, smooth and moisturised. Enriched with Niacinamide, Panthenol and Shea Butter, its nourishing formula helps maintain skin hydration and promotes a healthy-looking, radiant glow.

Enjoy daily sun care with a comfortable, moisturising feel. A thoughtfully selected blend of UV filters, skin-conditioning ingredients and moisturising agents, including Niacinamide, Panthenol, Glycerin and Shea Butter, to care for your skin while supporting your everyday sun-protection routine.`,
    priceInCents: 44900,
    image: '/products/sunscreen.jpeg',
    galleryImages: ['/products/sunscreen.jpeg', '/products/sunscreen-back.jpeg', '/products/sunscreen-how-to-use.jpeg', '/products/sunscreen-details.jpeg'],
    howToUseImage: '/products/sunscreen-how-to-use.jpeg',
    tagline: 'UV Protection',
    quantity: '100ml',
    benefits: [
      'Helps protect skin from UV exposure',
      'Helps maintain skin hydration',
      'Leaves skin feeling soft and smooth',
      'Promotes a healthy-looking, radiant glow'
    ],
    ingredients: [
      'Niacinamide',
      'Panthenol',
      'Glycerin',
      'Shea Butter',
      'Selected UV Filters'
    ],
    usage: 'Apply as directed on the product label. Reapply as instructed on the label.'
  }
]

export function getProduct(id: string) {
  return PRODUCTS.find((product) => product.id === id)
}
