import { useState, useEffect, useCallback } from "react";
import {
  authService,
  subscriptionService,
  productService,
  errorLogService,
  type Subscription,
  type Product,
  type ErrorLog,
} from "./api/api";

// ─── Login Sayfası ──────────────────────────────────────────────────────────
function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username || !password) return;
    setLoading(true);
    setError("");
    try {
      const { token } = await authService.login(username, password);
      localStorage.setItem("caffiend_token", token);
      onLogin();
    } catch {
      setError("Kullanıcı adı veya şifre hatalı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#FAF9F6" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-5xl">☕</span>
          <h1 className="text-2xl font-bold text-[#2C2C2C] mt-3">Caffiend Admin</h1>
          <p className="text-sm text-[#8B7355] mt-1">Abonelik Yönetim Paneli</p>
        </div>

        {/* Kart */}
        <div className="bg-white rounded-2xl border border-[#E8E0D5] p-8 shadow-sm">
          <h2 className="text-base font-semibold text-[#2C2C2C] mb-6">Giriş Yap</h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[#8B7355] uppercase tracking-wide mb-1.5 block">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="caffiend"
                className="w-full border border-[#E8E0D5] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#C4A882] bg-[#FDFCFB] placeholder:text-[#C4B8A8]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#8B7355] uppercase tracking-wide mb-1.5 block">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                className="w-full border border-[#E8E0D5] rounded-xl px-4 py-2.5 text-sm text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#C4A882] bg-[#FDFCFB] placeholder:text-[#C4B8A8]"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !username || !password}
              className="w-full bg-[#6B3F2A] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5A3322] transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Giriş yapılıyor...
                </span>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </div>

          <p className="text-xs text-[#C4B8A8] text-center mt-6">
            Varsayılan: <span className="font-mono">caffiend</span> / <span className="font-mono">Admin1234!</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Yardımcı Bileşenler ────────────────────────────────────────────────────
function StatusBadge({ status }: { status: "Active" | "Paused" }) {
  const isActive = status === "Active";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-amber-500"}`} />
      {isActive ? "Aktif" : "Duraklatıldı"}
    </span>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="w-8 h-8 border-2 border-[#6B3F2A] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-[#8B7355]/60">
      <span className="text-4xl mb-3">☕</span>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── Abonelik Sekmesi ───────────────────────────────────────────────────────
function SubscriptionsTab() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setSubs(await subscriptionService.getAll());
    } catch { setSubs([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (sub: Subscription) => {
    setActionLoading(sub.id);
    try {
      const updated = sub.status === "Active"
        ? await subscriptionService.pause(sub.id)
        : await subscriptionService.activate(sub.id);
      setSubs((prev) => prev.map((s) => s.id === sub.id ? updated : s));
    } catch {
      setSubs((prev) => prev.map((s) => s.id === sub.id ? { ...s, status: s.status === "Active" ? "Paused" : "Active" } : s));
    } finally { setActionLoading(null); }
  };

  const handleDelay = async (id: number) => {
    setActionLoading(id * 100);
    try {
      const updated = await subscriptionService.delayOneWeek(id);
      setSubs((prev) => prev.map((s) => s.id === id ? updated : s));
    } catch {
      setSubs((prev) => prev.map((s) => s.id === id ? { ...s, nextDeliveryDate: new Date(new Date(s.nextDeliveryDate).getTime() + 7 * 86400000).toISOString() } : s));
    } finally { setActionLoading(null); }
  };

  if (loading) return <LoadingSpinner />;
  if (!subs.length) return <EmptyState message="Henüz abonelik yok." />;

  return (
    <div className="space-y-4">
      {subs.map((sub) => (
        <div key={sub.id} className="bg-white rounded-2xl border border-[#E8E0D5] p-5 hover:border-[#C4A882] transition-colors">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-semibold text-[#2C2C2C]">{sub.user.fullName}</span>
                <StatusBadge status={sub.status} />
              </div>
              <p className="text-sm text-[#8B7355]">{sub.user.email}</p>
              <p className="text-xs text-[#8B7355]/70 mt-1">
                Her {sub.frequencyWeeks} haftada bir · Sonraki:{" "}
                <span className="font-medium text-[#6B3F2A]">{new Date(sub.nextDeliveryDate).toLocaleDateString("tr-TR")}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleToggle(sub)} disabled={actionLoading === sub.id}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${sub.status === "Active" ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"}`}>
                {actionLoading === sub.id ? "..." : sub.status === "Active" ? "⏸ Duraklat" : "▶ Aktif Et"}
              </button>
              <button onClick={() => handleDelay(sub.id)} disabled={actionLoading === sub.id * 100}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#FAF0E6] text-[#6B3F2A] hover:bg-[#F0E0CC] border border-[#E8D5BF] transition-all disabled:opacity-50">
                {actionLoading === sub.id * 100 ? "..." : "📅 1 Hafta Ertele"}
              </button>
            </div>
          </div>
          <div className="border-t border-[#F0E8DC] pt-3">
            <p className="text-xs font-medium text-[#8B7355] uppercase tracking-wide mb-2">Sepet</p>
            <div className="flex flex-wrap gap-2">
              {sub.items.map((item) => (
                <div key={item.id} className="flex items-center gap-1.5 bg-[#FAF6F0] border border-[#E8DDD0] rounded-lg px-2.5 py-1">
                  <span className="text-xs">☕</span>
                  <span className="text-xs font-medium text-[#2C2C2C]">{item.product.name}</span>
                  <span className="text-xs text-[#8B7355]">× {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Ürün Sekmesi ───────────────────────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", pricePerUnit: "", stock: "" });

  const load = useCallback(async () => {
    try { setLoading(true); setProducts(await productService.getAll()); }
    catch { setProducts([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.pricePerUnit || !form.stock) return;
    setSaving(true);
    try {
      const created = await productService.create({ name: form.name, category: form.category, pricePerUnit: parseFloat(form.pricePerUnit), stock: parseInt(form.stock) });
      setProducts((prev) => [created, ...prev]);
    } catch {
      setProducts((prev) => [{ id: Date.now(), name: form.name, category: form.category, pricePerUnit: parseFloat(form.pricePerUnit), stock: parseInt(form.stock) }, ...prev]);
    } finally {
      setForm({ name: "", category: "", pricePerUnit: "", stock: "" });
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try { await productService.delete(id); } catch {}
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#E8E0D5] p-5">
        <h3 className="text-sm font-semibold text-[#6B3F2A] uppercase tracking-wide mb-4">➕ Yeni Ürün Ekle</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <input className="col-span-2 sm:col-span-1 border border-[#E8E0D5] rounded-xl px-3 py-2 text-sm text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#C4A882] bg-[#FDFCFB] placeholder:text-[#C4B8A8]" placeholder="Ürün adı" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="border border-[#E8E0D5] rounded-xl px-3 py-2 text-sm text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#C4A882] bg-[#FDFCFB] placeholder:text-[#C4B8A8]" placeholder="Kategori" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input type="number" className="border border-[#E8E0D5] rounded-xl px-3 py-2 text-sm text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#C4A882] bg-[#FDFCFB] placeholder:text-[#C4B8A8]" placeholder="Fiyat (₺)" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })} />
          <input type="number" className="border border-[#E8E0D5] rounded-xl px-3 py-2 text-sm text-[#2C2C2C] focus:outline-none focus:ring-2 focus:ring-[#C4A882] bg-[#FDFCFB] placeholder:text-[#C4B8A8]" placeholder="Stok" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        </div>
        <button onClick={handleSubmit} disabled={saving || !form.name || !form.category || !form.pricePerUnit || !form.stock}
          className="mt-3 px-5 py-2 bg-[#6B3F2A] text-white text-sm font-medium rounded-xl hover:bg-[#5A3322] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          {saving ? "Kaydediliyor..." : "Ürünü Kaydet"}
        </button>
      </div>
      {loading ? <LoadingSpinner /> : !products.length ? <EmptyState message="Henüz ürün yok." /> : (
        <div className="bg-white rounded-2xl border border-[#E8E0D5] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#F0E8DC] bg-[#FAF6F0]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#8B7355] uppercase tracking-wide">Ürün</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#8B7355] uppercase tracking-wide hidden sm:table-cell">Kategori</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#8B7355] uppercase tracking-wide">Fiyat</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-[#8B7355] uppercase tracking-wide">Stok</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} className={`border-b border-[#F5EFE8] last:border-0 hover:bg-[#FDFAF7] transition-colors ${i % 2 === 0 ? "" : "bg-[#FDFAF7]/50"}`}>
                  <td className="px-5 py-3 font-medium text-[#2C2C2C]">{p.name}</td>
                  <td className="px-4 py-3 text-[#8B7355] hidden sm:table-cell">{p.category}</td>
                  <td className="px-4 py-3 text-right font-medium text-[#2C2C2C]">₺{p.pricePerUnit.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${p.stock < 10 ? "text-red-600" : "text-[#2C2C2C]"}`}>{p.stock}</span>
                    {p.stock < 10 && <span className="ml-1 text-xs text-red-500">⚠ Az</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(p.id)} className="text-[#C4A882] hover:text-red-500 transition-colors text-lg leading-none">×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Hata Takipçisi ─────────────────────────────────────────────────────────
const SIMULATED_ERRORS = [
  { message: "NullReferenceException: Object reference not set to an instance of an object.", stackTrace: `at CaffiendAdmin.Services.SubscriptionService.GetNextDelivery(Int32 userId) in /app/Services/SubscriptionService.cs:line 87`, source: "Backend" as const },
  { message: "TypeError: Cannot read properties of undefined (reading 'items')", stackTrace: `at SubscriptionsTab (App.tsx:142:28)\n    at renderWithHooks (react-dom.development.js:14985:18)`, source: "Frontend" as const },
  { message: "Unhandled Promise Rejection: Network Error — POST /api/subscriptions/99/activate returned 404", stackTrace: `at api.ts:handleToggle (App.tsx:108:22)`, source: "Frontend" as const },
  { message: "PostgreSQL: duplicate key value violates unique constraint 'users_email_key'", stackTrace: `at Npgsql.NpgsqlCommand.ExecuteReader()\n   at CaffiendAdmin.Controllers.UsersController.Create() line 41`, source: "Backend" as const },
];

function ErrorTrackerTab() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try { setLoading(true); setLogs(await errorLogService.getAll()); }
    catch { setLogs([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const triggerError = async () => {
    setTriggering(true);
    const template = SIMULATED_ERRORS[Math.floor(Math.random() * SIMULATED_ERRORS.length)];
    const mockLog: ErrorLog = { id: Date.now(), ...template, timestamp: new Date().toISOString(), aiAnalysis: undefined };
    setLogs((prev) => [mockLog, ...prev]);
    try { await errorLogService.create({ source: template.source, message: template.message, stackTrace: template.stackTrace }); } catch {}
    setTimeout(() => {
      setLogs((prev) => prev.map((l) => l.id === mockLog.id ? {
        ...l,
        aiAnalysis: `🔍 Hatanın Kökü: ${template.source === "Backend" ? "Sunucu tarafında beklenmeyen bir istisna fırlatılmış." : "React bileşeni render aşamasında undefined değere erişmeye çalışmış."}\n\n🛠️ Olası Sebepler:\n• Veri kaynağından boş response dönmüş\n• Async işlem tamamlanmadan state güncellenmiş\n\n✅ Çözüm Önerisi:\n1. İlgili servise null-check ekleyin\n2. Loading state kontrolü yapın\n3. Try-catch bloğunu genişletin\n\n⚠️ Önleyici Tedbir: Integration testleri ekleyin.`
      } : l));
    }, 2500);
    setTriggering(false);
  };

  const handleDelete = async (id: number) => {
    try { await errorLogService.delete(id); } catch {}
    setLogs((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#8B7355]">{logs.length} hata kaydı · AI analizi otomatik çalışır</p>
        <button onClick={triggerError} disabled={triggering}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50">
          {triggering ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Tetikleniyor...</> : "🔥 Yapay Hata Tetikle"}
        </button>
      </div>
      {loading ? <LoadingSpinner /> : !logs.length ? <EmptyState message="Henüz hata kaydı yok. Harika! ☕" /> : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className={`bg-white rounded-2xl border transition-all ${log.source === "Backend" ? "border-orange-200 hover:border-orange-300" : "border-blue-200 hover:border-blue-300"}`}>
              <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}>
                <span className={`mt-0.5 shrink-0 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${log.source === "Backend" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>{log.source}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#2C2C2C] truncate">{log.message}</p>
                  <p className="text-xs text-[#8B7355] mt-0.5">{new Date(log.timestamp).toLocaleString("tr-TR")}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {log.aiAnalysis ? <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">✨ AI Hazır</span> : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full animate-pulse">⏳ Bekleniyor</span>}
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(log.id); }} className="text-[#C4A882] hover:text-red-500 transition-colors text-lg leading-none">×</button>
                </div>
              </div>
              {expandedId === log.id && (
                <div className="border-t border-[#F0E8DC] px-4 pb-4 pt-3 space-y-3">
                  {log.stackTrace && (
                    <div>
                      <p className="text-xs font-semibold text-[#8B7355] uppercase tracking-wide mb-1">Stack Trace</p>
                      <pre className="text-xs bg-[#FAF6F0] border border-[#EDE0D0] rounded-xl p-3 overflow-x-auto text-[#6B3F2A] whitespace-pre-wrap font-mono leading-relaxed">{log.stackTrace}</pre>
                    </div>
                  )}
                  {log.aiAnalysis ? (
                    <div>
                      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">🤖 Gemini AI Analizi</p>
                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
                        <pre className="text-sm text-[#2C2C2C] whitespace-pre-wrap font-sans leading-relaxed">{log.aiAnalysis}</pre>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-[#8B7355]">
                      <span className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      Gemini analizi hazırlanıyor...
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Ana Panel ──────────────────────────────────────────────────────────────
type TabId = "subscriptions" | "products" | "errors";
const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "subscriptions", label: "Abonelik Yönetimi", icon: "📦" },
  { id: "products", label: "Ürün Stoku", icon: "🌿" },
  { id: "errors", label: "Akıllı Hata Takipçisi", icon: "🔍" },
];

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>("subscriptions");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF9F6", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <header className="bg-white border-b border-[#EDE5DA] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">☕</span>
            <div>
              <h1 className="text-base font-bold text-[#2C2C2C] leading-tight">Caffiend Admin</h1>
              <p className="text-xs text-[#8B7355]">Abonelik Yönetim Paneli</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              <span className="text-xs text-[#8B7355]">AWS RDS • Bağlı</span>
            </div>
            <button
              onClick={onLogout}
              className="text-xs text-[#8B7355] hover:text-[#6B3F2A] border border-[#E8E0D5] px-3 py-1.5 rounded-lg hover:border-[#C4A882] transition-all"
            >
              Çıkış
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-1 bg-white border border-[#EDE5DA] rounded-2xl p-1 mb-6">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? "bg-[#6B3F2A] text-white shadow-sm" : "text-[#8B7355] hover:bg-[#FAF6F0] hover:text-[#6B3F2A]"}`}>
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
        <div>
          {activeTab === "subscriptions" && <SubscriptionsTab />}
          {activeTab === "products" && <ProductsTab />}
          {activeTab === "errors" && <ErrorTrackerTab />}
        </div>
      </main>
    </div>
  );
}

// ─── App (Auth Router) ──────────────────────────────────────────────────────
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isLoggedIn());

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;
  return <Dashboard onLogout={handleLogout} />;
}
