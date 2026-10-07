import { useState, useEffect } from "react";
import "./App.css";

function App() {
    // =========================
    // STATES
    // =========================

    const [students, setStudents] = useState([]);

    const [showForm, setShowForm] = useState(false);

    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");
    const [classe, setClasse] = useState("");

    const [studentToEdit, setStudentToEdit] = useState(null);

    const [recherche, setRecherche] = useState("");

    // =========================
    // CHARGER LES ÉTUDIANTS
    // =========================

    useEffect(() => {
        chargerEtudiants();
    }, []);

    async function chargerEtudiants() {
        try {
            const response = await fetch(
                "http://localhost:3000/api/students"
            );

            if (!response.ok) {
                throw new Error(
                    "Impossible de récupérer les étudiants"
                );
            }

            const data = await response.json();

            setStudents(data);

        } catch (error) {
            console.error(error);
            alert("Erreur lors du chargement des étudiants.");
        }
    }

    // =========================
    // AJOUTER UN ÉTUDIANT
    // =========================

    async function ajouterEtudiant(event) {
        event.preventDefault();

        // Validation
        if (
            !nom.trim() ||
            !prenom.trim() ||
            !classe.trim()
        ) {
            alert("Tous les champs sont obligatoires.");
            return;
        }

        const nouvelEtudiant = {
            nom: nom.trim(),
            prenom: prenom.trim(),
            classe: classe.trim()
        };

        try {
            const response = await fetch(
                "http://localhost:3000/api/students",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(nouvelEtudiant)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Erreur lors de l'ajout"
                );
            }

            // Ajouter l'étudiant à la liste
            setStudents((anciensEtudiants) => [
                ...anciensEtudiants,
                data
            ]);

            // Vider le formulaire
            setNom("");
            setPrenom("");
            setClasse("");

            setShowForm(false);

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

    // =========================
    // COMMENCER MODIFICATION
    // =========================

    function commencerModification(student) {
        setStudentToEdit(student);
    }

    // =========================
    // MODIFIER UN ÉTUDIANT
    // =========================

    async function modifierEtudiant(event) {
        event.preventDefault();

        if (!studentToEdit) {
            return;
        }

        const donnees = {
            nom: studentToEdit.nom.trim(),
            prenom: studentToEdit.prenom.trim(),
            classe: studentToEdit.classe.trim()
        };

        // Validation
        if (
            !donnees.nom ||
            !donnees.prenom ||
            !donnees.classe
        ) {
            alert("Tous les champs sont obligatoires.");
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:3000/api/students/${studentToEdit.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(donnees)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Erreur lors de la modification"
                );
            }

            // Mettre à jour la liste
            setStudents((anciensEtudiants) =>
                anciensEtudiants.map((student) =>
                    student.id === data.id
                        ? data
                        : student
                )
            );

            // Fermer le formulaire
            setStudentToEdit(null);

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

    // =========================
    // SUPPRIMER UN ÉTUDIANT
    // =========================

    async function supprimerEtudiant(id) {
        const confirmation = window.confirm(
            "Voulez-vous vraiment supprimer cet étudiant ?"
        );

        if (!confirmation) {
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:3000/api/students/${id}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Impossible de supprimer l'étudiant"
                );
            }

            // Supprimer de l'affichage
            setStudents((anciensEtudiants) =>
                anciensEtudiants.filter(
                    (student) => student.id !== id
                )
            );

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

    // =========================
    // RECHERCHE
    // =========================

    async function rechercherEtudiants(texte) {
        setRecherche(texte);

        // Si la recherche est vide
        if (texte.trim() === "") {
            chargerEtudiants();
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:3000/api/students/search?q=${encodeURIComponent(
                    texte
                )}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Erreur lors de la recherche"
                );
            }

            setStudents(data);

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    }

    // =========================
    // DASHBOARD
    // =========================

    const nombreEtudiants = students.length;

    const nombreClasses = new Set(
        students.map((student) => student.classe)
    ).size;

    // =========================
    // AFFICHAGE
    // =========================

    return (
        <div className="app">

            <h1>🎓 Student Manager</h1>

            <p>
                Bienvenue dans notre application de gestion
                des étudiants.
            </p>


            {/* =========================
                DASHBOARD
            ========================= */}

            <div className="dashboard">

                <div className="card">
                    <h2>👨‍🎓</h2>
                    <h3>{nombreEtudiants}</h3>
                    <p>Étudiants</p>
                </div>

                <div className="card">
                    <h2>🏫</h2>
                    <h3>{nombreClasses}</h3>
                    <p>Classes</p>
                </div>

                <div className="card">
                    <h2>📅</h2>
                    <h3>0</h3>
                    <p>Absences</p>
                </div>

            </div>


            {/* =========================
                SECTION ÉTUDIANTS
            ========================= */}

            <div className="students-section">

                <div className="students-header">

                    <h2>Liste des étudiants</h2>

                    {/* RECHERCHE */}

                    <input
                        type="text"
                        placeholder="🔎 Rechercher..."
                        value={recherche}
                        onChange={(event) =>
                            rechercherEtudiants(
                                event.target.value
                            )
                        }
                    />

                    {/* BOUTON AJOUT */}

                    <button
                        onClick={() =>
                            setShowForm(!showForm)
                        }
                    >
                        {showForm
                            ? "Annuler"
                            : "Ajouter un étudiant"}
                    </button>

                </div>


                {/* =========================
                    FORMULAIRE AJOUT
                ========================= */}

                {showForm && (

                    <form
                        className="student-form"
                        onSubmit={ajouterEtudiant}
                    >

                        <input
                            type="text"
                            placeholder="Nom"
                            value={nom}
                            onChange={(event) =>
                                setNom(event.target.value)
                            }
                        />

                        <input
                            type="text"
                            placeholder="Prénom"
                            value={prenom}
                            onChange={(event) =>
                                setPrenom(event.target.value)
                            }
                        />

                        <input
                            type="text"
                            placeholder="Classe"
                            value={classe}
                            onChange={(event) =>
                                setClasse(event.target.value)
                            }
                        />

                        <button type="submit">
                            Ajouter
                        </button>

                    </form>

                )}


                {/* =========================
                    FORMULAIRE MODIFICATION
                ========================= */}

                {studentToEdit && (

                    <form
                        className="student-form"
                        onSubmit={modifierEtudiant}
                    >

                        <input
                            type="text"
                            placeholder="Nom"
                            value={studentToEdit.nom}
                            onChange={(event) =>
                                setStudentToEdit({
                                    ...studentToEdit,
                                    nom: event.target.value
                                })
                            }
                        />

                        <input
                            type="text"
                            placeholder="Prénom"
                            value={studentToEdit.prenom}
                            onChange={(event) =>
                                setStudentToEdit({
                                    ...studentToEdit,
                                    prenom: event.target.value
                                })
                            }
                        />

                        <input
                            type="text"
                            placeholder="Classe"
                            value={studentToEdit.classe}
                            onChange={(event) =>
                                setStudentToEdit({
                                    ...studentToEdit,
                                    classe: event.target.value
                                })
                            }
                        />

                        <button type="submit">
                            Enregistrer
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setStudentToEdit(null)
                            }
                        >
                            Annuler
                        </button>

                    </form>

                )}


                {/* =========================
                    TABLEAU
                ========================= */}

                <table>

                    <thead>

                        <tr>
                            <th>ID</th>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Classe</th>
                            <th>Actions</th>
                        </tr>

                    </thead>


                    <tbody>

                        {students.map((student) => (

                            <tr key={student.id}>

                                <td>{student.id}</td>

                                <td>{student.nom}</td>

                                <td>{student.prenom}</td>

                                <td>{student.classe}</td>

                                <td>

                                    <button
                                        onClick={() =>
                                            commencerModification(
                                                student
                                            )
                                        }
                                    >
                                        Modifier
                                    </button>

                                    <button
                                        onClick={() =>
                                            supprimerEtudiant(
                                                student.id
                                            )
                                        }
                                    >
                                        Supprimer
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default App;