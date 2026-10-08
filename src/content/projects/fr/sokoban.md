---
title: 'Sokoban'
description: 'Le jeu de réflexion Sokoban en Java : 8 niveaux décrits en JSON, boîtes de couleur, pièges, glace et rails, dans une interface Swing.'
publishDate: 2024-04-10
tags: [java, swing, poo, jeu]
repo: https://github.com/TobiStein/SOKOBAN
---

## Présentation

Projet de programmation orientée objet réalisé en binôme (avril 2024). Le Sokoban est un jeu de réflexion : le joueur pousse des boîtes jusqu’à leurs emplacements cibles. Une seule boîte se déplace à la fois, on ne peut pas la tirer, et le niveau est résolu quand toutes les boîtes sont sur leur objectif.

## Fonctionnalités

- **Boîtes de couleur** : chaque boîte doit rejoindre l’objectif de sa couleur ; les boîtes marron, sans objectif, servent d’obstacles.
- **Obstacles** : pièges (niveau 4), glace (niveau 5) et rails (niveau 6).
- **8 niveaux** décrits dans des fichiers JSON (taille, position du héros, boîtes, objectifs, murs, pièges, glace, rails) : ajouter un niveau revient à ajouter un fichier.
- **Compteur de pas**, comparé au nombre minimal de coups indiqué pour chaque niveau.
- **Menu** de sélection des niveaux.

## Technologies

Java, interface Swing, séparation modèle / vue-contrôleur, Jackson pour lire les niveaux JSON.
