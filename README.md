# PSIT Attendance — Glass Edition

Version 3.0.0. Chrome Manifest V3 extension with an Apple-inspired system font stack, glassmorphism surfaces, live ERP summary import, target planner and leave allowance estimate.

## Install locally
1. Extract `psit-attendance-glass.zip`.
2. Open `chrome://extensions`.
3. Enable Developer mode.
4. Click Load unpacked and select the `psit-attendance-glass` folder containing `manifest.json`.
5. Sign in to PSIT ERP and open `Student/MyAttendanceDetail`.
6. Click the extension. When opened on the attendance page, it attempts to sync automatically; otherwise press **Sync**.

## Formula
`current attendance = (L - (A - OAA)) / L * 100`

Example: L = 612, A = 105, OAA = 45 gives 90.20%.

## Target planner
- **Classes to attend** estimates consecutive classes needed to reach the target, assuming all are attended and no OAA/absence changes occur.
- **Possible classes to miss** estimates how many future lectures can be missed while staying at or above target, assuming all other future lectures are attended.
- Days are not calculated from lectures alone because the number of lectures per day varies by timetable. Convert lecture allowance to days only using the student's real timetable.

## Data and permissions
- Calculations run locally in the popup.
- No ERP password is collected and attendance data is not sent to a backend.
- The content script is limited to the PSIT ERP attendance detail page.
- The extension uses `activeTab`, `tabs`, and ERP host access for reading the active page.

## Accuracy and rollout cautions
The reader matches visible text labels, including `Total Absent + OAA` and `O.A. Attendance` from the supplied screenshot. ERP wording/layout may differ by student or change over time. Confirm imported values and OAA interpretation against the official ERP percentage before relying on leave estimates. The official ERP page has not been programmatically inspected or tested across multiple accounts as part of this package.

Before college-wide release, test across representative accounts, verify the formula with PSIT, create a privacy policy/support channel, and publish through the Chrome Web Store or college-managed Chrome policies. This is an unofficial student utility, not affiliated with PSIT.


## Branding assets
- `logo.png` is used in the popup header.
- `icons/icon16.png`, `icons/icon48.png`, and `icons/icon128.png` are used by Chrome's extension UI and store listing.
- Popup width is set to 360px with rounded glass styling. Chrome controls the outer browser popup frame, so the visible rounded treatment is applied inside the popup document.
