import React, { useEffect, useMemo, useState } from "react";
import { defaultDrafts } from "./data";
import { getShareConfig, loadRemoteState, saveRemoteState, saveShareConfig } from "./sharedStore";

const storageKey = "hk-expo-execution-system-v1";
const tabs = ["展会信息", "酒店信息", "接待推荐", "接待安排", "记得携带", "样品管理", "客户速记卡", "会展英语"];
const quickValueTags = ["重点客户", "有兴趣", "普通客户"];
const quickActions = [
  { label: "添加 WhatsApp", tip: "客户愿意保持联系" },
  { label: "发送产品资料", tip: "客户想了解产品、规格、包装、供应情况" },
  { label: "发送报价", tip: "客户有明确采购或询价需求" }
];
const receptionRestaurants = [
  {
    name: "the Jade 翠玉轩",
    location: "丽豪航天城酒店内，近 AsiaWorld-Expo",
    image: `${import.meta.env.BASE_URL}restaurants/the-jade.svg`,
    price: "参考：商务中餐，人均约 HKD 300-600 起，按点菜/套餐浮动",
    address: "8 Airport Expo Boulevard, Hong Kong International Airport, Chek Lap Kok",
    booking: "建议提前向酒店餐饮部确认包厢和最低消费",
    fit: "最适合：住酒店客户、正式但不想奔波的客户晚餐",
    advantages: ["就在酒店内，雨天/行李多也方便", "中餐接待稳妥，适合亚洲客户", "可优先询问 private dining room / 包厢"],
    source: "https://sccd-cn.regalhotel.com/en/regala-skycity-hotel/Restaurants-and-Bars/the-Jade"
  },
  {
    name: "NUVA",
    location: "AsiaWorld-Expo 展馆内",
    image: `${import.meta.env.BASE_URL}restaurants/nuva.svg`,
    price: "参考：中高端中餐/点心/商务餐，人均约 HKD 300-800，按菜单浮动",
    address: "AsiaWorld-Expo, Hong Kong International Airport, Lantau",
    booking: "展会期间很容易满位，建议提前预约并确认包厢/半私密区域",
    fit: "最适合：客户不方便离开展馆、展中午餐或快速商务接待",
    advantages: ["在展馆内，动线最短", "适合 PLAN C：客户不方便外出时直接接待", "环境比普通展馆餐饮更正式"],
    source: "https://www.asiaworld-expo.com/en-us/our-services/food-beverage/nuva/"
  },
  {
    name: "Man Ho Chinese Restaurant 万豪金殿",
    location: "香港天际万豪酒店内，近 AsiaWorld-Expo",
    image: `${import.meta.env.BASE_URL}restaurants/man-ho.svg`,
    price: "参考：酒店粤菜商务接待，人均约 HKD 500-900+",
    address: "Hong Kong SkyCity Marriott Hotel, 1 Sky City Road East, Hong Kong International Airport",
    booking: "建议提前订位，说明 business dinner / private room request",
    fit: "最适合：重点客户、正式晚餐、需要更体面酒店环境的接待",
    advantages: ["酒店中餐厅，商务属性强", "离展馆和丽豪航天城酒店都近", "适合重点客户深度沟通"],
    source: "https://www.marriott.com/en-us/hotels/hkgap-hong-kong-skycity-marriott-hotel/dining/"
  },
  {
    name: "Rouge 富豪中菜厅",
    location: "香港富豪机场酒店内，机场区域",
    image: `${import.meta.env.BASE_URL}restaurants/rouge.svg`,
    price: "参考：传统粤菜接待，人均约 HKD 300-700，按点菜浮动",
    address: "Regal Airport Hotel, 9 Cheong Tat Road, Hong Kong International Airport",
    booking: "适合提前电话确认包厢、圆桌和最低消费",
    fit: "最适合：客户住机场酒店、需要传统粤菜圆桌接待",
    advantages: ["机场酒店区域，交通相对确定", "粤菜选择稳妥，适合正式但不太冒险的客户", "适合不想进入市区的晚餐安排"],
    source: "https://www.regalhotel.com/en/regal-airport-hotel/restaurants-and-bars/rouge"
  }
];
const meetingSchedules = [
  {
    id: 1,
    buyer: "Kc trading (Australia) pty ltd",
    buyerEn: "Kc trading (Australia) pty ltd",
    country: "Australia",
    countryEn: "Australia",
    time: "2 September (Day 1) 09:00",
    timeEn: "2 September (Day 1) 09:00",
    status: "已预约",
    focus: "Export to Australia.",
    focusEn: "Export to Australia.",
    notes: ["确认主要采购品类", "了解澳洲市场需求", "带公司介绍和水果品类资料"]
  },
  {
    id: 2,
    buyer: "A. Chinatamby Co. Ltd / Votre Pote Age Ltee",
    buyerEn: "A. Chinatamby Co. Ltd / Votre Pote Age Ltee",
    country: "Mauritius",
    countryEn: "Mauritius",
    time: "2 September (Day 1) 11:00",
    timeEn: "2 September (Day 1) 11:00",
    status: "已预约",
    focus: "Mauritius importer, distributor, retailer and wholesaler of fresh fruits and vegetables. Key supplier to hotels and restaurants, also manages fresh fruit and vegetable sections of Carrefour in Mauritius.",
    focusEn: "Mauritius importer, distributor, retailer and wholesaler of fresh fruits and vegetables. Key supplier to hotels and restaurants, also manages fresh fruit and vegetable sections of Carrefour in Mauritius.",
    notes: ["重点介绍中国鲜果出口经验", "可讨论梨、柚子、柑橘及季节水果", "客户寻找长期合作的种植商、出口商和供应商", "关注酒店餐饮和零售渠道稳定供货"]
  },
  {
    id: 3,
    buyer: "LEVAN PTE LTD",
    buyerEn: "LEVAN PTE LTD",
    country: "Cambodia",
    countryEn: "Cambodia",
    time: "2 September (Day 1) 13:00",
    timeEn: "2 September (Day 1) 13:00",
    status: "已预约",
    focus: "Cambodia based importer looking for mandarin orange.",
    focusEn: "Cambodia based importer looking for mandarin orange.",
    notes: ["重点准备 mandarin orange 资料", "确认规格、包装、季节、价格区间", "可引导客户留下 WhatsApp 便于后续报价"]
  },
  {
    id: 4,
    buyer: "DMA FOODS / Firas",
    buyerEn: "DMA FOODS / Firas",
    country: "Turkey / Kazakhstan route",
    countryEn: "Turkey / Kazakhstan route",
    time: "3 September (Day 2) 13:00",
    timeEn: "3 September (Day 2) 13:00",
    status: "已预约",
    focus: "Blueberry bulk 3kg/carton. Customer asks FOB Khorgas / Kazakhstan shipment, with Turkey as final destination documents.",
    focusEn: "Blueberry bulk 3kg/carton. Customer asks FOB Khorgas / Kazakhstan shipment, with Turkey as final destination documents.",
    notes: ["客户关心 high quality、shelf life、FOB Kazakhstan shipment details", "客户表示 they will take care of shipment from Khorgas, Kazakhstan", "文件要求：all documents are Turkey", "香港面谈重点：付款条款、风险责任、单证要求、FOB霍尔果斯可行性", "预约时间改为：9月3日 下午1点"]
  },
  {
    id: 5,
    buyer: "柬埔寨客户（合作过）",
    buyerEn: "Cambodia customer (existing customer)",
    country: "柬埔寨",
    countryEn: "Cambodia",
    time: "2 September (Day 1) 14:00",
    timeEn: "2 September (Day 1) 14:00",
    status: "已预约",
    focus: "合作过的柬埔寨客户，重点沟通后续订单和本季水果需求。",
    focusEn: "Existing Cambodia customer. Focus on follow-up orders and seasonal fruit demand.",
    notes: ["确认今年采购计划", "重点沟通柑橘/季节性水果", "了解价格、规格、包装和出货时间要求"]
  }
];
const englishSections = [
  {
    title: "快速开场",
    badge: "Greeting",
    lines: [
      ["自然迎接", "Hello, welcome to our booth. Please feel free to have a look.", "您好，欢迎来到我们的展位，您可以先随便看看。"],
      ["轻松破冰", "Is this your first time visiting Asia Fruit Logistica?", "这是您第一次来亚洲果蔬展吗？"],
      ["快速判断需求", "Are you mainly looking for fresh fruits, vegetables, or seasonal produce?", "您主要在找水果、蔬菜，还是季节性农产品？"],
      ["留下沟通空间", "If anything is interesting, I can give you a quick introduction.", "如果您对某个产品感兴趣，我可以简单给您介绍一下。"]
    ]
  },
  {
    title: "介绍自己和公司",
    badge: "Company Intro",
    lines: [
      ["自我介绍", "My name is Krystal. I am responsible for overseas business and customer follow-up.", "我是 Krystal，主要负责海外业务和客户跟进。"],
      ["公司名称", "We are Fuzhou Xiangshan Fruit Co., Ltd., specializing in exporting fresh fruits from China.", "我们是福州向善果业有限公司，专注于中国鲜果出口。"],
      ["公司定位", "We work with global importers, distributors and retailers.", "我们服务全球进口商、分销商和零售商。"],
      ["官网介绍", "You can also visit our website: fruitioncn.com.", "您也可以查看我们的官网：fruitioncn.com。"]
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
      ["水果品类", "We specialize in Chinese pears, pomelo, mandarins and other seasonal fruits.", "我们重点做中国梨、柚子、柑橘及其他季节性水果。"],
      ["蔬菜需求", "We can also discuss fresh vegetables if they fit your purchasing plan.", "如果符合您的采购计划，也可以沟通新鲜蔬菜。"]
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
const englishDialogues = [
  {
    title: "场景一：客户路过展位，快速接待",
    goal: "适合客户刚停下来，还没有明确问价格时使用。",
    turns: [
      ["Sales", "Hello, welcome to our booth. Please feel free to have a look.", "您好，欢迎来到我们的展位，您可以先随便看看。"],
      ["Visitor", "Thank you. What kind of products do you mainly supply?", "谢谢。你们主要供应什么产品？"],
      ["Sales", "Fuzhou Xiangshan Fruit Co., Ltd. specializes in exporting fresh fruits from China, including Chinese pears, pomelo, mandarins and other seasonal fruits.", "福州向善果业有限公司专注于中国鲜果出口，包括中国梨、柚子、柑橘和其他季节性水果。"],
      ["Visitor", "Do you only supply from one factory?", "你们只从一家工厂供货吗？"],
      ["Sales", "No. Our advantage is integration. We work with different production areas and factories, so we can match suitable products according to your market.", "不是。我们的优势是整合。我们和不同产区、不同工厂合作，可以根据您的市场匹配合适产品。"],
      ["Sales", "May I know which market you are buying for?", "方便问一下您主要做哪个市场吗？"]
    ]
  },
  {
    title: "场景二：客户想要多品类拼柜",
    goal: "适合客户不是只买单一产品，想了解你们贸易公司价值时使用。",
    turns: [
      ["Visitor", "We are not looking for only one item. Can you combine different products?", "我们不是只找一个产品。你们可以组合不同产品吗？"],
      ["Sales", "Yes, this is one of our biggest advantages. We can arrange mixed container loading for different items.", "可以，这是我们最大的优势之一。我们可以为不同产品安排拼柜。"],
      ["Sales", "For example, if you need different fruits and vegetables together, we can help you coordinate suppliers, packing, documents, and shipment.", "比如您需要不同水果和蔬菜一起出货，我们可以帮您协调供应商、包装、单证和运输。"],
      ["Visitor", "That sounds useful. Can you customize the combination?", "这听起来不错。可以定制组合吗？"],
      ["Sales", "Yes. We can customize it according to your market, season, budget, target price, and packing requirement.", "可以。我们可以根据您的市场、季节、预算、目标价格和包装要求定制。"],
      ["Sales", "If you share your product list, I can check what can be combined in one shipment.", "如果您给我产品清单，我可以帮您确认哪些产品适合拼在同一票货里。"]
    ]
  },
  {
    title: "场景三：重点客户聊付款和后续跟进",
    goal: "适合客户采购意向比较强，开始问合作方式和付款条件时使用。",
    turns: [
      ["Visitor", "What payment terms can you offer?", "你们可以提供什么付款方式？"],
      ["Sales", "For new cooperation, we usually start with safer payment terms for both sides.", "新合作我们通常先采用对双方都更安全的付款方式。"],
      ["Sales", "For qualified customers, we can apply for credit insurance support. After approval, OA terms may be possible.", "对于优质客户，我们可以申请中信保支持。通过审核后，可以讨论 OA 账期。"],
      ["Visitor", "Do you have enough financial support for bigger orders?", "如果订单比较大，你们资金支持够吗？"],
      ["Sales", "Yes. We also work with Fujian Huaxi Import and Export Co., Ltd. as a financing partner. It is a state-owned enterprise, so it helps reduce funding pressure.", "有的。我们也有福建华禧进出口有限责任公司作为垫资合作方，它是国企，可以减轻资金压力。"],
      ["Sales", "May I add your WhatsApp? I will send you our company profile and product details after the exhibition.", "我可以加您 WhatsApp 吗？展后我把公司介绍和产品资料发给您。"]
    ]
  },
  {
    title: "场景四：不是自己负责，转给同事",
    goal: "适合客户问到你不确定或不是你负责的内容，避免现场卡住。",
    turns: [
      ["Visitor", "Can you send me the detailed packing list for this product?", "你能发我这个产品的详细包装清单吗？"],
      ["Sales", "This part is handled by Kevin. I will ask him to send it to you.", "这部分是 Kevin 负责的，我请他传给您。"],
      ["Visitor", "Can he contact me directly?", "他可以直接联系我吗？"],
      ["Sales", "Of course. Could you please leave your WhatsApp or name card? I will pass it to him after the meeting.", "当然可以。您方便留 WhatsApp 或名片吗？我会在会后转给他。"],
      ["Sales", "Let me also write down your request, so we can follow up more accurately.", "我也先记录一下您的需求，这样后续跟进会更准确。"]
    ]
  }
];

function Card({ title, action, children }) {
  return <section className="card"><div className="card-head"><h2>{title}</h2>{action}</div>{children}</section>;
}

function loadState() {
  return defaultDrafts;
}

function receptionKey(item) {
  if (!item) return "";
  return item.id ? `id:${item.id}` : `buyer:${item.buyer || item.buyerEn || ""}`;
}

function normalizeReceptionMeetings(items, deletedIds = []) {
  const deletedSet = new Set(Array.isArray(deletedIds) ? deletedIds : []);
  const merged = new Map();

  meetingSchedules.forEach((item) => {
    if (!deletedSet.has(item.id)) merged.set(receptionKey(item), item);
  });

  if (Array.isArray(items)) {
    items.forEach((item) => {
      if (!item || deletedSet.has(item.id)) return;
      const key = receptionKey(item);
      merged.set(key, { ...(merged.get(key) || {}), ...item });
    });
  }

  return Array.from(merged.values()).map((item) => {
    const isDma = item.buyer === "DMA FOODS / Firas" || item.buyerEn === "DMA FOODS / Firas";
    const isOldTime = item.time === "2 September (Day 1) 14:00 待确认" || item.timeEn === "2 September (Day 1) 14:00 pending confirmation";
    if (!isDma) return item;
    return {
      ...item,
      time: isOldTime ? "3 September (Day 2) 13:00" : (item.time || "3 September (Day 2) 13:00"),
      timeEn: isOldTime ? "3 September (Day 2) 13:00" : (item.timeEn || "3 September (Day 2) 13:00"),
      status: "已预约",
      notes: Array.isArray(item.notes)
        ? item.notes.map((note) => note.includes("已改约") ? "预约时间改为：9月3日 下午1点" : note)
        : item.notes
    };
  });
}

export default function App() {
  const [state, setState] = useState(loadState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [shareConfig, setShareConfig] = useState(getShareConfig);
  const [showShareSetup, setShowShareSetup] = useState(false);
  const [shareDraft, setShareDraft] = useState(() => getShareConfig());
  const [syncStatus, setSyncStatus] = useState("本地模式");
  const [activeTab, setActiveTab] = useState("展会信息");
  const [travelSubTab, setTravelSubTab] = useState("行程信息");
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
  const [showMeetingCard, setShowMeetingCard] = useState(false);
  const [meetingDraft, setMeetingDraft] = useState(null);
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
          setState((prev) => ({ ...prev, ...data, reception: normalizeReceptionMeetings(data.reception, data.deletedReceptionIds) }));
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
          setState((prev) => ({ ...prev, ...data, reception: normalizeReceptionMeetings(data.reception, data.deletedReceptionIds) }));
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
  const meetings = normalizeReceptionMeetings(state.reception, state.deletedReceptionIds);

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

  const addCarryItem = () => {
    const name = window.prompt("请输入要携带的物品名称");
    if (!name?.trim()) return;
    const nextId = Math.max(0, ...checklist.map((i) => i.id || 0)) + 1;
    setState((prev) => ({ ...prev, checklist: [...prev.checklist, { id: nextId, name: name.trim(), note: "" }] }));
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

  const persistMeetings = (updater) => {
    setState((prev) => {
      const current = normalizeReceptionMeetings(prev.reception, prev.deletedReceptionIds);
      return { ...prev, reception: updater(current) };
    });
  };

  const openMeetingEditor = (meeting) => {
    setMeetingDraft({
      id: meeting?.id || Date.now(),
      buyer: meeting?.buyer || "",
      buyerEn: meeting?.buyerEn || meeting?.buyer || "",
      country: meeting?.country || "",
      countryEn: meeting?.countryEn || meeting?.country || "",
      time: meeting?.time || "",
      timeEn: meeting?.timeEn || meeting?.time || "",
      status: meeting?.status || "已预约",
      focus: meeting?.focus || "",
      focusEn: meeting?.focusEn || meeting?.focus || "",
      notesText: Array.isArray(meeting?.notes) ? meeting.notes.join("\n") : "",
      notesEnText: Array.isArray(meeting?.notesEn) ? meeting.notesEn.join("\n") : ""
    });
    setShowMeetingCard(true);
  };

  const saveMeeting = () => {
    if (!meetingDraft?.buyer?.trim()) return;
    const nextMeeting = {
      id: meetingDraft.id,
      buyer: meetingDraft.buyer.trim(),
      buyerEn: meetingDraft.buyerEn.trim(),
      country: meetingDraft.country.trim(),
      countryEn: meetingDraft.countryEn.trim(),
      time: meetingDraft.time.trim(),
      timeEn: meetingDraft.timeEn.trim(),
      status: meetingDraft.status,
      focus: meetingDraft.focus.trim(),
      focusEn: meetingDraft.focusEn.trim(),
      notes: meetingDraft.notesText.split("\n").map((item) => item.trim()).filter(Boolean),
      notesEn: meetingDraft.notesEnText.split("\n").map((item) => item.trim()).filter(Boolean)
    };
    persistMeetings((current) => {
      const exists = current.some((item) => item.id === nextMeeting.id);
      return exists ? current.map((item) => (item.id === nextMeeting.id ? nextMeeting : item)) : [nextMeeting, ...current];
    });
    setState((prev) => ({ ...prev, deletedReceptionIds: (prev.deletedReceptionIds || []).filter((id) => id !== nextMeeting.id) }));
    setShowMeetingCard(false);
    setMeetingDraft(null);
  };

  const deleteMeeting = (id) => {
    if (!window.confirm("确定删除这个接待安排吗？")) return;
    setState((prev) => {
      const current = normalizeReceptionMeetings(prev.reception, prev.deletedReceptionIds);
      return {
        ...prev,
        deletedReceptionIds: Array.from(new Set([...(prev.deletedReceptionIds || []), id])),
        reception: current.filter((item) => item.id !== id)
      };
    });
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
            <button className="secondary" onClick={() => setShowQuickCard(true)}>新增客户</button>
            <button className="secondary" onClick={() => setShowShareSetup(true)}>共享设置</button>
          </div>
        </header>
        <div className={shareConfig.url && shareConfig.anonKey ? "sync-banner online" : "sync-banner"}>
          <strong>{shareConfig.url && shareConfig.anonKey ? "共享模式" : "本地模式"}</strong>
          <span>{syncStatus}</span>
        </div>

        {activeTab === "展会信息" && (
          <Card title="展会信息">
            <div className="expo-board">
              <div className="expo-main">
                <p className="eyebrow">Asia Fruit Logistica 2026</p>
                <h2>{state.exhibition.name}</h2>
                <p>{state.exhibition.note}</p>
              </div>
              <div className="expo-info-grid">
                <div><span>展会日期</span><strong>2026/09/02 - 2026/09/04</strong></div>
                <div><span>展馆</span><strong>香港亚洲国际博览馆 AsiaWorld-Expo</strong></div>
                <div><span>展位</span><strong>5馆 5B32</strong></div>
                <div><span>出发动车</span><strong>福州南 → 深圳北 · G1609 · 09/01 08:33-13:06</strong></div>
                <div><span>公司官网</span><strong><a href="https://fruitioncn.com/" target="_blank" rel="noreferrer">fruitioncn.com</a></strong></div>
                <div><span>重点产品</span><strong>中国鲜果：梨、柚子、柑橘及其他季节性水果；可沟通新鲜蔬菜。</strong></div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "酒店信息" && (
          <Card title="酒店信息">
            <div className="guide-panel">
              <div className="guide-hero hotel">
                <div>
                  <p className="eyebrow">住宿与基础餐饮</p>
                  <h3>丽豪航天城酒店</h3>
                  <p>Regala Skycity Hotel · 入住 2026/09/01 - 退房 2026/09/04</p>
                </div>
                <div className="guide-ticket">含早</div>
              </div>
              <div className="guide-grid">
                <div className="guide-card"><span>入住</span><strong>2026/09/01 15:00</strong></div>
                <div className="guide-card"><span>退房</span><strong>2026/09/04 12:00</strong></div>
                <div className="guide-card wide"><span>提前到达说明</span><strong>如果提早到，只要有空房也可以安排入住。</strong></div>
                <div className="guide-card wide"><span>早餐</span><strong>酒店含早</strong></div>
                <div className="guide-card"><span>午餐</span><strong>订餐 / 下载 Keeta 点外卖</strong></div>
                <div className="guide-card"><span>晚餐</span><strong>暂无固定安排</strong></div>
                <div className="guide-card wide"><span>提醒</span><strong>展会现场节奏紧，建议随身备水和简单零食。</strong></div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "接待推荐" && (
          <Card title="接待推荐">
            <div className="guide-panel">
              <div className="section-block">
                <div className="section-title">选择逻辑</div>
                <p className="muted">客户不方便外出：优先 NUVA；客户住酒店或想省时间：优先 the Jade；重点客户正式晚餐：优先 Man Ho；传统粤菜圆桌：备选 Rouge。价格为接待预算参考，实际以餐厅当日菜单和预约确认为准。</p>
              </div>
              <div className="restaurant-grid">
                {receptionRestaurants.map((restaurant) => (
                  <article className="restaurant-card" key={restaurant.name}>
                    {restaurant.image ? <img src={restaurant.image} alt={restaurant.name} /> : <div className="restaurant-placeholder">暂无官方照片</div>}
                    <div className="restaurant-body">
                      <div className="restaurant-head">
                        <h3>{restaurant.name}</h3>
                        <span>{restaurant.location}</span>
                      </div>
                      <p className="restaurant-fit">{restaurant.fit}</p>
                      <div className="restaurant-meta"><strong>价格</strong><span>{restaurant.price}</span></div>
                      <div className="restaurant-meta"><strong>地址</strong><span>{restaurant.address}</span></div>
                      <div className="restaurant-meta"><strong>预约</strong><span>{restaurant.booking}</span></div>
                      <ul className="restaurant-list">
                        {restaurant.advantages.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                      <a className="source-link" href={restaurant.source} target="_blank" rel="noreferrer">查看来源/预约参考</a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </Card>
        )}

        {activeTab === "接待安排" && (
          <Card title="接待安排" action={<button className="primary small" onClick={() => openMeetingEditor(null)}>新增接待</button>}>
            <div className="meeting-board">
              {meetings.map((meeting) => (
                <article className={meeting.status === "待确认" ? "meeting-card pending" : "meeting-card"} key={meeting.buyer}>
                  <div className="meeting-top">
                    <div>
                      <span className="meeting-status">{meeting.status}</span>
                      <h3>{meeting.buyer}</h3>
                      <p className="meeting-en">{meeting.buyerEn || meeting.buyer}</p>
                    </div>
                    <div className="meeting-time">{meeting.time}</div>
                  </div>
                  <div className="meeting-meta">
                    <span>日期时间 Date & Time</span>
                    <strong>{meeting.time}</strong>
                    <small>{meeting.timeEn || meeting.time}</small>
                  </div>
                  <div className="meeting-meta">
                    <span>国家 / 路线 Country / Route</span>
                    <strong>{meeting.country}</strong>
                    <small>{meeting.countryEn || meeting.country}</small>
                  </div>
                  <div className="meeting-focus">
                    <strong>需求 Demand</strong>
                    <p>{meeting.focus}</p>
                    <p className="meeting-en">{meeting.focusEn || meeting.focus}</p>
                  </div>
                  <ul className="meeting-notes">
                    {meeting.notes.map((note) => <li key={note}>{note}</li>)}
                  </ul>
                  {Array.isArray(meeting.notesEn) && meeting.notesEn.length > 0 && (
                    <ul className="meeting-notes english">
                      {meeting.notesEn.map((note) => <li key={note}>{note}</li>)}
                    </ul>
                  )}
                  <div className="meeting-actions">
                    <button className="secondary small" onClick={() => openMeetingEditor(meeting)}>编辑</button>
                    <button className="secondary small" onClick={() => deleteMeeting(meeting.id)}>删除</button>
                  </div>
                </article>
              ))}
            </div>
          </Card>
        )}

        {activeTab === "记得携带" && (
          <Card title="记得携带" action={<button className="primary small" onClick={addCarryItem}>新增物品</button>}>
            <div className="carry-board">
              {checklist.map((item) => (
                <button className="carry-chip" key={item.id} type="button" onDoubleClick={() => deleteChecklist(item.id)} title="双击删除">
                  <span>{item.name}</span>
                  <small>{item.note || "双击删除"}</small>
                </button>
              ))}
            </div>
            <p className="muted carry-note">提示：点击只是查看，双击物品按钮可删除。新增和删除会同步保存。</p>
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
          <Card title="客户列表" action={<div className="card-actions"><button className="primary small" onClick={() => setShowQuickCard(true)}>新增客户</button></div>}>
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
            <div className="dialogue-grid">
              {englishDialogues.map((dialogue) => (
                <div className="dialogue-card" key={dialogue.title}>
                  <div className="dialogue-title">
                    <div>
                      <h3>{dialogue.title}</h3>
                      <p>{dialogue.goal}</p>
                    </div>
                    <button className="speak-button" type="button" onClick={() => speakEnglish(dialogue.turns.map((turn) => `${turn[0]}: ${turn[1]}`).join(" "))}>播放整段</button>
                  </div>
                  <div className="dialogue-turns">
                    {dialogue.turns.map(([role, en, zh], index) => (
                      <div className={role === "Sales" ? "dialogue-turn sales" : "dialogue-turn visitor"} key={`${dialogue.title}-${index}`}>
                        <div className="dialogue-role">{role === "Sales" ? "我们 Sales" : "客户 Visitor"}</div>
                        <div className="dialogue-bubble">
                          <div className="phrase-head">
                            <p className="phrase-en">{en}</p>
                            <button className={speakingText === en ? "speak-button mini active" : "speak-button mini"} onClick={() => speakEnglish(en)} type="button">{speakingText === en ? "读" : "听"}</button>
                          </div>
                          <p className="muted">{zh}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="section-divider">常用短句</div>
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

        {showMeetingCard && meetingDraft && (
          <div className="modal-backdrop" onClick={() => setShowMeetingCard(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <h2>接待安排编辑</h2>
                <button className="icon-button" onClick={() => setShowMeetingCard(false)}>×</button>
              </div>
              <div className="modal-grid">
                <label>买家/公司 中文<input value={meetingDraft.buyer} onChange={(e) => setMeetingDraft((p) => ({ ...p, buyer: e.target.value }))} /></label>
                <label>Buyer / Company English<input value={meetingDraft.buyerEn} onChange={(e) => setMeetingDraft((p) => ({ ...p, buyerEn: e.target.value }))} /></label>
                <label>日期时间 中文<input value={meetingDraft.time} onChange={(e) => setMeetingDraft((p) => ({ ...p, time: e.target.value }))} /></label>
                <label>Date & Time English<input value={meetingDraft.timeEn} onChange={(e) => setMeetingDraft((p) => ({ ...p, timeEn: e.target.value }))} /></label>
                <label>国家/路线 中文<input value={meetingDraft.country} onChange={(e) => setMeetingDraft((p) => ({ ...p, country: e.target.value }))} /></label>
                <label>Country / Route English<input value={meetingDraft.countryEn} onChange={(e) => setMeetingDraft((p) => ({ ...p, countryEn: e.target.value }))} /></label>
                <label>状态<select value={meetingDraft.status} onChange={(e) => setMeetingDraft((p) => ({ ...p, status: e.target.value }))}><option value="已预约">已预约</option><option value="待确认">待确认</option><option value="需改时间">需改时间</option><option value="已完成">已完成</option></select></label>
              </div>
              <div className="modal-grid">
                <label>需求 中文<textarea value={meetingDraft.focus} onChange={(e) => setMeetingDraft((p) => ({ ...p, focus: e.target.value }))} /></label>
                <label>Demand English<textarea value={meetingDraft.focusEn} onChange={(e) => setMeetingDraft((p) => ({ ...p, focusEn: e.target.value }))} /></label>
                <label>备注 中文（一行一条）<textarea value={meetingDraft.notesText} onChange={(e) => setMeetingDraft((p) => ({ ...p, notesText: e.target.value }))} /></label>
                <label>Notes English（一行一条）<textarea value={meetingDraft.notesEnText} onChange={(e) => setMeetingDraft((p) => ({ ...p, notesEnText: e.target.value }))} /></label>
              </div>
              <div className="modal-actions">
                <button className="secondary" onClick={() => setShowMeetingCard(false)}>取消</button>
                <button className="primary" onClick={saveMeeting}>保存</button>
              </div>
            </div>
          </div>
        )}

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
