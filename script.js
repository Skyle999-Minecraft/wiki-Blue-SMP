/* Blue SMP – wiki des joueurs
   Recherche dans les sections et le tableau des commandes, menu repliable
   sur mobile, repère de la section en cours dans le sommaire.
   Sans JavaScript, la page reste entière et lisible : ce fichier ne fait qu'ajouter. */
(function () {
  "use strict";

  var doc = document;
  var bureau = window.matchMedia("(min-width: 62em)");
  var sommaire = doc.getElementById("sommaire");
  var defileur = doc.querySelector(".nav-collant");

  function tous(sel, racine) {
    return Array.prototype.slice.call((racine || doc).querySelectorAll(sel));
  }

  // Le texte d'un élément, avec une espace autour de chaque bloc (cellule,
  // ligne de liste, paragraphe…). textContent colle « <th>/guide</th><td>rouvrir »
  // en « /guiderouvrir », et « rouvrir » ne serait plus trouvé.
  var BLOCS = {
    P: 1, LI: 1, TD: 1, TH: 1, TR: 1, H2: 1, H3: 1, H4: 1, H5: 1, DIV: 1, UL: 1, OL: 1,
    TABLE: 1, CAPTION: 1, SUMMARY: 1, DETAILS: 1, SECTION: 1, BR: 1
  };

  function texteDe(el) {
    var morceaux = [];
    (function lire(n) {
      for (var c = n.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === 3) {
          morceaux.push(c.nodeValue);
        } else if (c.nodeType === 1) {
          var bloc = BLOCS[c.tagName];
          if (bloc) morceaux.push(" ");
          lire(c);
          if (bloc) morceaux.push(" ");
        }
      }
    })(el);
    return morceaux.join("");
  }

  // Minuscules, sans accents, espaces simples : « Écrire » et « ecrire » se valent.
  function normaliser(texte) {
    return texte
      .normalize("NFD")
      .toLowerCase() // d'abord : sinon « Œuf » ne deviendrait jamais « oeuf »
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/\u0153/g, "oe")
      .replace(/\u00e6/g, "ae")
      .replace(/\s+/g, " ");
  }

  // Chaque mot cherché doit commencer un mot du texte : « tp » trouve « /tpa », pas « stp ».
  function motifs(mots) {
    return mots.map(function (m) {
      return new RegExp("(^|[^a-z0-9])" + m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    });
  }

  function contientTout(texte, res) {
    for (var i = 0; i < res.length; i++) {
      if (!res[i].test(texte)) return false;
    }
    return true;
  }

  /* ---------- Menu repliable ---------- */

  function majMenu() {
    if (sommaire) sommaire.open = bureau.matches;
  }
  majMenu();
  if (bureau.addEventListener) {
    bureau.addEventListener("change", majMenu);
  } else if (bureau.addListener) {
    bureau.addListener(majMenu);
  }
  if (sommaire) {
    sommaire.addEventListener("click", function (e) {
      if (!bureau.matches && e.target.closest("a")) sommaire.open = false;
    });
  }

  /* ---------- Liens du sommaire ---------- */

  var liensSommaire = {};
  tous(".toc a").forEach(function (a) {
    liensSommaire[a.getAttribute("href").slice(1)] = a;
  });

  /* ---------- Recherche ---------- */

  var form = doc.getElementById("recherche");
  var champ = doc.getElementById("q");
  var statut = doc.getElementById("recherche-statut");
  var aucun = doc.getElementById("aucun-resultat");
  var contenu = doc.getElementById("contenu");

  var parties = tous("main .partie:not(.partie-commandes)").map(function (el) {
    var sujets = tous(".sujet", el).map(function (s) {
      return { el: s, texte: normaliser(texteDe(s)), lien: liensSommaire[s.id] };
    });
    return { el: el, sujets: sujets, lien: liensSommaire[el.id] };
  });

  var partieCommandes = doc.getElementById("commandes");
  // Le titre d'une catégorie est sa ligne « groupe », où qu'elle soit dans le bloc.
  var groupes = tous("#table-commandes tbody").map(function (tb) {
    var titre = tb.querySelector("tr.groupe");
    var lignes = tous("tr:not(.groupe)", tb);
    return {
      el: tb,
      titre: titre ? normaliser(texteDe(titre)) : "",
      lignes: lignes.map(function (tr) {
        return { el: tr, texte: normaliser(texteDe(tr)) };
      })
    };
  });

  // Les titres (sections et sous-titres) servent aux raccourcis affichés sous le champ.
  var titres = [];
  parties.forEach(function (p) {
    p.sujets.forEach(function (s) {
      tous("h3, h4[id]", s.el).forEach(function (h) {
        titres.push({
          sujet: s.el,
          cible: h.tagName === "H3" ? s.el.id : h.id,
          niveau: h.tagName === "H3" ? 0 : 1,
          libelle: h.textContent.replace(/\s+/g, " ").trim(),
          texte: normaliser(h.textContent)
        });
      });
    });
  });

  var listeTitres = null;

  function majTitres(res, actif) {
    if (!listeTitres) return;
    while (listeTitres.firstChild) listeTitres.removeChild(listeTitres.firstChild);
    if (!actif) {
      listeTitres.hidden = true;
      return;
    }
    var trouves = titres.filter(function (t) {
      return !t.sujet.hidden && contientTout(t.texte, res);
    });
    trouves.sort(function (a, b) {
      return a.niveau - b.niveau;
    });
    trouves.slice(0, 6).forEach(function (t) {
      var li = doc.createElement("li");
      var a = doc.createElement("a");
      a.href = "#" + t.cible;
      a.textContent = t.libelle;
      li.appendChild(a);
      listeTitres.appendChild(li);
    });
    listeTitres.hidden = trouves.length === 0;
  }

  function compte(n, mot) {
    if (n === 0) return "aucune " + mot;
    return n + " " + mot + (n > 1 ? "s" : "");
  }

  var actifAvant = false;

  function appliquer(brut) {
    var requete = normaliser(brut).trim();
    var mots = motifs(requete ? requete.split(" ") : []);
    var actif = requete.length >= 2;
    var nbSujets = 0;
    var nbCommandes = 0;

    doc.body.classList.toggle("en-recherche", actif);

    parties.forEach(function (p) {
      var visibles = 0;
      p.sujets.forEach(function (s) {
        var ok = !actif || contientTout(s.texte, mots);
        s.el.hidden = !ok;
        if (s.lien) s.lien.parentNode.hidden = !ok;
        if (ok) {
          visibles++;
          if (actif) {
            tous("details.replie", s.el).forEach(function (d) {
              if (contientTout(normaliser(texteDe(d)), mots)) d.open = true;
            });
          }
        }
      });
      if (actif) nbSujets += visibles;
      p.el.hidden = actif && visibles === 0;
      if (p.lien) p.lien.parentNode.hidden = p.el.hidden;
    });

    groupes.forEach(function (g) {
      var groupeOk = actif && contientTout(g.titre, mots);
      var visibles = 0;
      g.lignes.forEach(function (l) {
        var ok = !actif || groupeOk || contientTout(l.texte, mots);
        l.el.hidden = !ok;
        if (ok) visibles++;
      });
      g.el.hidden = visibles === 0;
      if (actif) nbCommandes += visibles;
    });
    if (partieCommandes) {
      partieCommandes.hidden = actif && nbCommandes === 0;
      if (liensSommaire.commandes) liensSommaire.commandes.parentNode.hidden = partieCommandes.hidden;
    }

    if (aucun) aucun.hidden = !actif || nbSujets + nbCommandes > 0;

    if (!actif) {
      statut.textContent = requete ? "Tape au moins deux lettres." : "";
    } else if (nbSujets + nbCommandes === 0) {
      statut.textContent = "Aucun résultat.";
    } else {
      statut.textContent = "Résultats : " + compte(nbSujets, "section") + ", " + compte(nbCommandes, "commande") + ".";
    }
    majTitres(mots, actif);
    majMarge();

    // Sur grand écran, ramène le haut des résultats sous les yeux.
    if (actif && !actifAvant && bureau.matches && contenu) {
      var haut = contenu.getBoundingClientRect().top + window.pageYOffset;
      if (window.pageYOffset > haut) window.scrollTo(0, haut);
    }
    actifAvant = actif;
    majRepere();
  }

  // Au clavier, un lien du sommaire qui prend le focus ne doit pas finir
  // caché sous le formulaire collant : on réserve sa hauteur en haut.
  function majMarge() {
    if (!defileur || !form) return;
    var marge = bureau.matches && !form.hidden ? form.offsetHeight + 8 : 0;
    defileur.style.scrollPaddingTop = marge + "px";
  }

  if (form && champ && statut) {
    form.hidden = false;
    listeTitres = doc.createElement("ul");
    listeTitres.className = "recherche-titres";
    listeTitres.setAttribute("aria-label", "Titres qui correspondent");
    listeTitres.hidden = true;
    form.appendChild(listeTitres);
    majMarge();
    window.addEventListener("resize", majMarge);
    if (bureau.addEventListener) {
      bureau.addEventListener("change", majMarge);
    } else if (bureau.addListener) {
      bureau.addListener(majMarge);
    }
    var minuterie = null;

    champ.addEventListener("input", function () {
      clearTimeout(minuterie);
      minuterie = setTimeout(function () {
        appliquer(champ.value);
      }, 120);
    });

    champ.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && champ.value) {
        e.preventDefault();
        champ.value = "";
        appliquer("");
      }
    });

    // Entrée : aller au premier résultat.
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearTimeout(minuterie);
      appliquer(champ.value);
      var premier = null;
      tous("main .sujet, #commandes").some(function (el) {
        if (!el.hidden && !el.closest("[hidden]")) {
          premier = el;
          return true;
        }
        return false;
      });
      if (premier && doc.body.classList.contains("en-recherche")) {
        premier.scrollIntoView();
        var titre = premier.querySelector("h2, h3");
        if (titre) {
          titre.setAttribute("tabindex", "-1");
          titre.focus({ preventScroll: true });
        }
      }
    });

    // Un lien vers une section masquée par la recherche efface d'abord la recherche.
    doc.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a || !champ.value) return;
      var id = a.getAttribute("href").slice(1);
      var cible = id && doc.getElementById(id);
      if (cible && cible.closest("[hidden]")) {
        champ.value = "";
        appliquer("");
      }
    });
  }

  /* ---------- Repère de la section en cours ---------- */

  var reperes = tous("main .sujet, #commandes").filter(function (el) {
    return liensSommaire[el.id];
  });
  var lienCourant = null;
  var attente = false;

  function garderVisible(a) {
    if (!bureau.matches || !defileur) return;
    var r = a.getBoundingClientRect();
    var b = defileur.getBoundingClientRect();
    var marge = form && !form.hidden ? form.offsetHeight : 0;
    if (r.top < b.top + marge + 24 || r.bottom > b.bottom - 48) {
      defileur.scrollTop += r.top - b.top - marge - b.height / 3;
    }
  }

  function majRepere() {
    attente = false;
    var limite = window.innerHeight * 0.3;
    var trouve = null;
    for (var i = 0; i < reperes.length; i++) {
      var el = reperes[i];
      if (el.hidden || el.closest("[hidden]")) continue;
      if (el.getBoundingClientRect().top <= limite) {
        trouve = el;
      } else {
        break;
      }
    }
    var lien = trouve ? liensSommaire[trouve.id] : null;
    if (lien === lienCourant) return;
    if (lienCourant) lienCourant.removeAttribute("aria-current");
    lienCourant = lien;
    if (lien) {
      lien.setAttribute("aria-current", "true");
      garderVisible(lien);
    }
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!attente) {
        attente = true;
        window.requestAnimationFrame(majRepere);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", majRepere);
  majRepere();

  /* ---------- Tableaux larges : atteignables au clavier ---------- */

  // Le nom annoncé par un lecteur d'écran : la légende, sinon le titre qui précède.
  function libelleTableau(w) {
    var legende = w.querySelector("caption");
    if (legende) return legende.textContent;
    for (var el = w.previousElementSibling; el; el = el.previousElementSibling) {
      if (/^H[2-5]$/.test(el.tagName)) return el.textContent;
    }
    var section = w.closest("section");
    var titre = section && section.querySelector("h2, h3");
    return titre ? titre.textContent : "";
  }

  function majTableaux() {
    tous(".table-wrap").forEach(function (w) {
      if (w.scrollWidth > w.clientWidth + 1) {
        var libelle = libelleTableau(w).replace(/\s+/g, " ").trim();
        w.setAttribute("tabindex", "0");
        w.setAttribute("role", "region");
        w.setAttribute("aria-label", libelle ? "Tableau : " + libelle : "Tableau");
      } else {
        w.removeAttribute("tabindex");
        w.removeAttribute("role");
        w.removeAttribute("aria-label");
      }
    });
  }
  majTableaux();
  window.addEventListener("resize", majTableaux);
})();
