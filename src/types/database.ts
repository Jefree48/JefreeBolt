export interface UserPreferences {
  id: string;
  user_id: string;
  family_size: number;
  ages: string | null;
  dietary_restrictions: string | null;
  food_preferences: string | null;
  menu_days: number;
  created_at: string;
  updated_at: string;
}

export interface ShoppingList {
  id: string;
  user_id: string;
  name: string;
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    category: string;
    checked: boolean;
  }>;
  created_at: string;
  updated_at: string;
}

export interface MenuPlan {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  meals: {
    [date: string]: {
      breakfast?: string;
      lunch?: string;
      dinner?: string;
      snacks?: string[];
    };
  };
  created_at: string;
  updated_at: string;
}