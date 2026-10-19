# PSIT Attendance

A lightweight Chrome extension that helps students understand and plan
their PSIT attendance. It provides a compact, glassmorphism-inspired
popup, imports attendance figures from the logged-in PSIT ERP attendance
detail page when possible, calculates the current attendance percentage,
and estimates how many future lectures a student needs to attend or can
miss to reach or maintain a target.

> **Important:** This is an unofficial student utility and is not
> affiliated with or endorsed by PSIT. Verify all imported figures and
> calculations against the official ERP before making attendance
> decisions.

## Table of Contents

-   [Overview](#overview)
-   [Key Features](#key-features)
-   [How the Application Works](#how-the-application-works)
-   [Attendance Formula](#attendance-formula)
-   [Target Planner](#target-planner)
-   [Technology Stack](#technology-stack)
-   [Project Structure](#project-structure)
-   [Installation and Local Testing](#installation-and-local-testing)
-   [How to Use](#how-to-use)
-   [Privacy and Permissions](#privacy-and-permissions)
-   [Accuracy, Limitations, and Responsible
    Use](#accuracy-limitations-and-responsible-use)
-   [Troubleshooting](#troubleshooting)
-   [Roadmap](#roadmap)
-   [Contributing](#contributing)
-   [License](#license)

## Overview

**PSIT Attendance --- Glass Edition** is a Manifest V3 browser extension
designed to make attendance information easier to review without
repeatedly calculating percentages by hand.

The extension is intended to work with the student's existing
authenticated PSIT ERP session. When the student opens the supported
attendance detail page and launches the extension, it attempts to read
relevant visible attendance values from that page. The popup then uses
those values to calculate attendance and provide a target-based lecture
plan.

The application is designed around three principles:

1.  **Convenience:** reduce manual entry when attendance values can be
    imported.
2.  **Transparency:** show the values and assumptions used for
    estimates.
3.  **Privacy:** perform calculations locally in the extension without
    requiring an application backend or collecting the ERP password.

## Key Features

### Live ERP attendance import

-   Supports the PSIT ERP attendance detail page at
    `https://erp.psit.ac.in/Student/MyAttendanceDetail`.
-   Attempts to read attendance information from visible page text using
    a content script.
-   Offers a manual **Sync** action when automatic synchronization is
    unavailable.
-   Import depends on the ERP page being open, authenticated, and
    compatible with the reader's expected labels and layout.

### Attendance percentage calculator

-   Calculates the current attendance percentage from lecture, absence,
    and OAA values.
-   Updates the result when the values or target are changed in the
    popup.
-   Helps students compare their imported or entered values with the
    official ERP figure.

### Target attendance planner

-   Estimates the consecutive lectures that must be attended to reach a
    selected target percentage.
-   Estimates how many future lectures may be missed while staying at or
    above the target, under stated assumptions.
-   Uses lecture counts rather than assuming a fixed number of lectures
    per day.

### Compact glassmorphism interface

-   Small popup designed around a 360-pixel width.
-   Rounded surfaces, translucent visual treatments, subtle shadows, and
    warm accent colors.
-   Apple-inspired system font stack that uses fonts available on the
    user's operating system.
-   Reduced-motion support where defined by the interface styles.
-   Branded assets for the popup and Chrome extension UI.

### Chrome-native installation

-   Uses Chrome's Manifest V3 extension format.
-   Can be loaded locally in developer mode.
-   Can be packaged for submission to the Chrome Web Store after testing
    and completion of the required store disclosures.

## How the Application Works

1.  The student signs in to the PSIT ERP in Chrome.
2.  The student opens the attendance detail page.
3.  The extension's content script runs on the supported page and
    attempts to identify attendance values from visible text.
4.  The popup requests the available values and fills the corresponding
    fields when a compatible summary is found.
5.  The popup calculates the attendance percentage and updates the
    target-planning estimates.
6.  If automatic import does not work, the student can use **Sync**
    again or enter the values manually, if those fields are available in
    the current UI.

The extension is not an ERP login tool. It does not ask for the
student's ERP password.

## Attendance Formula

The current calculation is:

``` text
effective absences = A - OAA
adjusted attended lectures = L - effective absences

attendance percentage = (adjusted attended lectures / L) × 100
```

Where:

-   `L` = total lectures considered by the calculator.
-   `A` = absence value used by the calculator.
-   `OAA` = On-duty/other attendance adjustment value recognized by the
    calculator.

The compact formula is:

``` text
attendance = (L - (A - OAA)) / L × 100
```

### Example

Given:

``` text
L = 612
A = 105
OAA = 45
```

Then:

``` text
effective absences = 105 - 45 = 60
adjusted attended lectures = 612 - 60 = 552
attendance = (552 / 612) × 100 ≈ 90.20%
```

**Formula warning:** The meaning of each ERP field must be confirmed. If
the ERP's absence field already includes or excludes OAA, subtracting
OAA again could produce an incorrect result. Always compare the
extension's output with the official ERP percentage before relying on
it.

## Target Planner

The target planner is an estimate based on the currently entered or
imported figures and a selected target percentage.

### Classes to attend

When current attendance is below the selected target, the extension
estimates the number of consecutive future lectures that must be
attended, assuming:

-   Every future lecture is attended.
-   No new absences or OAA adjustments occur.
-   The lecture total increases by one for each future lecture.

### Possible classes to miss

When the student is at or above the target, the extension estimates how
many future lectures can be missed while remaining at or above that
target, assuming:

-   Every other future lecture is attended.
-   No OAA adjustment or other special attendance rule changes the
    calculation.
-   The same attendance formula remains valid.

These figures are **lecture estimates, not day estimates**. A student's
daily timetable may contain different numbers of lectures, so a reliable
number of leave days cannot be inferred from lecture counts alone.

## Technology Stack

-   **Chrome Extensions:** Manifest V3
-   **Frontend:** HTML, CSS, and JavaScript
-   **Page integration:** Chrome content script
-   **Design:** CSS glassmorphism and system-font typography
-   **Data processing:** client-side JavaScript calculations
-   **External backend:** not required for the current calculator
    workflow

## Project Structure

``` text
psit-attendance-glass/
├── manifest.json       # Extension metadata, permissions, icons, and entry points
├── popup.html          # Popup interface
├── popup.css           # Popup styling and responsive visual treatment
├── popup.js            # Calculator, target planner, and popup behavior
├── content.js          # Reads supported attendance text from the ERP page
├── logo.png            # Popup branding image
├── icons/
│   ├── icon16.png      # Small Chrome toolbar icon
│   ├── icon48.png      # Extension management icon
│   └── icon128.png     # Large extension/store icon
└── README.md           # Project documentation
```

## Installation and Local Testing

### Requirements

-   Google Chrome or a compatible Chromium-based browser.
-   A PSIT ERP account to test live import.
-   The extension project files extracted into a local folder.

### Load the extension

1.  Download and extract the project ZIP.
2.  Open `chrome://extensions` in Chrome.
3.  Enable **Developer mode**.
4.  Click **Load unpacked**.
5.  Select the extracted project folder containing `manifest.json`.
6.  Sign in to the PSIT ERP.
7.  Open the attendance detail page.
8.  Click the PSIT Attendance extension icon and test the displayed
    values.

### Reload after code changes

After modifying the extension files:

1.  Return to `chrome://extensions`.
2.  Click **Reload** on the PSIT Attendance extension card.
3.  Refresh the ERP attendance page if you changed `content.js`.
4.  Reopen the popup and repeat the test.

## How to Use

1.  Sign in to PSIT ERP normally.
2.  Navigate to the attendance detail page.
3.  Open the extension popup.
4.  Check that imported lecture, absence, and OAA values match the
    official ERP.
5.  If necessary, use **Sync** to retry importing the values.
6.  Select the attendance target you want to plan around.
7.  Review the current attendance percentage and lecture estimates.
8.  Recheck the official ERP before making attendance or leave
    decisions.

Do not treat the extension as an official attendance record or as a
guarantee that a particular absence will be permitted.

## Privacy and Permissions

The current design is intended to keep attendance processing on the
user's device.

-   **No ERP password collection:** students authenticate directly with
    the official ERP.
-   **No application backend required:** the current calculation flow
    does not need a server.
-   **Local calculation:** attendance and target estimates are
    calculated in the popup.
-   **Restricted page matching:** the content script is configured for
    the supported ERP attendance detail URL.
-   **No intentional attendance upload:** the current design does not
    send attendance values to a developer-controlled backend.

### Manifest permissions

The manifest requests:

-   `activeTab` --- access to the active tab in supported user
    interactions.
-   `tabs` --- identify the active tab and its URL for synchronization
    behavior.
-   `https://erp.psit.ac.in/*` host access --- enable the extension's
    content script to run on the PSIT ERP domain as configured.

Permissions should be reviewed against the actual code before release.
The Chrome Web Store listing must accurately disclose the extension's
behavior, data handling, and permissions. If future versions add
analytics, cloud storage, authentication, or a backend, update the
privacy disclosures and documentation accordingly.

## Accuracy, Limitations, and Responsible Use

-   The ERP reader relies on visible text and expected labels; changes
    in ERP markup, wording, or page layout may break synchronization.
-   The extension has not been verified across all student accounts or
    every possible ERP layout.
-   The interpretation of `Total Absent + OAA` and `O.A. Attendance`
    must be confirmed against the official ERP calculation.
-   A successful import does not automatically prove that the values are
    interpreted correctly.
-   The target planner assumes a consistent attendance formula and the
    future-attendance scenarios described above.
-   The extension does not determine college policy, attendance
    eligibility, or whether leave will be approved.
-   The extension is an unofficial student utility and is not affiliated
    with PSIT.

Before a broad rollout, test with consenting students whose ERP layouts
represent the expected variations, compare results with the official ERP
percentage, and resolve discrepancies before publishing.

## Troubleshooting

### Attendance does not import

-   Make sure you are signed in to the ERP.
-   Open the exact attendance detail page supported by the extension.
-   Refresh the ERP page and reopen the popup.
-   Press **Sync**.
-   Confirm that the current ERP page displays the attendance labels
    expected by the content script.

### The percentage differs from the ERP

-   Verify the lecture, absence, and OAA values.
-   Check whether the ERP counts OAA in the same way assumed by the
    extension.
-   Confirm the formula with the official ERP calculation.
-   Do not rely on leave estimates until the discrepancy is understood.

### The icon or interface does not update

-   Confirm that all icon files referenced by `manifest.json` exist.
-   Reload the extension from `chrome://extensions`.
-   Refresh the ERP page after reloading the extension.

## Roadmap

Potential improvements include:

-   Validate ERP field extraction against representative page layouts.
-   Add clearer import status and field-level validation.
-   Add unit tests for percentage and target-planning calculations.
-   Provide an accessible settings panel for target percentage.
-   Add a privacy policy and a support contact before public release.
-   Test the packaged extension and submit it through the Chrome Web
    Store review process.

## Contributing

Contributions are welcome. For a useful bug report, include:

-   Browser and extension version.
-   A description of the issue and steps to reproduce it.
-   Whether the official ERP percentage differs from the extension.
-   A redacted screenshot or sample page text when necessary.

**Never submit ERP passwords, session cookies, student IDs, or
unredacted personal attendance information in issues or pull requests.**


