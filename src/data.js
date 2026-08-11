export const seedData = {
  exhibition: {
    name: "2026香港亚洲果蔬展",
    dateRange: "2026/09/02 - 2026/09/04",
    venue: "香港亚洲国际博览馆 AsiaWorld-Expo",
    booth: "5馆 5B32",
    note: "内部使用：展前准备、展中接待、展后跟进统一管理"
  },
  hotel: {
    name: "丽豪航天城酒店",
    checkIn: "2026/09/01 14:00",
    checkOut: "2026/09/04 12:00",
    address: "香港国际机场附近",
    transport: "出租车 / 接驳车",
    breakfast: "含早",
    roomCount: 2,
    nights: 3,
    guests: ["展会团队A", "展会团队B", "展会团队C"]
  },
  travel: [
    {
      id: 1,
      person: "张三",
      ticketStatus: "31号买票",
      departureTime: "2026/08/31",
      arrivalTime: "2026/08/31",
      origin: "福州",
      destination: "丽豪航天城酒店",
      trainNo: "福州→深圳北，深圳北→香港西九龙",
      routeNote: "香港西九龙站步行连接通道 → 九龙站 → 机场快线 → EXIT B 出站，步行到丽豪航天城酒店",
      charterInfo: "深圳到香港包车，直接到酒店",
      charterNote: "适合多人同行，行李多，减少换乘"
    }
  ],
  checklist: [
    { id: 1, name: "身份证", note: "随身携带" },
    { id: 2, name: "港澳通行证", note: "检查有效期" },
    { id: 3, name: "展会工牌", note: "到场佩戴" },
    { id: 4, name: "充电宝", note: "保持满电" },
    { id: 5, name: "转换插头", note: "香港插头标准" },
    { id: 6, name: "平板", note: "现场展示资料" },
    { id: 7, name: "名片", note: "多带几盒" },
    { id: 8, name: "产品资料", note: "报价单 / 目录 / 宣传页" }
  ],
  restaurants: {
    staff: [
      { id: 1, restaurant: "丽豪航天城酒店餐厅", location: "酒店内", transport: "步行", note: "最方便，适合赶时间" }
    ],
    client: [
      { id: 1, restaurant: "酒店附近粤菜餐厅", reservation: "建议预约", contact: "电话待补充", distance: "车程10-15分钟", transport: "出租车", note: "适合正式接待" }
    ]
  },
  samples: [
    { id: 1, productName: "蓝莓样品", quantity: "2箱", factory: "福州一厂", specification: "125g x 12盒", note: "给重点客户展示", status: "待发出" }
  ],
  clients: [
    {
      id: 1,
      name: "Dubai Fresh Trading",
      country: "迪拜",
      market: "中东市场",
      type: "老客户",
      contactName: "Ahmed",
      whatsapp: "+971 50 000 0000",
      email: "ahmed@example.com",
      productsText: "蓝莓、车厘子",
      value: "重点客户",
      nextActions: ["发送报价", "发送产品资料"],
      quickNotes: "UAE importer, interested in blueberries, needs CIF price."
    }
  ],
  reception: [],
  agendas: [],
  aiOutput: ""
};

export const defaultDrafts = structuredClone(seedData);
