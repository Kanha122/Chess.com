const socket=io();
const chess=new Chess();
const boardElement=document.querySelector(".chessboard");

let dragPiece=null;
let sourceSquare=null;
let playerRole=null;

const renderBoard=function(){
    const board=chess.board();
    boardElement.innerHTML="";
    
    board.forEach((row, rowindex)=>{
        row.forEach((square, squareindex)=>{

            const squareElement=document.createElement("div");
            squareElement.classList.add("square", 
                ((rowindex + squareindex) % 2) === 0 ? "Light" : "Dark"
            );

            squareElement.dataset.row=rowindex;
            squareElement.dataset.col=squareindex;

            if(square){
                const pieceElement=document.createElement("div");
                pieceElement.classList.add("piece", square.color==="w" ? "white" : "black");
                pieceElement.innerText= getPieceUnicode(square);
                pieceElement.draggable=playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e)=>{
                    if(pieceElement.draggable){
                        dragPiece=pieceElement;
                        sourceSquare={row:rowindex, col:squareindex};
                        e.dataTransfer.setData("text/plan", "");
                    }
                    
                });

                pieceElement.addEventListener("dragend", (e)=>{
                    dragPiece=null;
                    sourceSquare=null;
                });

                squareElement.appendChild(pieceElement);

            }

            squareElement.addEventListener("dragover", function(e){
                e.preventDefault();

            });

            squareElement.addEventListener("drop", function(e){
                e.preventDefault();
                if(dragPiece){
                    const targetSource={
                        row:parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col),
                    };

                    handleMove(sourceSquare, targetSource);
                }

                       
            });
            boardElement.appendChild(squareElement);

        });
    });

    if(playerRole==="b"){
        boardElement.classList.add("flipped");
    }else{
        boardElement.classList.remove("flipped");
    }

}


const handleMove=function(source, target){
    const move={
        from: `${String.fromCharCode(97 + source.col)}${8-source.row}` ,
        to: `${String.fromCharCode(97 + target.col)}${8-target.row}`,
        promotion:"q"
    }
    socket.emit("move", move);

}


const getPieceUnicode=function(piece){
    const uniCodePieces={
    p:"♙",
    r:"♜",
    n:"♞",
    b:"♝",
    q:"♛",
    k:"♚",
    P:"♙",
    R:"♖",
    N:"♘",
    B:"♗",
    Q:"♕",
    K:"♔"
};

return uniCodePieces[piece.type] || "";

}

socket.on("PlayerRole", function(role){
    playerRole=role;
    renderBoard();

});

socket.on("SpectatorRole", function(){
    playerRole=null;
    renderBoard();
});

socket.on("boardState", function(fen){
    chess.load(fen);
    renderBoard();
});


socket.on("move", function(move){
    chess.move(move);
    renderBoard();
});

socket.on("InvalidMove", function(move) {
    if (move && move.reason){
        console.log(move);
        alert(`${move.reason}`);
    } else {
        console.error('Invalid move object received:', move);
    }
    renderBoard();
});

socket.on("error", function(move){
    if(move && move.reason){
        alert(`${move.reason}`);
    }else{
        console.error('Invalid move object received:', move);
    }
    renderBoard();
});



renderBoard();
