const express = require("express");
const cors = require("cors");
const db = require("./db");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// =====================
// MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/uploads", express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_-]/g, "");
    cb(null, `quiz_${Date.now()}_${safeName}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File harus berupa JPG, JPEG, PNG, atau WEBP."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// =====================
// TEST
// =====================
app.get("/", (req, res) => {
  res.send("Backend jalan 🚀");
});

// =====================
// AUTH
// =====================

// LOGIN
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email / password kosong" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal login",
        error: err.message,
      });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: "User tidak ditemukan" });
    }

    const user = result[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Password salah" });
    }

    return res.json({
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    });
  });
});

// SIGNUP
app.post("/api/signup", async (req, res) => {
  try {
    const { nama, email, password } = req.body;

    if (!nama || !email || !password) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const hash = await bcrypt.hash(password, 10);

    const sql =
      "INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, 'user')";

    db.query(sql, [nama, email, hash], (err, result) => {
      if (err) {
        console.log("DB ERROR:", err);
        return res.status(500).json({ message: err.sqlMessage || err.message });
      }

      return res.json({
        message: "Signup berhasil",
        id: result.insertId,
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// =====================
// USER
// =====================

app.get("/api/user/quiz-history", (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({
      message: "user_id wajib diisi",
    });
  }

  const sql = `
    SELECT 
      uqr.id,
      uqr.user_id,
      uqr.quiz_id,
      uqr.score,
      uqr.is_pass,
      uqr.taken_at,
      q.title AS quiz_title,
      q.description,
      q.passing_score,
      q.quiz_type
    FROM user_quiz_results uqr
    LEFT JOIN quizzes q ON q.id = uqr.quiz_id
    WHERE uqr.user_id = ?
    ORDER BY uqr.taken_at DESC, uqr.id DESC
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      console.error("GET QUIZ HISTORY ERROR:", err);
      return res.status(500).json({
        message: "Gagal mengambil riwayat quiz",
        error: err.message,
      });
    }

    return res.json(result);
  });
});

app.get("/api/user/settings", (req, res) => {
  const userId = req.query.userId || 1;

  const sql = "SELECT id, nama, email, role FROM users WHERE id = ?";

  db.query(sql, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal mengambil settings user",
        error: err.message,
      });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const user = result[0];

    return res.json({
      id: user.id,
      name: user.nama,
      email: user.email,
      role: user.role,
      notif: true,
      sound: true,
    });
  });
});

app.put("/api/user/settings", (req, res) => {
  const { id, nama, email } = req.body;

  const sql = `
    UPDATE users
    SET nama = ?, email = ?
    WHERE id = ?
  `;

  db.query(sql, [nama, email, id], (err) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal update settings user",
        error: err.message,
      });
    }

    return res.json({ message: "Update berhasil" });
  });
});

app.put("/api/user/password", async (req, res) => {
  const { id, oldPassword, newPassword } = req.body;

  const sql = "SELECT password FROM users WHERE id = ?";

  db.query(sql, [id], async (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal memproses password",
        error: err.message,
      });
    }

    if (!result.length) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const match = await bcrypt.compare(oldPassword, result[0].password);

    if (!match) {
      return res.status(400).json({ message: "Password lama salah" });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hash, id],
      (updateErr) => {
        if (updateErr) {
          return res.status(500).json({
            message: "Gagal mengubah password",
            error: updateErr.message,
          });
        }

        return res.json({ message: "Password berhasil diubah" });
      }
    );
  });
});

app.get("/api/users/:id", (req, res) => {
  db.query(
    "SELECT id, nama, email, role FROM users WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Gagal mengambil user",
          error: err.message,
        });
      }

      return res.json(result[0]);
    }
  );
});

app.put("/api/users/:id", (req, res) => {
  const { nama, email } = req.body;

  db.query(
    "UPDATE users SET nama = ?, email = ? WHERE id = ?",
    [nama, email, req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({
          message: "Gagal update user",
          error: err.message,
        });
      }

      return res.json({ message: "User updated" });
    }
  );
});

// =====================
// SISWA / GURU
// =====================

