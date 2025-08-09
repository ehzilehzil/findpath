// 마이크로소프트의 Copilot 이 생성한 tsp 솔버 코드...

// 위도, 경도 이용하여 두 지점 간 거리(Km)를 구하는 함수
// 데이터셋이 [인덱스, 업체명, 주소, 경도, 위도]... 이어야 함...
function haversine(a, b) {
    const R = 6371;
    const toRad = deg => deg * Math.PI / 180;
    const dLat = toRad(b[4] - a[4]); // 위도
    const dLng = toRad(b[3] - a[3]); // 경도
    const lat1 = toRad(a[4]);
    const lat2 = toRad(b[4]);

    const aVal = Math.sin(dLat / 2) ** 2 +
                Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
    return R * c;
}

// Nearest Neighbor TSP
function solveTSP(cities) {
    if (cities.length === 0) return []; // 빈 배열 처리

    const visited = new Array(cities.length).fill(false);
    const path = [];
    let current = 0;
    visited[current] = true;
    path.push(cities[current]);

    for (let i = 1; i < cities.length; i++) {
    let nearest = -1;
    let minDist = Infinity;
    for (let j = 0; j < cities.length; j++) {
        if (!visited[j]) {
            const dist = haversine(cities[current], cities[j]);
            if (dist < minDist) {
                minDist = dist;
                nearest = j;
            }
        }
    }
    visited[nearest] = true;
    path.push(cities[nearest]);
    current = nearest;
    }

    return path;
}

// 사용법 예시
// const result = solveTSP(cities);
// console.log("방문 순서:");
// result.forEach((city, i) => {
//     console.log(`${i + 1}. [${city[0]}] ${city[1]} - ${city[2]}`);
// });