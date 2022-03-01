// @ts-check

import { create, $, curry, compose, qs, qsa } from './util.js';
import { setup, show, prune, sekme } from './buildIndex.js';
import { thingsWithId, updateMyProperties, getLocalJSON, setLocalJSON } from './Minos.js';

const { max, min, abs, log } = Math;

export const web = updateMyProperties();
const { bonds } = thingsWithId();

const selectedNodes = new Set();

export const select = id => {
    selectedNodes.add(id);
}

export const unselect = () => {
    selectedNodes.clear();
}

export var comp;

let graph;

web.bonds = 20;

/*
web.teller = 0;
setInterval(() => {
    web.teller ++;
},200)
*/

export const update = () => {
    graph.nodeThreeObject(graph.nodeThreeObject()); // update color of selected nodes
}



export async function force(ForceGraph3D, SpriteText) {
    let { nodes, links } = await setup();
    const divMain = qs("#force");
    const divText = qs("#text");
    const inpSeek = qs("#seek");
    comp = qs("#complete");
    const { floor } = Math;
    const initData = {
        nodes,
        links
    };

    bonds.addEventListener("change", () => {
        const limit = Number(web.bonds) || 5;
        // @ts-ignore
        links = prune(limit);
        graph.graphData({nodes,links});
    })

    inpSeek.addEventListener("keyup", sekme);


    graph = ForceGraph3D()(divMain)
        //.jsonUrl('./filer.json')
        .graphData(initData)
        .nodeAutoColorBy(d => floor(d.value / 10))
        //.nodeColor(node => selectedNodes.has(node) ? 'yellow' : "green")
        .width(900)
        .height(900)
        .linkDirectionalParticles(d => 1 + d.value/5)
        .linkDirectionalParticleSpeed(d => 0.002)
        .onNodeClick(node => {
            show(node, divText);
        })
        .nodeThreeObject(node => {
            const sprite = new SpriteText(node.id);
            sprite.material.depthWrite = false; // make sprite background transparent
            sprite.color = selectedNodes.has(node.id) ? 'yellow' : "green";
            sprite.textHeight = 8;
            return sprite;
        })
        .linkThreeObjectExtend(true)
        .linkThreeObject(link => {
            // extend link with text sprite
            const sprite = new SpriteText(`${link.words.slice(0, 5).join(",")}`);
            sprite.color = 'lightgrey';
            sprite.textHeight = 1.5;
            return sprite;
        })
        .linkPositionUpdate((sprite, { start, end }) => {
            // @ts-ignore
            const middlePos = Object.assign(...['x', 'y', 'z'].map(c => ({
                [c]: start[c] + (end[c] - start[c]) / 2 // calc middle point
            })));

            // Position sprite
            Object.assign(sprite.position, middlePos);
        });


    const linkForce = graph
        .d3Force('link')
        .distance(d => max(5, 90 - 10 * floor(log(d.value + 0.1))));


}


