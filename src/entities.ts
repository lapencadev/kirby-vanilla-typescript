import { GameObj, KaboomCtx } from "kaboom";
import { scale } from "./constants";

// function responsible for the game player
export function makePlayer(k: KaboomCtx, posX: number, posY: number) {
    const player = k.make([
        // in the assets we have the animation for kirbIdle, this will be the option by default 
        k.sprite("assets", { anim: "kirbIdle" }),
        // to create a hit box, it is a rectangle, position relative to the sprite
        k.area({ shape: new k.Rect(k.vec2(4, 5.9), 8, 10) }),
        // the player can collide with other objetcs
        k.body(),
        // position multipled by the scale
        k.pos(posX * scale, posY * scale),
        // to scale the sprite
        k.scale(scale),
        // specific of kaboom
        k.doubleJump(10),
        // health value / heal function to heal the player
        k.health(3),
        // to fully see the player, you can change the opacity when player is hit, for example
        k.opacity(1),
        // object with properties for the player
        {
            speed: 300,
            direction: "right",
            isInhaling: false,
            isFull: false,
        },
        "player",
    ]);

    // the player will collide with some object like an enemy

    player.onCollide("enemy", async (enemy: GameObj) => {
        if (player.isInhaling && enemy.isInhalable) {
            player.isInhaling = false;
            k.destroy(enemy);
            player.isFull = true;
            return;
        }

        if (player.hp() === 0) {
            // if the player has no health, it's death
            k.destroy(player);
            k.go("level-1");
            return;
        }
        // so the player is hurt
        player.hurt();
        // a tween allows to change the player from a value to another
        await k.tween(
            // we first await until the tween is done to continue running the code
            player.opacity,
            0, // the end
            0.05, // the velocity in seconds
            (val) => (player.opacity = val),
            k.easings.linear // a linear function
        );
        await k.tween(
            // blanking effect
            player.opacity,
            1,
            0.05,
            (val) => (player.opacity = val),
            k.easings.linear
        );
    });

    // when the player arrives to the door of exit
    player.onCollide("exit", () => {
        // go function of kaboom for moving to the next level
        k.go("level-2");
    });

    // inhaling effect that will be performed forever in loop
    const inhaleEffect = k.add([
        k.sprite("assets", { anim: "kirbInhaleEffect" }),
        k.pos(),
        k.scale(scale),
        k.opacity(0),
        "inhaleEffect",
    ]);

    // a hit box, area component non visible so it allows the inhaling movement takes place
    const inhaleZone = player.add([
        k.area({ shape: new k.Rect(k.vec2(0), 20, 4) }),
        k.pos(),
        "inhaleZone",
    ]);

    // the inhaling effect is a child of the player
    // so the position will be relative to the player depending on the direction
    inhaleZone.onUpdate(() => {
        if (player.direction === "left") {
            inhaleZone.pos = k.vec2(-14, 8);
            // we have to set the position of the player manually since 
            // it cannot be separated the player component of the effect which is a child component
            inhaleEffect.pos = k.vec2(player.pos.x - 60, player.pos.y + 0);
            // it is needed to flip the animation
            inhaleEffect.flipX = true;
            return;
        }
        inhaleZone.pos = k.vec2(14, 8);
        inhaleEffect.pos = k.vec2(player.pos.x + 60, player.pos.y + 0);
        inhaleEffect.flipX = false;
    });

    player.onUpdate(() => {
        if (player.pos.y > 2000) {
            // if the player falls you are dead
            // the position is higher when the player is going down
            k.go("level-1");
        }
    });

    return player;
}
