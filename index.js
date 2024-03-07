const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const app = express();
const port = 3000;

// URL MongoDB dan konten basis data
const url = "mongodb://localhost:27017";
const dbName = "webpcm";
app.get("/Berita", async (req, res) => {
  let client;
  try {
    // Dapatkan _id dari query params
    const { _id } = req.query;
    // Buat koneksi ke server MongoDB
    client = await MongoClient.connect(url, {});
    const db = client.db(dbName);
    // Koleksi Berita
    const BeritaCollection = db.collection("berita");
    // Jika _id ada, ambil data Berita berdasarkan _id
    if (_id) {
      const Berita = await BeritaCollection.findOne({
        _id: new ObjectId(_id),
      });
      // Periksa apakah data Berita ditemukan
      if (Berita) {
        res.json(Berita);
      } else {
        res.status(404).json("Data not found");
      }
    } else {
      // Jika _id tidak ada, ambil seluruh data Berita
      const BeritaList = await BeritaCollection.find().toArray();
      // Kirim data Berita sebagai respons
      res.json(BeritaList);
    }
  } catch (err) {
    // Tangani kesalahan
    console.error("Error fetching data from MongoDB:", err);
    res.status(500).json("Internal Server Error");
  } finally {
    // Tutup koneksi ke database
    if (client) {
      client.close();
    }
  }
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Method POST

// Middleware untuk mengurai data dari query params
app.use((req, res, next) => {
  const { _id } = req.query;
  // Ubah _id menjadi objek ObjectId jika ada
  if (_id) {
    req.parsedParams = { _id: new ObjectId(_id) };
  }
  next();
});
// Middleware untuk mengurai data dari body dengan format x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.post("/Berita", async (req, res) => {
  let client;
  try {
    // Buat koneksi ke server MongoDB
    client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db(dbName);
    // Koleksi Berita
    const BeritaCollection = db.collection("berita");
    // Dapatkan data dari body Postman
    const { judul, konten, penulis, editor } = req.body;
    // Pastikan data yang dibutuhkan ada
    if (!judul || !konten) {
      return res.status(400).json("Incomplete data");
    }
    // Tambahkan data Berita ke koleksi
    const result = await BeritaCollection.insertOne({
      judul: judul,
      konten: konten,
      penulis: penulis,
      editor: editor,
    });
    // Tampilkan hasilnya di console
    console.log(result);
    res.status(201).json("Data successfully added");
  } catch (err) {
    // Tangani kesalahan
    console.error("Error adding data to MongoDB:", err);
    res.status(500).json("Internal Server Error");
  } finally {
    // Tutup koneksi ke database
    if (client) {
      client.close();
    }
  }
});

// Method PUT

// Middleware untuk mengurai data dari body dengan format x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.put("/Berita/:id", async (req, res) => {
  let client;
  try {
    // Buat koneksi ke server MongoDB
    client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db(dbName);
    // Koleksi Berita
    const BeritaCollection = db.collection("berita");
    // Dapatkan data dari body Postman
    const { judul, konten, penulis, editor } = req.body;
    // Pastikan data yang dibutuhkan ada
    if (!judul || !konten) {
      return res.status(400).json("Incomplete data");
    }
    // Ubah _id menjadi objek ObjectId
    const objectId = new ObjectId(req.params.id);
    // Update data Berita berdasarkan _id
    const result = await BeritaCollection.updateOne(
      { _id: objectId },
      {
        $set: {
          judul: judul,
          konten: konten,
          penulis: penulis,
          editor: editor,
        },
      }
    );
    // Periksa apakah data berhasil diupdate
    if (result.modifiedCount === 1) {
      res.status(200).json("Data successfully updated");
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    // Tangani kesalahan
    console.error("Error updating data in MongoDB:", err);
    res.status(500).json("Internal Server Error");
  } finally {
    // Tutup koneksi ke database
    if (client) {
      client.close();
    }
  }
});

// Method Delete

// Middleware untuk mengurai data dari query params
app.use((req, res, next) => {
  const { _id } = req.query;
  // Ubah _id menjadi objek ObjectId jika ada
  if (_id) {
    req.parsedParams = { _id: new ObjectId(_id) };
  }
  next();
});
// Router untuk URL /Berita
app.delete("/Berita", async (req, res) => {
  let client;
  try {
    // Dapatkan parameter yang sudah diurai dari middleware
    const { _id } = req.parsedParams || {};
    // Pastikan _id yang dibutuhkan ada
    if (!_id) {
      return res.status(400).json("Invalid or missing _id");
    }
    // Buat koneksi ke server MongoDB
    client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = client.db(dbName);
    // Koleksi Berita
    const BeritaCollection = db.collection("berita");
    // Hapus satu data Berita berdasarkan _id
    const result = await BeritaCollection.deleteOne({ _id });
    // Periksa apakah data Berita ditemukan dan dihapus
    if (result.deletedCount === 1) {
      res.json("Data successfully deleted");
    } else {
      res.status(404).json("Data not found");
    }
  } catch (err) {
    // Tangani kesalahan
    console.error("Error deleting data from MongoDB:", err);
    res.status(500).json("Internal Server Error");
  } finally {
    // Tutup koneksi ke database
    if (client) {
      client.close();
    }
  }
});
