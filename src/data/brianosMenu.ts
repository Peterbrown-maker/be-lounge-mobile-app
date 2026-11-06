// Briano's menu — the single local source of menu data (no backend).
export interface BrianosMenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: any; // require()'d local asset
  rating: number;
  description: string;
}

// Mock menu items for each category
export const BRIANOS_MENU: { [categoryId: string]: BrianosMenuItem[] } = {
  "grills": [
    {
      id: "grill-1",
      name: "Flame-Grilled Chicken Breast",
      category: "Grilled Chicken",
      price: 95,
      image: require("../assets/brianos/grilled_chicken.jpg"),
      rating: 4.8,
      description: "Basted chicken breast with golden chips and a fresh garden salad",
    },
    {
      id: "grill-2",
      name: "Half Chicken & Chips",
      category: "Grilled Chicken",
      price: 120,
      image: require("../assets/brianos/grilled_chicken.jpg"),
      rating: 4.7,
      description: "Half chicken grilled in our signature basting, served with chips",
    },
  ],
  "wings": [
    {
      id: "wings-1",
      name: "Wings & Sausage Combo",
      category: "Wings & Sausage",
      price: 110,
      image: require("../assets/brianos/wings_and_sausage.jpg"),
      rating: 4.8,
      description: "Sticky grilled wings with boerewors sausage and chips",
    },
  ],
  "steak": [
    {
      id: "steak-1",
      name: "Steak & Lamb Chops",
      category: "Steak & Chops",
      price: 210,
      image: require("../assets/brianos/steak_and_lamb_chops.jpg"),
      rating: 4.9,
      description: "Juicy rump steak and lamb chops, grilled to order",
    },
  ],
  "ribs": [
    {
      id: "ribs-1",
      name: "Glazed Pork Ribs",
      category: "Glazed Ribs",
      price: 185,
      image: require("../assets/brianos/glazed_ribs.jpg"),
      rating: 4.9,
      description: "Slow-cooked ribs finished with a sweet smoky glaze",
    },
  ],
  "platters": [
    {
      id: "platter-1",
      name: "Mixed Grill Platter",
      category: "Platters",
      price: 320,
      image: require("../assets/brianos/mixed_grill_platter.jpg"),
      rating: 4.9,
      description: "Chicken, ribs, wors and chops with sides — made for sharing",
    },
  ],
  "burgers": [
    {
      id: "burger-1",
      name: "Cheeseburger & Chips",
      category: "Burgers",
      price: 89,
      image: require("../assets/brianos/cheeseburger_and_chips.jpg"),
      rating: 4.7,
      description: "Beef patty, melted cheese and fresh toppings with chips",
    },
  ],
  "seafood": [
    {
      id: "seafood-1",
      name: "Seafood Platter",
      category: "Seafood",
      price: 280,
      image: require("../assets/brianos/seafood_platter.jpg"),
      rating: 4.8,
      description: "Grilled prawns, calamari and fish with lemon butter",
    },
  ],
  "cocktails": [
    {
      id: "cocktail-1",
      name: "Tropical Cocktails",
      category: "Cocktails",
      price: 65,
      image: require("../assets/brianos/cocktails.jpg"),
      rating: 4.8,
      description: "Fresh fruity cocktails, shaken to order",
    },
  ],
};

export const ALL_MENU_ITEMS: BrianosMenuItem[] = Object.values(BRIANOS_MENU).flat();
