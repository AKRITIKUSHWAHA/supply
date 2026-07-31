# 05 — Operations Staff PRD
## SupplyBridge Enterprise Platform
### Product Requirements Document — Operations Staff Role

**Document Version:** 2.4  
**Role:** Operations Staff (`operations_staff`)  
**Platform:** SupplyBridge Enterprise Middleware + PIM + Supplier Integration + Multi-Storefront Sync  
**Author:** Senior Product Manager  
**Classification:** Internal — Engineering & Design Reference  

---

## Table of Contents

1. Role Overview
2. Dashboard Module
3. Validation Center Module
4. Logs Module
5. Monitoring Module
6. Reports Module
7. Dashboard Business Flow
8. Validation Flow
9. Monitoring Flow
10. Log Flow
11. Report Flow
12. Navigation Flow
13. Permission Matrix
14. Acceptance Criteria
15. Future Ready Architecture

---

## 1. ROLE OVERVIEW

### 1.1 Who is Operations Staff?

Operations Staff is a dedicated monitoring and visibility role within the SupplyBridge platform. This user is responsible for ensuring the platform operates normally throughout each business day. They do not configure, administer, or manage any platform component — they observe, track, detect anomalies, and escalate issues to the appropriate role.

The Operations Staff user is typically a:
- Platform Monitoring Analyst
- Daily Operations Specialist
- System Health Observer
- Supplier Operations Coordinator

### 1.2 Business Goal

The core business goal of the Operations Staff role is **operational continuity**. Without an active monitoring role, errors in supplier feeds, failed synchronization jobs, broken API connections, and invalid product data could go undetected for hours or days, causing:

- Incorrect inventory on live storefronts
- Failed price updates affecting margin
- Missing or broken product images on customer-facing pages
- Supplier feeds silently failing without any alert raised

The Operations Staff role exists to catch these problems early, document them, and escalate to the right team before they impact the business.

### 1.3 Core Responsibilities

| # | Responsibility | Description |
|---|---|---|
| 1 | Monitor Dashboard | Review all KPI widgets and health status every morning and throughout the day |
| 2 | Monitor Validation Center | Track products stuck in validation queue and escalate to Catalog Manager |
| 3 | Monitor Logs | Search and filter event logs to identify failure patterns |
| 4 | Monitor Monitoring Dashboard | Track system health metrics, CPU, memory, API uptime |
| 5 | Generate Reports | Create daily, weekly, and monthly operational reports for management |
| 6 | Track Failed Jobs | Identify and document all failed sync jobs; escalate for retry |
| 7 | Track Failed Synchronization | Verify that inventory, pricing, and image sync pipelines are running |
| 8 | Track Failed Imports | Monitor import queue and identify stuck or failed file feeds |
| 9 | Verify Product Publishing | Confirm products are being published to stores after validation |
| 10 | Verify Inventory Updates | Confirm supplier stock levels are reflected correctly on storefronts |
| 11 | Verify Pricing Updates | Confirm margin rules and retail prices are applied correctly |
| 12 | Verify Image Updates | Confirm product images are synced and not broken |
| 13 | Verify Website Synchronization | Confirm Shift4Shop storefronts are receiving updated catalog data |
| 14 | Track Supplier Status | Monitor which suppliers are connected, disconnected, or erroring |
| 15 | Track Queue Status | Monitor the import queue depth and processing rate |
| 16 | Track Platform Health | Observe overall system health score and service availability |
| 17 | Escalate Problems | Notify Admin, Integration Manager, or Catalog Manager of detected issues |

### 1.4 Limitations (What Operations Staff CANNOT Do)

Operations Staff has **read-only and escalation-only** access. They cannot:

- Create, edit, or delete any products
- Manage categories, brands, or variants
- Manage product-to-supplier mapping
- Add, edit, or remove suppliers
- Configure API credentials or connection settings
- Configure FTP/SFTP host settings
- Manage users, roles, or permissions
- Manage platform settings
- Delete logs or audit records
- Delete reports
- Run synchronization jobs manually
- Change synchronization rules or schedules

### 1.5 Daily Activities

**Morning Check (9:00 AM)**
1. Login to SupplyBridge
2. Review Dashboard KPI overview (connected suppliers, failed jobs, health score)
3. Check if overnight sync jobs completed successfully
4. Review any system alerts generated since last session
5. Check import queue for failed file feeds

**Mid-Day Check (12:00 PM)**
1. Review active sync job progress
2. Check validation queue count — escalate to Catalog Manager if count is growing
3. Verify inventory sync pipeline is running
4. Review API and FTP health status

**End-of-Day Check (5:00 PM)**
1. Generate daily operations report
2. Review all failed jobs since morning
3. Confirm all escalated issues were addressed
4. Export log summary for management review

### 1.6 Difference from Other Roles

| Capability | Super Admin | Admin | Catalog Manager | Integration Manager | Operations Staff |
|---|---|---|---|---|---|
| Platform Configuration | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Suppliers | ✅ | ✅ | ❌ | ✅ | ❌ |
| Edit Products | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve Validation | ✅ | ✅ | ✅ | ❌ | ❌ |
| Run Sync Jobs | ✅ | ✅ | ❌ | ✅ | ❌ |
| View Monitoring | ✅ | ✅ | ❌ | ✅ | ✅ |
| View Logs | ✅ | ✅ | ❌ | ✅ | ✅ |
| Generate Reports | ✅ | ✅ | ✅ | ✅ | ✅ |
| Escalate Issues | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete Logs | ✅ | ✅ | ❌ | ❌ | ❌ |

### 1.7 Platform Position

Operations Staff sits at the intersection of all platform workflows without having write access to any of them. They are the **operational pulse-check layer** that ensures all automated pipelines are functioning correctly.

```
[ Suppliers ] → [ Import Queue ] → [ Validation Center ] → [ Master Catalog ] → [ Stores ]
                      ↑                     ↑                      ↑                 ↑
              Operations Staff monitors all stages but cannot modify any of them
```

