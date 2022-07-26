// domain 만 수정
let domain = "haein-sidee.click";
// export const paddr = `http://${domain}/`;
export const paddr = `https://${domain}/`;
// export const reqHeaders = { };
export const reqHeaders = { withCredentials: true, origin: "https://d1cbkw060yb1pg.cloudfront.net" };
