// @ts-check

import { range } from './util.js';

// @ts-ignore
const md = new remarkable.Remarkable("full", { html: true });

let skipwords;
const wordlist = {
    a: {}, b: {}, c: {}, d: {}, e: {}, f: {}, g: {}, h: {},
    i: {}, j: {}, k: {}, l: {}, m: {}, n: {}, o: {}, p: {}, q: {},
    r: {}, s: {}, t: {}, u: {}, v: {}, w: {}, x: {}, y: {}, z: {}, A: {},
    æ: {}, ø: {}, å: {}
};

const relations = {};

export function show(node, div) {
    console.log(node);
    const list = links.filter(n => n.target.id === node.id || n.source.id === node.id);
    const words = new Set(list.map(e => e.words).flat());
    if (lookup[node.id] !== undefined) {
        const inner = md.render(text[lookup[node.id]].t);
        const hilit = inner.replace(/([A-Z_a-zæøåÆÅØ]+)([-+.<>{},;\[\]:() *\f\n\r\t\v\u00A0\u2028\u2029])/g, function (m, wo,sep) {
            if (words.has(wo) && ! supressed.has(wo)) {
                return `<span class="linked">${wo}</span>${sep}`
            }
            return m;
        })
        div.innerHTML = hilit;
    } else {
        div.innerHTML = "NO TEXT";
    }
}

let text;
let links;
let supressed;
const lookup = {};


export async function setup() {
    const dex = await getBase();
    const names = range(1, 16).map(n => `d${n}`);
    const docs = await Promise.allSettled(names.map(n => readFile(n + '.md')));
    // @ts-ignore
    text = docs.map((e, i) => ({ id: names[i], t: e.value })).filter(v => v.t !== '');
    const skip = await readFile("skipwords.txt");
    const adjustments = await readFile("important.json");
    supressed = new Set(adjustments.bland || []);  // used as links, but supress in listings
    makeSkipList(skip);
    text.forEach(v => extract(v.t, v.id));
    // buildLinks();
    linkedTexts();
    const nodes = text.map(n => ({ id: n.id, group: 1, value: 123 }));
    links = prune(relations);
    text.forEach((e, i) => lookup[e.id] = i);
    return { nodes, links };

}

const freq = word => {
    if (supressed.has(word)) return 0;
    const a = word.charAt(0);
    return (wordlist[a][word]?.count) || 0;
}


function prune(relations, limit = 1) {
    const links = [];
    for (const s in relations) {
        const targs = relations[s];
        for (const t in targs) {
            const v = targs[t];
            if (v.c > limit) {
                if (v.c > 5) {
                    // sort by frequency
                    v.w.sort((a, b) => freq(b) - freq(a));
                }
                links.push({ target: t, source: s, value: v.c, words: v.w });
            }
        }
    }
    return links;
}

function linkedTexts() {
    for (const w0 in wordlist) {
        const ww = wordlist[w0];
        for (const wo in ww) {
            const w = ww[wo];
            if (w.fcount > 1) {
                for (const q in w.fname) {
                    if (!relations[q]) {
                        relations[q] = {};
                    }
                    for (const qq in w.fname) {
                        if (qq == q || qq > q) continue;
                        if (!relations[q][qq]) {
                            relations[q][qq] = { c: 1, w: [wo] };
                        } else {
                            relations[q][qq].c++;
                            relations[q][qq].w.push(wo);
                        }
                    }
                }
            }
        }
    }
}

function makeSkipList(skip) {
    const words = skip.split(/\s+/g);
    skipwords = new Set(words);
}


function buildLinks() {
    for (const w0 in wordlist) {
        const top = wordlist[w0];
        for (const w in top) {
            const e = top[w];
            if (e.count < 2) continue;
            const files = Object.keys(e.fname);
            if (files.length < 2) continue;
            console.log(w, files);
        }
    }
}


async function getBase() {
    return await readFile("../docs/indeks.json");
}

async function readFile(fname) {
    const res = await fetch(`../docs/${fname}`).catch(e => {
        console.log(e);
    })
    if (!res || res && !res.ok) return '';
    const [_,type] = fname.split(".");
    const dex = await (type === "json") ? res.json() : res.text();
    return dex;
}

function extract(txt, name) {
    let wcount = 0;
    txt.replace(/([A-Z_a-zæøåÆÅØ]+)[-+.<>{},;\[\]:() *\f\n\r\t\v\u00A0\u2028\u2029]/g, function (m, wo) {
        if (wo.length < 3) return '';
        wo = wo.toLowerCase();
        if (skipwords.has(wo)) {
            return '';
        }
        wo = wo.replace(/_a/g, 'å').replace(/_o/g, 'ø').replace(/_e/g, 'æ');
        if (wo.length < 3) return '';
        if (wo.includes('_')) return '';
        wcount++;
        var w0 = wo.charAt(0);
        if (!wordlist[w0]) w0 = 'A';
        if (wordlist[w0][wo]) {
            wordlist[w0][wo].count++;
            if (!wordlist[w0][wo].fname[name]) {
                wordlist[w0][wo].fcount++;
                wordlist[w0][wo].fname[name] = 1;
            }
        } else {
            wordlist[w0][wo] = { count: 1, fcount: 1, fname: {} };
            wordlist[w0][wo].fname[name] = 1;
        }
        return '';
    });
}