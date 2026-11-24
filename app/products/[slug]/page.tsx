'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getProduct } from '@/lib/products'

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const product = getProduct(params.slug)
  const [added, setAdded] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [cartCount, setCartCount] = useState(0)
  const [selectedImage, setSelectedImage] = useState('')

  useEffect(() => {
    setSelectedImage('')
  }, [params.slug])

  useEffect(() => {
    const saved = window.localStorage.getItem('nxtglam-cart-v1')
    if (saved) {
      try {
        const cart = JSON.parse(saved)
        setCartCount(['skin-brightening-facewash','fresh-burst-moisturising-facewash','oil-control-facewash','insta-glow-facewash','extraa-moisturising-body-lotion','vitamin-c-serum','de-pigmentation-serum','sunscreen'].reduce((sum, id) => sum + Number(cart[id] || 0), 0))
      } catch {
        window.localStorage.removeItem('nxtglam-cart-v1')
      }
    }
  }, [])

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
    cart[product.id] = (cart[product.id] || 0) + quantity
    window.localStorage.setItem(key, JSON.stringify(cart))
    setCartCount(['skin-brightening-facewash','fresh-burst-moisturising-facewash','oil-control-facewash','insta-glow-facewash','extraa-moisturising-body-lotion','vitamin-c-serum','de-pigmentation-serum','sunscreen'].reduce((sum, id) => sum + Number(cart[id] || 0), 0))
    setAdded(true)
  }

  return (
    <main className="product-detail-page">
      <header className="detail-header">
        <Link href="/" className="detail-logo">NXTGLAM</Link>
        <div className="detail-header-actions"><Link href="/?checkout=1" className="detail-top-cart">🛍 BAG {cartCount > 0 && <span className="detail-cart-count">{cartCount}</span>}</Link><Link href="/" className="detail-back">← Continue Shopping</Link></div>
      </header>

      <section className="detail-main">
        <div className="detail-image-wrap">
          <img src={selectedImage || product.galleryImages?.[0] || product.image} alt={product.name} className="detail-image" />
          {product.galleryImages && product.galleryImages.length > 1 && (
            <div className="detail-image-thumbnails">
              {product.galleryImages.map((image, index) => (
                <button key={image} type="button" className={selectedImage === image || (!selectedImage && index === 0) ? "detail-image-thumbnail active" : "detail-image-thumbnail"} onClick={() => setSelectedImage(image)} aria-label={"View " + product.name + " image " + (index + 1)}>
                  <img src={image} alt={product.name + " view " + (index + 1)} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-info">
          <p className="detail-eyebrow">NXTGLAM SKINCARE</p>
          <h1>{product.name}</h1>
          <p className="detail-tagline">{product.tagline}</p>
          <p className="detail-price">{'\u20B9'}{(product.priceInCents / 100).toLocaleString('en-IN')}</p>
          <p className="detail-description">{product.description}</p>

          <div className="detail-quantity">
            <span>QUANTITY</span>
            <div className="detail-quantity-controls">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => q + 1)}>+</button>
            </div>
          </div>

          <button className="detail-add-button" onClick={addToBag}>
            {added ? (<>Added to Bag {'\u2713'}</>) : 'ADD TO BAG'}
          </button>

          {added && (
            <Link href="/?checkout=1" className="detail-cart-link">
              Go to homepage to view your bag {'\u2192'}
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
          <p className="detail-shipping">FREE SHIPPING {'\u2022'} Secure Checkout</p>
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

      <footer className="footer" id="footer"><div className="footer-grid"><div className="footer-brand"><p>Performance-first skincare built for real life-sweat, sun, pollution, everything in between.</p><a className="instagram-link" href="https://www.instagram.com/nxtglam/" target="_blank" rel="noopener noreferrer" aria-label="Follow NXTGLAM on Instagram"><svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg></a></div><div className="footer-links"><p className="footer-label">QUICK LINKS</p><a href="/#shop">Shopping & Returns</a><a href="/#footer">Privacy Policy</a><a href="/#footer">Terms</a></div><div className="footer-contact"><p className="footer-label">CONTACT US</p><a className="support-email" href="mailto:support@nxtglam.co.in">support@nxtglam.co.in</a><a className="support-whatsapp" href="https://wa.me/918827648880" target="_blank" rel="noreferrer">WhatsApp: +91 88276 48880</a></div><div className="footer-glow"><p className="footer-label">STAY IN THE GLOW</p><p>Get early access to drops and offers.</p><form onSubmit={e => e.preventDefault()}><input type="email" placeholder="Your email address" aria-label="Email address" required/><button>Join</button></form></div></div><div className="footer-bottom"><span>GSTIN: 23AZTPS3534P2ZI</span><span>Copyright 2026 NxtGlam. All rights reserved.</span><span>Made for real skin.</span></div></footer>
    </main>
  )
}






