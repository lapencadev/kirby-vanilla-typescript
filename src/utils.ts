import { KaboomCtx } from "kaboom";
import { scale } from "./constants";
import { kaboomMethods } from "./kaboomCtx";

export async function makeMap(k: KaboomCtx, name: string){
    const mapData = await (await fetch(`./${name}.json`)).json();

    const map = kaboomMethods.make([
        k.sprite(name), 
        k.scale(scale), 
        k.pos(0) // position just 1 or 2 values
    ])

    const spawnPoints: { [key: string] : [{ x: number; y: number}] } = {};
        for (const layer of mapData.layers) {
            if(layer.name === "colliders") {
                for(const collider of layer.objects) {
                    map.add([
                        k.area({
                            shape: new k.Rect(k.vec2(0),
                                collider.width,
                                collider.height),
                            collisionIgnore: ["platform", "exit"],
                        }),
                        collider.name !== "exit" ? k.body({ isStatic: true }) : null,
                        k.pos(collider.x, collider.y),
                        collider.name !== "exit" ? "platform" : "exit",
                    ]);
                }
                continue;
            }

            if(layer.name === "spawnpoints") {
                for (const spawnPoint of layer.objects){
                    if (spawnPoints[spawnPoint.name]) {
                        // if it already exists add to the array of spawnpoints
                        spawnPoints[spawnPoint.name].push({
                            x: spawnPoint.x,
                            y: spawnPoint.y,
                        });
                        continue;
                    }
                    spawnPoints[spawnPoint.name] = [{x: spawnPoint.x, y: spawnPoint.y}]
                }
            }
        }

        return {map, spawnPoints};
    
}