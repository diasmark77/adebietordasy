const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = 3000;

// Upload конфигурациясы
const upload = multer({ dest: 'public/uploads/' });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Күтудегі авторлар файлы
const pendingFile = path.join(__dirname, 'pending/pending.json');
if (!fs.existsSync(pendingFile)) fs.writeFileSync(pendingFile, '[]');

// Жаңа автор қосу
app.post('/add-author', upload.single('photo'), (req, res) => {
  const { name, birth, death, poems } = req.body;
  const photo = req.file ? `/uploads/${req.file.filename}` : '';

  const pending = JSON.parse(fs.readFileSync(pendingFile));
  pending.push({ name, birth, death, poems: poems.split('\n'), photo });
  fs.writeFileSync(pendingFile, JSON.stringify(pending, null, 2));

  res.send({ status: 'success', message: 'Автор модерацияға жіберілді' });
});

// Админ: күтіп тұрған авторлар
app.get('/admin/pending', (req, res) => {
  const pending = JSON.parse(fs.readFileSync(pendingFile));
  res.json(pending);
});

// Админ: мақұлдау
app.post('/admin/approve', (req, res) => {
  const { index } = req.body;
  const pending = JSON.parse(fs.readFileSync(pendingFile));
  const approvedAuthor = pending.splice(index, 1)[0];
  fs.writeFileSync(pendingFile, JSON.stringify(pending, null, 2));

  // Approved JSON файлына қосу
  const approvedFile = path.join(__dirname, 'authors/authors.json');
  let authors = [];
  if (fs.existsSync(approvedFile)) authors = JSON.parse(fs.readFileSync(approvedFile));
  authors.push(approvedAuthor);
  fs.writeFileSync(approvedFile, JSON.stringify(authors, null, 2));

  res.send({ status: 'success', message: 'Автор мақұлданды' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
