---
title: 'Hungry Hungry Hippos : flotte de robots ramasseurs de balles'
description: 'Deux robots Lego EV3 autonomes ramassent un maximum de balles dans une arène filmée par caméra : vision par ordinateur avec OpenCV, Raspberry Pi et réseau TCP/IP.'
publishDate: 2025-02-24
tags: [robotique, computer-vision, opencv, python, c++, raspberry-pi]
repo: https://github.com/Thomas-aub/Hungry_Hungry_Hippos_Robots
---

## Présentation

Inspiré du jeu de société _Hippos gloutons_ (Hungry Hungry Hippos), ce projet fait s’affronter deux robots autonomes : des balles sont lâchées au hasard dans une arène, et chaque robot doit en ramasser le plus possible dans un temps limité. Projet réalisé en équipe.

## Architecture

- **Robots** : deux robots Lego EV3, chacun piloté par un Raspberry Pi.
- **Vision** : des caméras placées au-dessus de l’arène filment la partie, et le flux vidéo passe par un réseau Wi-Fi privé. Les balles sont repérées avec OpenCV : seuillage de couleur en HSV, nettoyage morphologique, puis détection des cercles par transformée de Hough.
- **Réseau** : les commandes de déplacement et les données circulent entre le système de contrôle et les robots par TCP/IP.
- **Code** : Python, avec des composants en C++.
