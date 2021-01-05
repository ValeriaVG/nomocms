export const ip2num = (ip: string) => {
  const p = ip.split(".");
  if (p.length !== 4) return 0;
  return p.reduce((a, c, i) => {
    const num = parseInt(c);
    return a + Math.pow(256, 3 - i) * num;
  }, 0);
};
export const num2ip = (num: number) => {
  const p = [];
  let v = num;
  for (let i = 0; i < 4; i++) {
    const k = Math.pow(256, 3 - i);
    p[i] = Math.floor(v / k);
    v = v % k;
  }
  return p.join(".");
};
