// Registro de minijuegos: slug del juego → componente que se dibuja en la pantalla.
// Para sumar otro juego, impórtalo aquí. Los que no estén salen como "PRÓXIMAMENTE".
import TurboBit from './TurboBit';
import Culebrita from './Culebrita';
import TresEnRaya from './TresEnRaya';

export const juegos = {
  'turbo-bit': TurboBit,
  'culebrita': Culebrita,
  'tres-en-raya': TresEnRaya,
};
