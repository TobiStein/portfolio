---
title: 'Lever de jambe par apprentissage par renforcement (SCONE)'
description: 'Un agent PPO apprend à activer les muscles d’un modèle de jambe pour réaliser un lever de jambe, dans le simulateur biomécanique SCONE.'
publishDate: 2025-04-21
tags: [reinforcement-learning, python, stable-baselines3, biomécanique]
repo: https://forge.univ-lyon1.fr/p1808009/recherche-image
---

## Présentation

Projet de recherche mené en équipe d’octobre 2024 à avril 2025 : simuler un exercice de lever de jambe avec un agent d’apprentissage par renforcement, dans SCONE, un simulateur de modèles musculo-squelettiques. Le dépôt fournit un environnement d’entraînement, des scripts d’entraînement et de test, ainsi qu’un agent pré-entraîné pour voir le résultat sans tout réentraîner.

## Démarche

- **Environnement** : à partir de la bibliothèque sconegym (interface Gym pour SCONE), un environnement dédié, `SingleLegGym`, pilote un modèle de jambe au format OpenSim. Une adaptation de sconegym permet d’utiliser un modèle sans tête ni tronc.
- **Observations** : l’état de la jambe droite à chaque pas de simulation.
- **Récompense** : l’agent est pénalisé par l’écart entre la hauteur du fémur et une trajectoire cible qui monte progressivement jusqu’à la hauteur du bassin.
- **Apprentissage** : un agent PPO (Stable-Baselines3), entraîné sur 100 000 pas de simulation.
- **Réutilisation** : le README explique comment adapter la démarche à un autre modèle SCONE (observations, récompense, critère d’arrêt).

## Technologies

Python, SCONE et sconegym, Gym, Stable-Baselines3 (PPO), modèle musculo-squelettique OpenSim, scripts Lua de SCONE.