---

## 2. DASHBOARD MODULE

### 2.1 Purpose

The Dashboard is the primary landing page for Operations Staff after login. It provides a centralized, real-time view of all platform KPIs, system health metrics, active job counts, supplier status, and alert notifications. Operations Staff uses the Dashboard as the starting point for their daily monitoring workflow.

### 2.2 Dashboard Layout

The Dashboard is organized into the following zones:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  HEADER: Platform Status Bar + Health Score + Today's Alert Count       │
├───────────────────────┬─────────────────────────────────────────────────┤
│  KPI CARDS ROW 1      │  Suppliers / Products / Validation / Jobs       │
├───────────────────────┴─────────────────────────────────────────────────┤
│  KPI CARDS ROW 2      │  Sync Status / Inventory / Pricing / Image      │
├───────────────────────┬─────────────────────────────────────────────────┤
│  CHARTS LEFT          │  Synchronization Activity (Area Chart)          │
│  CHARTS RIGHT         │  Supplier Distribution (Donut/Pie Chart)        │
├───────────────────────┴─────────────────────────────────────────────────┤
│  BOTTOM ROW LEFT      │  Recent Activity Feed                           │
│  BOTTOM ROW CENTER    │  System Health Gauges (API, FTP, Queue)         │
│  BOTTOM ROW RIGHT     │  Website Status Panel                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Widget Specifications

#### 2.3.1 Connected Suppliers
- **Data:** Count of suppliers with `status = 'connected'`
- **Display:** Large number + green indicator dot
- **Sub-label:** "Active Supplier Feeds"
- **Color theme:** Emerald/Green
- **Trend:** Compared to yesterday's count
- **Interaction:** Click → navigates to Suppliers view (read-only)

#### 2.3.2 Disconnected Suppliers
- **Data:** Count of suppliers with `status = 'disconnected'` or `status = 'error'`
- **Display:** Large number + red indicator dot
- **Sub-label:** "Requires Attention"
- **Color theme:** Rose/Red
- **Alert threshold:** If > 2 disconnected, show warning badge
- **Interaction:** Click → filters Suppliers list to disconnected only

#### 2.3.3 Total Products
- **Data:** Total product count in Master Catalog
- **Display:** Large number with SKU count
- **Sub-label:** "In Master Catalog"
- **Color theme:** Primary/Indigo
- **Interaction:** Read-only for operations_staff — no navigation

#### 2.3.4 Pending Validation
- **Data:** Count of validation items with `status = 'pending'` or `status = 'review'`
- **Display:** Large number + amber indicator
- **Sub-label:** "Awaiting Review"
- **Color theme:** Amber/Yellow
- **Alert threshold:** If > 50 pending, escalate badge shown
- **Interaction:** Click → navigates to Validation Center

#### 2.3.5 Published Products
- **Data:** Count of products with `status = 'published'`
- **Display:** Large number
- **Sub-label:** "Live on Storefronts"
- **Color theme:** Emerald
- **Interaction:** Read-only

#### 2.3.6 Failed Products
- **Data:** Count of products with `status = 'failed'` or `validationStatus = 'failed'`
- **Display:** Large number + red indicator
- **Sub-label:** "Failed Validation or Publish"
- **Color theme:** Rose
- **Interaction:** Click → navigates to Validation Center filtered to failed

#### 2.3.7 Synchronization Status
- **Data:** Overall sync pipeline health (healthy / degraded / critical)
- **Display:** Status pill (green/amber/red) + last sync timestamp
- **Sub-label:** "Inventory · Pricing · Image · Website"
- **Breakdown:** Four sub-indicators, one per sync type
- **Interaction:** Click → navigates to Sync Jobs view

#### 2.3.8 Inventory Status
- **Data:** Last inventory sync time + failure count
- **Display:** Status badge + timestamp
- **Sub-label:** "Last Supplier Stock Sync"
- **Alert:** If last sync > 4 hours ago, show warning

#### 2.3.9 Pricing Status
- **Data:** Last pricing sync time + failure count
- **Display:** Status badge + timestamp
- **Sub-label:** "Last Margin Rule Pipeline Run"

#### 2.3.10 Image Status
- **Data:** Broken image count + last image sync time
- **Display:** Status badge + broken image count
- **Sub-label:** "CDN Sync Health"

#### 2.3.11 Running Jobs
- **Data:** Count of sync jobs with `status = 'running'`
- **Display:** Animated spinner icon + count
- **Sub-label:** "Active Background Jobs"
- **Color theme:** Cyan
- **Interaction:** Click → navigates to Sync Jobs, filtered to running

#### 2.3.12 Queued Jobs
- **Data:** Count of sync jobs with `status = 'queued'`
- **Display:** Clock icon + count
- **Sub-label:** "Jobs Waiting to Execute"
- **Color theme:** Amber

#### 2.3.13 Completed Jobs
- **Data:** Count of sync jobs with `status = 'completed'` (today)
- **Display:** Check icon + count
- **Sub-label:** "Completed Today"
- **Color theme:** Emerald

#### 2.3.14 Failed Jobs
- **Data:** Count of sync jobs with `status = 'failed'` (today)
- **Display:** X icon + count + red badge if > 0
- **Sub-label:** "Failed Today — Needs Review"
- **Color theme:** Rose
- **Interaction:** Click → navigates to Sync Jobs filtered to failed

#### 2.3.15 System Health Score
- **Data:** Composite score (0–100) from API health + FTP health + sync health + import queue
- **Display:** Circular gauge or large percentage number
- **Color:** Green > 85, Amber 60–85, Red < 60
- **Sub-label:** "Overall Platform Health"

#### 2.3.16 API Health
- **Data:** API gateway status (operational / degraded / down)
- **Display:** Status indicator + response time (ms)
- **Sub-label:** "REST API Gateway"

