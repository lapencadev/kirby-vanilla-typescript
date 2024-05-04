import { makeBirdEnemy, makeFlameEnemy, makeGuyEnemy, makePlayer, setControls } from "./entities";
import { kaboomMethods } from "./kaboomCtx";
import { makeMap } from "./utils";

async function gameSetup() {
    kaboomMethods.loadSprite("assets", "./kirby-like.png", {
        // La numeración corresponde a los ejes de la imagen que se dividen en 9 de ancho x 10 de largo
        // Cada número corresponde a la celda de la imagen siendo 0 correspondiente al primer monigote
        sliceX: 9,
        sliceY: 10,
        anims: {
            kirbIdle: 0,
            kirbInhaling: 1,
            kirbFull: 2,
            kirbInhaleEffect: {
                from: 3,
                to: 8,
                speed: 15,
                loop: true
            },
            shootingStar: 9,
            flame: {
                from: 36,
                to: 37,
                speed: 4,
                loop: true,
            },
            guyIdle: 18,
            guyWalk: {
                from: 18,
                to: 19,
                speed: 4,
                loop: true,
            },
            bird: {
                from: 27,
                to: 28,
                speed: 4,
                loop: true,
            },
        },
    });

    kaboomMethods.loadSprite("level-1", "./level-1.png");

    const { map: level1Layout, spawnPoints: level1SpawnPoints } = await makeMap(
        kaboomMethods,
        "level-1"
    );
    kaboomMethods.scene("level-1", () => {
        kaboomMethods.setGravity(2100);
        kaboomMethods.add([
            kaboomMethods.rect(kaboomMethods.width(), kaboomMethods.height()),
            // background colour the the scene
            kaboomMethods.color(kaboomMethods.Color.fromHex("#cdfafe")),
            // this is for fixing the camera view
            kaboomMethods.fixed(),
        ]);

        // we add the map in order we can see it on the screen
        kaboomMethods.add(level1Layout);

        // we create the instance of the player
        const kirb = makePlayer(
            // if we know that there is one player we indicate the position of the array
            kaboomMethods,
            level1SpawnPoints.player[0].x,
            level1SpawnPoints.player[0].y
        );

        setControls(kaboomMethods, kirb);
        // we add the character to the scene
        kaboomMethods.add(kirb);
        // logic for the camera
        kaboomMethods.camScale(kaboomMethods.vec2(0.7));
        // event that runs every frame
        kaboomMethods.onUpdate(() => {
            if (kirb.pos.x < level1Layout.pos.x + 432)
                // the camera follows the player in a certain way
                kaboomMethods.camPos(kirb.pos.x + 500, 870);
        });

        // flame characters of the map
        for (const flame of level1SpawnPoints.flame) {
            makeFlameEnemy(kaboomMethods, flame.x, flame.y);
        }

        for (const guy of level1SpawnPoints.guy) {
            makeGuyEnemy(kaboomMethods, guy.x, guy.y);
        }

        for (const bird of level1SpawnPoints.bird) {
            const possibleSpeeds = [100, 200, 300];
            kaboomMethods.loop(10, () => {
              makeBirdEnemy(
                kaboomMethods,
                bird.x,
                bird.y,
                possibleSpeeds[Math.floor(Math.random() * possibleSpeeds.length)]
              );
            });
          }
        });
    kaboomMethods.go("level-1");
}

gameSetup();