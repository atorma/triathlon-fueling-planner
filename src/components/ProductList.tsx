import React from 'react';
import { useNutrition } from '../context/NutritionContext';
import { Product } from '../types/nutrition';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ProductList: React.FC = () => {
  const { state, dispatch } = useNutrition();

  const handleChange = (product: Product, field: keyof Product, value: string | number): void => {
    let updated = { ...product, [field]: value };
    if (field === 'carbs' || field === 'salt') {
      updated[field] = parseFloat(value as string) || 0;
    }
    dispatch({ type: 'UPDATE_PRODUCT', product: updated });
  };

  if (!state.products.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">No products added yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Product Library</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Name</th>
                <th className="text-left p-2 font-medium">Carbs (g/unit)</th>
                <th className="text-left p-2 font-medium">Salt (g/unit)</th>
                <th className="text-left p-2 font-medium">Unit</th>
              </tr>
            </thead>
            <tbody>
              {state.products.map((product, index) => (
                <tr key={product.id} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                  <td className="p-2">
                    <Input
                      name="name"
                      value={product.name}
                      onChange={e => handleChange(product, 'name', e.target.value)}
                      className="w-full"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      name="carbs"
                      type="number"
                      value={product.carbs}
                      onChange={e => handleChange(product, 'carbs', e.target.value)}
                      className="w-20"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      name="salt"
                      type="number"
                      value={product.salt}
                      onChange={e => handleChange(product, 'salt', e.target.value)}
                      className="w-20"
                    />
                  </td>
                  <td className="p-2">
                    <Select
                      value={product.unit}
                      onValueChange={value => handleChange(product, 'unit', value as 'liter' | 'item')}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="liter">Liter</SelectItem>
                        <SelectItem value="item">Item</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="secondary">Total Products: {state.products.length}</Badge>
          <Badge variant="outline">Fluids: {state.products.filter(p => p.unit === 'liter').length}</Badge>
          <Badge variant="outline">Solids: {state.products.filter(p => p.unit === 'item').length}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductList;
