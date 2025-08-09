// 마이크로소프트의 Copilot 이 생성한 tsp 솔버 코드...

// 위도, 경도 이용하여 두 지점 간 거리(Km)를 구하는 함수
// 데이터셋이 [인덱스, 업체명, 주소, 경도, 위도]... 이어야 함...
// Haversine 거리 계산 (위도/경도 기반 거리)
function haversineDistance(a, b) {
  const toRad = deg => deg * Math.PI / 180;
  const R = 6371; // 지구 반지름 (km)
  const dLat = toRad(b[4] - a[4]);
  const dLng = toRad(b[3] - a[3]);
  const lat1 = toRad(a[4]);
  const lat2 = toRad(b[4]);

  const aVal = Math.sin(dLat / 2) ** 2 +
               Math.cos(lat1) * Math.cos(lat2) *
               Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
  return R * c;
}

// Nearest Neighbor 초기 경로 생성
function nearestNeighbor(cities) {
  const visited = new Array(cities.length).fill(false);
  const path = [0]; // 시작점은 첫 번째 도시
  visited[0] = true;

  for (let i = 1; i < cities.length; i++) {
    const last = cities[path[path.length - 1]];
    let nearest = -1;
    let minDist = Infinity;

    for (let j = 0; j < cities.length; j++) {
      if (!visited[j]) {
        const dist = haversineDistance(last, cities[j]);
        if (dist < minDist) {
          minDist = dist;
          nearest = j;
        }
      }
    }

    path.push(nearest);
    visited[nearest] = true;
  }

  return path;
}

// 2-opt 경로 최적화
function twoOpt(path, cities) {
  let improved = true;

  while (improved) {
    improved = false;

    for (let i = 1; i < path.length - 2; i++) {
      for (let j = i + 1; j < path.length - 1; j++) {
        const A = cities[path[i - 1]];
        const B = cities[path[i]];
        const C = cities[path[j]];
        const D = cities[path[j + 1]];

        const currentDist = haversineDistance(A, B) + haversineDistance(C, D);
        const newDist = haversineDistance(A, C) + haversineDistance(B, D);

        if (newDist < currentDist) {
          path = path.slice(0, i).concat(path.slice(i, j + 1).reverse(), path.slice(j + 1));
          improved = true;
        }
      }
    }
  }

  return path;
}

// 전체 실행 함수
function solveTSP(cities) {
  let initialPath = nearestNeighbor(cities);
  let optimizedPath = twoOpt(initialPath, cities);

  return optimizedPath.map(i => cities[i]);
}