app.get("/api/siswa", (req, res) => {
  const sql = `
    SELECT id, nama, email
    FROM users
    WHERE role = 'user'
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: "Gagal mengambil data siswa",
        error: err.message,
      });
    }

    return res.json(result);
  });
});

app.get("/api/dashboard-guru", (req, res) => {
  const { userId } = req.query;

  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM modules WHERE user_id = ?) AS total_modul,
      (SELECT COUNT(*)
       FROM module_items mi
       JOIN modules m ON mi.module_id = m.id
       WHERE m.user_id = ?) AS total_lesson,
      (SELECT COUNT(*) FROM users WHERE role = 'user') AS total_siswa
  `;

  db.query(sql, [userId, userId], (err, result) => {
    if (err) {
      console.error("DASHBOARD GURU ERROR:", err);
      return res.status(500).json({ error: "Database error" });
    }

    return res.json(result[0]);
  });
});

// =====================
// MODULES
// =====================

app.get("/api/modules", (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ message: "User ID tidak ditemukan" });
  }

  const sql = `
    SELECT 
      id,
      title,
      description,
      order_index,
      created_at,
      user_id
    FROM modules
    WHERE user_id = ?
    ORDER BY order_index ASC, id ASC
  `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("GET MODULES ERROR:", err);
      return res.status(500).json({
        message: "Gagal mengambil data modul",
        error: err.message,
      });
    }

    return res.json(result);
  });
});

app.get("/api/modules/:id", (req, res) => {
  const { id } = req.params;

  const sql = `SELECT * FROM modules WHERE id = ? LIMIT 1`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("GET MODULE BY ID ERROR:", err);
      return res.status(500).json({
        message: "Gagal mengambil detail modul",
        error: err.message,
      });
    }

    if (!result.length) {
      return res.status(404).json({
        message: "Modul tidak ditemukan",
      });
    }

    return res.json(result[0]);
  });
});

