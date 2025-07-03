import React, { createContext, useContext, useReducer } from 'react';

const NutritionContext = createContext();

const initialState = {
  products: [], // { id, name, carbs, sodium, fluid }
  stages: [
    { id: 1, name: 'Swim', duration: 30 },
    { id: 2, name: 'T1', duration: 4 },
    { id: 3, name: 'Bike', duration: 60 },
    { id: 4, name: 'T2', duration: 2 },
    { id: 5, name: 'Run', duration: 42  },
  ],
  assignments: {}, // { [stageId]: [{ productId, quantity }] }
  targets: { carbs: 0, sodium: 0, fluid: 0 },
};

function nutritionReducer(state, action) {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.products };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.product] };
    case 'SET_STAGES':
      return { ...state, stages: action.stages };
    case 'UPDATE_STAGE':
      return {
        ...state,
        stages: state.stages.map(s => s.id === action.stage.id ? action.stage : s),
      };
    case 'ASSIGN_PRODUCT': {
      const { stageId, productId, quantity } = action;
      const prev = state.assignments[stageId] || [];
      const updated = prev.filter(a => a.productId !== productId).concat({ productId, quantity });
      return {
        ...state,
        assignments: { ...state.assignments, [stageId]: updated },
      };
    }
    case 'SET_TARGETS':
      return { ...state, targets: action.targets };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.product.id ? { ...p, ...action.product } : p
        ),
      };
    default:
      return state;
  }
}

export function NutritionProvider({ children }) {
  const [state, dispatch] = useReducer(nutritionReducer, initialState);
  return (
    <NutritionContext.Provider value={{ state, dispatch }}>
      {children}
    </NutritionContext.Provider>
  );
}

export function useNutrition() {
  return useContext(NutritionContext);
} 