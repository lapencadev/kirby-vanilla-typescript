import {
    AreaComp,
    BodyComp,
    DoubleJumpComp,
    GameObj,
    HealthComp,
    KaboomCtx,
    OpacityComp,
    PosComp,
    ScaleComp,
    SpriteComp,
} from "kaboom";
import { scale } from "./constants";

// necessary components for the game object type
type PlayerGameObj = GameObj<
    SpriteComp &
    AreaComp &
    BodyComp &
    PosComp &
    ScaleComp &
    DoubleJumpComp &
    HealthComp &
    OpacityComp & {
        speed: number;
        direction: string;
        isInhaling: boolean;
        isFull: boolean;
    }
>;

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

// function responsible for the actions of the player
export function setControls(k: KaboomCtx, player: PlayerGameObj) {
    // reference to inhale effect, index for expecting just one
    const inhaleEffectRef = k.get("inhaleEffect")[0];

    // movement when pressing  a key and holds it on
    k.onKeyDown((key) => {
        switch (key) {
            case "left":
                player.direction = "left";
                player.flipX = true;
                player.move(-player.speed, 0);
                break;
            case "right":
                player.direction = "right";
                player.flipX = false;
                player.move(player.speed, 0);
                break;
            case "z":
                if (player.isFull) {
                    player.play("kirbFull");
                    inhaleEffectRef.opacity = 0;
                    break;
                }

                player.isInhaling = true;
                player.play("kirbInhaling");
                inhaleEffectRef.opacity = 1;
                break;
            default:
        }
    });

    // movement just pressing a key
    k.onKeyPress((key) => {
        switch (key) {
            case "x":
                player.doubleJump();
                break;
            default:
        }
    });

    // action when we release the key pressed
    k.onKeyRelease((key) => {
        switch (key) {
            case "z":
                if (player.isFull) {
                    player.play("kirbInhaling");
                    const shootingStar = k.add([
                        k.sprite("assets", {
                            anim: "shootingStar",
                            flipX: player.direction === "right",
                        }),
                        // rectangle with axes
                        k.area({ shape: new k.Rect(k.vec2(5, 4), 6, 6) }),
                        k.pos(
                            player.direction === "left"
                                ? player.pos.x - 80
                                : player.pos.x + 80,
                            player.pos.y + 5
                        ),
                        k.scale(scale),
                        // to move the sprite
                        // left and right constants provided by Kaboom
                        player.direction === "left"
                            ? k.move(k.LEFT, 800)
                            : k.move(k.RIGHT, 800),
                        "shootingStar",
                    ]);

                    // on collide event listener
                    // if it's collide with a platform just destroy it
                    shootingStar.onCollide("platform", () => k.destroy(shootingStar));

                    player.isFull = false;
                    // wait one second before making the player changing into kirbIdle anim
                    k.wait(1, () => player.play("kirbIdle"));
                    break;
                }

                // no longer inhaling anything
                inhaleEffectRef.opacity = 0;
                player.isInhaling = false;
                player.play("kirbIdle");
                break;
            default:
        }
    });


}

// function for creating flame enemies
export function makeFlameEnemy(k: KaboomCtx, posX: number, posY: number) {
    const flame = k.add([
      k.sprite("assets", { anim: "flame" }),
      k.scale(scale),
      k.pos(posX * scale, posY * scale),
      // box area / no effect of collisions between elements
      k.area({
        shape: new k.Rect(k.vec2(4, 6), 8, 10),
        collisionIgnore: ["enemy"],
      }),
      k.body(),

      // later we set the code for eacht state
      k.state("idle", ["idle", "jump"]),
      "enemy",
    ]);
  
    makeInhalable(k, flame);
  
    flame.onStateEnter("idle", async () => {
      await k.wait(1);
      flame.enterState("jump");
    });
  
    flame.onStateEnter("jump", async () => {
      flame.jump(1000);
    });
  
    flame.onStateUpdate("jump", async () => {
      if (flame.isGrounded()) {
        flame.enterState("idle");
      }
    });
  
    return flame;
  }

// function for make enemies inhalable
export function makeInhalable(k: KaboomCtx, enemy: GameObj) {
    enemy.onCollide("inhaleZone", () => {
      enemy.isInhalable = true;
    });
  
    enemy.onCollideEnd("inhaleZone", () => {
      enemy.isInhalable = false;
    });
  
    enemy.onCollide("shootingStar", (shootingStar: GameObj) => {
      k.destroy(enemy);
      k.destroy(shootingStar);
    });

    // to get the player  
    const playerRef = k.get("player")[0];
    enemy.onUpdate(() => {
      if (playerRef.isInhaling && enemy.isInhalable) {
        if (playerRef.direction === "right") {
          enemy.move(-800, 0);
          return;
        }
        enemy.move(800, 0);
      }
    });
  }
