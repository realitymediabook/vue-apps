
import hubsTest1 from './src/apps/HubsTest1/hubs.js'
import hubsTest2 from './src/apps/HubsTest2/hubs.js'

import Map from './src/apps/Center_Map/hubs.js'
import Center1 from './src/apps/Center1_Intro/hubs.js'
import Center2 from './src/apps/Center2_History/hubs.js'
import Center3 from './src/apps/Center3_3D-Tracking/hubs.js'
import Center4 from './src/apps/Center4_Presence/hubs.js'
import Center5 from './src/apps/Center5_Genres/hubs.js'
import Center6 from './src/apps/Center6_Future/hubs.js'
import Center7 from './src/apps/Center7_Privacy/hubs.js'
import Monolith1 from './src/apps/Monolith1_Intro/hubs.js'
import Monolith2 from './src/apps/Monolith2_History/hubs.js'
import Monolith3 from './src/apps/Monolith3_3D-Tracking//hubs.js'
import Monolith4 from './src/apps/Monolith4_Presence/hubs.js'
import Monolith5 from './src/apps/Monolith5_Genres/hubs.js'
import Monolith6 from './src/apps/Monolith6_Future/hubs.js'
import Monolith7 from './src/apps/Monolith7_Privacy/hubs.js'
import Alyx from './src/apps/Room5/Alyx/hubs.js'
import Pokemon from './src/apps/Room5/Pokemon/hubs.js'
import BeatSaber from './src/apps/Room5/BeatSaber/hubs.js'
import WalkingDead from './src/apps/Room5/WalkingDead/hubs.js'
import Apparizione from './src/apps/Room5/Apparizione/hubs.js'
import Minecraft from './src/apps/Room5/Minecraft/hubs.js'
import GamesBanner from './src/apps/Room5/GamesBanner/hubs.js'

import {initializeEthereal, systemTick} from './src/apps/HubsApp'

export {
    // for updating ethereal once per tick
    systemTick, initializeEthereal,

    // Rotunda and Rooms
    Map, Center1, Center2, Center3, Center4, Center5, Center6, Center7, 
    Monolith1, Monolith2, Monolith3, Monolith4, Monolith5, Monolith6, Monolith7, 
    Alyx, Pokemon, BeatSaber, WalkingDead, Minecraft, Apparizione, GamesBanner,

    // Tests
    hubsTest1, hubsTest2}



// need to wait until we have some reasonable performance optimizations
// such as shadow dom support for Ethereal
//   import hubsRevealTest from './src/apps/HubsRevealTest/hubs.js'

// if (THREE.Object3D.applyMatrix4) {
//     THREE.Object3D.prototype.applyMatrix4 = function(matrix ) {
// 		if ( this.matrixAutoUpdate ) this.updateMatrix();
// 		this.matrix.premultiply( matrix );
// 		this.matrix.decompose( this.position, this.quaternion, this.scale )
// 	}
// }