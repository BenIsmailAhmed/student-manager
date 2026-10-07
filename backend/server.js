const db = require("./db");
const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 3000;

app.use(cors());
app.use(express.json());


// connection de base de donneé
db.getConnection()
    .then((connection) => {
        console.log("Connexion à MySQL réussie ✅");
        connection.release();
    })
    .catch((error) => {
        console.error("Erreur de connexion à MySQL ❌");
        console.error(error.message);
    });

// Route principale
app.get("/", (req, res) => {
    res.send("Bienvenue dans Student Manager 🚀");
});


// GET : récupérer les étudiants
app.get("/api/students", async (req, res) => {
    try {
        const [students] = await db.query(
            "SELECT * FROM students"
        );

        res.json(students);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Erreur lors de la récupération des étudiants"
        });
    }
});


// POST : ajouter un étudiant
app.post("/api/students", async (req, res) => {
    try {
        const { nom, prenom, classe } = req.body;

        // Validation
        if (!nom || !prenom || !classe) {
            return res.status(400).json({
                message: "Tous les champs sont obligatoires"
            });
        }

        if (
            !nom.trim() ||
            !prenom.trim() ||
            !classe.trim()
        ) {
            return res.status(400).json({
                message: "Les champs ne peuvent pas être vides"
            });
        }

        const [result] = await db.query(
            `INSERT INTO students (nom, prenom, classe)
             VALUES (?, ?, ?)`,
            [
                nom.trim(),
                prenom.trim(),
                classe.trim()
            ]
        );

        const nouvelEtudiant = {
            id: result.insertId,
            nom: nom.trim(),
            prenom: prenom.trim(),
            classe: classe.trim()
        };

        res.status(201).json(nouvelEtudiant);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Erreur lors de l'ajout de l'étudiant"
        });
    }
});
// PUT : modifier un étudiant
app.put("/api/students/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nom, prenom, classe } = req.body;

        if (!nom || !prenom || !classe) {
            return res.status(400).json({
                message: "Tous les champs sont obligatoires"
            });
        }

        if (
            !nom.trim() ||
            !prenom.trim() ||
            !classe.trim()
        ) {
            return res.status(400).json({
                message: "Les champs ne peuvent pas être vides"
            });
        }

        const [result] = await db.query(
            `UPDATE students
             SET nom = ?, prenom = ?, classe = ?
             WHERE id = ?`,
            [
                nom.trim(),
                prenom.trim(),
                classe.trim(),
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Étudiant introuvable"
            });
        }

        const [rows] = await db.query(
            "SELECT * FROM students WHERE id = ?",
            [id]
        );

        res.json(rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Erreur lors de la modification"
        });
    }
});

// DELETE : supprimer un étudiant
app.delete("/api/students/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const [result] = await db.query(
            "DELETE FROM students WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Étudiant introuvable"
            });
        }

        res.json({
            message: "Étudiant supprimé avec succès"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Erreur lors de la suppression de l'étudiant"
        });
    }
});

// recherche 

app.get("/api/students/search", async (req, res) => {
    try {
        const recherche = req.query.q;

        const [students] = await db.query(
            `SELECT * FROM students
             WHERE nom LIKE ?
             OR prenom LIKE ?
             OR classe LIKE ?`,
            [
                `%${recherche}%`,
                `%${recherche}%`,
                `%${recherche}%`
            ]
        );

        res.json(students);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Erreur lors de la recherche"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});