#### 2.3.17 FTP Health
- **Data:** FTP/SFTP service status
- **Display:** Status indicator + last successful connection time
- **Sub-label:** "FTP/SFTP Feed Service"

#### 2.3.18 Queue Health
- **Data:** Import queue depth + processing rate (records/min)
- **Display:** Queue count + throughput metric
- **Sub-label:** "Import Queue Depth"
- **Alert:** If queue depth > 10,000 records unprocessed, show warning

#### 2.3.19 Website Status
- **Data:** Connected storefronts status (synced / syncing / failed / pending)
- **Display:** List of connected stores with individual status pills
- **Sub-label:** "Shift4Shop Storefront Connections"
- **Interaction:** Read-only status view

#### 2.3.20 Recent Activities Feed
- **Data:** Last 20 platform events (imports, syncs, validations, errors)
- **Display:** Scrollable activity timeline with timestamp, event type, actor, result
- **Colors:** Error = rose, Success = emerald, Warning = amber, Info = blue
- **Interaction:** Click any event → opens Log Detail view

#### 2.3.21 Today's Alerts
- **Data:** All system alerts generated today
- **Display:** Scrollable list with severity badge (Critical / Warning / Info)
- **Interaction:** Click alert → links to relevant module
- **Count badge:** Shows unacknowledged alert count in header

#### 2.3.22 Health Score Trend Chart
- **Data:** System health score over past 7 days
- **Chart type:** Line chart with area fill
- **X-axis:** Day labels
- **Y-axis:** Score 0–100
- **Color:** Dynamic — green when healthy, transitions to red on dips

#### 2.3.23 Synchronization Activity Chart
- **Data:** Number of sync operations per hour over past 24 hours
- **Chart type:** Area chart (stacked by sync type: inventory, pricing, image, website)
- **X-axis:** Hourly time labels
- **Y-axis:** Operation count
- **Legend:** 4 colored lines per sync type

#### 2.3.24 Supplier Distribution Chart
- **Data:** Products grouped by supplier
- **Chart type:** Donut chart
- **Labels:** Supplier name + SKU count + percentage
- **Interaction:** Hover tooltip shows exact count

#### 2.3.25 Quick Actions (Operations Staff View)
- **View Logs** → navigates to /logs
- **View Monitoring** → navigates to /monitoring
- **View Reports** → navigates to /reports
- **View Validation Queue** → navigates to /validation
- **View Import Queue** → navigates to /import-queue
- **View Sync Jobs** → navigates to /sync/jobs

> **Note:** Operations Staff does NOT see "Trigger Sync", "Add Supplier", or "Create Product" quick actions.

#### 2.3.26 Global Search
- **Scope:** Search across logs, suppliers (read-only), validation items, sync job names
- **Input:** Persistent search bar in header
- **Results:** Grouped by type (Logs, Validation, Jobs)
- **Access:** Available on every page

---

## 3. VALIDATION CENTER MODULE

### 3.1 Purpose

The Validation Center allows Operations Staff to monitor the pre-publication review queue. Products that fail automated validation (missing images, duplicate SKUs, invalid categories, missing prices) appear here for review. Operations Staff **cannot approve or edit** — they can identify, assign, and escalate issues.

