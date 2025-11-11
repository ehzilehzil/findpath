const fakeData = Array.from({ length: 100 }, () => {
  const lon = +(126.90 + Math.random() * 0.20).toFixed(6); // 경도
  const lat = +(37.45 + Math.random() * 0.20).toFixed(6);  // 위도
  return ['a', 'b', 'c', lon, lat, 'g'];
});

console.log(fakeData);