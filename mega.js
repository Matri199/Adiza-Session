const mega = require('megajs');

const email = 'matrixzat99@gmail.com'; // Your Mega.nz email
const password = 'Godpapa@1999';       // Your Mega.nz password

function upload(stream, filename) {
  return new Promise((resolve, reject) => {
    const storage = mega({ email, password });

    storage.on('ready', () => {
      const file = storage.upload({ name: filename, allowUploadBuffering: true }); // This avoids the file size error!
      stream.pipe(file);

      file.on('complete', () => {
        file.link((err, link) => {
          if (err) return reject(err);
          resolve(link);
        });
      });

      file.on('error', reject);
    });

    storage.on('error', reject);
  });
}

module.exports = { upload };
