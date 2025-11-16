// 웹워커로 작동시킴...
self.onmessage = function(e) {
  const { tar } = e.data;
  console.log(tar);
  const r = solveTSP(tar);
  
  self.postMessage(r);
};








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




// 3.0 MTSP 위한 K-means 클러스터링
function kMeansGeo(data, k, maxIter = 100) {
  k = Math.min(k, data.length); // k 제한

  // 초기 중심점 무작위 선택
  const centroids = Array.from({ length: k }, () => {
    const point = data[Math.floor(Math.random() * data.length)];
    return [point[3], point[4]]; // [x, y]
  });

  let labels = new Array(data.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    // 각 점에 가장 가까운 중심점 할당
    labels = data.map(([,,, x, y]) => {
      let minDist = Infinity;
      let label = 0;
      centroids.forEach(([cx, cy], idx) => {
        const dist = Math.hypot(x - cx, y - cy);
        if (dist < minDist) {
          minDist = dist;
          label = idx;
        }
      });
      return label;
    });

    // 중심점 업데이트
    const sums = Array(k).fill().map(() => [0, 0, 0]); // [sumX, sumY, count]
    data.forEach(([,,, x, y], i) => {
      const label = labels[i];
      sums[label][0] += x;
      sums[label][1] += y;
      sums[label][2]++;
    });

    centroids.forEach((_, i) => {
      const [sumX, sumY, count] = sums[i];
      if (count > 0) {
        centroids[i] = [sumX / count, sumY / count];
      } else {
        // 빈 클러스터 → 랜덤 재배치
        const randomPoint = data[Math.floor(Math.random() * data.length)];
        centroids[i] = [randomPoint[3], randomPoint[4]];
      }
    });
  }

  // 결과: 클러스터별 인덱스 배열
  const clusters = Array(k).fill().map(() => []);
  labels.forEach((label, i) => {
    clusters[label].push(i);
  });

  return clusters;
}

// 평균 좌표 계산 함수
function average(data, indices) {
  const sum = indices.reduce((acc, idx) => {
    acc[0] += data[idx][3]; // x
    acc[1] += data[idx][4]; // y
    return acc;
  }, [0, 0]);
  const count = indices.length || 1;
  return [sum[0] / count, sum[1] / count];
}

// 빈 그룹 보정 함수
function enforceKGroups(clusters, k, data) {
  for (let i = 0; i < k; i++) {
    if (clusters[i].length === 0) {
      // 가장 큰 그룹 찾기
      const largest = clusters.reduce((max, group, idx) =>
        group.length > clusters[max].length ? idx : max, 0
      );

      // 가장 먼 점 선택 (초기값 명시)
      const centroid = [0, 0]; // 빈 그룹일 경우 기본값
      const farthest = clusters[largest].reduce((farthestIdx, currIdx) => {
        const curr = data[currIdx];
        const dist = Math.hypot(curr[3] - centroid[0], curr[4] - centroid[1]);
        const farthestDist = Math.hypot(data[farthestIdx][3] - centroid[0], data[farthestIdx][4] - centroid[1]);
        return dist > farthestDist ? currIdx : farthestIdx;
      }, clusters[largest][0]);

      // 점 이동
      clusters[i].push(farthest);
      clusters[largest] = clusters[largest].filter(idx => idx !== farthest);
    }
  }
  return clusters;
}


// 실행
function kMeans(tar, k) {
    const rawClusters = kMeansGeo(tar, k);
    return enforceKGroups(rawClusters, Math.min(tar.length, k), tar);    
}
