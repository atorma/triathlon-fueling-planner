export interface Product {
  id: number;
  name: string;
  carbs: number;
  salt: number;
  unit: "liter" | "item";
}

export interface Stage {
  id: number;
  name: string;
  duration: number;
}

export interface Assignment {
  productId: number;
  quantity: number;
}

export interface NutritionState {
  products: Product[];
  stages: Stage[];
  assignments: Record<string, Assignment[]>;
}

export type NutritionAction =
  | { type: "SET_PRODUCTS"; products: Product[] }
  | { type: "ADD_PRODUCT"; product: Product }
  | { type: "UPDATE_PRODUCT"; product: Product }
  | { type: "SET_STAGES"; stages: Stage[] }
  | { type: "UPDATE_STAGE"; stage: Stage }
  | {
      type: "ASSIGN_PRODUCT";
      stageId: string | number;
      productId: number;
      quantity: number;
    };

export interface NutritionContextType {
  state: NutritionState;
  dispatch: React.Dispatch<NutritionAction>;
}
