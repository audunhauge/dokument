// @ts-check


export function curry(func) {
    return function curried(...args) {
      if (args.length >= func.length) {
        return func.apply(this, args);
      } else {
        return function (...args2) {
          return curried.apply(this, args.concat(args2));
        }
      }
    };
  }
  export const compose = (...fns) => x => fns.reduceRight((y, f) => f(y), x);
  
  export const $ = id => document.getElementById(id);
  export const create = tag => document.createElement(tag);
  export const qs = rule => document.querySelector(rule);
  export const qsa = rule => document.querySelectorAll(rule);
  export const fill = (selector, v) => qsa(selector).forEach(e => e.innerHTML = String(v));
  export const wipe = (selector) => fill(selector, '');

  export const range = (lo, hi, step = 1) => {
    // range(1,10,1) => [1,2,3,4,5,6,7,8,9]
    // range(1,4,0.1) => [1.0, 1.1, 1.2, 1.3 .. 3.9]
    hi = Number(hi);
    lo = Number(lo);
    step = step === 0 || isNaN(step) ? 1 : step;
    let list = [],
        i = lo;
    if (hi <= lo) return list;
    while (i < hi) {
        list.push(Number(i.toFixed(2)));
        i += step;
    }
    return list;
}