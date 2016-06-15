Created a simple game with a simple player class.

Rather than assign movement speed directly to the button press, ```if(left.isDown) body.velocity.x = -walkspeed``` we return a Vector2 that checks against the dash. This way, we can apply movement modifiers after the fact.

Added a simple weapon with a debounced fire script. Later, will add a check for 'is using' so we can't rapid-switch to beat the timer or switch between attacks. Maybe a weapon-weight as well to slow the player.  Also add a fire-on release for charge attacks rather than click attacks?
Also add a projectile vs melee weapon that requires ammo.

Weapons are in a group that stays relative to the player like a childsprite. When we rotate the player, we rotate the group. Will need to add a 'facing' var to the player to update properly.

weapon 'extend' added with a tween.

weapon rotation by pointer. Strafing is go! we subtract 1.57 rads (90 deg) from the angle because I defaulted down.// maybe I should change that.
*See Above* switched it to right-facing is default for ease of rotation manipulation.

added a swing function

added a 'using weapon' variable that locks the player rotation. No swinging in a million directions, kids!
I'll have to put variables in for the swing limits.

should put in rotation lerping rather than instant turn.

added rudimentary left-click only for attacking. Not a fan of the way phaser distinguishes mouse buttons.

Changing player speed based on direction faced. moving back is safest, slowest. 

added rudimentary rotation lerp. //in the future, check to see which direction is fastest -- maybe convert to deg and then back? 