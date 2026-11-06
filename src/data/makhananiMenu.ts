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
};

export const ALL_MENU_ITEMS: MakhananiMenuItem[] = Object.values(MAKHANANI_MENU).flat();
