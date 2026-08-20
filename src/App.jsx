import React, { useEffect, useMemo, useState } from "react";
import { defaultDrafts } from "./data";
import { getShareConfig, loadRemoteState, saveRemoteState, saveShareConfig } from "./sharedStore";

const storageKey = "hk-expo-execution-system-v1";
const tabs = ["总控台", "展会信息", "攻略", "样品管理", "客户速记卡", "会展英语", "AI辅助"];
const quickValueTags = ["重点客户", "有兴趣", "普通客户"];
const quickActions = [
  { label: "添加 WhatsApp", tip: "客户愿意保持联系" },
  { label: "发送产品资料", tip: "客户想了解产品、规格、包装、供应情况" },
  { label: "发送报价", tip: "客户有明确采购或询价需求" }
];
const englishSections = [
  {
    title: "快速开场",
    badge: "Greeting",
    lines: [
      ["自然迎接", "Hello, welcome to our booth. Please feel free to have a look.", "您好，欢迎来到我们的展位，您可以先随便看看。"],
      ["轻松破冰", "Is this your first time visiting Asia Fruit Logistica?", "这是您第一次来亚洲果蔬展吗？"],
      ["快速判断需求", "Are you mainly looking for fresh fruits, vegetables, frozen products, or seafood?", "您主要在找水果、蔬菜、冻品还是海鲜？"],
      ["留下沟通空间", "If anything is interesting, I can give you a quick introduction.", "如果您对某个产品感兴趣，我可以简单给您介绍一下。"]
    ]
  },
  {
    title: "介绍自己和公司",
    badge: "Company Intro",
    lines: [
      ["自我介绍", "My name is Krystal. I am responsible for overseas business and customer follow-up.", "我是 Krystal，主要负责海外业务和客户跟进。"],
      ["公司名称", "We are Fuzhou Xiangshan Fruit Co., Ltd., a fruit and food trading company based in Fuzhou, China.", "我们是福州向善果业有限公司，是一家位于福州的水果食品贸易公司。"],
      ["公司定位", "We work as a sourcing and export partner, helping customers match reliable factories and suitable products.", "我们作为采购和出口合作伙伴，帮客户匹配可靠工厂和合适产品。"],
      ["合作资源", "Our supply network covers fruit production areas across China, and we also cooperate with suppliers from Vietnam and Taiwan.", "我们的供应网络覆盖中国多个水果产区，也和越南、台湾供应商有合作。"]
    ]
  },
  {
    title: "贸易公司优势",
    badge: "Why Us",
    lines: [
      ["整合供应", "Our advantage is not only one product. We can integrate different products for one customer.", "我们的优势不是只做单一产品，而是能为客户整合多种产品。"],
      ["拼柜能力", "We can arrange mixed container loading, so you can combine different items in one shipment.", "我们可以安排拼柜，把不同品类组合到一个柜里。"],
      ["定制方案", "We can customize the product combination according to your market, season, budget, and packing requirements.", "我们可以根据您的市场、季节、预算和包装要求定制组合方案。"],
      ["降低沟通成本", "Instead of talking to many factories separately, you can work with us as one contact window.", "您不用分别对接很多工厂，可以把我们作为统一沟通窗口。"]
    ]
  },
  {
    title: "经验和品类",
    badge: "Experience",
    lines: [
      ["做过多久", "We have been working in fruit sourcing and export for many years, with stable factory and farm resources.", "我们多年从事水果采购和出口，有稳定的工厂和基地资源。"],
      ["做过国家", "We have experience serving customers from the Middle East, Southeast Asia, Korea, Taiwan, and other markets.", "我们有服务中东、东南亚、韩国、台湾等市场客户的经验。"],
      ["水果品类", "For fruits, we can discuss blueberries, cherries, citrus, grapes, apples, pears, and seasonal fruits.", "水果方面可以沟通蓝莓、车厘子、柑橘、葡萄、苹果、梨和季节性水果。"],
      ["蔬菜冻品", "We can also help with vegetables, frozen products, seafood, and other food items depending on your demand.", "也可以根据需求协助蔬菜、冻品、海鲜和其他食品品类。"]
    ]
  },
  {
    title: "付款和账期",
    badge: "Payment",
    lines: [
      ["基础付款", "For new cooperation, we usually start with safer payment terms for both sides.", "新合作通常会先采用对双方都更安全的付款方式。"],
      ["优质客户", "For qualified customers, we can apply for credit insurance support and discuss better payment terms.", "对于优质客户，我们可以申请中信保支持，再讨论更好的付款条件。"],
      ["OA账期", "After credit approval, OA terms may be possible depending on the customer background and order scale.", "通过信用审核后，可以根据客户背景和订单规模讨论 OA 账期。"],
      ["资金支持", "We also work with Fujian Huaxi Import and Export Co., Ltd. as a financing partner, which helps reduce funding pressure.", "我们也有福建华禧进出口有限责任公司作为垫资合作方，能减轻资金压力。"]
    ]
  },
  {
    title: "日常转接",
    badge: "Handoff",
    lines: [
      ["同事负责", "Kevin is in charge of this part. I will ask him to send it to you.", "这部分是 Kevin 负责的，我请他传给您。"],
      ["帮忙转达", "I will pass your request to the right colleague and get back to you soon.", "我会把您的需求转给对应同事，然后尽快回复您。"],
      ["请同事联系", "I will ask my colleague to contact you directly after the exhibition.", "展会后我会请同事直接联系您。"],
      ["资料稍后发", "I do not have the full file with me now, but I can send it to you by WhatsApp later.", "我现在手上没有完整资料，但稍后可以通过 WhatsApp 发给您。"],
      ["确认后回复", "Let me double-check with our team first, and I will reply to you later today.", "我先和团队确认一下，今天晚些时候回复您。"]
    ]
  },
  {
    title: "现场缓冲话术",
    badge: "Soft Reply",
    lines: [
      ["没听清", "Sorry, could you please say that again a little slower?", "不好意思，您可以稍微慢一点再说一遍吗？"],
      ["暂时不确定", "I am not 100% sure about that right now. Let me confirm before giving you an answer.", "这个我现在不能百分百确定，我确认后再答复您。"],
      ["需要记录", "Let me write this down so I can follow up properly after the show.", "我先记录一下，展会后好好跟进您。"],
      ["请客户留信息", "Could you please leave your name card or WhatsApp? I will send you the details later.", "您方便留名片或 WhatsApp 吗？我稍后把详细资料发给您。"],
      ["忙时安抚", "Please give me one moment. I will come back to you very soon.", "请稍等一下，我马上回来跟您沟通。"]
    ]
  },
  {
    title: "结束和跟进",
    badge: "Follow-up",
    lines: [
      ["加 WhatsApp", "May I add your WhatsApp? I can send product photos, packing details, and availability after the show.", "我可以加您 WhatsApp 吗？展后我把产品照片、包装和供应情况发给您。"],
      ["要资料", "I will send you our product list and company profile after the exhibition.", "展会后我会发您产品目录和公司介绍。"],
      ["问报价条件", "To quote accurately, may I know your destination port, preferred packing, and estimated quantity?", "为了准确报价，我想确认目的港、包装要求和预计数量。"],
      ["礼貌收尾", "Thank you for visiting us. I will follow up with you shortly.", "感谢您来我们展位，我会尽快跟进您。"]
    ]
  }
];
const tradeTerms = [
  ["贸易公司", "trading company"],
  ["供应商整合", "supplier integration"],
  ["拼柜", "mixed container loading / consolidated shipment"],
  ["整柜", "full container load / FCL"],
  ["散货", "less than container load / LCL"],
  ["产地", "origin / production area"],
  ["规格", "specification"],
  ["包装", "packing / packaging"],
  ["纸箱", "carton"],
  ["托盘", "pallet"],
  ["柜量", "container quantity"],
  ["目的港", "destination port"],
  ["冷链", "cold chain"],
  ["冷冻", "frozen"],
  ["保鲜", "fresh keeping"],
  ["采购量", "purchase volume"],
  ["目标价", "target price"],
  ["到岸价", "CIF price"],
  ["离岸价", "FOB price"],
  ["付款方式", "payment terms"],
  ["信用保险", "credit insurance"],
  ["中信保", "Sinosure / China Export & Credit Insurance Corporation"],
  ["OA账期", "OA terms / open account terms"],
  ["垫资方", "financing partner"],
  ["国企", "state-owned enterprise"]
];

