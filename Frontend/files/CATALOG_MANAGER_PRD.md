# TASK

Create a complete enterprise Product Requirement Document named:

03_CATALOG_MANAGER_PRD.md

Do NOT generate code.

Do NOT generate React components.

Do NOT generate database schema.

Only create a complete Product Requirement Document.

--------------------------------------------------

PROJECT CONTEXT

Read the complete Client Requirement PDF before writing.

Read

01_SUPER_ADMIN_PRD.md

02_ADMIN_PRD.md

before writing this document.

This project is an Enterprise Middleware + Product Information Management (PIM) + Supplier Integration + Inventory Synchronization Platform.

There is ONLY ONE Dashboard.

This role accesses the same application through Role Based Access Control.

--------------------------------------------------

ROLE NAME

Catalog Manager

--------------------------------------------------

ROLE PURPOSE

Catalog Manager is responsible for maintaining the quality of the Master Catalog.

This role does NOT manage suppliers.

This role does NOT manage integrations.

This role does NOT manage users.

This role does NOT manage permissions.

This role does NOT manage platform settings.

This role only manages product information.

The Catalog Manager ensures every product inside the Master Catalog is accurate, standardized, validated and ready for publishing.

--------------------------------------------------

PRIMARY RESPONSIBILITIES

Manage Products

Manage Categories

Manage Brands

Manage Variants

Product Mapping

Category Mapping

Variant Mapping

Supplier Mapping

Validation Center

Approve Products

Reject Products

Bulk Product Updates

Catalog Quality

Catalog Search

Catalog Publishing

--------------------------------------------------

PERMISSION RESTRICTIONS

Catalog Manager CANNOT

Create Users

Delete Users

Manage Roles

Manage Permissions

Configure APIs

Configure FTP

Configure Scheduler

Configure System

Manage Platform Settings

Manage Monitoring

Manage Logs

Manage Reports

Manage Synchronization

Manage Import Queue

Manage Suppliers

Manage Integrations

--------------------------------------------------

CREATE A COMPLETE PRODUCT REQUIREMENT DOCUMENT

Every module must include

Purpose

Business Goal

User Story

Business Rules

Navigation

Workflow

Tables

Cards

Search

Advanced Filters

Sorting

Pagination

Bulk Actions

Export

Validation

Notifications

Success State

Error State

Acceptance Criteria

Future Scalability

--------------------------------------------------

DOCUMENT STRUCTURE

1.

Role Overview

Explain

Who is Catalog Manager

Business Goal

Responsibilities

Restrictions

Platform Position

Difference from Admin

Difference from Super Admin

--------------------------------------------------

2.

Dashboard

Dashboard should display

Total Products

Pending Validation

Approved Products

Rejected Products

Draft Products

Recently Updated Products

Products Missing Images

Products Missing Categories

Products Missing Attributes

Duplicate SKU Count

Validation Queue

Recent Product Activities

Catalog Statistics

Product Growth

Category Distribution

Brand Distribution

Variant Statistics

Quick Actions

Search

Recent Changes

--------------------------------------------------

3.

Master Catalog

Purpose

Single Source of Truth

Product Lifecycle

Product Status

Draft

Pending

Validated

Published

Archived

Explain every workflow.

--------------------------------------------------

4.

Products

Product List

Create Product

Edit Product

Archive Product

Soft Delete

Bulk Edit

Bulk Publish

Bulk Archive

Bulk Update

Clone Product

Version History

Timeline

Media

Attributes

Specifications

SEO Fields

Publishing Status

Approval Status

Validation Status

Every action must be explained.

--------------------------------------------------

5.

Categories

Category Tree

Nested Categories

Category Assignment

Category Editing

Category Search

Category Merge

Archive Category

Bulk Assignment

--------------------------------------------------

6.

Brands

Brand List

Create Brand

Edit Brand

Archive Brand

Brand Search

Assign Products

Brand Statistics

--------------------------------------------------

7.

Variants

Parent Products

Child Products

Variant Creation

Variant Editing

Variant Grouping

Variant Attributes

Color

Size

Material

Weight

Dimensions

Variant Search

Bulk Update

--------------------------------------------------

8.

Product Mapping

Supplier SKU Mapping

Internal SKU Mapping

Master SKU Mapping

Category Mapping

Brand Mapping

Variant Mapping

Image Mapping

Attribute Mapping

Normalization Rules

Bulk Mapping

Mapping History

Review Queue

--------------------------------------------------

9.

Validation Center

Purpose

Ensure catalog quality.

Validation Rules

Duplicate SKU

Duplicate Product

Missing Images

Missing Brand

Missing Category

Missing Attributes

Invalid Variant

Missing Price

Incomplete Specifications

Approval Workflow

Reject Workflow

Bulk Approval

Bulk Reject

Reviewer Notes

History

--------------------------------------------------

10.

Product Publishing

Ready For Publish

Pending Review

Published

Archived

Publishing Workflow

Publishing Checklist

Publishing History

--------------------------------------------------

11.

Search & Filters

Global Product Search

Advanced Filters

Supplier

Brand

Category

Status

Validation

Date

Updated By

Created By

Bulk Search

Saved Filters

--------------------------------------------------

12.

Navigation Flow

Login

↓

Dashboard

↓

Products

↓

Categories

↓

Brands

↓

Variants

↓

Product Mapping

↓

Validation Center

↓

Publish

↓

Logout

Explain navigation in detail.

--------------------------------------------------

13.

Business Flow

Supplier imports data

↓

Master Catalog receives product

↓

Catalog Manager reviews

↓

Edit Product

↓

Correct Attributes

↓

Correct Category

↓

Correct Brand

↓

Correct Variants

↓

Run Validation

↓

Approve

↓

Ready For Publishing

Explain every stage in detail.

--------------------------------------------------

14.

Permission Matrix

Clearly define

CAN

View Products

Create Products

Edit Products

Approve Products

Reject Products

Manage Categories

Manage Brands

Manage Variants

Manage Mapping

Run Validation

Publish Products

CANNOT

Manage Suppliers

Manage APIs

Manage Integrations

Manage Users

Manage Roles

Manage Permissions

Manage Settings

Manage Monitoring

Manage Logs

Manage Reports

--------------------------------------------------

15.

Acceptance Criteria

Every screen

Every table

Every button

Every workflow

Every bulk action

Every search

Every filter

Must include detailed acceptance criteria.

--------------------------------------------------

16.

Future Ready

Explain how Catalog Manager continues to work when

Phase 3

Order Automation

Phase 4

Punchout

EDI

OCI

SAP

Oracle

are introduced.

Catalog workflow should remain unchanged while supporting additional downstream integrations.

--------------------------------------------------

FINAL REQUIREMENT

Write like a Senior Product Manager at Microsoft, SAP, Oracle or Atlassian.

Generate a complete enterprise Product Requirement Document.

Do not summarize.

Do not skip any section.

The document should be detailed enough that UI Designers, Backend Developers and Frontend Developers can build the Catalog Manager module without asking additional questions.

Every workflow must align with the client requirement PDF.

This document should be approximately 35–50 pages worth of professional enterprise documentation.