
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const SIZE = 18;
const INITIAL_SNAKE = [
  { x: 8, y: 9 },
  { x: 7, y: 9 },
  { x: 6, y: 9 },
];

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function randomFood(snake) {
  let food;

  do {
    food = {
      x: Math.floor(Math.random() * SIZE),
      y: Math.floor(Math.random() * SIZE),
    };
  } while (snake.some((part) => part.x === food.x && part.y === food.y));

  return food;
}

export default function SnakeGame() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 12, y: 9 });
  const [direction, setDirection] = useState('right');
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState('ready');

  const directionRef = useRef('right');

  const changeDirection = useCallback((nextDirection) => {
    const current = directionRef.current;
    const opposite = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left',
    };

    if (opposite[current] === nextDirection) return;

    directionRef.current = nextDirection;
    setDirection(nextDirection);
  }, []);

  const restart = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood({ x: 12, y: 9 });
    setDirection('right');
    directionRef.current = 'right';
    setScore(0);
    setStatus('playing');
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      const keys = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right',
      };

      if (keys[event.key]) {
        event.preventDefault();
        changeDirection(keys[event.key]);
      }

      if (event.key === 'Enter' && status !== 'playing') {
        restart();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeDirection, restart, status]);

  useEffect(() => {
    if (status !== 'playing') return;

    const timer = setInterval(() => {
      setSnake((currentSnake) => {
        const movement = DIRECTIONS[directionRef.current];
        const head = {
          x: currentSnake[0].x + movement.x,
          y: currentSnake[0].y + movement.y,
        };

        const eating = head.x === food.x && head.y === food.y;
        const body = eating
          ? currentSnake
          : currentSnake.slice(0, -1);

        const collision =
          head.x < 0 ||
          head.y < 0 ||
          head.x >= SIZE ||
          head.y >= SIZE ||
          body.some((part) => part.x === head.x && part.y === head.y);

        if (collision) {
          setStatus('over');
          return currentSnake;
        }

        const nextSnake = [head, ...body];

        if (eating) {
          setScore((points) => points + 10);
          setFood(randomFood(nextSnake));
        }

        return nextSnake;
      });
    }, 160);

    return () => clearInterval(timer);
  }, [status, food]);

  return (
    <div className="snake-game">
      <div className="snake-info">
        <span>PUNTOS: {score}</span>
        <span>COMIDA: 🍎</span>
      </div>

      <div
        className="snake-board"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
      >
        {Array.from({ length: SIZE * SIZE }, (_, index) => {
          const x = index % SIZE;
          const y = Math.floor(index / SIZE);

          const isSnake = snake.some(
            (part) => part.x === x && part.y === y
          );

          const isHead = snake[0].x === x && snake[0].y === y;
          const isFood = food.x === x && food.y === y;

          return (
            <div
              key={index}
              className={[
                'snake-cell',
                isSnake ? 'snake-body' : '',
                isHead ? 'snake-head' : '',
                isFood ? 'snake-food' : '',
              ].join(' ')}
            />
          );
        })}
      </div>

      {status !== 'playing' && (
        <div className="snake-message">
          <strong>
            {status === 'ready'
              ? '¡PREPARADO!'
              : status === 'over'
                ? '¡FIN DEL JUEGO!'
                : ''}
          </strong>

          <button onClick={restart}>
            {status === 'ready' ? 'JUGAR' : 'REINTENTAR'}
          </button>
        </div>
      )}
    </div>
  );
}