app.post("/api/modules", (req, res) => {
  const { title, description, order_index, user_id } = req.body;

  if (!title || !user_id) {
    return res.status(400).json({ error: "Judul dan User ID wajib diisi" });
  }

  const sql = `
    INSERT INTO modules (title, description, order_index, user_id) 
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [title, description || "", order_index || 0, user_id],
    (err, result) => {
      if (err) {
        console.error("INSERT MODULE ERROR:", err);
        return res.status(500).json({
          error: "Database gagal menyimpan modul baru",
          detail: err.message,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Modul berhasil ditambahkan!",
        moduleId: result.insertId,
      });
    }
  );
});

app.delete("/api/modules/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM modules WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal menghapus modul",
        error: err.message,
      });
    }

    return res.json({ message: "Modul berhasil dihapus" });
  });
});

app.get("/api/student/modules", (req, res) => {
  const { userId } = req.query;

  const sql = `
    SELECT m.*, COUNT(mi.id) total_items,
    COALESCE(SUM(CASE WHEN ump.done=1 THEN 1 ELSE 0 END),0) done_items,
    CASE WHEN COUNT(mi.id)=0 THEN 0 
    ELSE ROUND(COALESCE(SUM(CASE WHEN ump.done=1 THEN 1 ELSE 0 END),0)/COUNT(mi.id)*100) END progress
    FROM modules m
    LEFT JOIN module_items mi ON mi.module_id=m.id
    LEFT JOIN user_module_progress ump ON ump.module_item_id=mi.id AND ump.user_id=?
    GROUP BY m.id
    ORDER BY m.order_index ASC, m.id ASC
  `;

  db.query(sql, [userId || 0], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// =============
// PENCAPAIAN
// =============
app.get("/api/student/achievements", (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "userId wajib diisi" });
  }

  const sql = `
    SELECT 
      m.id,
      m.title,
      m.description,

      COALESCE(mp.total_items, 0) AS total_items,
      COALESCE(mp.done_items, 0) AS done_items,

      CASE 
        WHEN COALESCE(mp.total_items, 0) = 0 THEN 0
        ELSE ROUND(COALESCE(mp.done_items, 0) / mp.total_items * 100)
      END AS progress,

      CASE 
        WHEN COALESCE(mp.total_items, 0) > 0
        AND COALESCE(mp.done_items, 0) = COALESCE(mp.total_items, 0)
        THEN 1 ELSE 0
      END AS is_completed,

      COALESCE(qs.avg_score, 0) AS avg_score,
      COALESCE(qs.quiz_attempts, 0) AS quiz_attempts

    FROM modules m

    LEFT JOIN (
      SELECT 
        mi.module_id,
        COUNT(mi.id) AS total_items,
        SUM(CASE WHEN ump.done = 1 THEN 1 ELSE 0 END) AS done_items
      FROM module_items mi
      LEFT JOIN user_module_progress ump
        ON ump.module_item_id = mi.id
        AND ump.user_id = ?
      GROUP BY mi.module_id
    ) mp ON mp.module_id = m.id

    LEFT JOIN (
      SELECT
        q.module_id,
        ROUND(AVG(uqr.score)) AS avg_score,
        COUNT(uqr.id) AS quiz_attempts
      FROM quizzes q
      LEFT JOIN user_quiz_results uqr
        ON uqr.quiz_id = q.id
        AND uqr.user_id = ?
      GROUP BY q.module_id
    ) qs ON qs.module_id = m.id

    ORDER BY m.order_index ASC, m.id ASC
  `;

  db.query(sql, [userId, userId], (err, result) => {
    if (err) {
      console.error("GET ACHIEVEMENTS ERROR:", err);
      return res.status(500).json({
        message: "Gagal mengambil pencapaian",
        error: err.message,
      });
    }

    res.json(result);
  });
});

// =====================
// MODULE ITEMS
// =====================

app.get("/api/module-items", (req, res) => {
  const { moduleId, userId } = req.query;

  let sql = `
    SELECT mi.*, COALESCE(ump.done,0) done
    FROM module_items mi
    LEFT JOIN user_module_progress ump 
    ON ump.module_item_id=mi.id AND ump.user_id=?
  `;

  const params = [userId || 0];

  if (moduleId) {
    sql += " WHERE mi.module_id=?";
    params.push(moduleId);
  }

  sql += " ORDER BY mi.module_id ASC, mi.order_index ASC, mi.id ASC";

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post("/api/module-items", (req, res) => {
  const {
    module_id,
    title,
    content = "",
    video_url = "",
    image_url = "",
    quiz_id = null,
  } = req.body;

  if (!module_id || !title?.trim()) {
    return res.status(400).json({
      message: "module_id dan title wajib diisi",
    });
  }

  let type = "article";
  let content_url = "";
  let content_text = content?.trim() || "";

  if (quiz_id) {
    type = "quiz";
  } else if (video_url?.trim()) {
    type = "video";
    content_url = video_url.trim();
  } else if (image_url?.trim()) {
    type = "article";
    content_url = image_url.trim();
  }

  const sql = `
    INSERT INTO module_items
    (module_id, title, type, content_url, content_text, order_index, is_locked, quiz_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      Number(module_id),
      title.trim(),
      type,
      content_url,
      content_text,
      0,
      0,
      quiz_id,
    ],
    (err, result) => {
      if (err) {
        console.error("INSERT MODULE ITEM ERROR:", err);
        return res.status(500).json({
          message: "Gagal menambahkan module item",
          error: err.message,
        });
      }

      return res.status(201).json({
        message: "Module item berhasil ditambahkan",
        id: result.insertId,
      });
    }
  );
});

