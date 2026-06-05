const Utils = {
  rand(min, max) { return Math.random() * (max - min) + min; },
  randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
  dist(a, b) { const dx=a.x-b.x, dy=a.y-b.y; return Math.sqrt(dx*dx+dy*dy); },
  formatTime(ms) {
    const s = Math.floor(ms / 1000);
    return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  },
  weightedRandom(items) {
    const total = items.reduce((s,i) => s+i.weight, 0);
    let r = Math.random() * total;
    for (const item of items) { r -= item.weight; if (r <= 0) return item; }
    return items[items.length-1];
  },
};
