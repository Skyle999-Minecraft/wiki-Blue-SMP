# Wiki des joueurs de Blue SMP

Un site statique d'une seule page, sans framework ni dépendance. Il marche hors ligne : double-clique sur `index.html` pour l'ouvrir dans ton navigateur.

| Fichier | Rôle |
|---|---|
| `index.html` | tout le contenu du wiki |
| `style.css` | la mise en page, les couleurs, le mode sombre |
| `script.js` | la recherche, le menu repliable sur mobile, le repère de la section en cours |
| `README.md` | ce fichier |

Sans JavaScript, la page reste complète et lisible ; seule la recherche disparaît.

## À remplacer avant de publier

Ouvre `index.html` dans un éditeur de texte (Notepad++, VS Code, ou le Bloc-notes) et cherche avec Ctrl+F :

- `[adresse du serveur]` : l'adresse Java que donne Eternal Zero, dans l'en-tête. Une seule occurrence. Si elle a besoin d'un port, écris-le avec (`:26611`).
- Le port Bedrock, dans l'en-tête, est `26611` : c'est celui de Java, parce que Geyser tourne en `clone-remote-port`. Vérifie-le. Si l'hébergeur donne un second port pour Bedrock, mets-le à la place et retire « (le même que Java) ».
- Si tu changes de version de Minecraft, elle est aussi dans l'en-tête (`Minecraft Java 26.3`).

Le lien du Discord, dans le pied de page, est déjà le bon : `https://discord.gg/6eqTWVe84j`, celui que donne `/discord` en jeu.

## Publier sur GitHub Pages

### 1. Créer le dépôt

1. Connecte-toi sur [github.com](https://github.com).
2. En haut à droite, clique sur **+** puis **New repository**.
3. Donne-lui un nom, par exemple `bluesmp-wiki`. Laisse-le en **Public** (GitHub Pages gratuit demande un dépôt public).
4. Ne coche rien d'autre et clique sur **Create repository**.

### 2. Pousser les fichiers

Au choix.

**Depuis le site de GitHub**, sans rien installer : sur la page du dépôt vide, clique sur **uploading an existing file**, glisse `index.html`, `style.css`, `script.js` et `README.md`, puis clique sur **Commit changes**. Ensuite, clique sur **Add file** puis **Create new file**, nomme-le `.nojekyll` (avec le point), laisse-le vide et clique sur **Commit changes**.

**Avec Git** : ouvre Git Bash et tape ces commandes. Les deux lignes `git config` ne servent qu'une fois, sur un Git tout neuf. Mets ton pseudo et ton adresse e-mail ; tu peux aussi prendre l'adresse « noreply » de GitHub, dans **Settings** puis **Emails**.

```sh
cd "$HOME/Desktop/BlueSMP-Wiki"
git config --global user.name "TonPseudo"
git config --global user.email "ton-adresse@exemple.fr"
git init
touch .nojekyll
git add index.html style.css script.js README.md .nojekyll
git commit -m "Wiki des joueurs"
git branch -M main
git remote add origin https://github.com/TON-COMPTE/bluesmp-wiki.git
git push -u origin main
```

Remplace `TON-COMPTE` et `bluesmp-wiki` par ton nom d'utilisateur et le nom du dépôt. Au premier `git push`, une fenêtre te demande de te connecter à GitHub : accepte.

Le fichier vide `.nojekyll` dit à GitHub de publier les fichiers tels quels, sans les passer par Jekyll. Sans lui, le site marche quand même, mais il met plus de temps à se publier.

### 3. Activer GitHub Pages

1. Dans le dépôt, ouvre **Settings**, puis **Pages** dans la colonne de gauche.
2. Sous **Build and deployment**, choisis **Source : Deploy from a branch**.
3. Sous **Branch**, choisis **main** et le dossier **/ (root)**, puis clique sur **Save**.
4. Attends une à deux minutes et recharge la page : l'adresse du site s'affiche en haut, du type `https://ton-compte.github.io/bluesmp-wiki/`.

Chaque fois que tu pousses une modification sur `main`, le site se met à jour tout seul en une minute ou deux. Si tu ne vois pas le changement, recharge avec Ctrl+F5 : le navigateur peut garder l'ancienne version jusqu'à 10 minutes.

## Modifier un texte

Tout le texte est dans `index.html`. Enregistre toujours le fichier en **UTF-8**.

1. Ouvre `index.html` dans ton éditeur.
2. Cherche avec Ctrl+F quelques mots de la phrase à changer.
3. Modifie le texte entre les balises, sans toucher aux balises elles-mêmes (`<p>`, `</p>`, `<code>`…).
4. Enregistre, puis recharge la page dans le navigateur pour vérifier.
5. Change la ligne `Dernière mise à jour : novembre 2026`, près du début.

Quelques repères :

- Une commande s'écrit entre `<code>` et `</code>`. Les signes `<` et `>` s'y écrivent `&lt;` et `&gt;` : `<code>/tpa &lt;joueur&gt;</code>`. Le signe `&` s'écrit `&amp;`.
- Un lien vers une autre section : `<a href="#homes">les homes</a>`. Ce qui suit le `#` est l'`id` de la section visée.
- Un encadré : `<div class="note note-astuce" role="note">` (ou `note-attention`), avec un titre `<p class="note-titre">Astuce</p>` puis le texte dans un seul `<p>`. Le titre s'affiche en ligne, suivi d'un deux-points ajouté par la feuille de style : n'en mets pas toi-même.
- Les espaces devant `:` `;` `!` `?`, dans les nombres (`2 000 $`) et entre un nombre et son unité sont des espaces insécables. Elles évitent une coupure de ligne au mauvais endroit. Si ta recherche Ctrl+F ne trouve pas une phrase qui contient un deux-points, cherche un morceau plus court.

### Ajouter une section

1. Copie une section existante, de `<section class="sujet" id="...">` jusqu'au `</section>` qui la ferme. Colle-la à l'intérieur d'une partie (`<section class="partie" ...>`), entre deux autres sections.
2. Donne-lui un `id` nouveau, en minuscules, sans accent ni espace (par exemple `id="nouvelle-section"`), et change son titre `<h3>`.
3. Change aussi l'`id` de chaque `<h4>` qu'elle contient, sur le modèle `id="nouvelle-section-titre-du-h4"`. Chaque `id` doit rester unique dans tout le fichier : une copie garde ceux de la section d'origine.
4. Dans le sommaire, en haut du fichier (`<ol class="toc">`), chaque partie tient sur une seule ligne. Sur la ligne de la partie concernée, insère `<li><a href="#nouvelle-section">Titre court</a></li>` dans son `<ol>`, à la même position que la section dans la page.

Si la section est bien rangée dans une partie, la recherche la prend en compte toute seule.

### Ajouter une commande au tableau final

Dans la partie `Toutes les commandes`, chaque catégorie est un bloc `<tbody>`, qui commence par sa ligne de titre `<tr class="groupe">`. Ajoute ta ligne dans le bon bloc, après cette ligne de titre :

```html
<tr><th scope="row"><code>/ma-commande &lt;joueur&gt;</code></th><td>ce que fait la commande</td></tr>
```

Pense aussi à mettre à jour le nombre de commandes dans la légende du tableau (`<caption>`).

