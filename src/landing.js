document.addEventListener('DOMContentLoaded', () => {
  const matchmakeButton = document.getElementById('matchmake-btn');

  if (matchmakeButton) {
    matchmakeButton.addEventListener('click', () => {
      // TODO: Connect API call to your matchmaking service.
      // Simulate finding a match and redirecting.
      console.log('Finding a match...');

      // Placeholder for matchmaking logic
      // In the future, this will be an async operation,
      // and the redirect would happen on success.
      // ex., findMatch().then(matchDetails => {
      //   window.location.href = `editor.html?matchId=${matchDetails.id}`;
      // });

      // Simulate a search.
      matchmakeButton.textContent = 'Searching...';
      matchmakeButton.disabled = true;

      setTimeout(() => {
        console.log('Match found! Redirecting to editor...');
        window.location.href = 'editor.html';
      }, 1500);
    });
  } else {
    console.error('Matchmake button not found!');
  }
});