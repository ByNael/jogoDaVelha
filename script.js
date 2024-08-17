document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const generateMovesButton = document.getElementById('generateMoves');
    const movesOutput = document.getElementById('movesOutput');
    const MAX_MOVES_DISPLAY = 10; // Limite de sequências a serem exibidas
    let board = Array(9).fill(null);
    let currentPlayer = 'X';

    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            const index = cell.getAttribute('data-index');
            if (!board[index]) {
                board[index] = currentPlayer;
                cell.textContent = currentPlayer;
                if (checkWinner(board, currentPlayer)) {
                    alert(`${currentPlayer} venceu!`);
                    resetBoard();
                } else if (checkDraw(board)) {
                    alert('Empate!');
                    resetBoard();
                } else {
                    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                }
            }
        });
    });

    generateMovesButton.addEventListener('click', () => {
        const moves = generateMoves(board);
        displayMoves(moves);
        const bestMove = bestBranch(buildTree(board, 'X'));
        console.log('Melhor Jogada:', bestMove);
    });

    function generateMoves(board) {
        const moves = [];
        const tree = buildTree(board, 'X');
        traverseTree(tree, [], moves);
        return moves;
    }

    function buildTree(board, player) {
        const root = { board: [...board], player, children: [] };
        const emptyIndices = board.map((cell, index) => cell === null ? index : null).filter(index => index !== null);

        emptyIndices.forEach(index => {
            const newBoard = [...board];
            newBoard[index] = player;
            const child = buildTree(newBoard, player === 'X' ? 'O' : 'X');
            root.children.push(child);
        });

        return root;
    }

    function traverseTree(node, path, moves) {
        const newPath = [...path, node.board];
        if (node.children.length === 0) {
            moves.push(newPath);
            return;
        }

        node.children.forEach(child => traverseTree(child, newPath, moves));
    }

    function displayMoves(moves) {
        const limitedMoves = moves.slice(0, MAX_MOVES_DISPLAY);
        movesOutput.textContent = limitedMoves.map((moveSequence, index) => {
            return `Sequência ${index + 1}:\n${moveSequence.map(formatBoard).join('\n')}`;
        }).join('\n\n');
    }

    function formatBoard(board) {
        return board.map((cell, index) => cell ? cell : '-').reduce((str, cell, index) => {
            return str + cell + ((index + 1) % 3 === 0 ? '\n' : ' ');
        }, '');
    }

    function checkWinner(board, player) {
        const winningCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        return winningCombinations.some(combination => {
            return combination.every(index => board[index] === player);
        });
    }

    function checkDraw(board) {
        return board.every(cell => cell !== null);
    }

    function resetBoard() {
        board = Array(9).fill(null);
        cells.forEach(cell => cell.textContent = '');
        currentPlayer = 'X';
    }

    function bestBranch(root) {
        function evaluateNode(node) {
            if (node.children.length === 0) {
                return evaluateBoard(node.board);
            }

            const childValues = node.children.map(evaluateNode);
            if (node.player === 'X') {
                return Math.max(...childValues);
            } else {
                return Math.min(...childValues);
            }
        }

        function evaluateBoard(board) {
            if (checkWinner(board, 'X')) return 1;
            if (checkWinner(board, 'O')) return -1;
            return 0;
        }

        let bestValue = -Infinity;
        let bestMove = null;
        root.children.forEach(child => {
            const childValue = evaluateNode(child);
            if (childValue > bestValue) {
                bestValue = childValue;
                bestMove = child.board;
            }
        });

        return bestMove;
    }
});
