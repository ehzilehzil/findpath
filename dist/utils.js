// 마이크로소프트의 Copilot 이 생성한 tsp 솔버 코드...

// json 객체가 너무 복잡하고 깊을 때, 특정 키값의 밸류만 모두 모아주는 기특한 함수...
function collectValuesByKey(obj, targetKey) {
    const results = [];

    function recurse(value) {
        if (Array.isArray(value)) {
        value.forEach(item => recurse(item));
        } else if (typeof value === 'object' && value !== null) {
        for (const key in value) {
            if (key === targetKey) {
            results.push(value[key]);
            }
            recurse(value[key]);
        }
        }
    }

    recurse(obj);
    return results;
}