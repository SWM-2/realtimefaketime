const { createCanvas, loadImage } = require('canvas');
const express = require('express');

const app = express();

let main_canvas = createCanvas(600,200);
let ctx = main_canvas.getContext('2d');

let buf = undefined;

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}


const clients = new Set();

let tme  = () => {
	ctx.font = "200px Impact";
	ctx.fillStyle = 'white';
	ctx.fillRect(0,0,600,200);
	ctx.fillStyle = 'black';
	
	let min = getRandomInt(60);
	let hr = getRandomInt(24);

	ctx.fillText(String(hr).padStart(2,'0')+`:`+String(min).padStart(2,'0'), 20, 180);

	buf = main_canvas.toBuffer('image/jpeg');
	
	clients.forEach((res) => {
		res.write("--frame\r\nContent-Type: image/jpeg\r\n\r\n");
		res.write(Buffer.from(buf,'binary'));
		res.write("\r\n");
	});

	setTimeout(tme,1000);
};

tme();

app.get('/', (req,res) => {
	res.send(`
	<img src="image.jpg"/>
	`);
});

app.get("/image.jpg",(req,res) => {
	
	res.setHeader("Content-Type", "text/event-stream");
  	res.setHeader("Cache-Control", "no-cache");
  	res.setHeader("Connection", "keep-alive");

	if(!buf)
	{
		res.status(404);
		res.send("Not ofund");
		return;
	}

	res.contentType('multipart/x-mixed-replace; boundary=frame');
	res.write("--frame\r\nContent-Type: image/jpeg\r\n\r\n");
	res.write(Buffer.from(buf,'binary'));
	res.write("\r\n");

	clients.add(res);

	req.on("close", () => {
		clients.delete(res);
	});
});

app.listen(3000,()=>{
	console.log("Started");
});