function Card({ title, action, children }) {
  return <section className="card"><div className="card-head"><h2>{title}</h2>{action}</div>{children}</section>;
}

function loadState() {
  return defaultDrafts;
}

export default function App() {
  const [state, setState] = useState(loadState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [shareConfig, setShareConfig] = useState(getShareConfig);
  const [showShareSetup, setShowShareSetup] = useState(false);
  const [shareDraft, setShareDraft] = useState(() => getShareConfig());
  const [syncStatus, setSyncStatus] = useState("本地模式");
  const [activeTab, setActiveTab] = useState("总控台");
  const [travelSubTab, setTravelSubTab] = useState("行程");
  const [diningSubTab, setDiningSubTab] = useState("员工用餐");
  const [selectedTravelId, setSelectedTravelId] = useState(() => loadState().travel?.[0]?.id ?? 1);
  const [selectedChecklistId, setSelectedChecklistId] = useState(() => loadState().checklist?.[0]?.id ?? 1);
  const [selectedStaffRestId, setSelectedStaffRestId] = useState(() => loadState().restaurants?.staff?.[0]?.id ?? 1);
  const [selectedClientRestId, setSelectedClientRestId] = useState(() => loadState().restaurants?.client?.[0]?.id ?? 1);
  const [selectedSampleId, setSelectedSampleId] = useState(() => loadState().samples?.[0]?.id ?? 1);
  const [sampleFilter, setSampleFilter] = useState("全部");
  const [aiOutput, setAiOutput] = useState("");
  const [showSampleCard, setShowSampleCard] = useState(false);
  const [showQuickCard, setShowQuickCard] = useState(false);
  const [actionHint, setActionHint] = useState("");
  const [actionState, setActionState] = useState({});
  const [speakingText, setSpeakingText] = useState("");
  const [draft, setDraft] = useState({
    companyName: "",
    country: "迪拜",
    market: "中东市场",
    clientType: "新客户",
    contactName: "",
    whatsapp: "",
    email: "",
    productsText: "",
    value: "有兴趣",
    nextActions: [],
    quickNotes: ""
  });

  useEffect(() => {
    let cancelled = false;
    setSyncStatus(shareConfig.url && shareConfig.anonKey ? "正在读取共享数据..." : "本地模式");
    loadRemoteState(shareConfig)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setState((prev) => ({ ...prev, ...data }));
          setAiOutput(data.aiOutput || "");
          setSyncStatus("已连接共享数据");
        } else {
          setSyncStatus(shareConfig.url && shareConfig.anonKey ? "共享库暂无数据，保存后创建" : "本地模式");
        }
      })
      .catch(() => {
        if (!cancelled) setSyncStatus("共享连接失败，当前为本地显示");
      })
      .finally(() => {
        if (!cancelled) setIsHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [shareConfig]);

  useEffect(() => {
    if (!isHydrated) return;
    const data = { ...state, aiOutput };
    localStorage.setItem(storageKey, JSON.stringify(data));
    if (!shareConfig.url || !shareConfig.anonKey) {
      setSyncStatus("本地模式");
      return;
    }
    setSyncStatus("保存中...");
    const timer = window.setTimeout(() => {
      saveRemoteState(shareConfig, data)
        .then(() => setSyncStatus(`已同步 ${new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`))
        .catch(() => setSyncStatus("保存失败，请检查 Supabase 配置"));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [state, aiOutput, isHydrated, shareConfig]);

  useEffect(() => {
    if (!shareConfig.url || !shareConfig.anonKey) return;
    const timer = window.setInterval(() => {
      loadRemoteState(shareConfig)
        .then((data) => {
          if (!data) return;
          setState((prev) => ({ ...prev, ...data }));
          setAiOutput(data.aiOutput || "");
        })
        .catch(() => setSyncStatus("自动同步失败，稍后重试"));
    }, 15000);
    return () => window.clearInterval(timer);
  }, [shareConfig]);

  const applyShareConfig = () => {
    saveShareConfig(shareDraft);
    setShareConfig({ ...shareDraft, source: "local" });
    setShowShareSetup(false);
    setIsHydrated(false);
  };

  const speakEnglish = (text) => {
    if (!window.speechSynthesis) {
      window.alert("当前浏览器不支持语音朗读，请换 Chrome / Edge 试试。");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((item) => item.lang?.toLowerCase().startsWith("en-us")) || voices.find((item) => item.lang?.toLowerCase().startsWith("en"));
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || "en-US";
    utterance.rate = 0.86;
    utterance.pitch = 1;
    utterance.onstart = () => setSpeakingText(text);
    utterance.onend = () => setSpeakingText("");
    utterance.onerror = () => setSpeakingText("");
    window.speechSynthesis.speak(utterance);
  };

  const clients = Array.isArray(state.clients) ? state.clients : [];
  const samples = Array.isArray(state.samples) ? state.samples : [];
  const travel = Array.isArray(state.travel) ? state.travel : [];
  const checklist = Array.isArray(state.checklist) ? state.checklist : [];
  const staffRestaurants = Array.isArray(state.restaurants?.staff) ? state.restaurants.staff : [];
  const clientRestaurants = Array.isArray(state.restaurants?.client) ? state.restaurants.client : [];

  const selectedTravel = travel.find((t, idx) => (t.id ?? idx + 1) === selectedTravelId) || travel[0];
  const selectedChecklist = checklist.find((i) => i.id === selectedChecklistId) || checklist[0];
  const selectedStaffRest = staffRestaurants.find((i) => i.id === selectedStaffRestId) || staffRestaurants[0];
  const selectedClientRest = clientRestaurants.find((i) => i.id === selectedClientRestId) || clientRestaurants[0];
  const selectedSample = samples.find((s) => s.id === selectedSampleId) || samples[0];

  const filteredSamples = useMemo(() => sampleFilter === "全部" ? samples : samples.filter((s) => (s.status || "待发出") === sampleFilter), [samples, sampleFilter]);

  const updateField = (section, field, value) => setState((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  const updateTravel = (id, field, value) => setState((prev) => ({ ...prev, travel: prev.travel.map((t, idx) => ((t.id ?? idx + 1) === id ? { ...t, [field]: value } : t)) }));
  const updateChecklist = (id, field, value) => setState((prev) => ({ ...prev, checklist: prev.checklist.map((i) => (i.id === id ? { ...i, [field]: value } : i)) }));
  const updateStaffRest = (id, field, value) => setState((prev) => ({ ...prev, restaurants: { ...prev.restaurants, staff: prev.restaurants.staff.map((i) => (i.id === id ? { ...i, [field]: value } : i)) } }));
  const updateClientRest = (id, field, value) => setState((prev) => ({ ...prev, restaurants: { ...prev.restaurants, client: prev.restaurants.client.map((i) => (i.id === id ? { ...i, [field]: value } : i)) } }));
  const updateSample = (id, field, value) => setState((prev) => ({ ...prev, samples: prev.samples.map((s) => (s.id === id ? { ...s, [field]: value } : s)) }));

  const addTravel = () => {
    const nextId = Math.max(0, ...state.travel.map((t, idx) => t.id ?? idx + 1)) + 1;
    const row = { id: nextId, person: "新人员", ticketStatus: "未购买", trainNo: "福州→深圳北", departureTime: "", arrivalTime: "", origin: "", destination: "", charterInfo: "", charterNote: "", routeNote: "" };
    setState((prev) => ({ ...prev, travel: [row, ...prev.travel] }));
    setSelectedTravelId(nextId);
  };

  const deleteTravel = (id) => {
    const target = state.travel.find((t, idx) => (t.id ?? idx + 1) === id);
    if (!window.confirm(`确定删除行程“${target?.person || "未命名人员"}”吗？`)) return;
    const next = state.travel.filter((t, idx) => (t.id ?? idx + 1) !== id);
    setState((prev) => ({ ...prev, travel: next }));
    setSelectedTravelId(next[0]?.id ?? 1);
  };

  const addChecklist = () => {
    const nextId = Math.max(0, ...state.checklist.map((i) => i.id)) + 1;
    setState((prev) => ({ ...prev, checklist: [{ id: nextId, name: "新清单项", note: "" }, ...prev.checklist] }));
    setSelectedChecklistId(nextId);
  };

  const deleteChecklist = (id) => {
    setState((prev) => ({ ...prev, checklist: prev.checklist.filter((i) => i.id !== id) }));
  };

  const addStaffRest = () => {
    const nextId = Math.max(0, ...state.restaurants.staff.map((i) => i.id)) + 1;
    setState((prev) => ({ ...prev, restaurants: { ...prev.restaurants, staff: [{ id: nextId, restaurant: "新餐厅", location: "", transport: "", note: "" }, ...prev.restaurants.staff] } }));
    setSelectedStaffRestId(nextId);
  };

  const addClientRest = () => {
    const nextId = Math.max(0, ...state.restaurants.client.map((i) => i.id)) + 1;
    setState((prev) => ({ ...prev, restaurants: { ...prev.restaurants, client: [{ id: nextId, restaurant: "新接待餐厅", reservation: "待填写", contact: "", distance: "", transport: "", note: "" }, ...prev.restaurants.client] } }));
    setSelectedClientRestId(nextId);
  };

  const addSample = () => {
    const nextId = Math.max(0, ...state.samples.map((s) => s.id)) + 1;
    setState((prev) => ({ ...prev, samples: [{ id: nextId, productName: "新样品", quantity: "", factory: "", specification: "", note: "", status: "待发出" }, ...prev.samples] }));
    setSelectedSampleId(nextId);
    setShowSampleCard(true);
  };

  const deleteSample = (id) => {
    if (!window.confirm("确定删除这个样品吗？")) return;
    setState((prev) => ({ ...prev, samples: prev.samples.filter((s) => s.id !== id) }));
  };

  const generateAI = () => {
    const client = clients[0];
    setAiOutput(`客户：${client?.name || "未填写"}\n建议：先确认需求、价格、包装和交期。\n英文：May I know your target price and packing requirement?\nWhatsApp：Nice meeting you at the booth. I will send the details shortly.`);
    setActiveTab("AI辅助");
  };

  const saveQuickCard = () => {
    if (!draft.companyName.trim()) return;
    const nextId = Math.max(0, ...state.clients.map((c) => c.id)) + 1;
    const newClient = {
      id: nextId,
      name: draft.companyName.trim(),
      country: draft.country.trim(),
      market: draft.market.trim(),
      type: draft.clientType,
      contactName: draft.contactName.trim(),
      whatsapp: draft.whatsapp.trim(),
      email: draft.email.trim(),
      productsText: draft.productsText.trim(),
      value: draft.value,
      nextActions: draft.nextActions,
      quickNotes: draft.quickNotes.trim()
    };
    setState((prev) => ({ ...prev, clients: [newClient, ...prev.clients] }));
    setShowQuickCard(false);
    setDraft({ companyName: "", country: "迪拜", market: "中东市场", clientType: "新客户", contactName: "", whatsapp: "", email: "", productsText: "", value: "有兴趣", nextActions: [], quickNotes: "" });
    setActiveTab("客户速记卡");
  };

  const toggleAction = (label) => {
    const now = Date.now();
    const current = actionState[label] || { count: 0, lastAt: 0, timer: null };
    const nextCount = now - current.lastAt < 500 ? current.count + 1 : 1;
    if (current.timer) window.clearTimeout(current.timer);
    const timer = window.setTimeout(() => setActionHint(""), 600);
    setActionState((prev) => ({ ...prev, [label]: { count: nextCount, lastAt: now, timer } }));
    setActionHint(`${label}：${quickActions.find((i) => i.label === label)?.tip || ""}`);
    if (nextCount === 2) setDraft((p) => ({ ...p, nextActions: p.nextActions.includes(label) ? p.nextActions : [...p.nextActions, label] }));
    if (nextCount >= 3) setDraft((p) => ({ ...p, nextActions: p.nextActions.filter((x) => x !== label) }));
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand">2026 香港展会执行管理系统</div>
          <div className="subtitle">Asia Fruit Logistica 现场执行台</div>
        </div>
        <div className="subtitle">展会日期：2026/09/02-09/04<br />展馆：AsiaWorld-Expo<br />展位：5馆 5B32</div>
        <div className="nav">{tabs.map((tab) => <button key={tab} className={activeTab === tab ? "nav-item active" : "nav-item"} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div>
        <div className="card-actions">
          <button className="primary" onClick={generateAI}>一键生成客户AI建议</button>
          <button className="secondary" onClick={() => setShowQuickCard(true)}>新增客户</button>
          <button className="secondary" onClick={() => setShowShareSetup(true)}>共享设置</button>
        </div>
      </aside>

      <main className="content">
        <header className="hero">
          <div>
            <p className="eyebrow">2026 香港展会执行管理系统</p>
            <h1>Asia Fruit Logistica 现场执行台</h1>
            <p className="hero-text">这是展会现场的轻量执行台，先把最常用的信息放在一屏内，后面再继续完善共享保存和发布版。</p>
          </div>
          <div className="card-actions">
            <button className="primary" onClick={generateAI}>一键生成客户AI建议</button>
            <button className="secondary" onClick={() => setShowQuickCard(true)}>新增客户</button>
            <button className="secondary" onClick={() => setShowShareSetup(true)}>共享设置</button>
          </div>
        </header>
        <div className={shareConfig.url && shareConfig.anonKey ? "sync-banner online" : "sync-banner"}>
          <strong>{shareConfig.url && shareConfig.anonKey ? "共享模式" : "本地模式"}</strong>
          <span>{syncStatus}</span>
        </div>

        {activeTab === "总控台" && (
          <Card title="总览">
            <div className="stats-grid grid stats">
              <div className="stat"><strong>{clients.length}</strong><span>客户</span></div>
              <div className="stat"><strong>{samples.length}</strong><span>样品</span></div>
              <div className="stat"><strong>{travel.length}</strong><span>行程</span></div>
              <div className="stat"><strong>{new Set(clients.map((c) => c.market).filter(Boolean)).size}</strong><span>市场</span></div>
            </div>
          </Card>
        )}

        {activeTab === "展会信息" && (
          <Card title="展会基础信息">
            <div className="info-grid">
              <div><span>名称</span><input value={state.exhibition.name} onChange={(e) => updateField("exhibition", "name", e.target.value)} /></div>
              <div><span>日期</span><input value={state.exhibition.dateRange} onChange={(e) => updateField("exhibition", "dateRange", e.target.value)} /></div>
              <div><span>展馆</span><input value={state.exhibition.venue} onChange={(e) => updateField("exhibition", "venue", e.target.value)} /></div>
              <div><span>展位</span><input value={state.exhibition.booth} onChange={(e) => updateField("exhibition", "booth", e.target.value)} /></div>
            </div>
          </Card>
        )}

        {activeTab === "攻略" && (
          <Card title="攻略" action={<div className="card-actions">{["行程", "清单", "酒店", "餐饮"].map((tab) => <button key={tab} className={travelSubTab === tab ? "chip active" : "chip"} onClick={() => setTravelSubTab(tab)}>{tab}</button>)}</div>}>
            {travelSubTab === "行程" && (
              <>
                <div className="section-block">
                  <div className="section-title">统一动车信息</div>
                  <div className="info-grid">
                    <div><span>福州-深圳北车次</span><input value={state.travel?.[0]?.trainNo || ""} onChange={(e) => updateTravel(state.travel?.[0]?.id || 1, "trainNo", e.target.value)} /></div>
                    <div><span>出发时间</span><input value={state.travel?.[0]?.departureTime || ""} onChange={(e) => updateTravel(state.travel?.[0]?.id || 1, "departureTime", e.target.value)} /></div>
                    <div><span>到达时间</span><input value={state.travel?.[0]?.arrivalTime || ""} onChange={(e) => updateTravel(state.travel?.[0]?.id || 1, "arrivalTime", e.target.value)} /></div>
                  </div>
                </div>
                <div className="card-actions"><button className="primary small" onClick={addTravel}>新增人员</button></div>
                <div className="table">
                  <div className="row head"><span>人员</span><span>是否已买票</span><span>操作</span></div>
                  {travel.map((item, idx) => {
                    const id = item.id ?? idx + 1;
                    return <div key={id} className={selectedTravelId === id ? "row selected" : "row"}><span>{item.person}</span><span>{item.ticketStatus}</span><span><button className="secondary small" onClick={() => setSelectedTravelId(id)}>编辑</button> <button className="secondary small" onClick={() => deleteTravel(id)}>删除</button></span></div>;
                  })}
                </div>
                {selectedTravel && <div className="editor"><div className="info-grid"><div><span>人员</span><input value={selectedTravel.person || ""} onChange={(e) => updateTravel(selectedTravelId, "person", e.target.value)} /></div><div><span>是否已买票</span><input value={selectedTravel.ticketStatus || ""} onChange={(e) => updateTravel(selectedTravelId, "ticketStatus", e.target.value)} /></div></div></div>}
              </>
            )}

            {travelSubTab === "清单" && (
              <>
                <div className="card-actions"><button className="primary small" onClick={addChecklist}>新增清单项</button></div>
                <div className="table">
                  <div className="row head"><span>清单项</span><span>备注</span><span>操作</span></div>
                  {checklist.map((item) => <div key={item.id} className={selectedChecklistId === item.id ? "row selected" : "row"}><span>{item.name}</span><span>{item.note}</span><span><button className="secondary small" onClick={() => setSelectedChecklistId(item.id)}>编辑</button> <button className="secondary small" onClick={() => deleteChecklist(item.id)}>删除</button></span></div>)}
                </div>
                {selectedChecklist && <div className="editor"><div className="info-grid"><div><span>清单项</span><input value={selectedChecklist.name} onChange={(e) => updateChecklist(selectedChecklistId, "name", e.target.value)} /></div><div><span>备注</span><input value={selectedChecklist.note || ""} onChange={(e) => updateChecklist(selectedChecklistId, "note", e.target.value)} /></div></div></div>}
              </>
            )}

            {travelSubTab === "酒店" && <Card title="酒店信息"><div className="info-grid"><div><span>酒店名称</span><input value={state.hotel.name} onChange={(e) => updateField("hotel", "name", e.target.value)} /></div><div><span>入住</span><input value={state.hotel.checkIn} onChange={(e) => updateField("hotel", "checkIn", e.target.value)} /></div><div><span>退房</span><input value={state.hotel.checkOut} onChange={(e) => updateField("hotel", "checkOut", e.target.value)} /></div><div><span>地址</span><input value={state.hotel.address} onChange={(e) => updateField("hotel", "address", e.target.value)} /></div><div><span>交通</span><input value={state.hotel.transport} onChange={(e) => updateField("hotel", "transport", e.target.value)} /></div><div><span>早餐</span><input value={state.hotel.breakfast} onChange={(e) => updateField("hotel", "breakfast", e.target.value)} /></div></div></Card>}

            {travelSubTab === "餐饮" && (
              <>
                <div className="card-actions">{["员工用餐", "客户接待"].map((tab) => <button key={tab} className={diningSubTab === tab ? "chip active" : "chip"} onClick={() => setDiningSubTab(tab)}>{tab}</button>)}</div>
                {diningSubTab === "员工用餐" && <><div className="card-actions"><button className="primary small" onClick={addStaffRest}>新增餐厅</button></div><div className="table"><div className="row head"><span>餐厅</span><span>位置</span><span>交通方式</span><span>备注</span><span>操作</span></div>{staffRestaurants.map((item) => <div key={item.id} className={selectedStaffRestId === item.id ? "row selected" : "row"}><span>{item.restaurant}</span><span>{item.location}</span><span>{item.transport}</span><span>{item.note}</span><span><button className="secondary small" onClick={() => setSelectedStaffRestId(item.id)}>编辑</button></span></div>)}</div>{selectedStaffRest && <div className="editor"><div className="info-grid"><div><span>餐厅</span><input value={selectedStaffRest.restaurant} onChange={(e) => updateStaffRest(selectedStaffRestId, "restaurant", e.target.value)} /></div><div><span>位置</span><input value={selectedStaffRest.location} onChange={(e) => updateStaffRest(selectedStaffRestId, "location", e.target.value)} /></div><div><span>交通方式</span><input value={selectedStaffRest.transport} onChange={(e) => updateStaffRest(selectedStaffRestId, "transport", e.target.value)} /></div><div><span>备注</span><input value={selectedStaffRest.note || ""} onChange={(e) => updateStaffRest(selectedStaffRestId, "note", e.target.value)} /></div></div></div>}</>}
                {diningSubTab === "客户接待" && <><div className="card-actions"><button className="primary small" onClick={addClientRest}>新增接待餐厅</button></div><div className="table"><div className="row head"><span>餐厅</span><span>是否预约</span><span>预约电话/方式</span><span>距离酒店</span><span>交通方式</span><span>备注</span><span>操作</span></div>{clientRestaurants.map((item) => <div key={item.id} className={selectedClientRestId === item.id ? "row selected" : "row"}><span>{item.restaurant}</span><span>{item.reservation}</span><span>{item.contact}</span><span>{item.distance}</span><span>{item.transport}</span><span>{item.note}</span><span><button className="secondary small" onClick={() => setSelectedClientRestId(item.id)}>编辑</button></span></div>)}</div>{selectedClientRest && <div className="editor"><div className="info-grid"><div><span>餐厅</span><input value={selectedClientRest.restaurant} onChange={(e) => updateClientRest(selectedClientRestId, "restaurant", e.target.value)} /></div><div><span>是否预约</span><input value={selectedClientRest.reservation} onChange={(e) => updateClientRest(selectedClientRestId, "reservation", e.target.value)} /></div><div><span>预约电话/方式</span><input value={selectedClientRest.contact} onChange={(e) => updateClientRest(selectedClientRestId, "contact", e.target.value)} /></div><div><span>距离酒店</span><input value={selectedClientRest.distance} onChange={(e) => updateClientRest(selectedClientRestId, "distance", e.target.value)} /></div><div><span>交通方式</span><input value={selectedClientRest.transport} onChange={(e) => updateClientRest(selectedClientRestId, "transport", e.target.value)} /></div><div><span>备注</span><input value={selectedClientRest.note || ""} onChange={(e) => updateClientRest(selectedClientRestId, "note", e.target.value)} /></div></div></div>}</>}
              </>
            )}
          </Card>
        )}

        {activeTab === "样品管理" && (
          <Card title="样品管理" action={<button className="primary small" onClick={addSample}>新增样品</button>}>
            <div className="client-toolbar"><div className="button-row">{["全部", "待发出", "已发出", "已收到"].map((f) => <button key={f} className={sampleFilter === f ? "chip active" : "chip"} onClick={() => setSampleFilter(f)}>{f}</button>)}</div></div>
            <div className="table"><div className="row head"><span>品名</span><span>数量</span><span>工厂</span><span>规格</span><span>备注</span><span>状态</span><span>操作</span></div>{filteredSamples.map((item) => <div key={item.id} className={selectedSampleId === item.id ? "row selected" : "row"}><span className="multiline-cell">{item.productName}</span><span className="multiline-cell">{item.quantity}</span><span>{item.factory}</span><span className="multiline-cell">{item.specification}</span><span>{item.note}</span><span>{item.status}</span><span><button className="secondary small" onClick={() => { setSelectedSampleId(item.id); setShowSampleCard(true); }}>编辑</button> <button className="secondary small" onClick={() => deleteSample(item.id)}>删除</button></span></div>)}</div>
            {showSampleCard && selectedSample && <div className="modal-backdrop" onClick={() => setShowSampleCard(false)}><div className="modal" onClick={(e) => e.stopPropagation()}><div className="modal-head"><h2>样品编辑</h2><button className="icon-button" onClick={() => setShowSampleCard(false)}>×</button></div><div className="modal-grid"><label>品名<textarea value={selectedSample.productName} onChange={(e) => updateSample(selectedSample.id, "productName", e.target.value)} /></label><label>数量<textarea value={selectedSample.quantity} onChange={(e) => updateSample(selectedSample.id, "quantity", e.target.value)} /></label><label>工厂<input value={selectedSample.factory} onChange={(e) => updateSample(selectedSample.id, "factory", e.target.value)} /></label><label>规格<textarea value={selectedSample.specification} onChange={(e) => updateSample(selectedSample.id, "specification", e.target.value)} /></label><label>状态<select value={selectedSample.status || "待发出"} onChange={(e) => updateSample(selectedSample.id, "status", e.target.value)}><option value="待发出">待发出</option><option value="已发出">已发出</option><option value="已收到">已收到</option></select></label></div><div className="section-block"><label>备注<textarea value={selectedSample.note || ""} onChange={(e) => updateSample(selectedSample.id, "note", e.target.value)} /></label></div><div className="modal-actions"><button className="secondary" onClick={() => setShowSampleCard(false)}>关闭</button><button className="primary" onClick={() => setShowSampleCard(false)}>确定</button></div></div></div>}
          </Card>
        )}

        {activeTab === "客户速记卡" && (
          <Card title="客户列表" action={<div className="card-actions"><button className="primary small" onClick={() => setShowQuickCard(true)}>新增客户</button><button className="secondary small" onClick={generateAI}>AI整理今日记录</button></div>}>
            <div className="table"><div className="row head"><span>公司</span><span>国家</span><span>客户类型</span><span>价值</span><span>市场</span><span>下一步动作</span></div>{clients.map((item) => <div key={item.id} className="row"><span>{item.name}</span><span>{item.country}</span><span>{item.type}</span><span>{item.value}</span><span>{item.market}</span><span>{(item.nextActions || []).join(" / ")}</span></div>)}</div>
            {showQuickCard && <div className="modal-backdrop" onClick={() => setShowQuickCard(false)}><div className="modal" onClick={(e) => e.stopPropagation()}><div className="modal-head"><h2>客户速记卡</h2><button className="icon-button" onClick={() => setShowQuickCard(false)}>×</button></div><div className="modal-grid"><label>公司<input value={draft.companyName} onChange={(e) => setDraft((p) => ({ ...p, companyName: e.target.value }))} /></label><label>国家<input value={draft.country} onChange={(e) => setDraft((p) => ({ ...p, country: e.target.value }))} /></label><label>市场<input value={draft.market} onChange={(e) => setDraft((p) => ({ ...p, market: e.target.value }))} /></label><label>客户类型<select value={draft.clientType} onChange={(e) => setDraft((p) => ({ ...p, clientType: e.target.value }))}><option value="新客户">新客户</option><option value="老客户">老客户</option></select></label><label>联系人<input value={draft.contactName} onChange={(e) => setDraft((p) => ({ ...p, contactName: e.target.value }))} /></label><label>WhatsApp<input value={draft.whatsapp} onChange={(e) => setDraft((p) => ({ ...p, whatsapp: e.target.value }))} /></label><label>Email<input value={draft.email} onChange={(e) => setDraft((p) => ({ ...p, email: e.target.value }))} /></label><label>产品兴趣<textarea value={draft.productsText} onChange={(e) => setDraft((p) => ({ ...p, productsText: e.target.value }))} /></label></div><div className="section-block"><div className="section-title">客户价值</div><div className="button-row">{quickValueTags.map((tag) => <button key={tag} className={draft.value === tag ? "chip active" : "chip"} onClick={() => setDraft((p) => ({ ...p, value: tag }))}>{tag}</button>)}</div></div><div className="section-block"><div className="section-title">下一步动作</div><div className="button-row wrap">{quickActions.map((item) => <button key={item.label} className={draft.nextActions.includes(item.label) ? "chip active" : "chip"} title={item.tip} onClick={() => toggleAction(item.label)}>{item.label}</button>)}</div><div className="action-hint">{actionHint || "第一次点击看提示，第二次确认选择，第三次取消选择。"}</div></div><div className="section-block"><label>Quick Notes<textarea value={draft.quickNotes} onChange={(e) => setDraft((p) => ({ ...p, quickNotes: e.target.value }))} /></label></div><div className="modal-actions"><button className="secondary" onClick={() => setShowQuickCard(false)}>取消</button><button className="primary" onClick={saveQuickCard}>保存</button></div></div></div>}
          </Card>
        )}

        {activeTab === "会展英语" && (
          <Card title="会展水果外贸英语">
            <div className="english-hero">
              <div>
                <p className="eyebrow">现场原则：先建立信任，再判断需求，最后留下联系方式</p>
                <h3>不是一上来报价格，而是快速说明“我们是谁、能帮客户解决什么”。</h3>
              </div>
              <div className="english-tip">Tip: 先问市场和品类，再聊包装、数量、目的港，最后再报价。</div>
            </div>
            <div className="english-grid">
              {englishSections.map((section) => (
                <div className="english-card" key={section.title}>
                  <div className="english-card-head">
                    <h3>{section.title}</h3>
                    <span>{section.badge}</span>
                  </div>
                  <div className="phrase-list">
                    {section.lines.map(([scene, en, zh]) => (
                      <div className="phrase" key={`${section.title}-${scene}`}>
                        <div className="phrase-head">
                          <strong>{scene}</strong>
                          <button className={speakingText === en ? "speak-button active" : "speak-button"} onClick={() => speakEnglish(en)} type="button">{speakingText === en ? "朗读中" : "播放"}</button>
                        </div>
                        <p className="phrase-en">{en}</p>
                        <p className="muted">{zh}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="section-block">
              <div className="section-title">专业术语 Quick Terms</div>
              <div className="terms-grid">
                {tradeTerms.map(([zh, en]) => (
                  <div className="term-item" key={zh}>
                    <span>{zh}</span>
                    <div className="term-line">
                      <strong>{en}</strong>
                      <button className={speakingText === en ? "speak-button mini active" : "speak-button mini"} onClick={() => speakEnglish(en)} type="button">{speakingText === en ? "读" : "听"}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {activeTab === "AI辅助" && <Card title="AI辅助输出"><pre className="output">{aiOutput || "点击生成后，这里会显示接待方案、英文话术、WhatsApp 问候语和跟进计划。"}</pre></Card>}

        {showShareSetup && (
          <div className="modal-backdrop" onClick={() => setShowShareSetup(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h2>共享保存设置</h2>
                <button className="icon-button" onClick={() => setShowShareSetup(false)}>×</button>
              </div>
              <div className="section-block">
                <p className="muted">填入 Supabase Project URL 和 anon public key 后，大家打开同一个网址就会读写同一份数据。</p>
              </div>
              <div className="modal-grid">
                <label>Supabase Project URL<input value={shareDraft.url || ""} onChange={(e) => setShareDraft((p) => ({ ...p, url: e.target.value }))} placeholder="https://xxxx.supabase.co" /></label>
                <label>Anon Public Key<input value={shareDraft.anonKey || ""} onChange={(e) => setShareDraft((p) => ({ ...p, anonKey: e.target.value }))} placeholder="eyJhbGci..." /></label>
              </div>
              <div className="modal-actions">
                <button className="secondary" onClick={() => setShowShareSetup(false)}>取消</button>
                <button className="primary" onClick={applyShareConfig}>保存共享设置</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
