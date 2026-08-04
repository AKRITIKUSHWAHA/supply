import { PrismaClient } from '@prisma/client';
import { runProductValidation } from '../utils/validationEngine';

const prisma = new PrismaClient();

interface ParsedProductRow {
  sku: string;
  title: string;
  price?: number;
  cost?: number;
  stock?: number;
  category?: string;
  brand?: string;
  imageUrl?: string;
}

/**
 * Parses raw CSV content text into structured product objects
 */
export function parseCSVFeed(csvText: string): ParsedProductRow[] {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // Parse header line if present
  const headerLine = lines[0].toLowerCase();
  const hasHeader = headerLine.includes('sku') || headerLine.includes('title') || headerLine.includes('name') || headerLine.includes('price');

  const headers = hasHeader
    ? lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase())
    : ['sku', 'title', 'price', 'stock', 'category', 'brand', 'imageurl'];

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const products: ParsedProductRow[] = [];

  for (const line of dataLines) {
    // Handle quoted fields
    const cols = line.match(/(?:[^\s,"]|"(?:\\.|[^"])*")+/g)?.map(c => c.trim().replace(/^["']|["']$/g, '')) || line.split(',');
    if (cols.length === 0) continue;

    const rowData: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowData[h] = cols[idx] || '';
    });

    const sku = rowData['sku'] || rowData['code'] || rowData['partnumber'] || cols[0] || `SKU-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const title = rowData['title'] || rowData['name'] || rowData['product'] || rowData['description'] || cols[1] || `Product ${sku}`;
    const price = parseFloat(rowData['price'] || rowData['retailprice'] || rowData['msrp'] || cols[2] || '0') || 0;
    const cost = parseFloat(rowData['cost'] || rowData['wholesaleprice'] || cols[3] || '0') || (price > 0 ? price * 0.7 : 0);
    const stock = parseInt(rowData['stock'] || rowData['quantity'] || rowData['qty'] || cols[4] || '10', 10);
    const category = rowData['category'] || rowData['cat'] || cols[5] || 'General';
    const brand = rowData['brand'] || rowData['manufacturer'] || cols[6] || 'Generic';
    const imageUrl = rowData['imageurl'] || rowData['image'] || rowData['photo'] || cols[7] || undefined;

    products.push({
      sku: sku.trim(),
      title: title.trim(),
      price,
      cost,
      stock,
      category: category.trim(),
      brand: brand.trim(),
      imageUrl: imageUrl?.trim(),
    });
  }

  return products;
}

/**
 * Parses raw XML content text into structured product objects
 */
export function parseXMLFeed(xmlText: string): ParsedProductRow[] {
  const products: ParsedProductRow[] = [];
  
  // Extract item/product blocks using regex
  const itemMatches = xmlText.match(/<(?:item|product|row|entry)[\s\S]*?<\/(?:item|product|row|entry)>/gi) || [];

  for (const block of itemMatches) {
    const extractTag = (tagNames: string[]) => {
      for (const tag of tagNames) {
        const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
        if (match && match[1]) return match[1].trim();
      }
      return '';
    };

    const sku = extractTag(['sku', 'code', 'id', 'partnumber']) || `XML-SKU-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const title = extractTag(['title', 'name', 'product', 'description']) || `XML Product ${sku}`;
    const priceStr = extractTag(['price', 'retail_price', 'msrp']);
    const costStr = extractTag(['cost', 'wholesale_price']);
    const stockStr = extractTag(['stock', 'quantity', 'qty']);
    const category = extractTag(['category', 'cat', 'type']) || 'General';
    const brand = extractTag(['brand', 'manufacturer']) || 'Generic';
    const imageUrl = extractTag(['image', 'image_url', 'photo', 'picture']);

    products.push({
      sku,
      title,
      price: parseFloat(priceStr) || 0,
      cost: parseFloat(costStr) || 0,
      stock: parseInt(stockStr, 10) || 10,
      category,
      brand,
      imageUrl: imageUrl || undefined,
    });
  }

  return products;
}

/**
 * Ingests a list of parsed products into the database under a specific supplier
 */
export async function ingestSupplierFeed(
  supplierId: string,
  connectionType: string,
  fileName: string,
  rawContent: string
): Promise<{ success: boolean; total: number; supplierName: string }> {
  const type = connectionType.toLowerCase();
  let parsedRows: ParsedProductRow[] = [];

  if (type === 'xml') {
    parsedRows = parseXMLFeed(rawContent);
  } else {
    // CSV / Excel CSV text format
    parsedRows = parseCSVFeed(rawContent);
  }

  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  const supplierName = supplier?.name || 'Supplier Feed';

  let successCount = 0;

  for (const item of parsedRows) {
    try {
      // 1. Category
      let categoryId: string | undefined = undefined;
      if (item.category) {
        const slug = item.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        let cat = await prisma.category.findUnique({ where: { slug } });
        if (!cat) {
          cat = await prisma.category.create({ data: { name: item.category, slug } });
        }
        categoryId = cat.id;
      }

      // 2. Brand
      let brandId: string | undefined = undefined;
      if (item.brand) {
        let br = await prisma.brand.findUnique({ where: { name: item.brand } });
        if (!br) {
          br = await prisma.brand.create({ data: { name: item.brand } });
        }
        brandId = br.id;
      }

      // 3. Upsert Product
      const product = await prisma.product.upsert({
        where: { sku: item.sku },
        update: {
          title: item.title,
          supplierId,
          categoryId,
          brandId,
          status: 'draft',
        },
        create: {
          sku: item.sku,
          title: item.title,
          supplierId,
          categoryId,
          brandId,
          status: 'draft',
        },
      });

      // 4. Product Price
      const existingPrice = await prisma.productPrice.findFirst({ where: { productId: product.id } });
      if (existingPrice) {
        await prisma.productPrice.update({
          where: { id: existingPrice.id },
          data: { price: item.price || 0, cost: item.cost || 0 },
        });
      } else {
        await prisma.productPrice.create({
          data: { productId: product.id, price: item.price || 0, cost: item.cost || 0, currency: 'USD' },
        });
      }

      // 5. Product Inventory
      const existingInv = await prisma.inventory.findFirst({ where: { productId: product.id } });
      if (existingInv) {
        await prisma.inventory.update({
          where: { id: existingInv.id },
          data: { quantity: item.stock || 0, status: (item.stock || 0) > 0 ? 'in_stock' : 'out_of_stock' },
        });
      } else {
        await prisma.inventory.create({
          data: { productId: product.id, quantity: item.stock || 0, status: (item.stock || 0) > 0 ? 'in_stock' : 'out_of_stock' },
        });
      }

      // 6. Product Image
      if (item.imageUrl) {
        const existingImg = await prisma.productImage.findFirst({ where: { productId: product.id } });
        if (!existingImg) {
          await prisma.productImage.create({
            data: { productId: product.id, url: item.imageUrl, isFeatured: true, order: 0 },
          });
        }
      }

      // 7. Run Validation check
      await runProductValidation(product.id, prisma);
      successCount++;
    } catch (err) {
      console.error(`[IngestionEngine] Error importing SKU ${item.sku}:`, err);
    }
  }

  // Record Import Job history entry
  await prisma.importJob.create({
    data: {
      source: type.toUpperCase(),
      type: 'Products Feed',
      status: 'completed',
      recordsProcessed: successCount,
      recordsFailed: Math.max(0, parsedRows.length - successCount),
      logs: `Imported ${successCount} products from file ${fileName} for supplier ${supplierName}`,
    },
  });

  return {
    success: true,
    total: successCount,
    supplierName,
  };
}
