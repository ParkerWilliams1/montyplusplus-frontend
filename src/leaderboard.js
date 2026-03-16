// document.addEventListener('DOMContentLoaded', async () => {
//     const container = document.getElementById('leaderboard-table');

//     try {
//         const response = await fetch('http://localhost/api/leaderboard');

//         if (!response.ok) {
//             throw new Error('Failed to fetch leaderboard');
//         }

//         const data = await response.json();

//         if (!data.length) {
//             container.innerHTML = "<p>No players ranked yet.</p>";
//             return;
//         }

//         container.innerHTML = '';

    //     data.forEach((player, index) => {
    //     const row = document.createElement('div');
    //     row.className = 'leaderboard-row';
    //     const winRate = player.wins + player.losses === 0
    //         ? 0
    //         : Math.round((player.wins / (player.wins + player.losses)) * 100);

    //     row.innerHTML = `
    //         <div class="rank">#${index + 1}</div>
    //         <div class="username">${player.name}</div>
    //         <div class="score">
    //             ${player.wins}W - ${player.losses}L
    //         <span style="color:#888; margin-left:10px;">(${winRate}%)</span>
    //         </div>
    //     `;

    //     container.appendChild(row);
    // });

//     } catch (error) {
//         console.error(error);
//         container.innerHTML = "<p>Failed to load leaderboard.</p>";
//     }
// });


document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('leaderboard-table');

    // 🔥 Fake data for testing UI
    const data = [
        { name: "Oli", wins: 12, losses: 3 },
        { name: "CodeWarrior", wins: 10, losses: 5 },
        { name: "BugSlayer", wins: 8, losses: 4 },
        { name: "StackDestroyer", wins: 6, losses: 7 },
        { name: "NullPointer", wins: 4, losses: 6 }
    ];

    container.innerHTML = '';

    data.forEach((player, index) => {
        const row = document.createElement('div');
        row.className = 'leaderboard-row';
        const winRate = player.wins + player.losses === 0
            ? 0
            : Math.round((player.wins / (player.wins + player.losses)) * 100);

        row.innerHTML = `
            <div class="rank">#${index + 1}</div>
            <div class="username">${player.name}</div>
           <div class="score">
            ${player.wins}W - ${player.losses}L
            <span style="color:#888; margin-left:10px;">(${winRate}%)</span>
            </div>
        `;

        container.appendChild(row);
    });
});