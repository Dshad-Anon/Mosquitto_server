const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://192.168.233.171:1883');

// Set up view engine
app.set('view engine', 'ejs');

// Set up static folder
app.use(express.static('public'));

// Route for home page
app.get('/', (req, res) => {
  res.render('index');
});

// MQTT subscriber
const tempTopic = 'home/esp32/Temp';
const humTopic = 'home/esp32/Hum';

console.log("connecting!!!")
client.on('connect', () => {
  client.subscribe(tempTopic);
  client.subscribe(humTopic);
});

client.on('message', (topic, message) => {
  message = message.toString();
  console.log(message);

  // Send MQTT message to client via socket.io
  if (topic === tempTopic) {
    io.emit('mqtt_message', { temp: message });
  } else if (topic === humTopic) {
    io.emit('mqtt_message', { hum: message });
  }
});

// Start server
const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
