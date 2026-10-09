import { useEffect, useRef, useState } from "react";
import React from "react";
import {
  Leaf,
  MessageCircle,
  Camera,
  Sprout,
  CloudSun,
  Landmark,
  Info,
  Plus,
  Trash2,
  Send,
  Upload,
  Menu,
  X,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const pages = [
  ["home", "Home", Leaf],
  ["chat", "AI Chat", MessageCircle],
  ["disease", "Plant Disease", Camera],
  ["crop", "Crop Guide", Sprout],
  ["weather", "Weather", CloudSun],
  ["schemes", "Schemes", Landmark],
  ["about", "About", Info],
];
function App() {
  const [page, setPage] = useState("home"),
    [language, setLanguage] = useState("English"),
    [convos, setConvos] = useState([]),
    [conversationId, setConversationId] = useState(null),
    [messages, setMessages] = useState([]),
    [input, setInput] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [mobile, setMobile] = useState(false);
  const loadConvos = () =>
    fetch(`${API}/api/conversations`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setConvos)
      .catch(() => {});
  const openConversation = async (id) => {
    try {
      const r = await fetch(`${API}/api/conversations/${id}`);
      const data = await r.json();
      if (!r.ok) throw Error(data.detail || "Could not load conversation");
      setConversationId(data.id);
      setLanguage(data.language || "English");
      setMessages(data.messages || []);
      setError("");
      setPage("chat");
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => {
    loadConvos();
  }, []);
  const send = async () => {
    if (!input.trim() || busy) return;
    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setBusy(true);
    setError("");
    try {
      const r = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: text,
          language,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.detail || "Request failed");
      setConversationId(data.conversation_id);
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      loadConvos();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const newChat = () => {
    setConversationId(null);
    setMessages([]);
    setError("");
    setPage("chat");
  };
  const clearChat = async () => {
    if (conversationId)
      await fetch(`${API}/api/conversations/${conversationId}`, {
        method: "DELETE",
      });
    newChat();
    loadConvos();
  };
  return (
    <div className="min-h-screen bg-cream text-slate-800">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-green-900/10 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button
            onClick={() => setPage("home")}
            className="flex items-center gap-2 text-xl font-bold text-forest"
          >
            <span className="rounded-xl bg-leaf p-2 text-white">
              <Leaf size={22} />
            </span>
            AgriMitra
          </button>
          <button
            className="rounded-lg p-2 md:hidden"
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? <X /> : <Menu />}
          </button>
          <div className="hidden items-center gap-3 md:flex">
            <span className="text-sm text-slate-500">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option>English</option>
              <option value="Hindi">हिन्दी</option>
              <option value="Telugu">తెలుగు</option>
            </select>
            <button
              onClick={newChat}
              className="flex items-center gap-2 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              New chat
            </button>
            <button
              onClick={clearChat}
              title="Clear current conversation"
              className="rounded-lg border p-2 text-slate-500 hover:text-red-600"
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl pt-[65px]">
        <aside
          className={`${mobile ? "block" : "hidden"} fixed bottom-0 left-0 top-[65px] z-40 min-h-0 w-72 overflow-y-auto border-r bg-white p-4 md:block`}
        >
          <nav className="space-y-1">
            {pages.map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => {
                  setPage(id);
                  setMobile(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium ${page === id ? "bg-green-50 text-leaf" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>
          <div className="my-5 border-t pt-4">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase text-slate-400">
              Recent chats
              <button onClick={newChat}>
                <Plus size={15} />
              </button>
            </div>
            {convos.slice(0, 8).map((c) => (
              <button
                key={c.id}
                onClick={() => openConversation(c.id)}
                className="block w-full truncate rounded-lg px-2 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
              >
                {c.title}
              </button>
            ))}
          </div>
        </aside>
        <main className="ml-0 min-h-[calc(100vh-65px)] w-full p-4 md:ml-72 md:p-10">
          {page === "home" ? (
            <Home go={setPage} />
          ) : page === "chat" ? (
            <Chat
              messages={messages}
              input={input}
              setInput={setInput}
              send={send}
              busy={busy}
              error={error}
              language={language}
            />
          ) : page === "disease" ? (
            <Disease language={language} />
          ) : page === "crop" ? (
            <Crop />
          ) : page === "weather" ? (
            <Weather />
          ) : page === "schemes" ? (
            <Schemes />
          ) : (
            <About />
          )}
        </main>
      </div>
    </div>
  );
}
function Home({ go }) {
  return (
    <section className="mx-auto max-w-4xl py-10">
      <div className="rounded-3xl bg-forest p-8 text-white shadow-xl md:p-14">
        <p className="mb-3 font-semibold text-yellow-300">
          Your farming companion
        </p>
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-6xl">
          Smarter decisions for healthier farms.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-green-100">
          Ask practical questions, explore crops, understand plant symptoms, and
          find official scheme links—all in your language.
        </p>
        <button
          onClick={() => go("chat")}
          className="mt-8 rounded-xl bg-yellow-400 px-5 py-3 font-bold text-forest"
        >
          Start a conversation
        </button>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["chat", "Ask AgriMitra", "Get step-by-step guidance"],
          ["disease", "Check a plant", "Upload a crop photo"],
          ["crop", "Plan your crop", "Compare general options"],
        ].map(([id, t, d]) => (
          <button
            onClick={() => go(id)}
            key={id}
            className="rounded-2xl border border-green-900/10 bg-white p-5 text-left shadow-sm hover:shadow-md"
          >
            <h3 className="font-bold text-forest">{t}</h3>
            <p className="mt-2 text-sm text-slate-500">{d}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
function Chat({ messages, input, setInput, send, busy, error, language }) {
  const end = useRef();
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <section className="mx-auto max-w-3xl">
      <div className="mb-6">
        <p className="font-semibold text-leaf">AgriMitra AI</p>
        <h1 className="text-3xl font-bold text-forest">
          How can I help your farm?
        </h1>
        <p className="mt-2 text-slate-500">
          Ask in English, Hindi, or Telugu. Advice is general and should be
          confirmed locally.
        </p>
      </div>
      <div className="min-h-[420px] space-y-4 rounded-2xl border bg-white p-4 shadow-sm md:p-6">
        {messages.length === 0 && (
          <div className="py-20 text-center text-slate-400">
            <MessageCircle className="mx-auto mb-3" size={38} />
            <p>Try: “Which crops suit low-water conditions in my district?”</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : ""}`}
          >
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${m.role === "user" ? "bg-forest text-white" : "bg-green-50 text-slate-700"}`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="text-sm text-slate-400">AgriMitra is thinking…</div>
        )}
        <div ref={end} />
      </div>
      {error && (
        <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="mt-4 flex gap-2 rounded-2xl border bg-white p-2 shadow-sm">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={`Ask in ${language}…`}
          rows="2"
          className="flex-1 resize-none p-2 outline-none"
        />
        <button
          onClick={send}
          disabled={busy || !input.trim()}
          className="self-end rounded-xl bg-leaf p-3 text-white disabled:opacity-40"
        >
          <Send size={18} />
        </button>
      </div>
    </section>
  );
}
function Disease({ language }) {
  const [file, setFile] = useState(null),
    [result, setResult] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const analyze = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    const f = new FormData();
    f.append("file", file);
    f.append("language", language);
    try {
      const r = await fetch(`${API}/api/disease`, { method: "POST", body: f });
      const d = await r.json();
      if (!r.ok) throw Error(d.detail);
      setResult(d.analysis);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Feature
      title="Plant disease assistant"
      subtitle="Upload a clear leaf or crop photo. The vision model reports observations and uncertainty—not a definitive diagnosis."
    >
      <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-green-200 bg-white p-10">
        <Upload className="mb-3 text-leaf" />
        <span className="font-semibold">
          {file ? file.name : "Choose JPG, PNG, or WebP image"}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0])}
        />
      </label>
      <button
        onClick={analyze}
        disabled={!file || busy}
        className="mt-4 rounded-xl bg-forest px-5 py-3 font-semibold text-white disabled:opacity-40"
      >
        {busy ? "Analyzing…" : "Analyze image"}
      </button>
      {error && <Alert text={error} />}{" "}
      {result && (
        <div className="mt-6 whitespace-pre-wrap rounded-2xl bg-white p-5 leading-7 shadow-sm">
          {result}
        </div>
      )}
    </Feature>
  );
}
function Crop() {
  const [form, setForm] = useState({
      state: "",
      district: "",
      season: "",
      soil_type: "",
      water_availability: "",
      soil_test: "",
    }),
    [result, setResult] = useState(null),
    [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const r = await fetch(`${API}/api/crop-recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setResult(await r.json());
    setBusy(false);
  };
  return (
    <Feature
      title="Crop recommendation"
      subtitle="Share your conditions for general options. Local extension advice remains important."
    >
      <form
        onSubmit={submit}
        className="grid gap-3 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-2"
      >
        {[
          ["state", "State"],
          ["district", "District"],
          ["season", "Season"],
          ["soil_type", "Soil type"],
          ["water_availability", "Water availability"],
        ].map(([k, l]) => (
          <input
            required
            key={k}
            placeholder={l}
            value={form[k]}
            onChange={(e) => setForm({ ...form, [k]: e.target.value })}
            className="rounded-xl border p-3"
          />
        ))}
        <textarea
          placeholder="Optional soil test results"
          value={form.soil_test}
          onChange={(e) => setForm({ ...form, soil_test: e.target.value })}
          className="rounded-xl border p-3 md:col-span-2"
        />
        <button className="rounded-xl bg-leaf px-5 py-3 font-semibold text-white md:col-span-2">
          {busy ? "Preparing…" : "Suggest crops"}
        </button>
      </form>
      {result && (
        <div className="mt-5 space-y-3">
          {result.recommendations?.map((x) => (
            <div className="rounded-xl bg-white p-4 shadow-sm" key={x.crop}>
              <b className="text-forest">{x.crop}</b>
              <p className="mt-1 text-sm">{x.reason}</p>
            </div>
          ))}
          <p className="text-sm text-slate-500">{result.note}</p>
        </div>
      )}
    </Feature>
  );
}
function Weather() {
  const [location, setLocation] = useState(""),
    [data, setData] = useState(null);
  const go = async () => {
    const r = await fetch(`${API}/api/weather`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location }),
    });
    setData(await r.json());
  };
  return (
    <Feature
      title="Weather information"
      subtitle="Live weather is shown only when a weather provider is configured; AgriMitra never invents current conditions."
    >
      <div className="flex gap-2">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City or district"
          className="flex-1 rounded-xl border p-3"
        />
        <button
          onClick={go}
          className="rounded-xl bg-leaf px-4 font-semibold text-white"
        >
          Check
        </button>
      </div>
      {data && (
        <div className="mt-5 rounded-2xl bg-white p-6 shadow-sm">
          {data.available ? (
            <>
              <h3 className="text-xl font-bold">{data.location}</h3>
              <p className="mt-2 text-3xl">{data.temperature_c}°C</p>
              <p>{data.description}</p>
              <small>Source: {data.source}</small>
            </>
          ) : (
            <p>{data.message}</p>
          )}
        </div>
      )}
    </Feature>
  );
}
function Schemes() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(`${API}/api/schemes`)
      .then((r) => r.json())
      .then(setData);
  }, []);
  return (
    <Feature
      title="Government schemes"
      subtitle="Links point to official portals. Always verify current eligibility, benefits, and deadlines there."
    >
      <div className="space-y-3">
        {data?.schemes.map((s) => (
          <a
            className="block rounded-2xl bg-white p-5 shadow-sm hover:shadow-md"
            href={s.url}
            target="_blank"
            rel="noreferrer"
            key={s.name}
          >
            <h3 className="font-bold text-forest">{s.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{s.description}</p>
            <span className="mt-2 block text-xs text-leaf">
              Open official source →
            </span>
          </a>
        ))}
      </div>
    </Feature>
  );
}
function About() {
  return (
    <Feature
      title="About AgriMitra"
      subtitle="A student-friendly agriculture assistant for Indian farmers."
    >
      <div className="rounded-2xl bg-white p-6 leading-7 shadow-sm">
        AgriMitra combines a React interface, FastAPI services, SQLite
        conversation storage, and Groq models. It supports English, Hindi, and
        Telugu conversations. AI responses may be incorrect; for disease,
        chemical, financial, or urgent crop decisions, consult a qualified local
        agriculture professional.
      </div>
    </Feature>
  );
}
function Feature({ title, subtitle, children }) {
  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold text-forest">{title}</h1>
      <p className="mt-2 mb-6 text-slate-500">{subtitle}</p>
      {children}
    </section>
  );
}
function Alert({ text }) {
  return (
    <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
      {text}
    </div>
  );
}
export default App;
