import React, { useState } from 'react';
import { useNutrition } from '../context/NutritionContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductFormData {
  name: string;
  carbs: string;
  salt: string;
  unit: 'liter' | 'item';
}

const defaultProduct: ProductFormData = {
  name: '',
  carbs: '',
  salt: '',
  unit: 'liter',
};

const ProductForm: React.FC = () => {
  const { dispatch } = useNutrition();
  const [product, setProduct] = useState<ProductFormData>(defaultProduct);

  const handleChange = (name: string, value: string): void => {
    setProduct(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!product.name) return;
    dispatch({
      type: 'ADD_PRODUCT',
      product: {
        ...product,
        id: Date.now(),
        carbs: parseFloat(product.carbs) || 0,
        salt: parseFloat(product.salt) || 0,
      },
    });
    setProduct(defaultProduct);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Add New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Energy Gel"
                value={product.name}
                onChange={e => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g/unit)</Label>
              <Input
                id="carbs"
                name="carbs"
                type="number"
                placeholder="0"
                value={product.carbs}
                onChange={e => handleChange('carbs', e.target.value)}
                min="0"
                step="any"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salt">Salt (g/unit)</Label>
              <Input
                id="salt"
                name="salt"
                type="number"
                placeholder="0"
                value={product.salt}
                onChange={e => handleChange('salt', e.target.value)}
                min="0"
                step="any"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select name="unit" value={product.unit} onValueChange={value => handleChange('unit', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="liter">Liter</SelectItem>
                  <SelectItem value="item">Item</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full md:w-auto">
            Add Product
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
