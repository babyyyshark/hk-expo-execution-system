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
            <div className="plan-grid">
              {[
                ["开场问候", "Hello, welcome to our booth. Nice to meet you.", "您好，欢迎来到我们的展位，很高兴见到您。"],
                ["介绍产品", "We supply fresh fruits, vegetables, frozen products, and seafood.", "我们供应水果、蔬菜、冻品和海鲜。"],
                ["询问需求", "What products are you looking for this season?", "您这季主要在找哪些产品？"],
                ["价格沟通", "Could you please share your target price and packing requirement?", "您方便告诉我目标价格和包装要求吗？"],
                ["交换联系方式", "May I have your WhatsApp so I can send more details?", "我可以加您的 WhatsApp，把更多资料发给您吗？"],
                ["后续跟进", "I will follow up with you after the exhibition.", "展会结束后我会继续跟进您。"]
              ].map(([title, en, zh]) => <div className="plan-card" key={title}><h3>{title}</h3><p>{en}</p><p className="muted">{zh}</p></div>)}
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