app.put("/api/module-items/:id", (req, res) => {
  const { id } = req.params;
  const {
    title,
    content = "",
    video_url = "",
    image_url = "",
    order_index = 0,
    is_locked = 0,
  } = req.body;

  if (!title?.trim()) {
    return res.status(400).json({
      message: "Judul materi wajib diisi",
    });
  }

  let type = "article";
  let content_url = "";
  let content_text = content?.trim() || "";

  if (video_url?.trim()) {
    type = "video";
    content_url = video_url.trim();
  } else if (image_url?.trim()) {
    type = "article";
    content_url = image_url.trim();
  }

  const sql = `
    UPDATE module_items
    SET
      title = ?,
      type = ?,
      content_url = ?,
      content_text = ?,
      order_index = ?,
      is_locked = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      title.trim(),
      type,
      content_url,
      content_text,
      Number(order_index) || 0,
      Number(is_locked) ? 1 : 0,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("UPDATE MODULE ITEM ERROR:", err);
        return res.status(500).json({
          message: "Gagal mengupdate module item",
          error: err.message,
          sqlMessage: err.sqlMessage,
        });
      }

      return res.json({
        message: "Module item berhasil diupdate",
        affectedRows: result.affectedRows,
      });
    }
  );
});

app.delete("/api/module-items/:id", (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM module_items WHERE id = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("DELETE MODULE ITEM ERROR:", err);
      return res.status(500).json({
        message: "Gagal menghapus module item",
        error: err.message,
        sqlMessage: err.sqlMessage,
      });
    }

    return res.json({
      message: "Module item berhasil dihapus",
      affectedRows: result.affectedRows,
    });
  });
});

app.post("/api/material-images", upload.single("image"), (req, res) => {
  const { material_id, caption, image_order } = req.body;

  if (!material_id || !req.file) {
    return res.status(400).json({
      message: "material_id dan image wajib diisi",
    });
  }

  const sql = `
    INSERT INTO material_images (material_id, image, caption, image_order)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      material_id,
      req.file.filename,
      caption || null,
      Number(image_order || 1),
    ],
    (err, result) => {
      if (err) {
        console.error("INSERT MATERIAL IMAGE ERROR:", err);
        return res.status(500).json({ message: "Gagal upload gambar materi" });
      }

      res.json({
        id: result.insertId,
        material_id,
        image: req.file.filename,
        caption,
        image_order: Number(image_order || 1),
      });
    }
  );
});

app.get("/api/material-images", (req, res) => {
  const { materialId } = req.query;

  if (!materialId) {
    return res.status(400).json({
      message: "materialId wajib diisi",
    });
  }

  const sql = `
    SELECT *
    FROM material_images
    WHERE material_id = ?
    ORDER BY image_order ASC, id ASC
  `;

  db.query(sql, [materialId], (err, result) => {
    if (err) {
      console.error("GET MATERIAL IMAGES ERROR:", err);
      return res.status(500).json({
        message: "Gagal mengambil gambar materi",
        error: err.message,
      });
    }

    return res.json(result);
  });
});

app.get("/api/quiz-dnd-koneksi", (req, res) => {
  const { questionId } = req.query;

  if (!questionId) {
    return res.status(400).json({ message: "questionId wajib diisi" });
  }

  db.query(
    "SELECT * FROM quiz_dnd_koneksi WHERE question_id = ?",
    [questionId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

app.post("/api/quiz-dnd-koneksi", (req, res) => {
  const { question_id, source_item_id, target_item_id, label, source_handle } =
    req.body;

  db.query(
    `INSERT INTO quiz_dnd_koneksi
     (question_id, source_item_id, target_item_id, label, source_handle)
     VALUES (?, ?, ?, ?, ?)`,
    [
      question_id,
      source_item_id,
      target_item_id,
      label || null,
      source_handle || null,
    ],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({
        id: result.insertId,
        question_id,
        source_item_id,
        target_item_id,
        label,
        source_handle,
      });
    }
  );
});

app.delete("/api/quiz-dnd-koneksi", (req, res) => {
  const { questionId } = req.query;

  if (!questionId) {
    return res.status(400).json({ message: "questionId wajib diisi" });
  }

  db.query(
    "DELETE FROM quiz_dnd_koneksi WHERE question_id = ?",
    [questionId],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({
        message: "Koneksi berhasil dihapus",
        affectedRows: result.affectedRows,
      });
    }
  );
});

// =====================
// ADMIN
// =====================

app.get("/api/admin/users", (req, res) => {
  const sql = "SELECT * FROM users";

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal mengambil users",
        error: err.message,
      });
    }

    return res.json(result);
  });
});

app.delete("/api/admin/users/:id", (req, res) => {
  const sql = "DELETE FROM users WHERE id = ?";

  db.query(sql, [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal menghapus user",
        error: err.message,
      });
    }

    return res.json({ message: "User deleted" });
  });
});

