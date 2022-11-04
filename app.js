const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')

const app = express();

app.use(cors())
app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

let clients = []

app.get('/', (req, res) => {
  res.json(req.body)
});

app.get('/events', (req, res) => {
  const headers = {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  };
  res.writeHead(200, headers);
  res.write('data: {}\n\n')

  const clientId = Date.now();

  clients.push({
    id: clientId,
    response: res
  })

  req.on('close', () => {
    clients = clients.filter(client => client.id !== clientId);
  });
})

app.post('/post', (req, res) => {
  res.json(req.body)
  const data = JSON.parse(req.body?.["m2m:sgn"]?.["m2m:nev"]?.["m2m:rep"]?.["m2m:cin"]?.["con"] || '{}')
  const output = `data: ${JSON.stringify(data)}\n\n`
  return clients.forEach(client => {
    client.response.write(output)
  })
})

module.exports = app;
