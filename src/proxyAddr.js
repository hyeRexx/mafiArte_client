// domain 만 수정
let domain = "marfiarte.click";
// export const paddr = `http://${domain}/`;
export const paddr = `https://${domain}/`;
// export const reqHeaders = { };
export const reqHeaders = { withCredentials: true, origin: "https://d2wm85v592lxtd.cloudfront.net" };