app.get("/api/admin/materi", (req, res) => {
  db.query("SELECT * FROM materi", (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal mengambil materi",
        error: err.message,
      });
    }

    return res.json(result);
  });
});

app.get("/api/admin/guru", (req, res) => {
  db.query("SELECT * FROM users WHERE role = 'guru'", (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal mengambil data guru",
        error: err.message,
      });
    }

    return res.json(result);
  });
});

app.delete("/api/admin/guru/:id", (req, res) => {
  db.query(
    "DELETE FROM users WHERE id = ? AND role = 'guru'",
    [req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json({
          message: "Gagal menghapus guru",
          error: err.message,
        });
      }

      return res.json({ message: "Guru berhasil dihapus" });
    }
  );
});

app.get("/api/admin/lessons", (req, res) => {
  const sql = `
    SELECT lessons.*, modules.title AS module_title
    FROM lessons
    LEFT JOIN modules ON lessons.module_id = modules.id
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Gagal mengambil lessons admin",
        error: err.message,
      });
    }

    return res.json(result);
  });
});

app.get("/api/admin/modules", (req, res) => {
  const sqlQuery = "SELECT * FROM modules ORDER BY id DESC";

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error("❌ Database Error:", err);
      return res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
      });
    }

    return res.status(200).json(results);
  });
});

app.get("/api/admin/modules/:id", (req, res) => {
  const { id } = req.params;
  const sqlQuery = "SELECT * FROM modules WHERE id = ?";

  db.query(sqlQuery, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Modul tidak ditemukan" });
    }

    return res.status(200).json(result[0]);
  });
});


// =====================
// QUIZ
// =====================

app.post("/api/quizzes", (req, res) => {
  const { module_id, title, description, passing_score, quiz_type } = req.body;

  if (!module_id || !title || !quiz_type) {
    return res.status(400).json({
      message: "module_id, title, dan quiz_type wajib diisi",
    });
  }

  const sql = `
    INSERT INTO quizzes (module_id, title, description, passing_score, quiz_type)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      module_id,
      title,
      description || "",
      passing_score || 75,
      quiz_type,
    ],
    (err, result) => {
      if (err) {
        console.error("INSERT QUIZ ERROR:", err);
        return res.status(500).json({
          message: "Gagal membuat quiz",
          error: err.message,
        });
      }

      return res.json({
        message: "Quiz berhasil dibuat",
        id: result.insertId,
      });
    }
  );
});

app.get("/api/quizzes", (req, res) => {
  const { moduleId } = req.query;

  let sql = "SELECT * FROM quizzes";
  let params = [];

  if (moduleId) {
    sql += " WHERE module_id = ?";
    params.push(moduleId);
  }

  sql += " ORDER BY id DESC";

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("GET QUIZZES ERROR:", err);
      return res.status(500).json({
        message: "Gagal mengambil quiz",
        error: err.message,
      });
    }

    return res.json(result);
  });
});

app.get("/api/quizzes/module/:moduleId", (req, res) => {
  const { moduleId } = req.params;

  const sql = `
    SELECT *
    FROM quizzes
    WHERE module_id = ?
    LIMIT 1
  `;

  db.query(sql, [moduleId], (err, result) => {
    if (err) {
      console.error("GET QUIZ BY MODULE ERROR:", err);
      return res.status(500).json({
        message: "Gagal mengambil quiz modul",
        error: err.message,
      });
    }

    if (!result.length) {
      return res.status(404).json({
        message: "Quiz modul tidak ditemukan",
      });
    }

    return res.json(result[0]);
  });
});

