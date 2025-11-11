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
