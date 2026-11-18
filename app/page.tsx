'use client'

import { useEffect, useMemo, useState } from 'react'
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
  { id: 'skin-brightening-facewash', name: 'Skin Brightening Face Wash', price: 399, meta: 'Face Wash - Brightening', description: 'A refreshing daily face wash.', tag: 'New', tone: 'peach', product: 'wash', image: '/products/skin-brightening-facewash.jpeg' },
  { id: 'fresh-burst-moisturising-facewash', name: 'Fresh-Burst Moisturising Face Wash', price: 399, meta: 'Face Wash - Moisture', description: 'A refreshing moisturising cleanse.', tag: 'Daily essential', tone: 'cream', product: 'wash', image: '/products/fresh-burst-moisturising-facewash.jpeg' },
  { id: 'oil-control-facewash', name: 'Oil Control Face Wash', price: 399, meta: 'Face Wash - Oil Control', description: 'A refreshing cleanse for oil control.', tag: 'Bestseller', tone: 'blue', product: 'wash', image: '/products/oil-control-facewash.jpeg' },
  { id: 'insta-glow-facewash', name: 'Insta Glow Face Wash', price: 399, meta: 'Face Wash - Glow', description: 'A refreshing face wash for a glowing look.', tag: 'New', tone: 'peach', product: 'wash', image: '/products/insta-glow-facewash.jpeg' },
  { id: 'extraa-moisturising-body-lotion', name: 'Extraa Moisturising Body Lotion', price: 599, meta: 'Body Care - Moisture', description: 'Daily moisturising body care.', tag: 'Body care', tone: 'lilac', product: 'cream', image: '/products/extraa-moisturising-body-lotion.jpeg' },
  { id: 'vitamin-c-serum', name: 'Vitamin-C Serum', price: 450, meta: 'Serum - Vitamin C', description: 'Vitamin C skincare serum.', tag: 'New', tone: 'cream', product: 'serum', image: '/products/vitamin-c-serum.jpeg' },
  { id: 'de-pigmentation-serum', name: 'De-Pigmentation Serum', price: 450, meta: 'Serum - Targeted care', description: 'Targeted skincare serum.', tag: 'New', tone: 'lilac', product: 'serum', image: '/products/de-pigmentation-serum.jpeg' },
  { id: 'sunscreen', name: 'Sunscreen', price: 449, meta: 'Daily skincare protection', description: 'Daily skincare protection.', tag: 'Daily essential', tone: 'cream', product: 'cream', image: '/products/sunscreen.jpeg' },
]


function ProductVisual({ tone, product, image }: { tone: string; product: string; image?: string }) {
  if (image) return <div className="product-visual image-visual"><img src={image} alt="" /></div>
  return <div className={`product-visual ${tone}`} aria-hidden="true"><div className={`bottle ${product}`}><span className="bottle-cap" /><span className="bottle-label"><b>NXT</b><small>GLAM</small><em>{product === 'wash' ? 'GLOW' : product === 'cream' ? 'BARRIER' : product === 'serum' ? 'C' : 'CLEAR'}</em></span></div><div className="sparkle">*</div></div>
}

export default function Page() {
  const [cart, setCart] = useState<Record<string, number>>({})
  const [cartOpen, setCartOpen] = useState(false)
  const [showOffer, setShowOffer] = useState(true)
  useEffect(() => {
    const saved = window.localStorage.getItem('nxtglam-cart-v1')
    if (saved) {
      try {
        setCart(JSON.parse(saved))
      } catch {
        window.localStorage.removeItem('nxtglam-cart-v1')
      }
    }
  }, [])

  useEffect(() => {
    if (window.location.search.includes('checkout=1')) {
      setCartOpen(true)
    }
  }, [])
 
  const [menuOpen, setMenuOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [chatSent, setChatSent] = useState(false)
  const count = products.reduce((sum, p) => sum + (cart[p.id] || 0), 0)
  const items = useMemo(() => products.filter(p => cart[p.id]), [cart])
  const total = items.reduce((sum, p) => sum + p.price * cart[p.id], 0)
  const add = (id: string) => setCart(c => {
    const next = { ...c, [id]: (c[id] || 0) + 1 }
    window.localStorage.setItem('nxtglam-cart-v1', JSON.stringify(next))
    return next
  })
  const change = (id: string, by: number) => setCart(c => {
    const quantity = (c[id] || 0) + by
    const next = { ...c }
    if (quantity <= 0) delete next[id]
    else next[id] = quantity
    window.localStorage.setItem('nxtglam-cart-v1', JSON.stringify(next))
    return next
  })
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })

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
        Object.fromEntries(items.map(p => [p.id, cart[p.id]])),
        customer,
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
window.localStorage.removeItem('nxtglam-cart-v1')
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

    <section className="hero-wrap" id="top"><div className="hero"><div className="hero-copy"><p className="eyebrow">SKINCARE, RECONSIDERED</p><h1>NxtGlam</h1><p className="hero-text">Performance-first skincare designed for Indian weather, real schedules and the skin you live in.</p><div className="hero-buttons"><a className="button primary" href="#shop">Shop the drop <ArrowRight size={16}/></a><a className="button ghost" href="#story">Discover more</a></div><p className="hero-note">For skin that does more than just look good.</p></div><div className="feature-list">{[['01','High-performance actives','Results-first formulas-not fluff.'],['02','Made for real life','Sweat, sun, pollution-handled.'],['03','Barrier-friendly','Designed for consistent daily use.'],['04','Glow that lasts','Intentional, long-term change.']].map(([num,title,text]) => <div className="feature" key={num}><span>{num}</span><div><strong>{title}</strong><p>{text}</p></div><ArrowRight size={16}/></div>)}</div></div></section>

    {showOffer && <div className="offer-overlay" onClick={() => setShowOffer(false)}><div className="offer-popup" onClick={e => e.stopPropagation()}><button className="offer-close" onClick={() => setShowOffer(false)} aria-label="Close offer"><X size={20}/></button><p>EXCLUSIVE LAUNCH OFFER</p><h2>FIRST 100 ORDERS</h2><h3>Enjoy FREE SHIPPING</h3><span>Shop your favourites today.</span><a href="#shop" className="button primary" onClick={() => setShowOffer(false)}>SHOP NOW <ArrowRight size={16}/></a></div></div>}
