document.addEventListener('DOMContentLoaded', () => {
  const matchmakeButton = document.getElementById('matchmake-btn');
  if (!matchmakeButton) return;

  let searching = false;

  async function attemptMatchmake() {
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        alert("You must sign in first.");
        window.location.href = "signin.html";
        return;
      }

      const response = await fetch("http://13.59.169.35/api/matchmake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Matchmaking response:", data);

      if (data.status === "waiting") {
        // Keep searching
        setTimeout(attemptMatchmake, 3000);
      } 
      else if (data.status === "matched") {
        searching = false;

        matchmakeButton.disabled = false;
        matchmakeButton.textContent = "Find a Match";

        window.location.href = `./editor.html?matchId=${data.matchId}`;
      }

    } catch (err) {
      console.error("Matchmaking error:", err);

      searching = false;
      matchmakeButton.disabled = false;
      matchmakeButton.textContent = "Find a Match";

      alert("Could not connect to matchmaking server.");
    }
  }

  matchmakeButton.addEventListener('click', () => {
    if (searching) return;

    searching = true;
    matchmakeButton.textContent = "Searching...";
    matchmakeButton.disabled = true;

    attemptMatchmake();
  });
});