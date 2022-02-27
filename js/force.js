// @ts-check

import { create, $, curry, compose, qs, qsa } from './util.js';
import { setup, show } from './buildIndex.js';

const { max, min, abs, log } = Math;

export async function force(ForceGraph3D, SpriteText) {
    const { nodes, links } = await setup();
    const divMain = qs("#force");
    const divText = qs("#text");
    const { floor } = Math;
    const initData = {
        nodes,
        links
    };
    const graph = ForceGraph3D()(divMain)
        //.jsonUrl('./filer.json')
        .graphData(initData)
        .nodeAutoColorBy(d => floor(d.value / 10))
        .width(900)
        .height(900)
        .linkDirectionalParticles(d => 1 + 5 * floor(log(d.value + 1)))
        .linkDirectionalParticleSpeed(d => 0.002)
        .onNodeClick(node => {
            show(node, divText);
        })
        .nodeThreeObject(node => {
            const sprite = new SpriteText(node.id);
            sprite.material.depthWrite = false; // make sprite background transparent
            sprite.color = node.color;
            sprite.textHeight = 8;
            return sprite;
        })
        .linkThreeObjectExtend(true)
        .linkThreeObject(link => {
            // extend link with text sprite
            const sprite = new SpriteText(`${link.words.slice(0,5).join(",")}`);
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


