
import Link from 'next/link'
import { supabaseAdmin } from '../../../lib/supabase-admin'
import { isAdminAuthenticated } from '../../../lib/admin-auth'
import { loginAdmin, logoutAdmin, updateDeliveryStatus, updateCourierDetails } from '../actions'

export const dynamic = 'force-dynamic'

const money = (amount: number) =>
  `\u20B9${(amount / 100).toLocaleString('en-IN')}`

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; q?: string; status?: string }>
}) {
  const authenticated = await isAdminAuthenticated()
  const params = await searchParams

  if (!authenticated) {
    return (
      <main className="admin-login">
        <section className="login-card">
          <div className="brand-mark">N</div>
          <p className="eyebrow">NXTGLAM PRIVATE AREA</p>
          <h1>Welcome back</h1>
          <p className="muted">Sign in to manage your store.</p>
          {params.error === '1' && (
            <p className="login-error">Incorrect password. Please try again.</p>
          )}
          <form action={loginAdmin}>
            <label htmlFor="admin-password">Admin password</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />
            <button className="primary-button" type="submit">Sign in</button>
          </form>
          <p className="login-foot">NXTGLAM &middot; STORE MANAGEMENT</p>
        </section>
        <style>{styles}</style>
      </main>
    )
  }

  const safeQuery = (params.q || '').replace(/[(),.%\\]/g, '').trim()
  const selectedStatus = ['paid', 'pending'].includes(params.status || '')
    ? params.status
    : 'all'

  let ordersQuery = supabaseAdmin
    .from('orders')
    .select('id, customer_name, customer_email, customer_phone, address, city, state, pincode, total_amount, status, delivery_status, courier_name, tracking_number, tracking_url, razorpay_payment_id, signature_verified, created_at, order_items(product_id, product_name, price, quantity)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (selectedStatus !== 'all') {
    ordersQuery = ordersQuery.eq('status', selectedStatus)
  }

  if (safeQuery) {
    ordersQuery = ordersQuery.or(
      `customer_name.ilike.%${safeQuery}%,customer_email.ilike.%${safeQuery}%,customer_phone.ilike.%${safeQuery}%`
    )
  }

  const [
    { data: orders, error },
    { data: statsRows, error: statsError },
  ] = await Promise.all([
    ordersQuery,
    supabaseAdmin
      .from('orders')
      .select('total_amount,status')
      .order('created_at', { ascending: false })
      .limit(1000),
  ])

  const stats = statsRows || []
  const paidOrders = stats.filter((o) => o.status === 'paid')
  const pendingOrders = stats.filter((o) => o.status === 'pending')
  const revenue = paidOrders.reduce((sum, o) => sum + o.total_amount, 0)

  return (
    <main className="admin-shell">
      <style>{styles}</style>

      <aside className="sidebar">
        <div className="side-brand">
          <div className="brand-mark">N</div>
          <div>
            <strong>NXTGLAM</strong>
            <span>ADMIN STUDIO</span>
          </div>
        </div>

        <div className="side-label">WORKSPACE</div>
        <div className="side-link active">
          <span>?</span> Overview
        </div>
        <div className="side-label side-bottom">STORE</div>
        <div className="side-link">
          <span>&#9638;</span> Orders
        </div>

        <div className="sidebar-footer">
          <div className="admin-avatar">A</div>
          <div className="admin-user">
            <strong>Store Admin</strong>
            <span>NXTGLAM</span>
          </div>
        </div>
      </aside>

      <section className="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">STORE MANAGEMENT</p>
            <h1>Orders</h1>
            <p className="muted">Manage customer orders, payments and deliveries.</p>
          </div>
          <form action={logoutAdmin}>
            <button className="logout-button" type="submit">&#8599; Log out</button>
          </form>
        </header>

        <div className="stats-heading">
          <div>
            <h2>Business snapshot</h2>
            <p>Based on the latest 1,000 orders in your database.</p>
          </div>
          <span className="live-label"><i /> DATABASE CONNECTED</span>
        </div>

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-top"><span>Total orders</span><b>?</b></div>
            <strong>{stats.length}</strong>
            <small>Latest 1,000 records</small>
          </article>
          <article className="stat-card">
            <div className="stat-top"><span>Paid orders</span><b>&#10003;</b></div>
            <strong>{paidOrders.length}</strong>
            <small className="green-text">Successfully paid</small>
          </article>
          <article className="stat-card">
            <div className="stat-top"><span>Pending orders</span><b>&#9702;</b></div>
            <strong>{pendingOrders.length}</strong>
            <small className="amber-text">Awaiting payment</small>
          </article>
          <article className="stat-card revenue-card">
            <div className="stat-top"><span>Paid revenue</span><b>{'\u20B9'}</b></div>
            <strong>{money(revenue)}</strong>
            <small>From paid orders only</small>
          </article>
        </section>

        <section className="orders-section">
          <div className="orders-heading">
            <div>
              <h2>All orders</h2>
              <p>View and search your customer orders.</p>
            </div>
            <span className="count-pill">{orders?.length || 0} results</span>
          </div>

          <form className="filter-bar" method="GET">
            <input
              type="search"
              name="q"
              defaultValue={params.q || ''}
              placeholder="Search name, email or phone..."
              aria-label="Search orders"
            />
            <select name="status" defaultValue={selectedStatus}>
              <option value="all">All statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
            <button type="submit" className="filter-button">Apply filters</button>
            <a className="reset-link" href="/admin">Reset</a>
          </form>

          {error || statsError ? (
            <div className="empty-state">
              <strong>Could not load orders</strong>
              <p>Please check the database connection and try again.</p>
            </div>
          ) : !orders?.length ? (
            <div className="empty-state">
              <strong>No orders found</strong>
              <p>Try another search or change the selected status.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>ORDER / CUSTOMER</th>
                    <th>PRODUCTS</th>
                    <th>DATE</th>
                    <th>AMOUNT</th>
                    <th>PAYMENT</th>
                    <th>DELIVERY</th>
                    <th>COURIER / TRACKING</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: any) => (
                    <tr key={order.id}>
                      <td>
                        <strong className="customer-name">{order.customer_name}</strong>
                        <span className="sub-text">{order.customer_email}</span>
                        <span className="sub-text">{order.customer_phone}</span>
                        <span className="order-id">#{order.id.slice(0, 8)}</span>
                        <span className="sub-text address-text">
                          {order.address}, {order.city}, {order.state} - {order.pincode}
                        </span>
<details style={{ marginTop: '12px', fontSize: '12px' }}>
  <summary style={{
    cursor: 'pointer',
    color: '#8b5472',
    fontWeight: 700,
    padding: '6px 0'
  }}>
    View Full Details
  </summary>

  <div style={{
    marginTop: '10px',
    padding: '16px',
    background: '#151515',
    color: '#f5f0e6',
    border: '1px solid #b89646',
    borderRadius: '10px',
    lineHeight: 1.8
  }}>
    <strong style={{color:'#d6b45c', fontSize:'14px'}}>ORDER DETAILS</strong>

    <div style={{
      display:'grid',
      gridTemplateColumns:'repeat(2, minmax(0, 1fr))',
      gap:'12px',
      marginTop:'12px'
    }}>
      <div style={{background:'#202020', padding:'12px', borderRadius:'8px', minWidth:0, overflowWrap:'anywhere'}}>
        <strong style={{color:'#d6b45c'}}>ORDER & PAYMENT</strong>
        <div>Order ID: {order.id}</div>
        <div>Order Amount: {money(order.total_amount)}</div>
        <div>Payment Status: {String(order.status).toUpperCase()}</div>
        <div>Delivery Status: {String(order.delivery_status || 'processing').toUpperCase()}</div>
        <div>Payment Verified: {order.signature_verified ? 'Yes' : 'No'}</div>
        <div>Razorpay Order ID: {order.razorpay_order_id || 'Not available'}</div>
        <div>Razorpay Payment ID: {order.razorpay_payment_id || 'Not available'}</div>
      </div>

      <div style={{background:'#202020', padding:'12px', borderRadius:'8px', minWidth:0, overflowWrap:'anywhere'}}>
        <strong style={{color:'#d6b45c'}}>CUSTOMER DETAILS</strong>
        <div>Customer: {order.customer_name}</div>
        <div>Email: {order.customer_email}</div>
        <div>Phone: {order.customer_phone}</div>
        <div>Address: {order.address}, {order.city}, {order.state} - {order.pincode}</div>
      </div>
    </div>

    <div style={{marginTop:'16px', padding:'12px', background:'#202020', borderRadius:'8px'}}>
      <strong style={{color:'#d6b45c'}}>PRODUCTS</strong>
      {(order.order_items || []).map((item: any, index: number) => (
        <div key={`detail-${item.product_id}-${index}`} style={{padding:'6px 0', borderBottom:'1px solid #39352b'}}>
          {item.product_name} &times; {item.quantity} &mdash; {money(item.price * item.quantity)}
        </div>
      ))}
    </div>
  </div>
</details>
                      </td>
                      <td>
                        {(order.order_items || []).map((item: any, index: number) => (
                          <div className="product-line" key={`${item.product_id}-${index}`}>
                            <strong>{item.product_name}</strong>
                            <span>Qty: {item.quantity}</span>
                            <span>{money(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </td>
                      <td>
                        <span className="date-text">
                          {new Date(order.created_at).toLocaleDateString('en-IN')}
                        </span>
                        <span className="sub-text">
                          {new Date(order.created_at).toLocaleTimeString('en-IN')}
                        </span>
                      </td>
                      <td><strong className="amount">{money(order.total_amount)}</strong></td>
                      <td>
                        <span className={`status-pill ${order.status === 'paid' ? 'paid' : 'pending'}`}>
                          <i /> {String(order.status).toUpperCase()}
                        </span>
                        
                        <span className="verified-text">
                          {order.signature_verified ? '\u2713 Verified' : 'Not verified'}
                        </span>
                        {order.razorpay_payment_id && (
                          <span className="payment-id">
                            {order.razorpay_payment_id}
                          </span>
                        )}
                      </td>
                      <td>
                        <form action={updateDeliveryStatus} style={{display:'flex',flexDirection:'column',gap:'8px',marginTop:'10px',width:'100%'}}><input type="hidden" name="orderId" value={order.id} /><select name="deliveryStatus" defaultValue={order.delivery_status || 'processing'} style={{maxWidth:'115px',fontSize:'10px',padding:'5px'}}><option value="processing">Processing</option><option value="shipped">Shipped</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select><button type="submit" style={{marginLeft:'5px',padding:'5px 8px',fontSize:'10px',cursor:'pointer'}}>Update</button></form>
                      </td>
                      <td>
                        
    <form action={updateCourierDetails} style={{display:'flex',flexDirection:'column',gap:'10px',marginTop:'8px',width:'100%',minWidth:'0'}}>
      <input type="hidden" name="orderId" value={order.id} />
      <input name="courierName" placeholder="Courier name (e.g. Delhivery)" defaultValue={order.courier_name || ''} />
      <input name="trackingNumber" placeholder="AWB / Tracking number" defaultValue={order.tracking_number || ''} />
      <input name="trackingUrl" type="url" placeholder="Tracking URL (https://...)" defaultValue={order.tracking_url || ''} />
      <button type="submit" style={{padding:'8px',cursor:'pointer'}}>Save Courier Details</button>
    </form>
    {order.tracking_url && <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">View Tracking</a>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="dashboard-footer">
          <span>&copy; {new Date().getFullYear()} NXTGLAM</span>
          <span>Private store management &middot; Secure admin area</span>
        </footer>
      </section>
    </main>
  )
}

const styles = `
* { box-sizing: border-box; }
.admin-shell { min-height:100vh; display:flex; background:#f7f5f6; color:#302536; font-family:Arial,Helvetica,sans-serif; }
.sidebar { width:240px; min-height:100vh; background:#302235; color:#fff; padding:28px 18px; display:flex; flex-direction:column; flex-shrink:0; }
.side-brand { display:flex; align-items:center; gap:12px; padding:0 8px 38px; }
.brand-mark { width:38px; height:38px; border-radius:12px; background:#d9b7c8; color:#302235; display:grid; place-items:center; font-family:Georgia,serif; font-size:24px; }
.side-brand strong { display:block; letter-spacing:2px; font-size:15px; }
.side-brand span { display:block; color:#c5b4c5; font-size:9px; letter-spacing:2px; margin-top:5px; }
.side-label { color:#a99aac; font-size:10px; letter-spacing:1.8px; padding:10px 10px; }
.side-link { padding:13px 12px; border-radius:9px; color:#d9ceda; font-size:13px; margin:3px 0; }
.side-link span { display:inline-block; width:25px; }
.side-link.active { background:#4b3b50; color:#fff; }
.side-bottom { margin-top:28px; }
.sidebar-footer { margin-top:auto; border-top:1px solid #514452; padding:20px 5px 0; display:flex; align-items:center; gap:10px; }
.admin-avatar { width:34px; height:34px; border-radius:50%; background:#d9b7c8; color:#302235; display:grid; place-items:center; font-weight:bold; }
.admin-user strong,.admin-user span { display:block; font-size:12px; }
.admin-user span { color:#bbaebe; font-size:10px; margin-top:4px; }
.dashboard { flex:1; min-width:0; padding:34px 38px 22px; max-width:1600px; margin:0 auto; }
.topbar { display:flex; justify-content:space-between; align-items:center; gap:20px; padding-bottom:30px; }
.eyebrow { color:#987b91; font-size:10px; letter-spacing:2px; font-weight:bold; margin:0 0 9px; }
.topbar h1 { font-family:Georgia,serif; font-size:34px; font-weight:normal; margin:0 0 8px; }
.muted { color:#8b818b; font-size:13px; margin:0; }
.logout-button { background:#fff; color:#514354; border:1px solid #e6dfe5; border-radius:8px; padding:11px 16px; cursor:pointer; font-size:12px; }
.stats-heading,.orders-heading { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:16px; }
.stats-heading h2,.orders-heading h2 { font-family:Georgia,serif; font-size:20px; font-weight:normal; margin:0 0 6px; }
.stats-heading p,.orders-heading p { color:#918791; font-size:12px; margin:0; }
.live-label { font-size:9px; letter-spacing:1px; color:#47836a; background:#e8f3ed; padding:8px 10px; border-radius:20px; white-space:nowrap; }
.live-label i,.status-pill i { display:inline-block; width:6px; height:6px; border-radius:50%; background:#4a9a70; margin-right:5px; }
.stats-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:15px; margin-bottom:34px; }
.stat-card { background:#fff; border:1px solid #eee8ed; border-radius:12px; padding:19px; box-shadow:0 3px 12px #39253b08; }
.stat-top { display:flex; justify-content:space-between; align-items:center; color:#857985; font-size:12px; }
.stat-top b { width:29px; height:29px; display:grid; place-items:center; border-radius:9px; background:#f4edf2; color:#8c6c84; font-size:14px; }
.stat-card > strong { display:block; font-family:Georgia,serif; font-size:29px; font-weight:normal; margin:14px 0 8px; overflow-wrap:anywhere; }
.stat-card small { color:#a096a0; font-size:10px; }
.stat-card .green-text { color:#39845f; }
.stat-card .amber-text { color:#b17a35; }
.revenue-card { background:#38283c; color:#fff; border-color:#38283c; }
.revenue-card .stat-top,.revenue-card small { color:#d0c1d0; }
.revenue-card .stat-top b { background:#59465c; color:#fff; }
.orders-section { background:#fff; border:1px solid #eee8ed; border-radius:13px; padding:22px; box-shadow:0 3px 12px #39253b08; }
.orders-heading { margin-bottom:20px; }
.count-pill { border-radius:20px; background:#f5eff4; color:#80677b; font-size:11px; padding:7px 11px; }
.filter-bar { display:flex; gap:9px; flex-wrap:wrap; margin-bottom:20px; }
.filter-bar input,.filter-bar select { min-height:39px; border:1px solid #e9e2e8; border-radius:7px; padding:0 11px; color:#493d4a; background:#fff; font-size:12px; }
.filter-bar input { flex:1; min-width:190px; }
.filter-bar select { min-width:130px; }
.filter-button { background:#38283c; color:#fff; border:0; border-radius:7px; padding:0 15px; min-height:39px; cursor:pointer; font-size:12px; }
.reset-link { display:flex; align-items:center; padding:0 8px; color:#8c7186; text-decoration:none; font-size:12px; }
.table-wrap { width:100%; overflow-x:auto; }
.orders-table { width:100%; border-collapse:collapse; min-width:850px; text-align:left; }
.orders-table th { background:#faf8fa; color:#938794; font-size:9px; letter-spacing:1px; font-weight:bold; padding:13px 12px; }
.orders-table td { border-bottom:1px solid #f0ebf0; padding:17px 12px; vertical-align:top; font-size:12px; }
.customer-name { display:block; font-size:13px; margin-bottom:5px; }
.sub-text { display:block; color:#948994; font-size:10px; margin-top:4px; overflow-wrap:anywhere; }
.order-id { display:inline-block; color:#92758b; background:#f6f0f5; border-radius:4px; padding:4px 6px; font-size:9px; margin-top:8px; }
.address-text { max-width:190px; line-height:1.5; }
.orders-table { table-layout:fixed; }
.orders-table th:nth-child(1),
.orders-table td:nth-child(1) { width:34%; }
.orders-table th:nth-child(2),
.orders-table td:nth-child(2) { width:22%; }
.orders-table th:nth-child(3),
.orders-table td:nth-child(3) { width:14%; }
.orders-table th:nth-child(4),
.orders-table td:nth-child(4) { width:12%; }
.orders-table th:nth-child(5),
.orders-table td:nth-child(5) { width:18%; }

.orders-table td { overflow-wrap:anywhere; }
.orders-table details { max-width:220px; }
.orders-table details > div {
  max-width:220px;
  overflow-wrap:anywhere;
  word-break:break-word;
}
.orders-table details summary { cursor:pointer; }
/* FINAL ORDER TABLE LAYOUT */
.orders-table {
  width: 1700px;
  min-width: 1700px;
  table-layout: fixed;
}
.orders-table th:nth-child(1), .orders-table td:nth-child(1) { width: 300px; }
.orders-table th:nth-child(2), .orders-table td:nth-child(2) { width: 210px; }
.orders-table th:nth-child(3), .orders-table td:nth-child(3) { width: 160px; }
.orders-table th:nth-child(4), .orders-table td:nth-child(4) { width: 120px; }
.orders-table th:nth-child(5), .orders-table td:nth-child(5) { width: 200px; }
.orders-table th:nth-child(6), .orders-table td:nth-child(6) { width: 260px; }
.orders-table th:nth-child(7), .orders-table td:nth-child(7) { width: 450px; }
.orders-table td {
  white-space: normal;
  overflow-wrap: anywhere;
  vertical-align: top;
}
.orders-table td:nth-child(6) form,
.orders-table td:nth-child(7) form {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  width: 100%;
  min-width: 0;
}
.orders-table td:nth-child(6) select,
.orders-table td:nth-child(7) input {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 10px;
}
.orders-table td:nth-child(6) button,
.orders-table td:nth-child(7) button {
  width: fit-content;
  max-width: 100%;
  padding: 9px 12px;
}
/* FIX: Seven-column admin table spacing */
.orders-table {
  width: 100%;
  min-width: 1450px;
  table-layout: fixed;
}
.orders-table th:nth-child(1), .orders-table td:nth-child(1) { width: 300px; }
.orders-table th:nth-child(2), .orders-table td:nth-child(2) { width: 190px; }
.orders-table th:nth-child(3), .orders-table td:nth-child(3) { width: 130px; }
.orders-table th:nth-child(4), .orders-table td:nth-child(4) { width: 110px; }
.orders-table th:nth-child(5), .orders-table td:nth-child(5) { width: 170px; }
.orders-table th:nth-child(6), .orders-table td:nth-child(6) { width: 210px; }
.orders-table th:nth-child(7), .orders-table td:nth-child(7) { width: 340px; }
.orders-table td:nth-child(5) form,
.orders-table td:nth-child(6) form,
.orders-table td:nth-child(7) form {
  max-width: 100%;
  box-sizing: border-box;
}
.orders-table td:nth-child(5) input,
.orders-table td:nth-child(5) select,
.orders-table td:nth-child(6) input,
.orders-table td:nth-child(6) select,
.orders-table td:nth-child(7) input {
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}
.orders-table td:nth-child(7) form {
  width: 100%;
}
.product-line { display:grid; gap:4px; margin-bottom:9px; min-width:130px; }
.product-line strong { font-size:11px; }
.product-line span { color:#948994; font-size:10px; }
.date-text { white-space:nowrap; }
.amount { font-size:13px; white-space:nowrap; }
.status-pill { display:inline-block; border-radius:20px; padding:6px 8px; font-size:9px; letter-spacing:.5px; white-space:nowrap; }
.status-pill.paid { background:#eaf5ee; color:#367c58; }
.status-pill.pending { background:#fff4e5; color:#a66a21; }
.status-pill.pending i { background:#d69a45; }
.verified-text { display:block; color:#428361; font-size:10px; margin-top:8px; }
.payment-id { display:block; max-width:125px; color:#9a9099; font-size:9px; margin-top:5px; overflow-wrap:anywhere; }
.empty-state { text-align:center; padding:45px 15px; color:#514354; }
.empty-state p { color:#948994; font-size:12px; }
.dashboard-footer { display:flex; justify-content:space-between; gap:10px; color:#a096a0; font-size:10px; padding:22px 3px 0; }
.admin-login { min-height:100vh; display:grid; place-items:center; background:#f7f4f6; padding:20px; font-family:Arial,Helvetica,sans-serif; }
.login-card { width:100%; max-width:390px; padding:34px; background:#fff; border:1px solid #eee7ed; border-radius:16px; box-shadow:0 12px 40px #30223512; }
.login-card .brand-mark { margin-bottom:22px; }
.login-card h1 { font-family:Georgia,serif; font-weight:normal; font-size:31px; margin:10px 0; color:#302235; }
.login-card label { display:block; margin:24px 0 8px; font-size:12px; color:#514354; }
.login-card input { width:100%; height:44px; border:1px solid #e4dce3; border-radius:7px; padding:0 12px; }
.primary-button { width:100%; height:45px; margin-top:15px; background:#302235; color:#fff; border:0; border-radius:7px; cursor:pointer; }
.login-error { color:#b42318; font-size:12px; }
.login-foot { color:#a096a0; font-size:9px; letter-spacing:1.5px; text-align:center; margin:28px 0 0; }
@media(max-width:900px) { .sidebar { width:190px; } .dashboard { padding:25px 20px; } .stats-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media(max-width:600px) { .sidebar { display:none; } .dashboard { padding:22px 13px; } .topbar h1 { font-size:29px; } .stats-grid { gap:9px; } .stat-card { padding:13px; } .stat-card > strong { font-size:23px; } .stats-heading { align-items:flex-start; flex-direction:column; } .orders-section { padding:13px; } .dashboard-footer { flex-direction:column; } }
/* NXTGLAM PREMIUM BLACK & GOLD ADMIN THEME */
.admin-shell {
  background: #090909;
  color: #f5f0e5;
}
.sidebar {
  background: #11100e;
  border-right: 1px solid #302717;
}
.brand-mark, .admin-avatar {
  background: linear-gradient(135deg,#f3d98b,#b58a38);
  color: #17130b;
}
.side-brand strong { color: #f4dfaa; }
.side-brand span, .side-label { color: #a99770; }
.side-link { color: #c9c0ad; }
.side-link.active {
  background: #302719;
  color: #f4d88b;
  border: 1px solid #6d5427;
}
.sidebar-footer { border-color: #382e1d; }
.admin-user span { color: #bba779; }

.dashboard { background: #090909; }
.eyebrow { color: #c4a45d; }
.topbar h1, .stats-heading h2, .orders-heading h2 {
  color: #f4e8c9;
}
.muted, .stats-heading p, .orders-heading p {
  color: #a69c89;
}
.logout-button {
  background: #c9a75c;
  color: #17130b;
  border: 1px solid #e5c77f;
}
.logout-button:hover, .filter-button:hover {
  background: #e0c47e;
}
.live-label {
  background: #19291d;
  color: #9cdbac;
}
.stats-grid { gap: 18px; }
.stat-card, .orders-section {
  background: #141311;
  border: 1px solid #39301f;
  box-shadow: 0 8px 25px #0008;
}
.stat-top { color: #c5b99f; }
.stat-top b {
  background: #302719;
  color: #e1c47e;
}
.stat-card > strong { color: #f5e8c8; }
.stat-card small { color: #aaa08c; }
.revenue-card {
  background: linear-gradient(145deg,#392d19,#17130d);
  border-color: #8b6b31;
}
.revenue-card .stat-top,
.revenue-card small { color: #e1d0a6; }
.revenue-card .stat-top b {
  background: #705326;
  color: #fff0c5;
}
.count-pill {
  background: #302719;
  color: #e7ca82;
}
.filter-bar input, .filter-bar select {
  background: #0e0d0b;
  border: 1px solid #51432a;
  color: #f4e8c9;
}
.filter-bar input::placeholder { color: #918875; }
.filter-button {
  background: #c9a75c;
  color: #17130b;
}
.reset-link { color: #e0c47e; }

.table-wrap {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #3b301e;
  border-radius: 9px;
}
.orders-table {
  width: 1700px;
  min-width: 1700px;
  table-layout: fixed;
  background: #11100e;
}
.orders-table th {
  background: #272014;
  color: #e3c77f;
  border-bottom: 1px solid #806333;
}
.orders-table td {
  color: #e7dfce;
  border-bottom: 1px solid #30291d;
  white-space: normal;
  overflow-wrap: anywhere;
  vertical-align: top;
}
.orders-table tr:hover td { background: #1b1812; }
.customer-name { color: #f2e5c5; }
.sub-text, .product-line span { color: #a99e89; }
.order-id {
  background: #302719;
  color: #e7c879;
}
.orders-table details > div {
  background: #211c13 !important;
  color: #e9dfca;
  border: 1px solid #4a3a20;
}
.orders-table details summary { color: #dfbd6b !important; }
.orders-table input, .orders-table select {
  background: #0d0c0a;
  color: #f1e5ca;
  border: 1px solid #59472b;
  border-radius: 6px;
  min-height: 36px;
}
.orders-table button {
  background: #c9a75c;
  color: #17130b;
  border: 0;
  border-radius: 6px;
  font-weight: 700;
}
.orders-table a { color: #e4c77e; }
.status-pill.paid {
  background: #193323;
  color: #9cdbac;
}
.status-pill.pending {
  background: #382a16;
  color: #edc77d;
}
.verified-text { color: #9cdbac; }
.payment-id { color: #b6aa93; }
.empty-state { color: #f1e5ca; }
.empty-state p { color: #a99e89; }
.dashboard-footer {
  color: #998b70;
  border-top: 1px solid #302719;
  margin-top: 20px;
  padding-top: 18px;
}

/* LOGIN PAGE */
.admin-login { background: #090909; }
.login-card {
  background: #151310;
  border: 1px solid #6b522b;
}
.login-card h1 { color: #f2dfb1; }
.login-card label { color: #dfc78e; }
.login-card input {
  background: #0c0b09;
  color: #fff0ce;
  border-color: #5c4827;
}
.primary-button {
  background: #c9a75c;
  color: #17130b;
  font-weight: 700;
}
.login-foot { color: #c4a45d; }

@media(max-width:900px) {
  .sidebar { width:190px; }
}
@media(max-width:600px) {
  .sidebar { display:none; }
  .dashboard { padding:20px 12px; }
  .orders-section { padding:12px; }
  .stats-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
`











