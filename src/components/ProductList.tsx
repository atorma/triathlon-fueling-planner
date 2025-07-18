import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { Product } from '../types/nutrition';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ProductList: React.FC = () => {
  const { state, dispatch } = useNutrition();
  const [sortKey, setSortKey] = useState<'name' | 'carbs' | 'salt' | 'unit'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: 'name' | 'carbs' | 'salt' | 'unit') => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleChange = (product: Product, field: keyof Product, value: string | number): void => {
    let updated = { ...product, [field]: value };
    if (field === 'carbs' || field === 'salt') {
      updated[field] = parseFloat(value as string) || 0;
    }
    dispatch({ type: 'UPDATE_PRODUCT', product: updated });
  };

  const handleRemove = (productId: number) => {
    dispatch({ type: 'REMOVE_PRODUCT_FROM_LIBRARY', productId });
  };

  // Sort products
  const sortedProducts = [...state.products].sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'name' || sortKey === 'unit') {
      cmp = a[sortKey].localeCompare(b[sortKey]);
    } else {
      cmp = a[sortKey] - b[sortKey];
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  if (!sortedProducts.length) {
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
        {/* Desktop Table */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium cursor-pointer select-none" onClick={() => handleSort('name')}>
                  Name {sortKey === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th
                  className="text-left p-2 font-medium cursor-pointer select-none"
                  onClick={() => handleSort('carbs')}
                >
                  Carbs (g/unit) {sortKey === 'carbs' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="text-left p-2 font-medium cursor-pointer select-none" onClick={() => handleSort('salt')}>
                  Salt (g/unit) {sortKey === 'salt' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="text-left p-2 font-medium cursor-pointer select-none" onClick={() => handleSort('unit')}>
                  Unit {sortKey === 'unit' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                </th>
                <th className="text-left p-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.map((product, index) => (
                <tr key={product.id} className={index % 2 === 0 ? 'bg-muted/50' : ''}>
                  <td className="p-2">
                    <Input
                      name="name"
                      value={product.name}
                      onChange={e => handleChange(product, 'name', e.target.value)}
                      className="w-full min-w-48"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      name="carbs"
                      type="number"
                      value={product.carbs}
                      onChange={e => handleChange(product, 'carbs', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      name="salt"
                      type="number"
                      value={product.salt}
                      onChange={e => handleChange(product, 'salt', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <Select
                      value={product.unit}
                      onValueChange={value => handleChange(product, 'unit', value as 'liters' | 'items' | 'grams')}
                    >
                      <SelectTrigger>
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
                      onClick={() => handleRemove(product.id)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile Stacked Cards */}
        <div className="block md:hidden space-y-2">
          {sortedProducts.map(product => {
            const nameId = `name-${product.id}`;
            const carbsId = `carbs-${product.id}`;
            const saltId = `salt-${product.id}`;
            const unitId = `unit-${product.id}`;
            return (
              <div key={product.id} className="border rounded p-2 bg-muted/50 grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={nameId}>Name</Label>
                  <Input
                    id={nameId}
                    name="name"
                    value={product.name}
                    onChange={e => handleChange(product, 'name', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={carbsId}>Carbs (g/unit)</Label>
                  <Input
                    id={carbsId}
                    name="carbs"
                    type="number"
                    value={product.carbs}
                    onChange={e => handleChange(product, 'carbs', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={saltId}>Salt (g/unit)</Label>
                  <Input
                    id={saltId}
                    name="salt"
                    type="number"
                    value={product.salt}
                    onChange={e => handleChange(product, 'salt', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={unitId}>Unit</Label>
                  <Select
                    value={product.unit}
                    onValueChange={value => handleChange(product, 'unit', value as 'liters' | 'items' | 'grams')}
                  >
                    <SelectTrigger id={unitId}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="liters">Liters</SelectItem>
                      <SelectItem value="items">Items</SelectItem>
                      <SelectItem value="grams">Grams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  title="Remove product"
                  onClick={() => handleRemove(product.id)}
                  className="mt-2"
                  id={`remove-${product.id}`}
                >
                  Remove
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductList;
