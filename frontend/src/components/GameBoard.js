import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios to make HTTP requests
import './GameBoard.css';
import knightImage from '../assets/knight.png';
import treasureImage from '../assets/treasure.png';
import dragonImage from '../assets/dragon.png';

const gridSize = 20;

const GameBoard = () => {
    const [board, setBoard] = useState(generateInitialBoard());
    const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
    const [score, setScore] = useState(0);
    const [startTime, setStartTime] = useState(Date.now());
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [playerName, setPlayerName] = useState('');
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Get leaderboard data
    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const response = await axios.get('http://localhost:5000/api/leaderboard');
                setLeaderboard(response.data);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            }
        }

        fetchLeaderboard();
    }, [leaderboard]);
    // Keys logic in UseEffect
    useEffect(() => {
        const handleKeyDown = (event) => {
            switch (event.key) {
                case 'ArrowUp':
                    movePlayer(0, -1); // x = 0 and y = -1 (Upwards)
                    break;
                case 'ArrowDown':
                    movePlayer(0, 1); // x = 0 and y = 1 (downwards)
                    break;
                case 'ArrowLeft':
                    movePlayer(-1, 0); // x = -1 and y = 0 (left)
                    break;
                case 'ArrowRight':
                    movePlayer(1, 0); // x = 1 and y = 0 (right)
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [playerPosition, isGameStarted]);

    function generateInitialBoard() {
        let initialBoard = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));

        // Place knight at (0, 0)
        initialBoard[0][0] = 'knight';

        // Randomly place collectibles and dangers
        placeItemsRandomly(initialBoard, 'collectable', 10);
        placeItemsRandomly(initialBoard, 'danger', 10);

        return initialBoard;
    }

    function placeItemsRandomly(board, item, count) {
        let placed = 0;
        while (placed < count) {
            const x = Math.floor(Math.random() * gridSize); // Generate a random x-coordinate within the grid
            const y = Math.floor(Math.random() * gridSize); // Generate a random y-coordinate within the grid

            // Check if the randomly selected cell is empty
            if (!board[x][y]) {
                board[x][y] = item; // Place the item in the empty cell
                placed++; // Increment the placed counter
            }
        }
    }

    async function saveScoreToBackend(playerName, timeTaken) {
        try {
            await axios.post('http://localhost:5000/api/scores', {
                player: playerName,
                time: timeTaken,
            });
        } catch (error) {
            console.error('Error saving score:', error);
        }
    }

    function movePlayer(dx, dy) {
        const newX = playerPosition.x + dx; // Calculate new x-coordinate after every move
        const newY = playerPosition.y + dy; // Calculate new y-coordinate after every move    

        // Check boundaries(new position with grid hy)
        if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize) {
            const newBoard = [...board]; // Copy of current board
            const targetCell = newBoard[newY][newX]; // content of target cell

            if (targetCell === 'danger') {
                alert('Game Over! You hit a dragon!');
                const timeTaken = (Date.now() - startTime) / 1000; // Calculate time taken in seconds
                saveScoreToBackend(playerName, timeTaken); // Save score to backend
                resetGame(); // Reset the game
                return;
            } else if (targetCell === 'collectable') {
                setScore(score + 1); // Increment
            }

            // Move knight to new position
            newBoard[playerPosition.y][playerPosition.x] = null; // clear previous position of knight
            newBoard[newY][newX] = 'knight'; // new position of knight

            setBoard(newBoard); // Updating board state
            setPlayerPosition({ x: newX, y: newY }); // Update player state

            // Check if all collectables are picked
            if (score === 10) {
                const timeTaken = (Date.now() - startTime) / 1000; // Calculate time taken in seconds
                alert(`Congratulations, ${playerName}! You collected all treasures in ${timeTaken} seconds!`);
                saveScoreToBackend(playerName, timeTaken); // Save score to backend via api
                resetGame();  // Reset game
            }
        }
    }

    function resetGame() {
        setBoard(generateInitialBoard());
        setPlayerPosition({ x: 0, y: 0 });
        setScore(0);
        setStartTime(Date.now()); // Reset start time
        setIsGameStarted(false); // Stop the game until player re-enters their name
    }
    function startGame() {
        if (playerName.trim() !== '') {
            setIsGameStarted(true);
            setStartTime(Date.now());
        } else {
            alert('Please enter a player name to start the game.');
        }
    }
    function renderCellContent(content) {
        switch (content) {
            case 'knight':
                return <img src={knightImage} alt="Knight" />;
            case 'collectable':
                return <img src={treasureImage} alt="Treasure" />;
            case 'danger':
                return <img src={dragonImage} alt="Danger" />;
            default:
                return null;
        }
    }

    return (
        <div>
            {!isGameStarted && (
                <>
                    <div className="input-container">
                        <input
                            type="text"
                            required
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                        />
                        <span className="label">Enter your player name</span>
                        <span className="underline"></span>
                        <button className="start-button" onClick={startGame}>Start</button>
                    </div>

                    <div>
                        <h2>Leaderboard</h2>
                        <ul>
                            {leaderboard.map((score, index) => (
                                <li key={index}>
                                    {index + 1}. {score.player} - {score.time} s
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
            {isGameStarted && (
                <>
                    <div className='main-text-style'>
                        <h5>Player: {playerName}</h5>
                        <h5>Score: {score}</h5>
                        <h5>Time: {Math.floor((currentTime - startTime) / 1000)} seconds</h5>
                    </div>
                    <div className="board">
                        {board.map((row, rowIndex) => (
                            <div className="row" key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                    <div className="cell" key={cellIndex}>
                                        {renderCellContent(cell)}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default GameBoard;
