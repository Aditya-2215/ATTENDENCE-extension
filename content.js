(() => {
  const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();

  function getValue(text, regexes) {
    for (const regex of regexes) {
      const m = text.match(regex);
      if (m) {
        const n = Number(String(m[1]).replace(/,/g, ""));
        if (Number.isFinite(n)) return n;
      }
    }
    return null;
  }

  function readAttendance() {
    const bodyText = clean(document.body?.innerText || "");
    // Recognize the labels shown in the supplied PSIT ERP screenshot.
    const lectures = getValue(bodyText, [
      /Total\s*Lecture\s*:?\s*([\d,]+)/i,
      /Total\s*Lectures?\s*(?:Conducted)?\s*:?\s*([\d,]+)/i
    ]);
    const absents = getValue(bodyText, [
      /Total\s*Absent\s*\+\s*OAA\s*:?\s*([\d,]+)/i,
      /Total\s*Absents?\s*:?\s*([\d,]+)/i,
      /Total\s*Absent\s*:?\s*([\d,]+)/i
    ]);
    const oaa = getValue(bodyText, [
      /O\.?\s*A\.?\s*Attendance\s*:?\s*([\d,]+)/i,
      /Total\s*OAA\s*(?:\([^)]*\))?\s*:?\s*([\d,]+)/i,
      /OAA\s*Attendance\s*:?\s*([\d,]+)/i
    ]);
    const official = getValue(bodyText, [
      /Attendance\s*%\s*without\s*PF\s*:?\s*([\d.]+)\s*%?/i,
      /Attendance\s*without\s*PF\s*:?\s*([\d.]+)\s*%?/i
    ]);

    if (lectures === null || absents === null || oaa === null) {
      return { ok: false, error: "The extension could not identify all required ERP fields. Enter values manually; no information was uploaded." };
    }
    return { ok: true, data: { lectures, absents, oaa, officialAttendance: official } };
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "PSIT_READ_ATTENDANCE") sendResponse(readAttendance());
    return false;
  });
})();