// Makhanani's menu: the single local source of menu data (no backend).
// TODO: every price below is a placeholder. Replace with Makhanani's real prices.
export interface MakhananiMenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: any; // require()'d local asset
  description: string;
}

export const MAKHANANI_MENU: { [categoryId: string]: MakhananiMenuItem[] } = {
  heads: [
    {
      id: "head-cow",
      name: "Cow Head",
      category: "Head Meats",
      price: 150,
      image: require("../assets/makhanani/head_plate.jpg"),
      description: "Cow head meat, seasoned and cooked to perfection",
    },
    {
      id: "head-pig",
      name: "Pig Head",
      category: "Head Meats",
      price: 130,
      image: require("../assets/makhanani/head_closeup.jpg"),
      description: "Pig head meat, seasoned and cooked to perfection",
    },
    {
      id: "head-sheep",
      name: "Sheep Head",
      category: "Head Meats",
      price: 120,
      image: require("../assets/makhanani/head_red_table.jpg"),
      description: "Sheep head meat, seasoned and cooked to perfection",
    },
  ],
  feet: [
    {
      id: "feet-gravy",
      name: "Feet in Gravy",
      category: "Feet",
      price: 80,
      image: require("../assets/makhanani/feet_gravy.jpg"),
      description: "Tender feet served in rich gravy",
    },
    {
      id: "feet-pap",
      name: "Feet, Gravy & Pap",
      category: "Feet",
      price: 100,
      image: require("../assets/makhanani/feet_and_pap.jpg"),
      description: "Feet in rich gravy with soft white pap",
    },
  ],
  sides: [
    {
      id: "side-pap",
      name: "Pap",
      category: "Pap & Gravy",
      price: 20,
      image: require("../assets/makhanani/pap.jpg"),
      description: "Soft white pap, made fresh",
    },
    {
      id: "side-gravy",
      name: "Gravy",
      category: "Pap & Gravy",
      price: 25,
      image: require("../assets/makhanani/gravy.jpg"),
      description: "A bowl of rich gravy for your pap and meat",
    },
  ],
  combos: [
    {
      id: "combo-head-pap",
      name: "Head & Pap",
      category: "Combos",
      price: 160,
      image: require("../assets/makhanani/head_and_pap.jpg"),
      description: "Head meat with soft white pap",
    },
    {
      id: "combo-full-plate",
      name: "Head, Feet & Pap",
      category: "Combos",
      price: 210,
      image: require("../assets/makhanani/full_plate.jpg"),
      description: "Head meat and feet on one plate, with soft white pap",
    },
  ],
  grills: [
    {
      id: "grill-1",
      name: "Flame-Grilled Chicken Breast",
      category: "Grilled Chicken",
      price: 95,
      image: require("../assets/makhanani/grilled_chicken.jpg"),
      description: "Basted chicken breast with golden chips and a fresh garden salad",
    },
    {
      id: "grill-2",
      name: "Half Chicken & Chips",
      category: "Grilled Chicken",
      price: 120,
      image: require("../assets/makhanani/grilled_chicken.jpg"),
      description: "Half chicken grilled in our signature basting, served with chips",
    },
  ],
  platters: [
    {
      id: "platter-1",
      name: "Mixed Grill Platter",
      category: "Platters",
      price: 320,
      image: require("../assets/makhanani/mixed_grill_platter.jpg"),
      description: "Chicken, ribs, wors and chops with sides, made for sharing",
    },
  ],
  steak: [
    {
      id: "steak-1",
      name: "Steak & Lamb Chops",
      category: "Steak & Chops",
      price: 210,
      image: require("../assets/makhanani/steak_and_lamb_chops.jpg"),
      description: "Juicy rump steak and lamb chops, grilled to order",
    },
  ],
  wings: [
    {
      id: "wings-1",
      name: "Wings & Sausage Combo",
      category: "Wings & Sausage",
      price: 110,
      image: require("../assets/makhanani/wings_and_sausage.jpg"),
      description: "Sticky grilled wings with boerewors sausage and chips",
    },
  ],
  ribs: [
    {
      id: "ribs-1",
      name: "Glazed Pork Ribs",
      category: "Glazed Ribs",
      price: 185,
      image: require("../assets/makhanani/glazed_ribs.jpg"),
      description: "Slow-cooked ribs finished with a sweet smoky glaze",
    },
  ],
  burgers: [
    {
      id: "burger-1",
      name: "Cheeseburger & Chips",
      category: "Burgers",
      price: 89,
      image: require("../assets/makhanani/cheeseburger_and_chips.jpg"),
      description: "Beef patty, melted cheese and fresh toppings with chips",
    },
  ],
  seafood: [
    {
      id: "seafood-1",
      name: "Seafood Platter",
      category: "Seafood",
      price: 280,
      image: require("../assets/makhanani/seafood_platter.jpg"),
      description: "Grilled prawns, calamari and fish with lemon butter",
    },
  ],
  cocktails: [
    {
      id: "cocktail-1",
      name: "Tropical Cocktails",
      category: "Cocktails",
      price: 65,
      image: require("../assets/makhanani/cocktails.jpg"),
      description: "Fresh fruity cocktails, shaken to order",
    },
  ],
};

export const ALL_MENU_ITEMS: MakhananiMenuItem[] = Object.values(MAKHANANI_MENU).flat();
