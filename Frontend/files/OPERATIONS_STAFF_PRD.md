# TASK

Create a complete enterprise Product Requirement Document named

05_OPERATIONS_STAFF_PRD.md

DO NOT WRITE CODE.

DO NOT CREATE REACT COMPONENTS.

DO NOT CREATE DATABASE SCHEMA.

Only create a complete Product Requirement Document.

------------------------------------------------------------

PROJECT CONTEXT

Read the complete Client Requirement PDF.

Read

01_SUPER_ADMIN_PRD.md

02_ADMIN_PRD.md

03_CATALOG_MANAGER_PRD.md

04_INTEGRATION_MANAGER_PRD.md

before creating this document.

This project is an Enterprise Middleware + Product Information Management (PIM) + Supplier Integration + Inventory Synchronization Platform.

There is ONLY ONE centralized enterprise dashboard.

The Operations Staff role is responsible for operational monitoring, issue tracking and platform visibility.

This role is NOT responsible for system administration.

------------------------------------------------------------

ROLE NAME

Operations Staff

------------------------------------------------------------

ROLE PURPOSE

Operations Staff ensures that the platform is operating normally throughout the day.

This role continuously monitors

Supplier Health

Validation Queue

Synchronization Status

Import Queue

System Health

Running Jobs

Failed Jobs

Platform Alerts

Website Status

Reports

Logs

The Operations Staff identifies issues and escalates them to Admin or Integration Manager.

------------------------------------------------------------

ROLE RESPONSIBILITIES

Monitor Dashboard

Monitor Validation Center

Monitor Logs

Monitor Monitoring Dashboard

Generate Reports

Track Failed Jobs

Track Failed Synchronization

Track Failed Imports

Verify Product Publishing Status

Verify Inventory Updates

Verify Pricing Updates

Verify Image Updates

Verify Website Synchronization

Track Supplier Status

Track Queue Status

Track Platform Health

Escalate Problems

------------------------------------------------------------

ROLE RESTRICTIONS

Operations Staff CANNOT

Create Products

Edit Products

Delete Products

Manage Categories

Manage Brands

Manage Variants

Manage Product Mapping

Manage Suppliers

Manage Integrations

Configure APIs

Configure FTP

Manage Users

Manage Roles

Manage Permissions

Manage Settings

Delete Logs

Delete Reports

Run Platform Configuration

Change Synchronization Rules

------------------------------------------------------------

DOCUMENT STRUCTURE

------------------------------------------------------------

1.

ROLE OVERVIEW

Explain

Who is Operations Staff

Business Goal

Responsibilities

Limitations

Daily Activities

Difference from Admin

Difference from Integration Manager

Difference from Catalog Manager

Platform Position

------------------------------------------------------------

2.

DASHBOARD

Explain every dashboard widget.

Dashboard should contain

Connected Suppliers

Disconnected Suppliers

Total Products

Pending Validation

Published Products

Failed Products

Synchronization Status

Inventory Status

Pricing Status

Image Status

Running Jobs

Queued Jobs

Completed Jobs

Failed Jobs

System Health

API Health

FTP Health

Queue Health

Website Status

Recent Activities

Today's Alerts

Health Score

Platform Status

Charts

Timeline

Synchronization Activity

Supplier Distribution

Quick Actions

Search

------------------------------------------------------------

3.

VALIDATION CENTER

Purpose

Monitor validation results.

Operations Staff can

View Validation Queue

View Duplicate Products

View Duplicate SKU

View Missing Images

View Missing Categories

View Missing Prices

View Validation Errors

Filter

Search

Export

Assign Issue

Escalate Issue

Operations Staff CANNOT approve or edit products.

------------------------------------------------------------

4.

LOGS

System Logs

Synchronization Logs

Inventory Logs

Pricing Logs

Image Logs

Import Logs

Supplier Logs

Website Logs

Audit Logs

Activity Logs

Operations Staff can

Search Logs

Filter Logs

Export Logs

View Details

Share Logs

Escalate Log

Cannot delete logs.

------------------------------------------------------------

5.

MONITORING

System Health

API Health

FTP Health

Import Queue

Synchronization Queue

Memory Usage

CPU Usage

Storage Usage

Platform Health

Supplier Health

Website Health

Store Health

Health Timeline

Alerts

Warnings

Critical Events

Trend Charts

------------------------------------------------------------

6.

REPORTS

Supplier Reports

Inventory Reports

Synchronization Reports

Validation Reports

Website Reports

Error Reports

Daily Reports

Weekly Reports

Monthly Reports

Operations Reports

Export PDF

Export CSV

Filter by Date

Filter by Supplier

Filter by Website

Comparison Reports

------------------------------------------------------------

7.

DASHBOARD BUSINESS FLOW

Operations Staff Login

↓

Dashboard

↓

Review Alerts

↓

Review Synchronization Status

↓

Review Running Jobs

↓

Review Failed Jobs

↓

Review Validation Queue

↓

Review Logs

↓

Review Monitoring

↓

Generate Reports

↓

Escalate Issues

↓

Logout

Explain every step in detail.

------------------------------------------------------------

8.

VALIDATION FLOW

Product Imported

↓

Validation Engine

↓

Validation Queue

↓

Operations Staff Reviews

↓

Issue Identified

↓

Assign Issue

↓

Escalate to Catalog Manager

Explain complete workflow.

------------------------------------------------------------

9.

MONITORING FLOW

Supplier

↓

Import

↓

Synchronization

↓

Website

↓

Dashboard

↓

Operations Staff Monitoring

↓

Issue Detection

↓

Escalation

Explain every stage.

------------------------------------------------------------

10.

LOG FLOW

Platform Activity

↓

Log Generated

↓

Operations Dashboard

↓

Search

↓

Filter

↓

View Details

↓

Export

↓

Escalate

------------------------------------------------------------

11.

REPORT FLOW

Platform Data

↓

Analytics Engine

↓

Reports

↓

Operations Staff

↓

Export PDF

↓

Export CSV

↓

Management

------------------------------------------------------------

12.

NAVIGATION FLOW

Login

↓

Dashboard

↓

Validation Center

↓

Logs

↓

Monitoring

↓

Reports

↓

Logout

Explain navigation in detail.

------------------------------------------------------------

13.

PERMISSION MATRIX

Clearly explain

CAN

View Dashboard

View Validation

View Logs

View Monitoring

View Reports

Search

Filter

Export

Escalate

View Alerts

View Queue

View Synchronization Status

CANNOT

Edit Products

Manage Suppliers

Manage Integrations

Manage Users

Manage Roles

Manage Permissions

Manage Settings

Run Synchronization

Configure APIs

Configure FTP

Delete Logs

Delete Reports

------------------------------------------------------------

14.

ACCEPTANCE CRITERIA

Every dashboard widget

Every chart

Every report

Every table

Every filter

Every export

Every search

Every log

Every monitoring screen

Must have complete acceptance criteria.

------------------------------------------------------------

15.

FUTURE READY

Explain how Operations Staff will monitor

Order Automation

Shipment Tracking

Invoices

Punchout

OCI

cXML

SAP

Oracle

without changing the existing operational workflow.

------------------------------------------------------------

FINAL REQUIREMENT

Write this document like a Senior Product Manager at Microsoft, SAP, Oracle or Atlassian.

Generate approximately 35–50 pages worth of professional enterprise documentation.

Do not summarize.

Do not skip sections.

Every workflow must align with the client requirement.

The document should be detailed enough that frontend developers, backend developers and UI designers can build the complete Operations Staff module without asking additional questions.
