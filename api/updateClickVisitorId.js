window.addEventListener("beforeunload", async () => {
  const visitEnd = new Date().toISOString();
  const sessionId = sessionStorage.getItem("session_id");
  const referrer = document.referrer || "direct";
  const visitorId = await saveVisitData(
    visitStart,
    sessionId,
    visitEnd,
    referrer
  ); // Получаем visitor_id после завершения сессии

  // Обновляем все клики с временным идентификатором
  updateClicksWithVisitorId(visitorId, sessionId);
});

async function updateClicksWithVisitorId(visitorId, sessionId) {
  try {
    const response = await fetch("/api/updateClickVisitorId", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, sessionId }),
    });

    if (response.ok) {
      console.log("Clicks updated successfully");
    } else {
      console.error("Failed to update clicks");
    }
  } catch (error) {
    console.error("Error updating clicks:", error);
  }
}
