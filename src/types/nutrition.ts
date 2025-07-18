export interface Product {
  id: number;
  name: string;
  carbs: number;
  salt: number;
  unit: 'liters' | 'items' | 'grams';
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
  | { type: 'SET_PRODUCTS'; products: Product[] }
  | { type: 'ADD_PRODUCT'; product: Product }
  | { type: 'UPDATE_PRODUCT'; product: Product }
  | { type: 'SET_STAGES'; stages: Stage[] }
  | { type: 'UPDATE_STAGE'; stage: Stage }
  | {
      type: 'ASSIGN_PRODUCT';
      stageId: string | number;
      productId: number;
      quantity: number;
    }
  | {
      type: 'UPDATE_PRODUCT_QUANTITY';
      stageId: string | number;
      productId: number;
      quantity: number;
    }
  | {
      type: 'REMOVE_PRODUCT';
      stageId: string | number;
      productId: number;
    }
  | {
      type: 'REMOVE_PRODUCT_FROM_LIBRARY';
      productId: number;
    };

export interface NutritionContextType {
  state: NutritionState;
  dispatch: React.Dispatch<NutritionAction>;
}
