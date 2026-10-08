---
title: 'Smart Connect 4 : robot joueur de Puissance 4'
description: 'Un robot autonome qui affronte un humain au Puissance 4 sur une vraie grille : IA par apprentissage par renforcement profond, Arduino et pièces modélisées sur Onshape puis imprimées en 3D.'
publishDate: 2026-02-01
tags: [robotique, iot, reinforcement-learning, pytorch, arduino, onshape]
repo: https://forge.univ-lyon1.fr/puissance/iot-connect4
heroImage:
  src: ../../../assets/projects/connect4-robot.jpg
  alt: 'Le robot Smart Connect 4 en pleine partie, à côté de l’interface web qui affiche le même plateau'
---

## Présentation

Smart Connect 4 est un robot autonome qui joue au Puissance 4 contre un humain, sur une vraie grille. Ce projet de Master 2 Intelligence Artificielle (Université Claude Bernard Lyon 1, 2025-2026), réalisé en équipe de 5, réunit robotique, Internet des objets et apprentissage par renforcement profond.

## Déroulement d’une partie

1. Au démarrage, le robot calibre ses 7 capteurs de lumière (une photorésistance par colonne) selon la luminosité ambiante.
2. Quand le joueur lâche un jeton, le capteur de la colonne détecte son passage : l’état du jeu est suivi sans caméra.
3. Le plateau est converti en matrice et envoyé à l’IA, qui choisit une colonne.
4. Un chariot motorisé se place au-dessus de cette colonne, puis un servomoteur ouvre une trappe qui libère un pion.

## Architecture

Trois modules communiquent en temps réel :

- **Cerveau IA** (Python, PyTorch, Flask) : une API REST reçoit l’état du plateau et renvoie la colonne à jouer. Un réseau _Dueling DQN_ entraîné en self-play choisit le coup, précédé d’une couche réflexe qui joue un coup gagnant immédiat ou bloque une menace directe.
- **Contrôleur** (Node.js, Johnny-Five, protocole Firmata) : il pilote l’Arduino Mega, lit les capteurs, commande le moteur pas à pas et le servomoteur, et diffuse l’état de la partie par WebSocket.
- **Interface web** (React, Vite, Framer Motion) : elle affiche la partie en temps réel et propose un « mode ingénieur » pour calibrer les moteurs et les seuils des capteurs, avec sauvegarde des réglages côté serveur.

## Mécanique

Le robot repose sur des pièces sur mesure imprimées en 3D, **que j’ai moi-même modélisées sur Onshape** :

- le support du moteur pas à pas (28BYJ-48) qui déplace le chariot au-dessus des 7 colonnes ;
- le distributeur et sa trappe, ouverte par un servomoteur (SG90) : ce déclencheur mécanique libère les pions un par un ;
- les pions eux-mêmes, redessinés pour tomber sans se bloquer.

Un tube vertical sert de réservoir et alimente le distributeur par gravité.

## Bilan

L’architecture modulaire sépare nettement l’IA, le contrôle du matériel et l’interface, et la couche réflexe rend le robot fiable sur les coups décisifs. Limite identifiée : les photorésistances sont sensibles aux variations de lumière ; une évolution envisagée est de détecter les jetons par caméra avec OpenCV.
