const $ = (id) => document.getElementById(id);
const statusBox = $("status");
const ERP_URL = "https://erp.psit.ac.in/Student/MyAttendanceDetail";

function setStatus(message, type = "") {
  statusBox.textContent = message;
  statusBox.className = "status" + (type ? ` ${type}` : "");
}
function setSyncStatus(message) { $("syncStatus").textContent = message; }
function val(id) { return Number($(id).value); }
function fmt(value, digits = 2) {
  return Number(value).toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

async function syncErp() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url?.startsWith("https://erp.psit.ac.in/")) {
      setStatus("Open the logged-in PSIT ERP attendance page in this tab, then press Sync.", "error");
      setSyncStatus("ERP page not active");
      return;
    }
    if (!tab.url.includes("MyAttendanceDetail")) {
      setStatus("Navigate to Student → My Attendance Detail in ERP first.", "error");
      setSyncStatus("Open My Attendance Detail");
      return;
    }
    setStatus("Reading the current attendance summary…");
    setSyncStatus("Connecting to ERP…");
    chrome.tabs.sendMessage(tab.id, { type: "PSIT_READ_ATTENDANCE" }, (response) => {
      if (chrome.runtime.lastError) {
        setStatus("The page reader is not ready. Refresh the ERP attendance page, then try Sync again.", "error");
        setSyncStatus("Refresh ERP and retry");
        return;
      }
      if (!response?.ok) {
        setStatus(response?.error || "Could not identify all values. You can enter them manually.", "error");
        setSyncStatus("Could not read values");
        return;
      }
      const d = response.data;
      $("lectures").value = d.lectures;
      $("absents").value = d.absents;
      $("oaa").value = d.oaa;
      setStatus("ERP values imported. Check the labels and values, then calculate your plan.", "success");
      setSyncStatus("Values synced from current ERP page");
      calculate();
    });
  } catch {
    setStatus("Could not read the active tab. Refresh ERP and retry.", "error");
    setSyncStatus("Sync failed");
  }
}

function calculate() {
  const lectures = val("lectures"), absents = val("absents"), oaa = val("oaa"), target = val("target");
  if (![lectures, absents, oaa, target].every(Number.isFinite) ||
      !Number.isInteger(lectures) || !Number.isInteger(absents) || !Number.isInteger(oaa) ||
      lectures <= 0 || absents < 0 || oaa < 0 || target <= 0 || target >= 100.0001 || target > 100) {
    setStatus("Enter valid counts. Lectures must be above zero and target must be between 1% and 100%.", "error");
    return false;
  }
  if (oaa > absents) {
    setStatus("OAA is greater than total absences. Check the ERP values before calculating.", "error");
    return false;
  }

  // User's formula: (L - (A - OAA)) / L * 100.
  const effectiveAbsences = absents - oaa;
  const adjustedAttended = lectures - effectiveAbsences;
  const current = (adjustedAttended / lectures) * 100;
  if (current < 0 || current > 100) {
    setStatus("These values produce a percentage outside 0–100%. Please verify the entries.", "error");
    return false;
  }

  // Classes to attend: solve (adjustedAttended + n) / (lectures + n) >= target%.
  const attendNeeded = current >= target ? 0 : Math.max(0,
    Math.ceil((target / 100 * lectures - adjustedAttended) / (1 - target / 100) - 1e-10));

  // Future classes can be missed while attendance remains >= target:
  // (adjustedAttended) / (lectures + m) >= target%.
  // Since adjustedAttended is the currently credited attended count, each future absence adds to denominator only.
  const missAllowed = current < target ? 0 : Math.max(0,
    Math.floor((adjustedAttended / (target / 100)) - lectures + 1e-10));

  $("results").hidden = false;
  $("percentage").textContent = `${fmt(current)}%`;
  $("targetCaption").textContent = `Target ${fmt(target, 1)}%`;
  $("barFill").style.width = `${Math.min(100, Math.max(0, current))}%`;
  $("targetLine").style.left = `${target}%`;
  $("effective").textContent = fmt(effectiveAbsences, 0);
  $("attended").textContent = fmt(adjustedAttended, 0);
  $("needAttend").textContent = attendNeeded === 0 ? "0" : fmt(attendNeeded, 0);
  $("canMiss").textContent = current < target ? "0" : fmt(missAllowed, 0);

  const below = current < target;
  $("badge").textContent = below ? "BELOW TARGET" : "ON TARGET";
  $("badge").className = "badge" + (below ? " below" : "");
  $("resultMessage").textContent = below ? "Let's get back on track." : "You're within your target.";
  $("resultNote").textContent = below
    ? `Attend the next ${attendNeeded} consecutive lectures to reach ${fmt(target, 1)}%, assuming no further absences or OAA changes.`
    : `You are ${(current - target).toFixed(2)} percentage points ${current === target ? "at" : "above"} your target.`;
  $("leaveNote").textContent = below
    ? "You are currently below target, so the safe leave allowance is 0 lectures until you recover. Each future missed lecture reduces attendance."
    : `At this target, you can miss up to ${missAllowed} future lectures before dropping below ${fmt(target, 1)}%, assuming every other lecture is attended and no OAA changes. One college day may contain multiple lectures, so use the day estimate only after checking your timetable.`;

  setStatus("Plan calculated from the values currently shown. Verify the ERP interpretation of OAA.", "success");
  return true;
}

$("syncBtn").addEventListener("click", syncErp);
$("form").addEventListener("submit", (event) => { event.preventDefault(); calculate(); });
$("refreshCalc").addEventListener("click", calculate);
["lectures", "absents", "oaa", "target"].forEach((id) => {
  $(id).addEventListener("change", () => {
    if (!$("results").hidden) calculate();
  });
});

// When popup opens while the user is already on the ERP detail page, fetch immediately.
document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url?.includes("erp.psit.ac.in/Student/MyAttendanceDetail")) syncErp();
});