app.put(
  "/api/quiz-questions/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "option_a_image", maxCount: 1 },
    { name: "option_b_image", maxCount: 1 },
    { name: "option_c_image", maxCount: 1 },
    { name: "option_d_image", maxCount: 1 },
  ]),
  (req, res) => {
    const { id } = req.params;

    const {
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
    } = req.body;

    const sql = `
      UPDATE quiz_questions
      SET
        question = ?,
        option_a = ?,
        option_b = ?,
        option_c = ?,
        option_d = ?,
        correct_answer = ?,
        image = COALESCE(?, image),
        option_a_image = COALESCE(?, option_a_image),
        option_b_image = COALESCE(?, option_b_image),
        option_c_image = COALESCE(?, option_c_image),
        option_d_image = COALESCE(?, option_d_image)
      WHERE id = ?
    `;

    db.query(
      sql,
      [
        question,
        option_a || null,
        option_b || null,
        option_c || null,
        option_d || null,
        correct_answer,
        req.files?.image?.[0]?.filename || null,
        req.files?.option_a_image?.[0]?.filename || null,
        req.files?.option_b_image?.[0]?.filename || null,
        req.files?.option_c_image?.[0]?.filename || null,
        req.files?.option_d_image?.[0]?.filename || null,
        id,
      ],
      (err, result) => {
        if (err) {
          console.error("UPDATE MCQ ERROR:", err);
          return res.status(500).json({
            message: "Gagal update soal",
            error: err.message,
          });
        }

        res.json({ message: "Soal berhasil diupdate" });
      }
    );
  }
);


app.get("/api/quiz-questions", (req, res) => {
  const { quizId } = req.query;

  if (!quizId) {
    return res.status(400).json({
      message: "quizId wajib diisi",
    });
  }

  const sql = `
    SELECT *
    FROM quiz_questions
    WHERE quiz_id = ?
    ORDER BY id ASC
  `;

  db.query(sql, [quizId], (err, result) => {
    if (err) {
      console.error("GET QUIZ QUESTIONS ERROR:", err);
      return res.status(500).json({
        message: "Gagal mengambil soal quiz",
        error: err.message,
      });
    }

    return res.json(result);
  });
});

app.post(
  "/api/quiz-questions",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "option_a_image", maxCount: 1 },
    { name: "option_b_image", maxCount: 1 },
    { name: "option_c_image", maxCount: 1 },
    { name: "option_d_image", maxCount: 1 },
  ]),
  (req, res) => {
    const {
      quiz_id,
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      type,
    } = req.body;

    if (!quiz_id || !question || !type) {
      return res.status(400).json({
        message: "quiz_id, question, dan type wajib diisi",
      });
    }

    const image = req.files?.image?.[0]
      ? `/uploads/${req.files.image[0].filename}`
      : null;

    const option_a_image = req.files?.option_a_image?.[0]
      ? `/uploads/${req.files.option_a_image[0].filename}`
      : null;

    const option_b_image = req.files?.option_b_image?.[0]
      ? `/uploads/${req.files.option_b_image[0].filename}`
      : null;

    const option_c_image = req.files?.option_c_image?.[0]
      ? `/uploads/${req.files.option_c_image[0].filename}`
      : null;

    const option_d_image = req.files?.option_d_image?.[0]
      ? `/uploads/${req.files.option_d_image[0].filename}`
      : null;

    const sql = `
      INSERT INTO quiz_questions
      (
        quiz_id,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        type,
        image,
        option_a_image,
        option_b_image,
        option_c_image,
        option_d_image
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        quiz_id,
        question,
        option_a || "",
        option_b || "",
        option_c || "",
        option_d || "",
        correct_answer || "",
        type,
        image,
        option_a_image,
        option_b_image,
        option_c_image,
        option_d_image,
      ],
      (err, result) => {
        if (err) {
          console.error("INSERT QUIZ QUESTION ERROR:", err);
          return res.status(500).json({
            message: "Gagal menambahkan soal quiz",
            error: err.message,
          });
        }

        return res.json({
          message: "Soal quiz berhasil ditambahkan",
          question_id: result.insertId,
          image,
          option_a_image,
          option_b_image,
          option_c_image,
          option_d_image,
        });
      }
    );
  }
);

app.post("/api/quiz-dnd-items", (req, res) => {
  const { question_id, text, correct_order, node_type } = req.body;

  if (!question_id || !text || correct_order == null) {
    return res.status(400).json({
      message: "question_id, text, dan correct_order wajib diisi",
    });
  }

  const sql = `
    INSERT INTO quiz_dnd_items 
    (question_id, text, correct_order, node_type)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [question_id, text, correct_order, node_type || "process"],
    (err, result) => {
      if (err) {
        console.error("INSERT QUIZ DND ITEM ERROR:", err);
        return res.status(500).json({
          message: "Gagal menambahkan item drag and drop",
          error: err.message,
        });
      }

      return res.json({
        id: result.insertId,
        question_id,
        text,
        correct_order,
        node_type: node_type || "process",
      });
    }
  );
});

