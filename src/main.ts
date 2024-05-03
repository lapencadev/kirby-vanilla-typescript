import { kaboomMethods } from "./kaboomCtx";

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

    kaboomMethods.scene("level-1", () => {
        kaboomMethods.setGravity(2100);
        kaboomMethods.add([
           kaboomMethods.rect(kaboomMethods.width(), kaboomMethods.height()),
           kaboomMethods.color(kaboomMethods.Color.fromHex("#fef9e7")),
           // cámara fija
           kaboomMethods.fixed(),
        ])
    });
    

    kaboomMethods.go("level-1");

}

gameSetup();