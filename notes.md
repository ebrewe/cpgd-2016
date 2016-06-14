Created a simple game with a simple player class.

Rather than assign movement speed directly to the button press, ```if(left.isDown) body.velocity.x = -walkspeed``` we return a Vector2 that checks against the dash. This way, we can apply movement modifiers after the fact.

Added a simple weapon with a debounced fire script. Later, will add a check for 'is using' so we can't rapid-switch to beat the timer or switch between attacks. Maybe a weapon-weight as well to slow the player.  Also add a fire-on release for charge attacks rather than click attacks?
Also add a projectile vs melee weapon that requires ammo.

Weapons are in a group that stays relative to the player like a childsprite. When we rotate the player, we rotate the group. Will need to add a 'facing' var to the player to update properly. 
