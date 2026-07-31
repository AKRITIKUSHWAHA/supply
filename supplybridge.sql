-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 31, 2026 at 01:58 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `supplybridge`
--

-- --------------------------------------------------------

--
-- Table structure for table `activitylog`
--

CREATE TABLE `activitylog` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `action` varchar(191) NOT NULL,
  `details` text DEFAULT NULL,
  `ipAddress` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attribute`
--

CREATE TABLE `attribute` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `group` varchar(191) DEFAULT NULL,
  `type` varchar(191) NOT NULL DEFAULT 'text',
  `dynamicValues` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attributemapping`
--

CREATE TABLE `attributemapping` (
  `id` varchar(191) NOT NULL,
  `attributeId` varchar(191) NOT NULL,
  `supplierValue` varchar(191) NOT NULL,
  `storeValue` varchar(191) DEFAULT NULL,
  `manualOverride` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(191) NOT NULL DEFAULT 'mapped',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `brand`
--

CREATE TABLE `brand` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `logo` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `website` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `brandmapping`
--

CREATE TABLE `brandmapping` (
  `id` varchar(191) NOT NULL,
  `brandId` varchar(191) NOT NULL,
  `supplierValue` varchar(191) NOT NULL,
  `storeValue` varchar(191) DEFAULT NULL,
  `manualOverride` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(191) NOT NULL DEFAULT 'mapped',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `parentId` varchar(191) DEFAULT NULL,
  `seoTitle` varchar(191) DEFAULT NULL,
  `seoDescription` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categorymapping`
--

CREATE TABLE `categorymapping` (
  `id` varchar(191) NOT NULL,
  `categoryId` varchar(191) NOT NULL,
  `supplierValue` varchar(191) NOT NULL,
  `storeValue` varchar(191) DEFAULT NULL,
  `manualOverride` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(191) NOT NULL DEFAULT 'mapped',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `department`
--

CREATE TABLE `department` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `importjob`
--

CREATE TABLE `importjob` (
  `id` varchar(191) NOT NULL,
  `source` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL,
  `recordsProcessed` int(11) NOT NULL DEFAULT 0,
  `recordsFailed` int(11) NOT NULL DEFAULT 0,
  `logs` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

CREATE TABLE `inventory` (
  `id` varchar(191) NOT NULL,
  `productId` varchar(191) DEFAULT NULL,
  `variantId` varchar(191) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `status` varchar(191) NOT NULL DEFAULT 'in_stock',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `joblog`
--

CREATE TABLE `joblog` (
  `id` varchar(191) NOT NULL,
  `jobId` varchar(191) NOT NULL,
  `queueName` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL,
  `progress` int(11) NOT NULL DEFAULT 0,
  `result` text DEFAULT NULL,
  `error` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `completedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `manufacturer`
--

CREATE TABLE `manufacturer` (
  `id` varchar(191) NOT NULL,
  `company` varchar(191) NOT NULL,
  `country` varchar(191) DEFAULT NULL,
  `contact` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `media`
--

CREATE TABLE `media` (
  `id` varchar(191) NOT NULL,
  `url` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `folder` varchar(191) DEFAULT NULL,
  `filename` varchar(191) NOT NULL,
  `size` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permission`
--

CREATE TABLE `permission` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `id` varchar(191) NOT NULL,
  `sku` varchar(191) NOT NULL,
  `upc` varchar(191) DEFAULT NULL,
  `barcode` varchar(191) DEFAULT NULL,
  `title` varchar(191) NOT NULL,
  `description` text DEFAULT NULL,
  `shortDescription` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'draft',
  `slug` varchar(191) DEFAULT NULL,
  `seoTitle` varchar(191) DEFAULT NULL,
  `seoDescription` varchar(191) DEFAULT NULL,
  `weight` double DEFAULT NULL,
  `dimensions` varchar(191) DEFAULT NULL,
  `supplierId` varchar(191) DEFAULT NULL,
  `categoryId` varchar(191) DEFAULT NULL,
  `brandId` varchar(191) DEFAULT NULL,
  `manufacturerId` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `deletedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `productimage`
--

CREATE TABLE `productimage` (
  `id` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `url` varchar(191) NOT NULL,
  `isFeatured` tinyint(1) NOT NULL DEFAULT 0,
  `order` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `productmapping`
--

CREATE TABLE `productmapping` (
  `id` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `supplierValue` varchar(191) NOT NULL,
  `storeValue` varchar(191) DEFAULT NULL,
  `manualOverride` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(191) NOT NULL DEFAULT 'mapped',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `productprice`
--

CREATE TABLE `productprice` (
  `id` varchar(191) NOT NULL,
  `productId` varchar(191) DEFAULT NULL,
  `variantId` varchar(191) DEFAULT NULL,
  `price` double NOT NULL,
  `cost` double DEFAULT NULL,
  `currency` varchar(191) NOT NULL DEFAULT 'USD',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `publishinglog`
--

CREATE TABLE `publishinglog` (
  `id` varchar(191) NOT NULL,
  `storeId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL,
  `details` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `refreshtoken`
--

CREATE TABLE `refreshtoken` (
  `id` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `revoked` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rolepermission`
--

CREATE TABLE `rolepermission` (
  `roleId` varchar(191) NOT NULL,
  `permissionId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `session`
--

CREATE TABLE `session` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `ipAddress` varchar(191) DEFAULT NULL,
  `userAgent` varchar(191) DEFAULT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `store`
--

CREATE TABLE `store` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `currency` varchar(191) NOT NULL DEFAULT 'USD',
  `language` varchar(191) NOT NULL DEFAULT 'en',
  `timezone` varchar(191) NOT NULL DEFAULT 'UTC',
  `connectionStatus` varchar(191) NOT NULL DEFAULT 'disconnected',
  `syncStatus` varchar(191) NOT NULL DEFAULT 'idle',
  `lastSync` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `storeconfiguration`
--

CREATE TABLE `storeconfiguration` (
  `id` varchar(191) NOT NULL,
  `storeId` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` text NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `storecredential`
--

CREATE TABLE `storecredential` (
  `id` varchar(191) NOT NULL,
  `storeId` varchar(191) NOT NULL,
  `apiKey` varchar(191) DEFAULT NULL,
  `secret` varchar(191) DEFAULT NULL,
  `accessToken` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplier`
--

CREATE TABLE `supplier` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `company` varchar(191) DEFAULT NULL,
  `email` varchar(191) DEFAULT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `website` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `deletedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplierconnection`
--

CREATE TABLE `supplierconnection` (
  `id` varchar(191) NOT NULL,
  `supplierId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `apiUrl` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'disconnected',
  `lastSync` datetime(3) DEFAULT NULL,
  `nextSync` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suppliercredential`
--

CREATE TABLE `suppliercredential` (
  `id` varchar(191) NOT NULL,
  `supplierId` varchar(191) NOT NULL,
  `authType` varchar(191) NOT NULL,
  `username` varchar(191) DEFAULT NULL,
  `password` varchar(191) DEFAULT NULL,
  `apiKey` varchar(191) DEFAULT NULL,
  `secret` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplierlog`
--

CREATE TABLE `supplierlog` (
  `id` varchar(191) NOT NULL,
  `supplierId` varchar(191) NOT NULL,
  `action` varchar(191) NOT NULL,
  `details` text DEFAULT NULL,
  `status` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supplierschedule`
--

CREATE TABLE `supplierschedule` (
  `id` varchar(191) NOT NULL,
  `supplierId` varchar(191) NOT NULL,
  `cronExpression` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suppliersync`
--

CREATE TABLE `suppliersync` (
  `id` varchar(191) NOT NULL,
  `supplierId` varchar(191) NOT NULL,
  `status` varchar(191) NOT NULL,
  `productCount` int(11) NOT NULL DEFAULT 0,
  `inventoryStatus` varchar(191) DEFAULT NULL,
  `pricingStatus` varchar(191) DEFAULT NULL,
  `imageStatus` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `systemsetting`
--

CREATE TABLE `systemsetting` (
  `id` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` text NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'active',
  `profileImage` varchar(191) DEFAULT NULL,
  `lastLogin` datetime(3) DEFAULT NULL,
  `departmentId` varchar(191) DEFAULT NULL,
  `roleId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `validationlog`
--

CREATE TABLE `validationlog` (
  `id` varchar(191) NOT NULL,
  `entityId` varchar(191) NOT NULL,
  `entityType` varchar(191) NOT NULL,
  `issue` text NOT NULL,
  `status` varchar(191) NOT NULL DEFAULT 'open',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `resolvedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `validationrule`
--

CREATE TABLE `validationrule` (
  `id` varchar(191) NOT NULL,
  `entity` varchar(191) NOT NULL,
  `field` varchar(191) NOT NULL,
  `ruleType` varchar(191) NOT NULL,
  `errorMessage` varchar(191) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `variant`
--

CREATE TABLE `variant` (
  `id` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `sku` varchar(191) NOT NULL,
  `color` varchar(191) DEFAULT NULL,
  `size` varchar(191) DEFAULT NULL,
  `material` varchar(191) DEFAULT NULL,
  `storage` varchar(191) DEFAULT NULL,
  `memory` varchar(191) DEFAULT NULL,
  `model` varchar(191) DEFAULT NULL,
  `dynamicOptions` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `variantmapping`
--

CREATE TABLE `variantmapping` (
  `id` varchar(191) NOT NULL,
  `variantId` varchar(191) NOT NULL,
  `supplierValue` varchar(191) NOT NULL,
  `storeValue` varchar(191) DEFAULT NULL,
  `manualOverride` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(191) NOT NULL DEFAULT 'mapped',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('97a7d060-46da-4628-b562-d0777fba8b29', '5f2c4d3be5b75364b6f3fd43196aa761e995458358d106c508ac3f2ad6b23169', '2026-07-31 10:53:11.172', '20260731105310_user', NULL, NULL, '2026-07-31 10:53:11.038', 1),
('c9ee5464-d4f6-4ddf-9c8d-c6357f9eccf6', 'f36fe8d3379d261ca644214834b79454dc58de13f1a2a2842e4c247084f68e33', '2026-07-31 10:52:53.349', '20260731103146_y', NULL, NULL, '2026-07-31 10:52:48.752', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activitylog`
--
ALTER TABLE `activitylog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ActivityLog_userId_fkey` (`userId`);

--
-- Indexes for table `attribute`
--
ALTER TABLE `attribute`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `attributemapping`
--
ALTER TABLE `attributemapping`
  ADD PRIMARY KEY (`id`),
  ADD KEY `AttributeMapping_attributeId_fkey` (`attributeId`);

--
-- Indexes for table `brand`
--
ALTER TABLE `brand`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Brand_name_key` (`name`);

--
-- Indexes for table `brandmapping`
--
ALTER TABLE `brandmapping`
  ADD PRIMARY KEY (`id`),
  ADD KEY `BrandMapping_brandId_fkey` (`brandId`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Category_slug_key` (`slug`),
  ADD KEY `Category_parentId_fkey` (`parentId`);

--
-- Indexes for table `categorymapping`
--
ALTER TABLE `categorymapping`
  ADD PRIMARY KEY (`id`),
  ADD KEY `CategoryMapping_categoryId_fkey` (`categoryId`);

--
-- Indexes for table `department`
--
ALTER TABLE `department`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Department_name_key` (`name`);

--
-- Indexes for table `importjob`
--
ALTER TABLE `importjob`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `inventory`
--
ALTER TABLE `inventory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Inventory_productId_fkey` (`productId`),
  ADD KEY `Inventory_variantId_fkey` (`variantId`);

--
-- Indexes for table `joblog`
--
ALTER TABLE `joblog`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `manufacturer`
--
ALTER TABLE `manufacturer`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Manufacturer_company_key` (`company`);

--
-- Indexes for table `media`
--
ALTER TABLE `media`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `permission`
--
ALTER TABLE `permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Permission_name_key` (`name`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Product_sku_key` (`sku`),
  ADD UNIQUE KEY `Product_upc_key` (`upc`),
  ADD UNIQUE KEY `Product_barcode_key` (`barcode`),
  ADD UNIQUE KEY `Product_slug_key` (`slug`),
  ADD KEY `Product_supplierId_fkey` (`supplierId`),
  ADD KEY `Product_categoryId_fkey` (`categoryId`),
  ADD KEY `Product_brandId_fkey` (`brandId`),
  ADD KEY `Product_manufacturerId_fkey` (`manufacturerId`);

--
-- Indexes for table `productimage`
--
ALTER TABLE `productimage`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ProductImage_productId_fkey` (`productId`);

--
-- Indexes for table `productmapping`
--
ALTER TABLE `productmapping`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ProductMapping_productId_fkey` (`productId`);

--
-- Indexes for table `productprice`
--
ALTER TABLE `productprice`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ProductPrice_productId_fkey` (`productId`),
  ADD KEY `ProductPrice_variantId_fkey` (`variantId`);

--
-- Indexes for table `publishinglog`
--
ALTER TABLE `publishinglog`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `refreshtoken`
--
ALTER TABLE `refreshtoken`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `RefreshToken_token_key` (`token`),
  ADD KEY `RefreshToken_userId_fkey` (`userId`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Role_name_key` (`name`);

--
-- Indexes for table `rolepermission`
--
ALTER TABLE `rolepermission`
  ADD PRIMARY KEY (`roleId`,`permissionId`),
  ADD KEY `RolePermission_permissionId_fkey` (`permissionId`);

--
-- Indexes for table `session`
--
ALTER TABLE `session`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Session_token_key` (`token`),
  ADD KEY `Session_userId_fkey` (`userId`);

--
-- Indexes for table `store`
--
ALTER TABLE `store`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `storeconfiguration`
--
ALTER TABLE `storeconfiguration`
  ADD PRIMARY KEY (`id`),
  ADD KEY `StoreConfiguration_storeId_fkey` (`storeId`);

--
-- Indexes for table `storecredential`
--
ALTER TABLE `storecredential`
  ADD PRIMARY KEY (`id`),
  ADD KEY `StoreCredential_storeId_fkey` (`storeId`);

--
-- Indexes for table `supplier`
--
ALTER TABLE `supplier`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `supplierconnection`
--
ALTER TABLE `supplierconnection`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SupplierConnection_supplierId_fkey` (`supplierId`);

--
-- Indexes for table `suppliercredential`
--
ALTER TABLE `suppliercredential`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SupplierCredential_supplierId_fkey` (`supplierId`);

--
-- Indexes for table `supplierlog`
--
ALTER TABLE `supplierlog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SupplierLog_supplierId_fkey` (`supplierId`);

--
-- Indexes for table `supplierschedule`
--
ALTER TABLE `supplierschedule`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SupplierSchedule_supplierId_fkey` (`supplierId`);

--
-- Indexes for table `suppliersync`
--
ALTER TABLE `suppliersync`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SupplierSync_supplierId_fkey` (`supplierId`);

--
-- Indexes for table `systemsetting`
--
ALTER TABLE `systemsetting`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `SystemSetting_key_key` (`key`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`),
  ADD KEY `User_departmentId_fkey` (`departmentId`),
  ADD KEY `User_roleId_fkey` (`roleId`);

--
-- Indexes for table `validationlog`
--
ALTER TABLE `validationlog`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `validationrule`
--
ALTER TABLE `validationrule`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `variant`
--
ALTER TABLE `variant`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Variant_sku_key` (`sku`),
  ADD KEY `Variant_productId_fkey` (`productId`);

--
-- Indexes for table `variantmapping`
--
ALTER TABLE `variantmapping`
  ADD PRIMARY KEY (`id`),
  ADD KEY `VariantMapping_variantId_fkey` (`variantId`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activitylog`
--
ALTER TABLE `activitylog`
  ADD CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `attributemapping`
--
ALTER TABLE `attributemapping`
  ADD CONSTRAINT `AttributeMapping_attributeId_fkey` FOREIGN KEY (`attributeId`) REFERENCES `attribute` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `brandmapping`
--
ALTER TABLE `brandmapping`
  ADD CONSTRAINT `BrandMapping_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brand` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `category`
--
ALTER TABLE `category`
  ADD CONSTRAINT `Category_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `categorymapping`
--
ALTER TABLE `categorymapping`
  ADD CONSTRAINT `CategoryMapping_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `Inventory_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `Inventory_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `variant` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `Product_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brand` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Product_manufacturerId_fkey` FOREIGN KEY (`manufacturerId`) REFERENCES `manufacturer` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Product_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `supplier` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `productimage`
--
ALTER TABLE `productimage`
  ADD CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `productmapping`
--
ALTER TABLE `productmapping`
  ADD CONSTRAINT `ProductMapping_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `productprice`
--
ALTER TABLE `productprice`
  ADD CONSTRAINT `ProductPrice_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ProductPrice_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `variant` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `refreshtoken`
--
ALTER TABLE `refreshtoken`
  ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `rolepermission`
--
ALTER TABLE `rolepermission`
  ADD CONSTRAINT `RolePermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permission` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `RolePermission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `session`
--
ALTER TABLE `session`
  ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `storeconfiguration`
--
ALTER TABLE `storeconfiguration`
  ADD CONSTRAINT `StoreConfiguration_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `store` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `storecredential`
--
ALTER TABLE `storecredential`
  ADD CONSTRAINT `StoreCredential_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `store` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `supplierconnection`
--
ALTER TABLE `supplierconnection`
  ADD CONSTRAINT `SupplierConnection_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `supplier` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `suppliercredential`
--
ALTER TABLE `suppliercredential`
  ADD CONSTRAINT `SupplierCredential_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `supplier` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `supplierlog`
--
ALTER TABLE `supplierlog`
  ADD CONSTRAINT `SupplierLog_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `supplier` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `supplierschedule`
--
ALTER TABLE `supplierschedule`
  ADD CONSTRAINT `SupplierSchedule_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `supplier` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `suppliersync`
--
ALTER TABLE `suppliersync`
  ADD CONSTRAINT `SupplierSync_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `supplier` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `User_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `department` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `variant`
--
ALTER TABLE `variant`
  ADD CONSTRAINT `Variant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `variantmapping`
--
ALTER TABLE `variantmapping`
  ADD CONSTRAINT `VariantMapping_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `variant` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
