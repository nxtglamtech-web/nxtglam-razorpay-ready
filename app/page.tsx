'use client'

import { useMemo, useState } from 'react'
import { createRazorpayOrder, verifyRazorpayPayment } from './actions/checkout'
import { ArrowRight, ChevronDown, MessageCircle, Minus, Plus, ShoppingBag, Star, X } from 'lucide-react'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void
    }
  }
}

const products = [
  { id: 'glow-facewash', name: 'Glow Facewash', price: 499, meta: '100 ml • Dullness • Oil Control', description: 'A brightening, low-foam cleanse for everyday glow.', tag: 'Bestseller', tone: 'cream', product: 'wash' },
  { id: 'acne-facewash', name: 'Acne Facewash', price: 549, meta: '100 ml • Acne • Texture', description: 'A gentle clarifying cleanse for calm, balanced skin.', tag: 'New', tone: 'blue', product: 'wash' },
  { id: 'moisturising-facewash', name: 'Moisturising Facewash', price: 499, meta: '100 ml • Dryness • Sensitive', description: 'A creamy daily cleanse that leaves skin soft and comfortable.', tag: 'Daily essential', tone: 'lilac', product: 'wash' },
  { id: 'oil-control-facewash', name: 'Oil Control Facewash', price: 549, meta: '100 ml • Oiliness • Pores', description: 'A fresh, balanced cleanse for shine-prone skin.', tag: 'Bestseller', tone: 'cream', product: 'wash' },
  { id: 'vitamin-c-serum', name: 'Vitamin C Serum', price: 999, meta: '10 ml • Dullness • Dark Spots', description: 'Shield, radiant, protect with a concentrated vitamin C glow.', tag: 'Bestseller', tone: 'peach', product: 'serum', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/vitamin-c-serum-b3bdutbuH9EfCZTm7ovREs45CGoobM.jpeg' },
  { id: 'de-pigmentation-serum', name: 'De-Pigmentation Serum', price: 999, meta: '10 ml • Pigmentation • Uneven Tone', description: 'Restore, replenish, revive with targeted brightening actives.', tag: 'New', tone: 'blue', product: 'dropper', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/depigmentation-serum-5jb1trdCTTatA0vqAdJqtvg3sTBH4a.jpeg' },
  { id: 'body-butter', name: 'Body Butter', price: 699, meta: '200g • Dryness • Body Care', description: 'Rich, cushiony moisture for smooth skin from head to toe.', tag: 'Body care', tone: 'lilac', product: 'cream' },
  { id: 'spf-50-sunscreen', name: 'SPF 50+ Sunscreen', price: 799, meta: '50g • UV Protection • All Skin Types', description: 'Daily broad-spectrum protection with a comfortable finish.', tag: 'Daily essential', tone: 'cream', product: 'cream' },
]

function ProductVisual({ tone, product, image }: { tone: string; product: string; image?: string }) {
  if (image) return <div className="product-visual image-visual"><img src={image} alt="" /></div>
  return <div className={`product-visual ${tone}`} aria-hidden="true"><div className={`bottle ${product}`}><span className="bottle-cap" /><span className="bottle-label"><b>NXT</b><small>GLAM</small><em>{product === 'wash' ? 'GLOW' : product === 'cream' ? 'BARRIER' : product === 'serum' ? 'C' : 'CLEAR'}</em></span></div><div className="sparkle">✦</div></div>
}

export default function Page() {
  const [cart, setCart] = useState<Record<string, number>>({})
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatSent, setChatSent] = useState(false)
  const count = Object.values(cart).reduce((a, b) => a + b, 0)
  const items = useMemo(() => products.filter(p => cart[p.name]), [cart])
  const total = items.reduce((sum, p) => sum + p.price * cart[p.name], 0)
  const add = (name: string) => setCart(c => ({ ...c, [name]: (c[name] || 0) + 1 }))
  const change = (name: string, by: number) => setCart(c => { const next = (c[name] || 0) + by; const copy = { ...c }; if (next <= 0) delete copy[name]; else copy[name] = next; return copy })
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const checkout = async () => {
    if (checkoutLoading || items.length === 0) return

    setCheckoutLoading(true)

    try {
      const loaded = await loadRazorpay()

      if (!loaded) {
        throw new Error('Razorpay Checkout could not be loaded. Please check your internet connection and try again.')
      }

      const { orderId, amount, currency, keyId } = await createRazorpayOrder(
        Object.fromEntries(items.map(p => [p.id, cart[p.name]])),
      )

      const razorpay = new window.Razorpay({
        key: keyId,
        amount,
        currency,
        name: 'NxtGlam',
        description: 'NxtGlam skincare order',
        order_id: orderId,
        theme: {
          color: '#111111',
        },
        handler: async (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          try {
            await verifyRazorpayPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            })

            setCart({})
            setCartOpen(false)
            alert('Payment successful! Thank you for shopping with NxtGlam.')
          } catch (error) {
            console.error(error)
            alert('Payment was received, but verification failed. Please contact NxtGlam support before trying again.')
          } finally {
            setCheckoutLoading(false)
          }
        },
        modal: {
          ondismiss: () => setCheckoutLoading(false),
        },
      })

      razorpay.open()
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'Unable to start payment. Please try again.')
      setCheckoutLoading(false)
    }
  }
  const sendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessage.trim()) return
    setChatSent(true)
    setChatMessage('')
  }

  return <main>
    <header className="site-header"><a className="logo" href="#top" aria-label="NxtGlam home"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-Z2b4GwEfQSIfKBte0yqirOTN2kr8WE.png" alt="NxtGlam" /></a><nav className={menuOpen ? 'mobile-nav open' : 'mobile-nav'}><a href="#shop" onClick={() => setMenuOpen(false)}>Shop</a><a href="#story" onClick={() => setMenuOpen(false)}>Our story</a><a href="#philosophy" onClick={() => setMenuOpen(false)}>Philosophy</a><a href="#footer" onClick={() => setMenuOpen(false)}>Support</a></nav><div className="header-actions"><button className="bag-button" onClick={() => setCartOpen(true)} aria-label={`Open cart, ${count} items`}><ShoppingBag size={19} strokeWidth={1.7}/>{count > 0 && <span>{count}</span>}</button><button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation"><ChevronDown size={18} className={menuOpen ? 'rotate' : ''}/></button></div></header>

    <section className="hero-wrap" id="top"><div className="hero"><div className="hero-copy"><p className="eyebrow">SKINCARE, RECONSIDERED</p><h1>NxtGlam</h1><p className="hero-text">Performance-first skincare designed for Indian weather, real schedules and the skin you live in.</p><div className="hero-buttons"><a className="button primary" href="#shop">Shop the drop <ArrowRight size={16}/></a><a className="button ghost" href="#story">Discover more</a></div><p className="hero-note">For skin that does more than just look good.</p></div><div className="feature-list">{[['01','High-performance actives','Results-first formulas—not fluff.'],['02','Made for real life','Sweat, sun, pollution—handled.'],['03','Barrier-friendly','Designed for consistent daily use.'],['04','Glow that lasts','Intentional, long-term change.']].map(([num,title,text]) => <div className="feature" key={num}><span>{num}</span><div><strong>{title}</strong><p>{text}</p></div><ArrowRight size={16}/></div>)}</div></div></section>

    <section className="shop section" id="shop"><div className="section-heading"><div><p className="eyebrow">BESTSELLERS</p><h2>Shop the drop</h2><p>Curated essentials for a simple, high performance routine.</p></div><a className="view-all" href="#shop">View all <ArrowRight size={15}/></a></div><div className="products">{products.map(p => <article className="product-card" key={p.name}><div className="card-top"><ProductVisual tone={p.tone} product={p.product} image={p.image}/><span className="category">{p.tag}</span></div><div className="product-info"><div className="product-title"><h3>{p.name}</h3><span className="rating"><Star size={12} fill="currentColor"/> 4.9</span></div><p className="meta">{p.meta}</p><p className="description">{p.description}</p><div className="product-bottom"><strong>₹{p.price.toLocaleString('en-IN')}</strong><button onClick={() => add(p.name)}>Add to cart <Plus size={14}/></button></div></div></article>)}</div></section>

    <section className="story section" id="story"><div className="story-inner"><div className="story-heading"><p className="eyebrow light">THE NXTGLAM STANDARD</p><h2>Maximum effort.<br/>Maximum glow.</h2><p>Skincare that keeps up with the heat, the humidity and everything your day asks of you. No shortcuts, no empty promises—just formulas that work.</p><div className="story-buttons"><a className="button light-button" href="#shop">Build my routine</a><a className="button outline-button" href="#footer">Need help choosing?</a></div></div><div className="standard-list">{['Designed for Indian skin tones','Engineered for Indian climate','Barrier-first formulas','No empty promises'].map((t, i) => <div className="standard" key={t}><span>0{i + 1}</span><strong>{t}</strong><ArrowRight size={17}/></div>)}</div></div></section>

    <section className="philosophy section" id="philosophy"><div className="philosophy-inner"><div className="philosophy-intro"><p className="eyebrow">OUR PHILOSOPHY</p><h2>Skincare,<br/>with purpose.</h2><p className="philosophy-lead">NxtGlam is where science meets self-care.</p></div><div className="philosophy-copy"><p>At NxtGlam, we believe skincare should do more than simply look beautiful on your shelf—it should make a visible difference to your skin.</p><p>We bring together effective actives, thoughtful formulations and modern skincare science to create targeted solutions for real skin concerns. From pigmentation and uneven skin tone to dullness, acne and hydration, every NxtGlam product is designed with a clear purpose: to help your skin look healthier, feel better and glow with confidence.</p><p>Our philosophy is simple—less noise, more efficacy. We believe in purposeful ingredients, considered formulations and products that fit effortlessly into everyday routines.</p><p>Skincare is personal. That is why NxtGlam is designed to make people feel good about taking care of their skin—not overwhelmed by it. Our approach balances science with sensoriality, efficacy with simplicity, and performance with beauty.</p><strong>Targeted skincare. Thoughtfully formulated. Made for your skin journey.</strong></div></div></section>

    <footer className="footer" id="footer"><div className="footer-grid"><div><a className="logo footer-logo" href="#top"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-Z2b4GwEfQSIfKBte0yqirOTN2kr8WE.png" alt="NxtGlam" /></a><p>Performance-first skincare built for real life—sweat, sun, pollution, everything in between.</p></div><div><p className="footer-label">QUICK LINKS</p><a href="#shop">Shopping & Returns</a><a href="#footer">Privacy Policy</a><a href="#footer">Terms</a><a href="mailto:nxtglam@gmail.com">Support</a><a className="support-email" href="mailto:nxtglam@gmail.com">nxtglam@gmail.com</a><a className="support-whatsapp" href="https://wa.me/9188276488880" target="_blank" rel="noreferrer">WhatsApp: +91 88276 488880</a><span className="gst-number">GSTIN: 23AZTPS3534P2ZI</span></div><div><p className="footer-label">STAY IN THE GLOW</p><p>Get early access to drops and offers.</p><form onSubmit={e => e.preventDefault()}><input type="email" placeholder="Your email address" aria-label="Email address" required/><button>Join</button></form></div></div><div className="footer-bottom"><span>© 2026 NxtGlam. All rights reserved.</span><span>Made for real skin.</span></div></footer>

    <div className={`chat-widget ${chatOpen ? 'is-open' : ''}`}>
      {chatOpen && <section className="chat-panel" aria-label="NxtGlam live chat"><div className="chat-panel-head"><div><strong>NxtGlam support</strong><span>Usually replies quickly</span></div><button onClick={() => setChatOpen(false)} aria-label="Close live chat"><X size={17}/></button></div><div className="chat-body"><div className="chat-bubble agent">Hi, welcome to NxtGlam. How can we help with your skincare routine?</div><a className="whatsapp-chat-link" href="https://wa.me/9188276488880?text=Hi%20NxtGlam%2C%20I%20need%20help%20with%20my%20skincare%20routine." target="_blank" rel="noreferrer">Continue on WhatsApp: +91 88276 488880</a>{chatSent && <div className="chat-bubble customer">Thanks! Your message has been received. Our team will reply at <a href="mailto:nxtglam@gmail.com">nxtglam@gmail.com</a>.</div>}</div><form className="chat-form" onSubmit={sendChat}><input value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder="Type your message..." aria-label="Chat message"/><button type="submit" aria-label="Send message"><ArrowRight size={16}/></button></form></section>}
      <button className="chat-launcher" onClick={() => setChatOpen(!chatOpen)} aria-label={chatOpen ? 'Close live chat' : 'Open live chat'}><MessageCircle size={19}/><span>{chatOpen ? 'Close' : 'Chat with us'}</span></button>
    </div>

    {cartOpen && <div className="cart-overlay" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={e => e.stopPropagation()}><div className="cart-head"><div><p className="eyebrow">YOUR BAG</p><h2>Your cart <span>({count})</span></h2></div><button onClick={() => setCartOpen(false)} aria-label="Close cart"><X size={20}/></button></div>{items.length === 0 ? <div className="empty-cart"><ShoppingBag size={32}/><p>Your bag is waiting for a little glow.</p><button className="button primary" onClick={() => setCartOpen(false)}>Continue shopping</button></div> : <><div className="cart-items">{items.map(p => <div className="cart-item" key={p.name}><ProductVisual tone={p.tone} product={p.product} image={p.image}/><div><h3>{p.name}</h3><strong>₹{p.price.toLocaleString('en-IN')}</strong><div className="quantity"><button onClick={() => change(p.name, -1)}><Minus size={13}/></button><span>{cart[p.name]}</span><button onClick={() => change(p.name, 1)}><Plus size={13}/></button></div></div></div>)}</div><div className="cart-total"><span>Subtotal</span><strong>₹{total.toLocaleString('en-IN')}</strong></div><button className="button primary checkout" onClick={checkout}>{checkoutLoading ? "Opening Razorpay..." : "Pay securely with Razorpay"} <ArrowRight size={16}/></button></>}</aside></div>}
  </main>
}
