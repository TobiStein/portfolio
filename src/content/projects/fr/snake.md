---
title: 'Snake'
description: 'Le jeu Snake en JavaScript sans bibliothèque : trois niveaux décrits en JSON, un mode sans fin à trois difficultés et un score.'
publishDate: 2022-10-30
tags: [javascript, html-css, canvas, jeu]
repo: https://github.com/TobiStein/jeuSnake
heroImage:
  src: ../../../assets/projects/snake.png
  alt: 'Partie en cours au niveau 2 : le serpent, deux murs et la nourriture sur la grille, avec le score en dessous'
---

## Présentation

Le jeu Snake, réalisé seule en HTML, CSS et JavaScript (octobre 2022) et dessiné dans un canvas. Le serpent se déplace au clavier et grandit à chaque fruit mangé ; la partie s’arrête s’il touche un mur, un bord ou son propre corps.

## Fonctionnalités

- **3 niveaux** chargés depuis des fichiers JSON : taille de la grille, vitesse, murs, positions de départ du serpent et de la nourriture. Un niveau est gagné quand toute la nourriture est mangée.
- **Mode sans fin**, avec trois niveaux de difficulté (facile, moyen, difficile) qui règlent la vitesse ; la nourriture réapparaît au hasard.
- **Contrôle aux flèches**, sans demi-tour possible.
- **Score**, écrans de victoire et de défaite, et bouton pour rejouer.

## Technologies

HTML, CSS, JavaScript (Canvas 2D, `fetch`), niveaux au format JSON.
