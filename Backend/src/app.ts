import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';
import permissionRoutes from './routes/permission.routes';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';

const app: Application = express();

// Security and utility middlewares
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);

// Phase 2 Routes
import supplierRoutes from './routes/supplier.routes';
import productRoutes from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import brandRoutes from './routes/brand.routes';
import storeRoutes from './routes/store.routes';

import metricsRoutes from './routes/metrics.routes';
import pricingRoutes from './routes/pricing.routes';
import manufacturerRoutes from './routes/manufacturer.routes';
import variantRoutes from './routes/variant.routes';
import mediaRoutes from './routes/media.routes';
import mappingRoutes from './routes/mapping.routes';
import validationRoutes from './routes/validation.routes';
import syncRoutes from './routes/sync.routes';
import reportsRoutes from './routes/reports.routes';
import logsRoutes from './routes/logs.routes';
import notificationRoutes from './routes/notification.routes';
import settingRoutes from './routes/setting.routes';

app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/dashboard', metricsRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/manufacturers', manufacturerRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/mappings', mappingRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
