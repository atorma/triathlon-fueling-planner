import React from 'react';
import { useNutrition } from '../context/NutritionContext';
import { Product } from '../types/nutrition';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
                <th className="text-left p-2 font-medium"></th>
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
                      className="w-28"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      name="salt"
                      type="number"
                      value={product.salt}
                      onChange={e => handleChange(product, 'salt', e.target.value)}
                      className="w-28"
                    />
                  </td>
                  <td className="p-2">
                    <Select
                      value={product.unit}
                      onValueChange={value => handleChange(product, 'unit', value as 'liters' | 'items' | 'grams')}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="items">Items</SelectItem>
                        <SelectItem value="grams">Grams</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      title="Remove product"
                      onClick={() => dispatch({ type: 'REMOVE_PRODUCT_FROM_LIBRARY', productId: product.id })}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductList;
