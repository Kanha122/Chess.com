const express=require("express");
const socket=require("socket.io");
const http=require("http");
const path=require("path");
const {Chess}=require("chess.js");

const app=express();

const server=http.createServer(app); //socket http maangta h 
const io=socket(server); //realtime connections

const chess=new Chess();

let players={};
let currentPlayer="w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", function(req, res){
    res.render("index", {title:"Welcome the the chess game"});
});

io.on("connection", function(uniqueSocket){
console.log("connected");

if(!players.white){

    players.white=uniqueSocket.id;
    uniqueSocket.emit("PlayerRole", "w");

}else if(!players.black){

    players.black=uniqueSocket.id;
    uniqueSocket.emit("PlayerRole", "b");

}else{

    uniqueSocket.emit("SpectatorRole");
}
    
uniqueSocket.on("disconnected", function(){
    if(uniqueSocket.id=== players.white){

        delete players.white;

    }else if(uniqueSocket.id=== players.black){

        delete players.black;

    }
});
 uniqueSocket.on("move", (move)=>{
    try{

        if(chess.turn()==="w" && uniqueSocket.id!==players.white) uniqueSocket.emit("error", {reason:"It is not your turn"});

        if(chess.turn()==="b" && uniqueSocket.id!==players.black) uniqueSocket.emit("error", {reason:"It is not your turn"});
        

        const result=chess.move(move);

        if(result){

            currentPlayer=chess.turn();
            io.emit("move", move);
            io.emit("boardState", chess.fen());

        }else{
            
            uniqueSocket.emit("InvalidMove",{reason:"Invalid Move! Pls Try Again"});
            
        }


    }
    catch(err){
        
        uniqueSocket.emit("InvalidMove", {reason:"Invalid Move! Pls Try Again"});

    }

 });


});


server.listen(3000, ()=>{
    console.log("listen to the server");
});