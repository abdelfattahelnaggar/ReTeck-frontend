// Sample product data for the market
const productData = [
  {
    id: "1",
    name: "Eco-friendly Bluetooth Speaker",
    category: "electronics",
    description:
      "Sustainable Bluetooth speaker with superior sound quality. Made from recycled materials with 10-hour battery life.",
    price: "E£200",
    image: "images/market/speaker.jpg",
    isNew: true,
  },
  {
    id: "2",
    name: "Recycled Plastic Water Bottle",
    category: "household",
    description:
      "BPA-free water bottle made from 100% recycled plastic. Holds 750ml of liquid and has a leak-proof design.",
    price: "E£50",
    image: "images/market/water-bottle.jpg",
    isNew: false,
  },
  {
    id: "3",
    name: "Organic Cotton T-shirt",
    category: "clothing",
    description:
      "Comfortable t-shirt made from 100% organic cotton. Eco-friendly dyes and sustainable production methods.",
    price: "E£100",
    image: "images/market/tshirt.jpg",
    isNew: false,
  },
  {
    id: "4",
    name: "Bamboo Toothbrush Set",
    category: "personal",
    description:
      "Set of 4 bamboo toothbrushes with charcoal-infused bristles. Biodegradable and eco-friendly alternative to plastic toothbrushes.",
    price: "E£75",
    image: "images/market/toothbrush.jpg",
    isNew: false,
  },
  {
    id: "5",
    name: "Solar-Powered Charger",
    category: "electronics",
    description:
      "Portable solar charger for smartphones and small devices. Includes 2 USB ports and a built-in LED light.",
    price: "E£150",
    image: "images/market/solar-charger.jpg",
    isNew: true,
  },
  {
    id: "6",
    name: "Recycled Paper Notebook",
    category: "stationery",
    description:
      "A5 notebook with 100 pages made from 100% recycled paper. Includes a bamboo pen and elastic closure.",
    price: "E£40",
    image: "images/market/notebook.jpg",
    isNew: false,
  },
  {
    id: "7",
    name: "Reusable Grocery Bags (Set of 3)",
    category: "household",
    description:
      "Set of 3 reusable grocery bags made from recycled materials. Foldable, washable, and extra strong.",
    price: "E£60",
    image: "images/market/grocery-bags.jpg",
    isNew: false,
  },
  {
    id: "8",
    name: "Biodegradable Phone Case",
    category: "electronics",
    description:
      "Fully biodegradable phone case made from plant-based materials. Available for various smartphone models.",
    price: "E£80",
    image: "images/market/phone-case.jpg",
    isNew: true,
  },
  {
    id: "9",
    name: "Steel Straw Set with Cleaning Brush",
    category: "household",
    description:
      "Set of 4 stainless steel straws with cleaning brush. Reusable alternative to plastic straws.",
    price: "E£30",
    image: "images/market/straws.jpg",
    isNew: false,
  },
  {
    id: "10",
    name: "Eco-friendly Yoga Mat",
    category: "sports",
    description:
      "Yoga mat made from natural rubber and recycled materials. Non-slip surface and biodegradable.",
    price: "E£120",
    image: "images/market/yoga-mat.jpg",
    isNew: false,
  },
  {
    id: "11",
    name: "Wireless Earbuds",
    category: "electronics",
    description:
      "Energy-efficient wireless earbuds with noise cancellation. Made with recyclable components.",
    price: "E£180",
    image: "images/market/earbuds.jpg",
    isNew: true,
  },
  {
    id: "12",
    name: "Recycled Glass Tumblers (Set of 4)",
    category: "household",
    description:
      "Set of 4 tumblers made from recycled glass. Each glass holds 350ml and is dishwasher safe.",
    price: "E£90",
    image: "images/market/glasses.jpg",
    isNew: false,
  },
];

// Demo voucher rewards (for testing)
function createDemoRewards() {
  return [
    {
      id: "reward_1",
      type: "voucher",
      value: "100",
      description: "E£100 HyperOne Voucher",
      issueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      used: false,
    },
    {
      id: "reward_2",
      type: "voucher",
      value: "150",
      description: "E£150 HyperOne Voucher",
      issueDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      used: false,
    },
    {
      id: "reward_3",
      type: "voucher",
      value: "200",
      description: "E£200 HyperOne Voucher (Anniversary Special)",
      issueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      used: false,
    },
  ];
}