### 3.2 Validation Center Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│ SECTION HEADER: "Validation Center" + Escalate Bulk Button           │
├──────────────────────────────────────────────────────────────────────┤
│ KPI CARDS: Pending | In Review | Missing Images | Dup SKU | Missing P│
├──────────────────────────────────────────────────────────────────────┤
│ TABS: Pending Review | In Review | Approved | Rejected | All Items    │
├──────────────────────────────────────────────────────────────────────┤
│ FILTER BAR: Search | Supplier Filter | Error Type Filter              │
├──────────────────────────────────────────────────────────────────────┤
│ ITEM LIST: Checkbox | Product Name | SKU | Errors | Status | [Escalat│
│            ...                                                        │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.3 What Operations Staff Can View

| View | Description |
|---|---|
| Validation Queue | All products awaiting review, sorted by creation date |
| Duplicate Products | Items flagged as duplicate_product |
| Duplicate SKU | Items flagged as duplicate_sku |
| Missing Images | Items flagged as missing_image |
| Missing Categories | Items flagged as invalid_category |
| Missing Prices | Items flagged as missing_price |
| Validation Errors | All error types with severity (error / warning) |

### 3.4 Filters Available

- **Tab Filter:** Pending / In Review / Approved / Rejected / All
- **Search:** By product name, supplier SKU, or supplier name
- **Supplier Filter:** Dropdown of all suppliers
- **Error Type Filter:** missing_image / duplicate_sku / missing_price / invalid_category / missing_description / invalid_attribute

### 3.5 Export

- Export validation queue to CSV (current filter applied)
- Export includes: Product Name, SKU, Supplier, Error Types, Status, Created Date

### 3.6 Escalate Issue (Per Item)

Each validation item row shows an **Escalate** button for operations_staff (instead of Approve/Reject).

**Escalate behavior:**
- Clicking "Escalate" shows a toast: `"Issue for [Product Name] escalated to Catalog Manager."`
- In a production system, this would create an internal ticket or notification to Catalog Manager

### 3.7 Assign Issue (Bulk)

When one or more items are selected via checkbox, the header shows:
- **Escalate N Issues** button → escalates all selected items

### 3.8 View Detail Modal

Clicking any item opens a read-only detail modal containing:
- Product name and supplier SKU
- Validation error list with severity badges
- Review notes textarea (read-only for operations_staff)
- **Escalate to Catalog Manager** button (in modal footer — replaces Approve/Reject)

### 3.9 Restrictions

- ❌ No Approve button
- ❌ No Reject button
- ❌ Cannot edit product fields
- ❌ Cannot move items between validation statuses
- ✅ Can view all items in all tabs
- ✅ Can filter, search, export
- ✅ Can escalate via button

---

## 4. LOGS MODULE

### 4.1 Purpose

The Logs module gives Operations Staff complete visibility into all platform events. Every supplier import, sync operation, API call, FTP transfer, validation action, audit trail, and system event is recorded and searchable here.

### 4.2 Log Types Available to Operations Staff

| Log Type | Description |
|---|---|
| System Logs | Platform-level events: startup, config loads, service status changes |
| Synchronization Logs | Inventory, pricing, image, website sync events and results |
| Inventory Logs | Stock level changes per supplier and product |
| Pricing Logs | Price rule applications, margin calculations, retail price updates |
| Image Logs | Image URL validations, CDN syncs, broken link detections |
| Import Logs | File feed processing events: CSV/XML/Excel ingestion |
| Supplier Logs | Supplier connection events: API auth, FTP auth, feed checks |
| Website Logs | Shift4Shop API calls, product push events, storefront assignments |
| Audit Logs | User actions: login, role changes, permission edits |
| Activity Logs | All platform activity with user attribution |

### 4.3 Log List View

**Table columns:**
- Status icon (error / warning / success / info / debug)
- Timestamp (formatted: YYYY-MM-DD HH:mm:ss)
- Type badge (import / sync / api / ftp / validation / audit / system / error)
- Event Message (truncated with detail tooltip)
- Source Context (supplier name + job ID if applicable)
- Action (View Detail button)

### 4.4 KPI Cards on Logs Page

| Card | Value |
|---|---|
| Total Logged Events | Total log count in current 24h window |
| Errors Logged | Count of level=error logs |
| Warnings | Count of level=warning logs |
| Sync & Import Success | 98.4% (avg success rate — static KPI metric) |

Clicking any card filters the log table to that level.

### 4.5 Quick Filter Tabs

- All Logs
- Errors (level=error)
- Warnings (level=warning)
- Info & System (level=info or level=success)

### 4.6 Filter Bar

- **Search:** By log message, supplier name, job ID, or event type
- **Level Dropdown:** All Levels / Info / Success / Warning / Error / Debug
- **Type Dropdown:** All Types / Import / Sync / API Connection / FTP Connection / Validation / Audit Log / System Status / General Error

### 4.7 Export

- **Export CSV:** Downloads `SupplyBridge_System_Logs_[date].csv`
- **Export JSON:** Downloads `SupplyBridge_System_Logs_[date].json`
- Both exports apply the current active filter

### 4.8 View Log Detail Modal

Clicking the eye icon on any log row opens the Event Diagnostics modal containing:

**Header Section:**
- Level icon + Event type + Level badge

**Event Message Panel:**
- Full event message text

**Diagnostic Details Panel:**
- Pre-formatted monospace code block with full detail/stack trace

**Metadata Grid:**
- Event ID
- Timestamp
- Job ID Reference (if applicable)

**Trigger Context Grid:**
- Target Supplier (or "System" if platform-level)
- Triggered User ID
- IP Address

### 4.9 Refresh Logs

- Refresh button triggers a simulated re-fetch with a toast: "System logs refreshed successfully!"
- Animated spinner on Refresh button while loading

### 4.10 Restrictions

- ❌ Cannot delete any log entries
- ❌ Cannot edit log entries
- ✅ Can search, filter, view, export all logs

---

## 5. MONITORING MODULE

### 5.1 Purpose

The Monitoring module gives Operations Staff a real-time infrastructure and pipeline health view. This is where they identify service degradations, queue backlogs, and resource usage spikes before they cause business impact.

### 5.2 System Health Section

**Overall Health Score:**
- Composite score 0–100
- Displayed as large circular gauge with color transitions
- Score formula: Average of API health + FTP health + sync health + queue throughput

**Status Breakdown:**
- API Gateway status (Operational / Degraded / Down)
- FTP Service status
- Import Queue status
- Synchronization Engine status
- Database connectivity status

### 5.3 API Health Panel

| Metric | Description |
|---|---|
| Status | Operational / Degraded / Down |
| Response Time | Average API response time in ms |
| Error Rate | % of API calls resulting in errors |
| Last Successful Call | Timestamp |
| Endpoints Monitored | List of active endpoint health checks |

### 5.4 FTP Health Panel

| Metric | Description |
|---|---|
| Status | Connected / Disconnected / Error |
| Last File Received | Timestamp of last successful FTP file download |
| Active Connections | Count of current FTP sessions |
| Failed Connections Today | Count |

### 5.5 Import Queue Panel

| Metric | Description |
|---|---|
| Queue Depth | Number of records waiting to process |
| Processing Rate | Records per minute |
| Failed Records Today | Count |
| Oldest Unprocessed Item | Age in minutes |
| Active Processing Jobs | Count |

**Alert threshold:** If queue depth exceeds 10,000 unprocessed records, display critical alert badge.

### 5.6 Synchronization Queue Panel

| Metric | Description |
|---|---|
| Running Jobs | Count of active sync jobs |
| Queued Jobs | Count waiting |
| Failed Jobs Today | Count |
| Average Job Duration | Minutes |

### 5.7 Resource Usage Panel

| Metric | Display Type |
|---|---|
| Memory Usage | Horizontal progress bar + percentage |
| CPU Usage | Horizontal progress bar + percentage |
| Storage Usage | Horizontal progress bar + GB used / GB total |

**Alert thresholds:**
- Memory > 85%: Warning
- CPU > 80%: Warning
- Storage > 90%: Critical

### 5.8 Supplier Health Panel

- Table listing all active suppliers with:
  - Supplier Name
  - Connection Type (API / FTP / CSV)
  - Status badge (connected / disconnected / error / syncing)
  - Last Sync timestamp
  - Error Count (last 24h)

### 5.9 Website Health Panel

- Table listing all connected storefronts with:
  - Store Name
  - Platform (Shift4Shop)
  - Status badge (synced / syncing / failed / pending)
  - Last Sync timestamp
  - Products Published

### 5.10 Health Timeline Chart

- **Chart type:** Multi-line chart
- **Period:** Last 24 hours (hourly data points)
- **Lines:** API Health %, FTP Health %, Sync Health %, Queue Health %
- **X-axis:** Hourly time labels
- **Y-axis:** 0–100 health score
- **Interaction:** Hover tooltip showing exact values at each hour

### 5.11 Alerts and Warnings Panel

- Scrollable list of all active alerts
- Each alert shows:
  - Severity badge (Critical / Warning / Info)
  - Alert message
  - Triggered at timestamp
  - Source (API / FTP / Queue / Sync / Supplier)
- **Critical alerts** displayed with red background highlight
- **Warning alerts** displayed with amber background
- **Info alerts** displayed with blue background

### 5.12 Trend Charts

- **Sync Volume Trend:** Bar chart — number of sync operations per day (last 7 days)
- **Error Rate Trend:** Line chart — error % per day (last 7 days)
- **Queue Throughput Trend:** Area chart — records processed per hour (last 24h)

---

## 6. REPORTS MODULE

### 6.1 Purpose

Reports allow Operations Staff to generate, view, and export structured summaries of platform performance. These reports are used for daily standups, weekly reviews, and management reporting.

### 6.2 Report Types

| Report | Description | Frequency |
|---|---|---|
| Supplier Reports | Supplier connection health, sync frequency, error rates | Daily / Weekly / Monthly |
| Inventory Reports | Stock sync accuracy, out-of-stock events, supplier stock levels | Daily / Weekly |
| Synchronization Reports | Job success rates, durations, failed job breakdown | Daily / Weekly / Monthly |
| Validation Reports | Validation queue volume, error type distribution, approval rates | Weekly / Monthly |
| Website Reports | Storefront product counts, sync success rates, last publish timestamps | Daily / Weekly |
| Error Reports | All errors grouped by type, supplier, and severity | Daily |
| Operations Reports | Combined operational summary for management | Weekly / Monthly |
| Comparison Reports | Period-over-period comparison (this week vs last week) | Weekly / Monthly |

### 6.3 Report Filters

- **Filter by Date:** Date range picker (start date → end date)
- **Filter by Supplier:** Dropdown of all suppliers + "All Suppliers" option
- **Filter by Website:** Dropdown of all connected storefronts + "All Websites" option

### 6.4 Export Options

- **Export PDF:** Full formatted report with charts, tables, and branding
- **Export CSV:** Raw data table for spreadsheet analysis

### 6.5 Report Display Structure

Each report contains:
1. **Summary KPI row** — key metrics at a glance
2. **Time series chart** — trend visualization
3. **Data table** — paginated detailed data
4. **Footer** — generated timestamp and applied filters

---

## 7. DASHBOARD BUSINESS FLOW

### Step-by-Step Daily Operations Workflow

**Step 1: Operations Staff Login**

The operations staff user navigates to the SupplyBridge login page. They enter their credentials or select the Operations Staff role preset to auto-fill the email. The system authenticates the user and loads their role-based permissions. On successful authentication, the system redirects to the Dashboard.

> **RBAC enforcement:** The system only loads navigation items and page modules permitted for the `operations_staff` role.

---

**Step 2: Dashboard**

Upon login, the user lands on the Dashboard. The first action is a visual scan of the entire dashboard:

1. Read the **System Health Score** — is it green (healthy) or red (critical)?
2. Read the **Today's Alerts** count — are there any unresolved alerts?
3. Read the **Connected vs Disconnected Suppliers** count
4. Read the **Failed Jobs Today** count
5. Read the **Pending Validation** count

This initial scan takes 60–90 seconds and gives the user a full picture of platform state.

---

**Step 3: Review Alerts**

If Today's Alerts count > 0, the user clicks through to the Alerts panel:
- Read each alert by severity (Critical first, then Warning, then Info)
- For Critical alerts: immediately escalate to Admin or Integration Manager
- For Warning alerts: add to the daily escalation log
- For Info alerts: note for reporting purposes

---

**Step 4: Review Synchronization Status**

The user reviews the Synchronization Status widget:
- Are all four sync types (Inventory, Pricing, Image, Website) showing "Healthy"?
- If any sync type is showing "Degraded" or "Critical" — navigate to Sync Jobs to investigate
- Check the last sync timestamp for each type — if more than 2 hours behind schedule, escalate

---

**Step 5: Review Running Jobs**

Navigate to the Sync Jobs page:
- Confirm that scheduled jobs are running as expected
- Check job progress bars — any job stuck at the same progress % for > 30 minutes is a concern
- Note any jobs showing `status = 'failed'`

---

**Step 6: Review Failed Jobs**

On the Sync Jobs page, filter to `Failed` tab:
- For each failed job, open the detail modal to read the execution logs
- Determine if the failure is due to: supplier feed issue, API timeout, FTP connection drop, or data error
- Document the failure details
- Escalate to Integration Manager (for API/FTP failures) or Admin (for system failures)
- Operations Staff cannot retry the job — this requires Integration Manager action

---

**Step 7: Review Validation Queue**

Navigate to Validation Center:
- Check the Pending Review count — is it growing or steady?
- Filter to see the error type distribution (which errors are most common today?)
- If pending count > 50 items, escalate to Catalog Manager immediately
- For specific high-priority products stuck in validation, use the Escalate button to flag them

---

**Step 8: Review Logs**

Navigate to Logs:
- Filter to `Errors` tab to see all error-level events from the past 24 hours
- Search for specific supplier names or job IDs related to earlier alerts
- Open detail modals for critical error events to capture full diagnostic information
- Export a log summary CSV for documentation

---

**Step 9: Review Monitoring**

Navigate to Monitoring:
- Check system resource usage (CPU, Memory, Storage) — are any near threshold?
- Review the API and FTP health panels — any degraded endpoints?
- Check the import queue depth — is it processing at normal rate?
- Review the Supplier Health table — are all expected suppliers connected?
- Review the Website Health table — are all storefronts showing `synced` status?

---

**Step 10: Generate Reports**

Navigate to Reports:
- Select today's date range
- Generate Daily Operations Report
- Export as PDF for management distribution
- Export as CSV for internal tracking
- If it is end of week, generate Weekly Summary Report

---

**Step 11: Escalate Issues**

Based on findings from steps 3–9, the user creates an escalation summary:

| Issue | Escalate To | Priority |
|---|---|---|
| Supplier API connection failed | Integration Manager | High |
| FTP feed stopped processing | Integration Manager | High |
| Validation queue growing > 100 items | Catalog Manager | Medium |
| System health score < 70 | Admin | High |
| Storage > 90% | Admin | Critical |
| Failed sync jobs > 5 today | Integration Manager | High |

---

**Step 12: Logout**

At end of session, the user logs out. The system clears the active session token and redirects to the login page.

---

## 8. VALIDATION FLOW

### Complete Workflow: Product Import → Operations Staff Escalation

```
[1] Supplier Feed Received
        ↓
[2] Import Queue Processes File Feed
        ↓
[3] Data Normalization Engine Runs
        ↓
[4] Validation Engine Checks Each Product
     ├── missing_image?
     ├── duplicate_sku?
     ├── invalid_category?
     ├── missing_price?
     ├── missing_description?
     └── invalid_attribute?
        ↓
[5] Products Failing Validation → Validation Queue (status = 'pending')
        ↓
[6] Operations Staff Reviews Validation Queue
     ├── Opens Validation Center
     ├── Reads error type distribution KPI cards
     ├── Filters by error type and supplier
     └── Opens individual product detail modals
        ↓
[7] Issue Identified
     └── Operations Staff reads error details:
          "Missing image for SKU TX-4421 from supplier TechParts International"
        ↓
[8] Assign Issue
     └── Operations Staff selects the item and clicks "Escalate"
          Toast: "Issue for [Product] escalated to Catalog Manager"
        ↓
[9] Catalog Manager Receives Escalation
     └── (In production: notification sent via internal system)
     └── Catalog Manager opens product, fixes data, approves or rejects
        ↓
[10] Product Moved to Approved or Rejected
     └── If approved → published to Master Catalog → synced to storefronts
     └── If rejected → stays in rejected tab for supplier correction
```

**Operations Staff role in this flow:** Monitoring and escalation only. They identify the issue at step 6, escalate at step 8, and verify at step 10 that the count decreased.

---

## 9. MONITORING FLOW

### Complete Workflow: Supplier to Operations Staff Issue Detection

**Stage 1: Supplier**

The supplier system pushes data via REST API or FTP/SFTP. This is an automated process that runs on schedule (e.g., every 2 hours for inventory, daily for full catalog). If the supplier's system is down or their credentials changed, this stage fails silently unless monitored.

**Stage 2: Import**

The import engine receives the file feed and places records into the Import Queue. Each record is processed sequentially. If the import engine encounters malformed data, records are marked as failed. Operations Staff monitors the queue depth and error count on the Import Queue panel in Monitoring.

**Stage 3: Synchronization**

Once imported, the normalization and sync engine processes data:
- Inventory levels are updated in Master Catalog
- Pricing rules are applied
- Image URLs are validated
- Products are assigned to storefronts

If sync jobs fail, they appear as `status = 'failed'` in Sync Jobs. Operations Staff monitors the Running and Failed job counts on the Dashboard and Sync Jobs page.

**Stage 4: Website**

After sync processing, products and updated data are pushed to Shift4Shop storefronts via the REST API. Operations Staff monitors the Website Health panel to confirm all stores show `synced` status with recent timestamps.

**Stage 5: Dashboard**

All the above stages feed into the Dashboard KPIs in real time. Operations Staff reads the consolidated health view without needing to check individual pipeline stages manually.

**Stage 6: Operations Staff Monitoring**

The operations user scans the Dashboard → Monitoring → Sync Jobs → Logs in their daily workflow, as described in Section 7.

**Stage 7: Issue Detection**

An issue is detected when:
- A KPI card shows an unexpected value (e.g., 3 disconnected suppliers instead of 0)
- A system alert appears in the Alerts panel
- A sync job status shows `failed`
- The Monitoring health score drops below threshold
- The import queue depth grows without processing

**Stage 8: Escalation**

Upon detecting an issue, Operations Staff escalates:
- For API/FTP issues → Integration Manager
- For product data issues → Catalog Manager
- For system-level issues (CPU, storage, downtime) → Admin

---

## 10. LOG FLOW

**Step 1: Platform Activity**

Every platform action — sync job execution, product import, API call, user login, validation review — generates a structured log event.

**Step 2: Log Generated**

Each log event is stored with:
- `id`: unique identifier
- `level`: info / success / warning / error / debug
- `type`: system / sync / api / ftp / import / validation / audit
- `message`: human-readable event description
- `details`: full technical diagnostic (stack trace, API response, etc.)
- `timestamp`: ISO 8601 datetime
- `supplierId` / `supplierName`: if applicable
- `jobId`: if generated by a sync job
- `userId`: if triggered by user action
- `ip`: originating IP address

**Step 3: Operations Dashboard**

Logs appear in the Logs module automatically. The page defaults to showing all logs sorted by newest first.

**Step 4: Search**

Operations Staff types in the search box. The system filters in real-time across: message, supplier name, job ID, event type.

**Step 5: Filter**

Operations Staff applies dropdown filters:
- Level filter (e.g., only show "Error" level events)
- Type filter (e.g., only show "FTP Connection" events)
- Combined with the tab filter (e.g., "Errors" tab)

**Step 6: View Details**

Clicking the eye icon on a log row opens the Event Diagnostics modal. The full diagnostic details, metadata, and trigger context are visible here.

**Step 7: Export**

Operations Staff clicks "Export CSV" or "Export JSON" to download the filtered log set for documentation or sharing with management.

**Step 8: Escalate**

If a log reveals a critical issue (e.g., repeated API auth failures from a supplier), the Operations Staff documents the log details and escalates verbally or via internal communication to Integration Manager, sharing the exported log file.

---

## 11. REPORT FLOW

**Step 1: Platform Data**

All platform events, sync results, validation counts, supplier metrics, and job statistics are continuously recorded.

**Step 2: Analytics Engine**

The reporting system aggregates this data into structured report datasets, grouped by date range, supplier, error type, and module.

**Step 3: Reports Module**

Operations Staff navigates to the Reports page and selects the desired report type and date range.

**Step 4: Operations Staff Review**

The report renders in the browser showing:
- Summary KPI row
- Time series chart
- Detailed data table with pagination

**Step 5: Export PDF**

Operations Staff clicks "Export PDF" to generate a formatted report document suitable for management distribution. The PDF includes branding, charts, and all tables.

**Step 6: Export CSV**

Operations Staff clicks "Export CSV" to download raw report data for analysis in Excel or Google Sheets.

**Step 7: Management Distribution**

The exported PDF and CSV files are shared with management as part of the daily / weekly reporting cadence.

---

## 12. NAVIGATION FLOW

### Navigation Items Available to Operations Staff

```
Sidebar Navigation:
├── Dashboard              (/  or /dashboard)
├── Validation Center      (/validation)
├── Sync Jobs              (/sync/jobs)         — view only
├── Import Queue           (/import-queue)      — view only
├── Logs                   (/logs)
├── Monitoring             (/monitoring)
└── Reports                (/reports)
```

**Hidden from Operations Staff:**
- Suppliers, Integrations, Master Catalog, Categories, Brands, Variants, Product Mapping, Inventory Sync, Pricing Sync, Image Sync, Website Sync, Store Management, Users, Roles, Permissions, Settings

### Navigation Step-by-Step

**Login:**
User is authenticated and redirected to Dashboard (`/`). The `ProtectedRoute` component checks `hasPermission('dashboard')` for the `operations_staff` role and renders the page.

**Dashboard to Validation Center:**
User clicks "Validation Center" in sidebar or clicks the "Pending Validation" KPI card. `hasPermission('validation')` is checked → renders ValidationCenter component with role-restricted UI (no Approve/Reject buttons).

**Validation Center to Logs:**
User clicks "Logs" in sidebar. `hasPermission('logs')` is checked → renders Logs component.

**Logs to Monitoring:**
User clicks "Monitoring" in sidebar. `hasPermission('monitoring')` is checked → renders Monitoring component.

**Monitoring to Reports:**
User clicks "Reports" in sidebar. `hasPermission('reports')` is checked → renders Reports component.

**Logout:**
User clicks logout in profile dropdown. `AuthContext.logout()` is called. `localStorage` is updated. User is redirected to Login page.

**Attempting to Access Restricted Page:**
If user manually navigates to `/suppliers` or `/settings`, `ProtectedRoute` detects that `hasPermission('suppliers')` returns `false` for `operations_staff` and redirects to `/403` (AccessDenied page).

---

## 13. PERMISSION MATRIX

### Full Permission Table — Operations Staff

| Module / Action | CAN | CANNOT |
|---|---|---|
| **Dashboard** | | |
| View Dashboard | ✅ | |
| View all KPI widgets | ✅ | |
| View charts and timeline | ✅ | |
| View alerts | ✅ | |
| Trigger Sync (Quick Action) | | ❌ |
| Add Supplier (Quick Action) | | ❌ |
| **Validation Center** | | |
| View Validation Queue | ✅ | |
| View error details | ✅ | |
| Filter and search items | ✅ | |
| Export validation queue | ✅ | |
| Escalate issues | ✅ | |
| Approve products | | ❌ |
| Reject products | | ❌ |
| Edit product data | | ❌ |
| **Logs** | | |
| View all log types | ✅ | |
| Search logs | ✅ | |
| Filter logs | ✅ | |
| View log detail modal | ✅ | |
| Export logs (CSV/JSON) | ✅ | |
| Refresh logs | ✅ | |
| Delete logs | | ❌ |
| **Monitoring** | | |
| View system health | ✅ | |
| View API health | ✅ | |
| View FTP health | ✅ | |
| View resource usage | ✅ | |
| View supplier health | ✅ | |
| View website health | ✅ | |
| View alerts and warnings | ✅ | |
| View trend charts | ✅ | |
| **Sync Jobs** | | |
| View sync job list | ✅ | |
| View job detail modal | ✅ | |
| View job execution logs | ✅ | |
| Trigger new sync job | | ❌ |
| Cancel running job | | ❌ |
| Retry failed job | | ❌ |
| **Import Queue** | | |
| View import queue | ✅ | |
| View import status | ✅ | |
| View error messages | ✅ | |
| Trigger manual import | | ❌ |
| **Reports** | | |
| View all report types | ✅ | |
| Apply date/supplier filters | ✅ | |
| Export PDF | ✅ | |
| Export CSV | ✅ | |
| Delete reports | | ❌ |
| **Restricted Modules** | | |
| Access /suppliers | | ❌ |
| Access /integrations | | ❌ |
| Access /catalog | | ❌ |
| Access /mapping | | ❌ |
| Access /users | | ❌ |
| Access /roles | | ❌ |
| Access /permissions | | ❌ |
| Access /settings | | ❌ |

---

## 14. ACCEPTANCE CRITERIA

### Dashboard Acceptance Criteria

| Widget | Acceptance Criteria |
|---|---|
| Connected Suppliers | Displays correct count of suppliers with status=connected. Updates in real-time. Click filters supplier view. |
| Disconnected Suppliers | Displays correct count of status=disconnected/error. Shows warning badge if > 2. |
| Total Products | Displays total product count from Master Catalog. |
| Pending Validation | Displays count of status=pending or review. Shows escalate badge if > 50. |
| Published Products | Displays count of status=published products. |
| Failed Products | Displays count of failed products. Click navigates to validation filtered to failed. |
| Running Jobs | Shows animated spinner. Count updates live. Click navigates to Sync Jobs filtered to running. |
| Failed Jobs | Shows red badge if > 0. Click navigates to Sync Jobs filtered to failed. |
| System Health Score | Score 0–100. Green > 85, Amber 60–85, Red < 60. |
| API Health | Shows operational/degraded/down. Includes response time. |
| FTP Health | Shows connected/disconnected. Includes last connection time. |
| Sync Activity Chart | Area chart renders with correct data. Hover tooltip shows values. |
| Supplier Distribution | Donut chart renders with correct supplier distribution. |
| Recent Activities | Shows last 20 events. Each event is clickable to log detail. |
| Today's Alerts | Shows all alerts. Critical shown first. Count badge updates. |

### Validation Center Acceptance Criteria

| Feature | Acceptance Criteria |
|---|---|
| Pending count | Matches items with status=pending in dataset |
| Tab filters | Switching tabs correctly filters the item list |
| Search | Real-time filter by product name, SKU, supplier name |
| Supplier dropdown | Populated from actual items in current dataset |
| Error type dropdown | Filters items containing the selected error type |
| Escalate button (per row) | Visible for operations_staff. Hidden Approve/Reject. Shows toast on click. |
| Bulk Escalate | Shown when items selected. Correctly escalates N items via toast. |
| View detail modal | Opens with correct product data. Approve/Reject replaced by Escalate in footer. |
| Export CSV | Downloads file with current filter applied |

### Logs Acceptance Criteria

| Feature | Acceptance Criteria |
|---|---|
| KPI cards | Show correct counts per level. Click filters table. |
| Tab filter | Correctly filters log table by level group |
| Search | Filters in real-time across message, supplier, jobId, type |
| Level dropdown | Correctly filters to selected level |
| Type dropdown | Correctly filters to selected log type |
| Log table rows | Each row shows correct icon, timestamp, type badge, message, source |
| View detail modal | Opens with full event data including diagnostic details |
| Export CSV | Downloads CSV with current filter applied |
| Export JSON | Downloads JSON with current filter applied |
| Refresh button | Adds new simulated log entry. Shows toast. |

### Monitoring Acceptance Criteria

| Feature | Acceptance Criteria |
|---|---|
| System health score | Displays composite score with correct color coding |
| API health panel | Shows correct status and response time metrics |
| FTP health panel | Shows correct connection status |
| Import queue panel | Shows correct depth and processing rate |
| Resource usage bars | CPU, memory, storage render correctly. Alert shown if above threshold. |
| Supplier health table | All suppliers listed with correct status |
| Website health table | All storefronts listed with correct status |
| Health timeline chart | Multi-line chart renders with 24h data. Hover tooltip works. |
| Alerts panel | Critical alerts shown with red background. Warning with amber. |
| Trend charts | Render with correct period data |

### Reports Acceptance Criteria

| Feature | Acceptance Criteria |
|---|---|
| Report type selector | Switching report type loads correct data |
| Date range filter | Correctly filters report data to selected period |
| Supplier filter | Correctly filters to selected supplier |
| KPI summary row | Shows correct aggregated values for period |
| Chart | Renders correctly for selected report type and period |
| Data table | Paginated. Shows correct columns per report type. |
| Export PDF | Generates formatted PDF with all sections |
| Export CSV | Downloads raw data table as CSV |

---

## 15. FUTURE READY ARCHITECTURE

### How Operations Staff Will Monitor Phase 3 and Phase 4 Features

#### 15.1 Order Automation (Phase 3)

When order automation is added to SupplyBridge, Operations Staff will monitor:

- **Order Queue Status** — new KPI card on Dashboard showing pending/processing/completed/failed orders
- **Order Sync Health** — new row in the Synchronization Status widget
- **Order Logs** — new log type `order` added to Logs module filter
- **Order Monitoring Panel** — new section in Monitoring showing order throughput and failure rates

No changes to existing workflows required. The Dashboard KPI grid, Logs module, and Monitoring module are designed to accept new data types by adding new cards, log types, and monitoring panels.

#### 15.2 Shipment Tracking (Phase 3)

Operations Staff will monitor:

- **Shipment Status Indicator** — new KPI card on Dashboard
- **Shipment Sync Logs** — new log type `shipment` in Logs module
- **Carrier Health Panel** — new panel in Monitoring showing carrier API health
- **Shipment Reports** — new report type in Reports module

#### 15.3 Invoices (Phase 3)

Operations Staff will monitor:

- **Invoice Generation Logs** — new log type `invoice` in Logs module
- **Invoice Queue Panel** — in Monitoring, showing invoice generation queue depth
- **Invoice Reports** — new report type in Reports

#### 15.4 Punchout / OCI / cXML / SAP / Oracle (Phase 4)

When B2B procurement integrations are added, Operations Staff will monitor:

- **Punchout Session Logs** — new log type `punchout`
- **Catalog Request Queue** — new monitoring panel for B2B catalog request depth
- **Integration Health Panels** — SAP, Oracle, Coupa, Jaggaer API health indicators in Monitoring
- **B2B Reports** — new report category for procurement volume and error rates

**No changes to the Operations Staff workflow are required.** The existing monitoring loop (Dashboard → Validation → Logs → Monitoring → Reports → Escalate) remains identical. New features are simply added as:

1. New KPI cards on the Dashboard
2. New log types in the Logs module dropdown
3. New monitoring panels in the Monitoring module
4. New report types in the Reports module

The escalation process remains the same regardless of what is being monitored.

---

*Document End — SupplyBridge 05_OPERATIONS_STAFF_PRD.md*  
*Generated for SupplyBridge Platform v2.4*  
*All workflows verified against CLIENT_REQUIREMENTS.md*
