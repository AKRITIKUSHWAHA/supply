import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { runProductValidation } from '../utils/validationEngine';

const prisma = new PrismaClient();

export const getProducts = async (req: Request, res: Response) => {
  try {
    let rawProducts = await prisma.product.findMany({
      include: {
        category: true,
        brand: true,
        supplier: true,
        prices: true,
        images: true,
        inventory: true
      }
    });

    // Auto-seed sample products if database table is completely empty
    if (rawProducts.length === 0) {
      let supplier = await prisma.supplier.findFirst();
      if (!supplier) {
        supplier = await prisma.supplier.create({
          data: { name: 'TechParts International', company: 'TechParts Corp', email: 'api@techparts.com', status: 'active' }
        });
      }

      let categoryCPU = await prisma.category.findFirst({ where: { slug: 'processors-cpus' } });
      if (!categoryCPU) {
        categoryCPU = await prisma.category.create({ data: { name: 'Processors (CPUs)', slug: 'processors-cpus' } });
      }
      let categoryGPU = await prisma.category.findFirst({ where: { slug: 'graphics-cards-gpus' } });
      if (!categoryGPU) {
        categoryGPU = await prisma.category.create({ data: { name: 'Graphics Cards (GPUs)', slug: 'graphics-cards-gpus' } });
      }

      // 1. AMD Ryzen 9 7950X
      const p1 = await prisma.product.create({
        data: {
          title: 'AMD Ryzen 9 7950X Processor 16-Core',
          sku: 'CPU-AMD-7950X',
          status: 'published',
          supplierId: supplier.id,
          categoryId: categoryCPU.id,
          prices: { create: { price: 549.99, cost: 420.00, currency: 'USD' } },
          inventory: { create: { quantity: 45, status: 'in_stock' } },
          images: { create: { url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500&q=80', isFeatured: true } }
        }
      });
      await runProductValidation(p1.id, prisma);

      // 2. NVIDIA RTX 4090
      const p2 = await prisma.product.create({
        data: {
          title: 'NVIDIA GeForce RTX 4090 24GB OC Edition',
          sku: 'GPU-NV-4090',
          status: 'published',
          supplierId: supplier.id,
          categoryId: categoryGPU.id,
          prices: { create: { price: 1599.99, cost: 1350.00, currency: 'USD' } },
          inventory: { create: { quantity: 18, status: 'in_stock' } },
          images: { create: { url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&q=80', isFeatured: true } }
        }
      });
      await runProductValidation(p2.id, prisma);

      // 3. Samsung 990 Pro SSD (no image intentionally to trigger validation issue!)
      const p3 = await prisma.product.create({
        data: {
          title: 'Samsung 990 Pro 2TB NVMe PCIe 4.0 SSD',
          sku: 'SSD-SAMSUNG-990P-2TB',
          status: 'draft',
          supplierId: supplier.id,
          categoryId: categoryCPU.id,
          prices: { create: { price: 179.99, cost: 130.00, currency: 'USD' } },
          inventory: { create: { quantity: 30, status: 'in_stock' } }
        }
      });
      await runProductValidation(p3.id, prisma);

      // Re-fetch populated products
      rawProducts = await prisma.product.findMany({
        include: {
          category: true,
          brand: true,
          supplier: true,
          prices: true,
          images: true,
          inventory: true
        }
      });
    }

    const data = rawProducts.map(p => ({
      id: p.id,
      sku: p.sku,
      masterSku: p.sku,
      name: p.title || 'Untitled',
      description: p.description || '',
      brand: p.brand?.name || 'Generic',
      categoryName: p.category?.name || 'General',
      supplierId: p.supplierId || 's1',
      supplierName: p.supplier?.name || 'Local Supplier',
      supplierSku: p.sku,
      status: p.status === 'draft' ? 'draft' : 'published',
      validationStatus: 'passed',
      pricing: {
        supplierPrice: p.prices?.[0]?.cost || 0,
        costPrice: p.prices?.[0]?.cost || 0,
        retailPrice: p.prices?.[0]?.price || 0,
        currency: p.prices?.[0]?.currency || 'USD',
        margin: p.prices?.[0]?.price && p.prices?.[0]?.cost ? ((p.prices[0].price - p.prices[0].cost) / p.prices[0].price) * 100 : 0,
        lastUpdated: p.updatedAt
      },
      inventory: {
        totalStock: p.inventory?.[0]?.quantity || 0,
        availableStock: p.inventory?.[0]?.quantity || 0,
        supplierStock: p.inventory?.[0]?.quantity || 0,
        warehouseStock: 0,
        reservedStock: 0,
        lowStockThreshold: 5,
        lastSynced: p.updatedAt,
        status: (p.inventory?.[0]?.quantity || 0) > 0 ? 'in_stock' : 'out_of_stock'
      },
      images: p.images?.map(img => ({
        id: img.id,
        url: img.url,
        isPrimary: img.isFeatured || false,
        syncStatus: 'synced'
      })) || [],
      variants: [],
      attributes: [],
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch Products' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, title, sku, brand, categoryName, supplierName, pricing, inventory, imageUrl } = req.body;
    const productTitle = name || title || 'Untitled Product';
    const productSku = sku || `SKU-${Date.now()}`;

    // Find or create Supplier by name
    let supplierId: string | undefined = undefined;
    if (supplierName) {
      let sup = await prisma.supplier.findFirst({ where: { name: supplierName } });
      if (!sup) {
        sup = await prisma.supplier.create({
          data: {
            name: supplierName,
            status: 'active'
          }
        });
      }
      supplierId = sup.id;
    }

    // Find or create Category by slug
    let categoryId: string | undefined = undefined;
    if (categoryName) {
      const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
      let cat = await prisma.category.findUnique({ where: { slug } });
      if (!cat) {
        cat = await prisma.category.create({
          data: {
            name: categoryName,
            slug
          }
        });
      }
      categoryId = cat.id;
    }

    // Find or create Brand by name
    let brandId: string | undefined = undefined;
    if (brand) {
      let br = await prisma.brand.findUnique({ where: { name: brand } });
      if (!br) {
        br = await prisma.brand.create({
          data: { name: brand }
        });
      }
      brandId = br.id;
    }

    // Create Product with relations
    const newProduct = await prisma.product.create({
      data: {
        title: productTitle,
        sku: productSku,
        status: 'published',
        supplierId,
        categoryId,
        brandId,
        prices: {
          create: {
            price: Number(pricing?.retailPrice || 0),
            cost: Number(pricing?.costPrice || 0),
            currency: pricing?.currency || 'USD'
          }
        },
        inventory: {
          create: {
            quantity: Number(inventory?.totalStock || inventory?.availableStock || 0),
            status: Number(inventory?.totalStock || inventory?.availableStock || 0) > 0 ? 'in_stock' : 'out_of_stock'
          }
        }
      },
      include: {
        supplier: true,
        category: true,
        brand: true,
        prices: true,
        inventory: true,
        images: true
      }
    });

    // Save image if provided
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) {
      await prisma.productImage.create({
        data: {
          productId: newProduct.id,
          url: imageUrl.trim(),
          isFeatured: true,
          order: 0,
        }
      });
    }

    const formatted = {
      id: newProduct.id,
      sku: newProduct.sku,
      masterSku: newProduct.sku,
      name: newProduct.title,
      description: newProduct.description || '',
      brand: newProduct.brand?.name || brand || 'Generic',
      categoryName: newProduct.category?.name || categoryName || 'General',
      supplierId: newProduct.supplierId || 's1',
      supplierName: newProduct.supplier?.name || supplierName || 'Local Supplier',
      supplierSku: newProduct.sku,
      status: newProduct.status === 'draft' ? 'draft' : 'published',
      validationStatus: 'passed',
      pricing: {
        supplierPrice: newProduct.prices?.[0]?.cost || 0,
        costPrice: newProduct.prices?.[0]?.cost || 0,
        retailPrice: newProduct.prices?.[0]?.price || 0,
        currency: newProduct.prices?.[0]?.currency || 'USD',
        margin: newProduct.prices?.[0]?.price && newProduct.prices?.[0]?.cost ? ((newProduct.prices[0].price - newProduct.prices[0].cost) / newProduct.prices[0].price) * 100 : 0,
        lastUpdated: newProduct.updatedAt
      },
      inventory: {
        totalStock: newProduct.inventory?.[0]?.quantity || 0,
        availableStock: newProduct.inventory?.[0]?.quantity || 0,
        supplierStock: newProduct.inventory?.[0]?.quantity || 0,
        warehouseStock: 0,
        reservedStock: 0,
        lowStockThreshold: 5,
        lastSynced: newProduct.updatedAt,
        status: (newProduct.inventory?.[0]?.quantity || 0) > 0 ? 'in_stock' : 'out_of_stock'
      },
      images: newProduct.images?.map(img => ({
        id: img.id,
        url: img.url,
        isPrimary: img.isFeatured || false,
        syncStatus: 'synced'
      })) || (imageUrl ? [{ id: 'new', url: imageUrl, isPrimary: true, syncStatus: 'synced' }] : []),
      variants: [],
      attributes: [],
      createdAt: newProduct.createdAt,
      updatedAt: newProduct.updatedAt
    };

    // ── Run auto-validation engine after product is saved ──
    await runProductValidation(newProduct.id, prisma);

    res.status(201).json(formatted);
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message || 'Failed to create Product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, title, sku, brand, categoryName, supplierName, pricing, inventory } = req.body;

    let supplierId: string | undefined = undefined;
    if (supplierName) {
      let sup = await prisma.supplier.findFirst({ where: { name: supplierName } });
      if (!sup) {
        sup = await prisma.supplier.create({
          data: { name: supplierName, status: 'active' }
        });
      }
      supplierId = sup.id;
    }

    let categoryId: string | undefined = undefined;
    if (categoryName) {
      const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
      let cat = await prisma.category.findUnique({ where: { slug } });
      if (!cat) {
        cat = await prisma.category.create({
          data: { name: categoryName, slug }
        });
      }
      categoryId = cat.id;
    }

    let brandId: string | undefined = undefined;
    if (brand) {
      let br = await prisma.brand.findUnique({ where: { name: brand } });
      if (!br) {
        br = await prisma.brand.create({
          data: { name: brand }
        });
      }
      brandId = br.id;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title: name || title,
        sku,
        supplierId,
        categoryId,
        brandId,
      },
      include: {
        supplier: true,
        category: true,
        brand: true,
        prices: true,
        inventory: true
      }
    });

    if (pricing) {
      const existingPrice = await prisma.productPrice.findFirst({ where: { productId: id } });
      if (existingPrice) {
        await prisma.productPrice.update({
          where: { id: existingPrice.id },
          data: {
            price: Number(pricing.retailPrice || existingPrice.price),
            cost: Number(pricing.costPrice || existingPrice.cost)
          }
        });
      } else {
        await prisma.productPrice.create({
          data: {
            productId: id,
            price: Number(pricing.retailPrice || 0),
            cost: Number(pricing.costPrice || 0),
            currency: 'USD'
          }
        });
      }
    }

    if (inventory) {
      const existingInv = await prisma.inventory.findFirst({ where: { productId: id } });
      if (existingInv) {
        await prisma.inventory.update({
          where: { id: existingInv.id },
          data: {
            quantity: Number(inventory.availableStock || inventory.totalStock || existingInv.quantity),
            status: Number(inventory.availableStock || inventory.totalStock || existingInv.quantity) > 0 ? 'in_stock' : 'out_of_stock'
          }
        });
      } else {
        await prisma.inventory.create({
          data: {
            productId: id,
            quantity: Number(inventory.availableStock || inventory.totalStock || 0),
            status: Number(inventory.availableStock || inventory.totalStock || 0) > 0 ? 'in_stock' : 'out_of_stock'
          }
        });
      }
    }

    const formatted = {
      id: updatedProduct.id,
      sku: updatedProduct.sku,
      masterSku: updatedProduct.sku,
      name: updatedProduct.title,
      description: updatedProduct.description || '',
      brand: updatedProduct.brand?.name || brand || 'Generic',
      categoryName: updatedProduct.category?.name || categoryName || 'General',
      supplierId: updatedProduct.supplierId || 's1',
      supplierName: updatedProduct.supplier?.name || supplierName || 'Local Supplier',
      supplierSku: updatedProduct.sku,
      status: updatedProduct.status === 'draft' ? 'draft' : 'published',
      validationStatus: 'passed',
      pricing: {
        supplierPrice: updatedProduct.prices?.[0]?.cost || 0,
        costPrice: updatedProduct.prices?.[0]?.cost || 0,
        retailPrice: updatedProduct.prices?.[0]?.price || 0,
        currency: updatedProduct.prices?.[0]?.currency || 'USD',
        margin: updatedProduct.prices?.[0]?.price && updatedProduct.prices?.[0]?.cost ? ((updatedProduct.prices[0].price - updatedProduct.prices[0].cost) / updatedProduct.prices[0].price) * 100 : 0,
        lastUpdated: updatedProduct.updatedAt
      },
      inventory: {
        totalStock: updatedProduct.inventory?.[0]?.quantity || 0,
        availableStock: updatedProduct.inventory?.[0]?.quantity || 0,
        supplierStock: updatedProduct.inventory?.[0]?.quantity || 0,
        warehouseStock: 0,
        reservedStock: 0,
        lowStockThreshold: 5,
        lastSynced: updatedProduct.updatedAt,
        status: (updatedProduct.inventory?.[0]?.quantity || 0) > 0 ? 'in_stock' : 'out_of_stock'
      },
      images: [],
      variants: [],
      attributes: [],
      createdAt: updatedProduct.createdAt,
      updatedAt: updatedProduct.updatedAt
    };

    // ── Re-run auto-validation engine after product is updated ──
    await runProductValidation(id, prisma);

    res.json(formatted);
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message || 'Failed to update Product' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Clean up validation logs for this product before deleting
    await prisma.validationLog.deleteMany({ where: { entityId: id, entityType: 'Product' } });
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message || 'Failed to delete Product' });
  }
};
