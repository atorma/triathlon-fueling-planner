import React, { createContext, useContext, useReducer } from 'react';
import { NutritionState, NutritionAction, NutritionContextType } from '../types/nutrition';

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

const initialState: NutritionState = {
  products: [
    { id: 1, name: 'Maxim energy drink', carbs: 72, salt: 1.04, unit: 'liters' },
    { id: 2, name: 'Dexal light', carbs: 37, salt: 0.11, unit: 'liters' },
    {
      id: 3,
      name: 'Nosht high energy drink',
      carbs: 100,
      salt: 3.0,
      unit: 'liters',
    },
    {
      id: 4,
      name: 'Maurten 320 drink mix',
      carbs: 156,
      salt: 1.24,
      unit: 'liters',
    },
    { id: 5, name: 'Water', carbs: 0, salt: 0.0025, unit: 'liters' },
    { id: 6, name: 'Dexal energy gel', carbs: 17, salt: 0.4, unit: 'items' },
    {
      id: 7,
      name: 'HartSport energy candy',
      carbs: 4.35,
      salt: 0.045,
      unit: 'items',
    },
    {
      id: 8,
      name: 'Jollos energy candy',
      carbs: 10,
      salt: 0.039,
      unit: 'items',
    },
  ],
  stages: [
    { id: 1, name: 'Swim', duration: 30 },
    { id: 2, name: 'T1', duration: 4 },
    { id: 3, name: 'Bike', duration: 70 },
    { id: 4, name: 'T2', duration: 2 },
    { id: 5, name: 'Run', duration: 42 },
  ],
  assignments: {},
};

function nutritionReducer(state: NutritionState, action: NutritionAction): NutritionState {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.products };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.product] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => (p.id === action.product.id ? { ...p, ...action.product } : p)),
      };
    case 'SET_STAGES':
      return { ...state, stages: action.stages };
    case 'UPDATE_STAGE':
      return {
        ...state,
        stages: state.stages.map(s => (s.id === action.stage.id ? action.stage : s)),
      };
    case 'ASSIGN_PRODUCT': {
      const { stageId, productId, quantity } = action;
      const stageKey = stageId.toString();
      const prev = state.assignments[stageKey] || [];

      // Add new product to the end
      const updated = [...prev, { productId, quantity }];
      return {
        ...state,
        assignments: { ...state.assignments, [stageKey]: updated },
      };
    }
    case 'UPDATE_PRODUCT_QUANTITY': {
      const { stageId, productId, quantity } = action;
      const stageKey = stageId.toString();
      const prev = state.assignments[stageKey] || [];

      // Update existing product in place (preserve order)
      const existingIndex = prev.findIndex(a => a.productId === productId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { productId, quantity };
        return {
          ...state,
          assignments: { ...state.assignments, [stageKey]: updated },
        };
      }
      return state; // Product not found, no change
    }
    case 'REMOVE_PRODUCT': {
      const { stageId, productId } = action;
      const stageKey = stageId.toString();
      const prev = state.assignments[stageKey] || [];

      // Remove the product assignment
      const updated = prev.filter(a => a.productId !== productId);
      return {
        ...state,
        assignments: { ...state.assignments, [stageKey]: updated },
      };
    }
    case 'REMOVE_PRODUCT_FROM_LIBRARY': {
      const { productId } = action;
      // Remove product from products
      const products = state.products.filter(p => p.id !== productId);
      // Remove product from all assignments
      const assignments: typeof state.assignments = {};
      for (const [stageKey, assigns] of Object.entries(state.assignments)) {
        assignments[stageKey] = assigns.filter(a => a.productId !== productId);
      }
      return { ...state, products, assignments };
    }
    default:
      return state;
  }
}

export function NutritionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(nutritionReducer, initialState);
  return <NutritionContext.Provider value={{ state, dispatch }}>{children}</NutritionContext.Provider>;
}

export function useNutrition(): NutritionContextType {
  const context = useContext(NutritionContext);
  if (context === undefined) {
    throw new Error('useNutrition must be used within a NutritionProvider');
  }
  return context;
}