<section className="shop section" id="shop"><div className="section-heading"><div><p className="eyebrow">BESTSELLERS</p><h2>Shop the drop</h2><p>Curated essentials for a simple, high performance routine.</p></div><a className="view-all" href="#shop">View all <ArrowRight size={15}/></a></div><div className="products">{products.map(p => <article className="product-card" key={p.id} onClick={() => window.location.href = `/products/${p.id}`}><div className="card-top"><ProductVisual tone={p.tone} product={p.product} image={p.image}/><span className="category">{p.tag}</span></div><div className="product-info"><div className="product-title"><h3>{p.name}</h3><span className="rating"><Star size={12} fill="currentColor"/> 4.9</span></div><p className="meta">{p.meta}</p><p className="description">{p.description}</p><div className="product-bottom"><strong>{'\u20B9'}{p.price.toLocaleString('en-IN')}</strong><button onClick={(e) => { e.stopPropagation(); add(p.id); }}>Add to cart <Plus size={14}/></button></div></div></article>)}</div></section>

    <section className="story section" id="story"><div className="story-inner"><div className="story-heading"><p className="eyebrow light">THE NXTGLAM STANDARD</p><h2>Minimal effort.<br/>Maximum glow.</h2><p>Skincare that keeps up with the heat, the humidity and everything your day asks of you. No shortcuts, no empty promises-just formulas that work.</p><div className="story-buttons"><a className="button light-button" href="#shop">Build my routine</a><a className="button outline-button" href="#footer">Need help choosing?</a></div></div><div className="standard-list">{['Tested in 100+ Salons','Designed for Indian skin tones','Engineered for Indian climate','Barrier-first formulas'].map((t, i) => <div className="standard" key={t}><span>0{i + 1}</span><strong>{t}</strong><ArrowRight size={17}/></div>)}</div></div></section>

    <section className="philosophy section" id="philosophy"><div className="philosophy-inner"><div className="philosophy-intro"><p className="eyebrow">OUR PHILOSOPHY</p><h2>Skincare,<br/>with purpose.</h2><p className="philosophy-lead">NxtGlam is where science meets self-care.</p></div><div className="philosophy-copy"><p>At NxtGlam, we believe skincare should do more than simply look beautiful on your shelf-it should make a visible difference to your skin.</p><p>We bring together effective actives, thoughtful formulations and modern skincare science to create targeted solutions for real skin concerns. From pigmentation and uneven skin tone to dullness, acne and hydration, every NxtGlam product is designed with a clear purpose: to help your skin look healthier, feel better and glow with confidence.</p><p>Our philosophy is simple-less noise, more efficacy. We believe in purposeful ingredients, considered formulations and products that fit effortlessly into everyday routines.</p><p>Skincare is personal. That is why NxtGlam is designed to make people feel good about taking care of their skin-not overwhelmed by it. Our approach balances science with sensoriality, efficacy with simplicity, and performance with beauty.</p><strong>Targeted skincare. Thoughtfully formulated. Made for your skin journey.</strong></div></div></section>

    <footer className="footer" id="footer"><div className="footer-grid"><div><p>Performance-first skincare built for real life-sweat, sun, pollution, everything in between.</p><a href="https://www.instagram.com/nxtglam/" target="_blank" rel="noopener noreferrer">Instagram</a></div><div><p className="footer-label">QUICK LINKS</p><a href="#shop">Shopping & Returns</a><a href="#footer">Privacy Policy</a><a href="#footer">Terms</a><a href="mailto:support@nxtglam.co.in">Support</a><a className="support-email" href="mailto:support@nxtglam.co.in">support@nxtglam.co.in</a><a className="support-whatsapp" href="https://wa.me/918827648880" target="_blank" rel="noreferrer">WhatsApp: +91 88276 48880</a><span className="gst-number">GSTIN: 23AZTPS3534P2ZI</span></div><div><p className="footer-label">STAY IN THE GLOW</p><p>Get early access to drops and offers.</p><form onSubmit={e => e.preventDefault()}><input type="email" placeholder="Your email address" aria-label="Email address" required/><button>Join</button></form></div></div><div className="footer-bottom"><span>Copyright 2026 NxtGlam. All rights reserved.</span><span>Made for real skin.</span></div></footer>

    <div className={`chat-widget ${chatOpen ? 'is-open' : ''}`}>
      {chatOpen && <section className="chat-panel" aria-label="NxtGlam live chat"><div className="chat-panel-head"><div><strong>NxtGlam support</strong><span>Usually replies quickly</span></div><button onClick={() => setChatOpen(false)} aria-label="Close live chat"><X size={17}/></button></div><div className="chat-body"><div className="chat-bubble agent">Hi, welcome to NxtGlam. How can we help with your skincare routine?</div><a className="whatsapp-chat-link" href="https://wa.me/918827648880?text=Hi%20NxtGlam%2C%20I%20need%20help%20with%20my%20skincare%20routine." target="_blank" rel="noreferrer">Continue on WhatsApp: +91 88276 48880</a>{chatSent && <div className="chat-bubble customer">Thanks! Your message has been received. Our team will reply at <a href="mailto:support@nxtglam.co.in">support@nxtglam.co.in</a>.</div>}</div><form className="chat-form" onSubmit={sendChat}><input value={chatMessage} onChange={e => setChatMessage(e.target.value)} placeholder="Type your message..." aria-label="Chat message"/><button type="submit" aria-label="Send message"><ArrowRight size={16}/></button></form></section>}
      <button className="chat-launcher" onClick={() => setChatOpen(!chatOpen)} aria-label={chatOpen ? 'Close live chat' : 'Open live chat'}><MessageCircle size={19}/><span>{chatOpen ? 'Close' : 'Chat with us'}</span></button>
    </div>

    {cartOpen && <div className="cart-overlay" onClick={() => setCartOpen(false)}><aside className="cart-drawer" onClick={e => e.stopPropagation()}><div className="cart-head"><div><p className="eyebrow">YOUR BAG</p><h2>Your cart <span>({count})</span></h2><p className="free-shipping">FREE SHIPPING</p></div><button onClick={() => setCartOpen(false)} aria-label="Close cart"><X size={20}/></button></div>{items.length === 0 ? <div className="empty-cart"><ShoppingBag size={32}/><p>Your bag is waiting for a little glow.</p><button className="button primary" onClick={() => setCartOpen(false)}>Continue shopping</button></div> : <><div className="cart-items">{items.map(p => <div className="cart-item" key={p.id} onClick={() => window.location.href = `/products/${p.id}`}><ProductVisual tone={p.tone} product={p.product} image={p.image}/><div><h3>{p.name}</h3><strong>{'\u20B9'}{p.price.toLocaleString('en-IN')}</strong><div className="quantity"><button onClick={() => change(p.id, -1)}><Minus size={13}/></button><span>{cart[p.id]}</span><button onClick={() => change(p.id, 1)}><Plus size={13}/></button></div></div></div>)}</div><div className="cart-total"><span>Subtotal</span><strong>{'\u20B9'}{total.toLocaleString('en-IN')}</strong></div><form className="customer-details" onSubmit={e => { e.preventDefault(); checkout() }}>
  <p className="eyebrow">DELIVERY DETAILS</p>
  <input required maxLength={100} autoComplete="name" placeholder="Full Name" value={customer.name} onChange={e => setCustomer({...customer, name:e.target.value})} />
  <input required type="email" autoComplete="email" placeholder="Email Address" value={customer.email} onChange={e => setCustomer({...customer, email:e.target.value})} />
  <input required type="tel" minLength={10} maxLength={15} autoComplete="tel" placeholder="Mobile Number" value={customer.phone} onChange={e => setCustomer({...customer, phone:e.target.value})} />
  <textarea required maxLength={500} autoComplete="street-address" placeholder="Full Delivery Address / House No. / Street" value={customer.address} onChange={e => setCustomer({...customer, address:e.target.value})} />
  <input required autoComplete="address-level2" placeholder="City" value={customer.city} onChange={e => setCustomer({...customer, city:e.target.value})} />
  <input required autoComplete="address-level1" placeholder="State" value={customer.state} onChange={e => setCustomer({...customer, state:e.target.value})} />
  <input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="postal-code" placeholder="6-digit Pincode" value={customer.pincode} onChange={e => setCustomer({...customer, pincode:e.target.value})} />
  <button type="submit" className="button primary checkout" disabled={checkoutLoading}>{checkoutLoading ? "Opening Razorpay..." : "Continue to Payment"} <ArrowRight size={16}/></button>
</form></>}</aside></div>}
  </main>
}