app.get("/api/quiz-dnd-items", (req, res) => {
  const { questionId } = req.query;

  if (!questionId) {
    return res.status(400).json({
      message: "questionId wajib diisi",
    });
  }

  const sql = `
    SELECT *
    FROM quiz_dnd_items
    WHERE question_id = ?
    ORDER BY correct_order ASC, id ASC
  `;

  db.query(sql, [questionId], (err, result) => {
    if (err) {
      console.error("GET QUIZ DND ITEMS ERROR:", err);
      return res.status(500).json({
        message: "Gagal mengambil item drag and drop",
        error: err.message,
      });
    }

    return res.json(result);
  });
});

app.post("/api/user-quiz-results", (req, res) => {
  const { user_id, quiz_id, score, is_pass } = req.body;

  if (!user_id || !quiz_id || score == null || is_pass == null) {
    return res.status(400).json({
      message: "user_id, quiz_id, score, dan is_pass wajib diisi",
    });
  }

  const sql = `
    INSERT INTO user_quiz_results (user_id, quiz_id, score, is_pass)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [user_id, quiz_id, score, is_pass], (err, result) => {
    if (err) {
      console.error("INSERT USER QUIZ RESULT ERROR:", err);
      return res.status(500).json({
        message: "Gagal menyimpan hasil quiz",
        error: err.message,
      });
    }

    return res.json({
      message: "Hasil quiz berhasil disimpan",
      id: result.insertId,
    });
  });
});


//======================
// PROGRESS
//======================
app.put("/api/modules/progress", (req, res) => {
  const { userId, moduleItemId, done } = req.body;

  if (!userId || !moduleItemId) {
    return res.status(400).json({
      message: "userId dan moduleItemId wajib diisi",
    });
  }

  const sql = `
    INSERT INTO user_module_progress (user_id, module_item_id, done)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE done = VALUES(done)
  `;

  db.query(sql, [userId, moduleItemId, done ? 1 : 0], (err, result) => {
    if (err) {
      console.error("UPDATE MODULE PROGRESS ERROR:", err);
      return res.status(500).json({
        message: "Gagal menyimpan progress",
        error: err.message,
      });
    }

    return res.json({
      message: "Progress berhasil disimpan",
    });
  });
});

// =====================
// EVALUASI
// =====================

app.post("/api/evaluasi", (req, res) => {
  const { id_siswa, nilai } = req.body;

  let keterangan = "";
  if (nilai >= 85) keterangan = "Sangat Baik";
  else if (nilai >= 70) keterangan = "Baik";
  else if (nilai >= 50) keterangan = "Cukup";
  else keterangan = "Perlu Perbaikan";

  db.query(
    "INSERT INTO evaluasi (id_siswa, nilai, keterangan) VALUES (?, ?, ?)",
    [id_siswa, nilai, keterangan],
    (err) => {
      if (err) {
        console.error("ERROR INSERT:", err);
        return res.status(500).json({ message: "Gagal simpan evaluasi" });
      }

      return res.json({ message: "Evaluasi berhasil disimpan" });
    }
  );
});

app.get("/api/evaluasi/siswa/:id_siswa", (req, res) => {
  const { id_siswa } = req.params;

  db.query(
    "SELECT id, nilai, keterangan, created_at FROM evaluasi WHERE id_siswa = ?",
    [id_siswa],
    (err, results) => {
      if (err) {
        console.error("ERROR GET:", err);
        return res.status(500).json({ message: "Server error" });
      }

      return res.json(results);
    }
  );
});

// =====================
// SERVER
// =====================
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      message: `Upload error: ${err.message}`,
    });
  }

  if (err) {
    return res.status(400).json({
      message: err.message || "Terjadi kesalahan.",
    });
  }

  next();
});

app.listen(5000, () => {
  console.log("Server jalan di http://localhost:5000 🚀");
});