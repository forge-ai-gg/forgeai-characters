export const SPRITE_CONFIG = {
  basePath: process.env.NODE_ENV === 'production' 
    ? '/public/assets'
    : './public/assets',
  
  types: ['warrior', 'mage', 'rogue'],
  animations: ['idle', 'walk', 'attack'],
  
  // Add your sprite sheet configurations
  sheets: {
    arms: {
      path: 'arms.png',
      frameSize: { width: 64, height: 64 }
    },
    bracers: {
      path: 'bracers.png', 
      frameSize: { width: 64, height: 64 }
    }
    // Add other body parts
  }
} 