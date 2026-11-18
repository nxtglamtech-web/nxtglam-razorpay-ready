'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { getProduct } from '@/lib/products'

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const product = getProduct(params.slug)
  const [added, setAdded] = useState(false)

  if (!product) {
    return (
      <main className="product-detail-page">
        <h1>Product not found</h1>
        <Link href="/">Back to Home</Link>
      </main>
    )
  }

  function addToBag() {
    if (!product) return
    const key = 'nxtglam-cart-v1'
    const saved = window.localStorage.getItem(key)
    const cart = saved ? JSON.parse(saved) : {}
    cart[product.id] = (cart[product.id] || 0) + 1
    window.localStorage.setItem(key, JSON.stringify(cart))
    setAdded(true)
  }

  return (
    <main className="product-detail-page">
      <header className="detail-header">
        <Link href="/" className="detail-logo">NXTGLAM</Link>
        <Link href="/" className="detail-back">← Continue Shopping</Link>
      </header>

      <section className="detail-main">
        <div className="detail-image-wrap">
          <img src={product.image} alt={product.name} className="detail-image" />
        </div>

        <div className="detail-info">
          <p className="detail-eyebrow">NXTGLAM SKINCARE</p>
          <h1>{product.name}</h1>
          <p className="detail-tagline">{product.tagline}</p>
          <p className="detail-price">₹{(product.priceInCents / 100).toLocaleString('en-IN')}</p>
          <p className="detail-description">{product.description}</p>

          <button className="detail-add-button" onClick={addToBag}>
            {added ? 'Added to Bag ✓' : 'ADD TO BAG'}
          </button>

          {added && (
            <Link href="/" className="detail-cart-link">
              Go to homepage to view your bag →
            </Link>
          )}
<button
  className="detail-add-button"
  onClick={() => {
    addToBag()
    router.push('/?checkout=1')
  }}
>
  BUY NOW
</button>

          <p className="detail-shipping">FREE SHIPPING • Secure Checkout</p>
        </div>
      </section>

      <section className="detail-content">
        <div>
          <p className="detail-eyebrow">WHY YOU'LL LOVE IT</p>
          <h2>Product Benefits</h2>
          <ul>
            {product.benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="detail-eyebrow">WHAT'S INSIDE</p>
          <h2>Key Ingredients</h2>
          <ul>
            {product.ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </div>

        <div className="detail-usage">
          <p className="detail-eyebrow">HOW TO USE</p>
          <h2>Usage</h2>
          <p>{product.usage}</p>
        </div>
      </section>

      <footer className="detail-footer">
        <Link href="/">NXTGLAM</Link>
        <p>Glow Beyond Limits</p>
      </footer>
    </main>
  )
}