const fs = require('fs');
const ytdl = require('ytdl-core');
const usetube = require('usetube')
const express = require('express')
const path = require('path');
const cron = require('node-cron');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

const youtubeBaseLink = "https://www.youtube.com/watch?v=";

app.post('/query', (req, res) => {
    const q = req.body.query;

    usetube.searchVideo(q).then(info => {
        res.send(info)
    })
})

app.post('/download', (req, res) => {
    const link = youtubeBaseLink + req.body.id;
    const title = req.body.title;

    ytdl(link, { filter: 'audioandvideo' })
    .pipe(fs.createWriteStream(`public/output/${title}.mp4`).on('finish', () => {
        res.send({"title": title})
    }))
})

// DELETE ALL FILES IN "OUTPUT" AT 0:00
let directoryPath = "public/output/";
cron.schedule('0 0 * * *', () => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        console.error('Error reading directory:', err);
        return;
      }
      files.forEach((file) => {
        const filePath = `${directoryPath}/${file}`;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting file:', filePath, err);
          } else {
            console.log('Deleted file:', filePath);
          }
        });
      });
    });
  });

app.listen(3000, () => {
    console.log("server started on 3000");
})