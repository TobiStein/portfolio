---
title: 'Traducteur de langue des signes (preuve de concept)'
description: 'Prototype de détection de signes à la webcam avec TensorFlow Object Detection : collecte et annotation d’un jeu d’images, puis préparation d’un modèle par apprentissage par transfert.'
publishDate: 2022-03-19
tags: [computer-vision, deep-learning, tensorflow, opencv, python]
repo: https://github.com/cegepmatane/projet-specialise-2022-TobiStein
---

## Présentation

Projet spécialisé individuel réalisé en 2022 au Cégep de Matane (Québec). L’objectif : reconnaître des signes faits devant une caméra et afficher leur signification sous forme de sous-titres. Le projet a commencé par une veille technologique et une preuve de concept, documentées dans des fiches _Kickoff_ et _PoC_.

## Démarche

- **Prise en main** : un premier modèle TensorFlow sur des données tabulaires (prédiction de désabonnement), dans un notebook Jupyter, pour valider l’outillage.
- **Collecte** : un notebook capture des images à la webcam avec OpenCV pour trois signes (« hello », « thanks », « I love you »).
- **Annotation** : les images sont annotées avec LabelImg, puis converties en fichiers TFRecord pour l’entraînement et le test.
- **Modèle** : apprentissage par transfert à partir d’un modèle pré-entraîné SSD MobileNet v2 FPNLite (320 × 320) de l’API TensorFlow Object Detection.

## Technologies

Python, TensorFlow (Object Detection API), OpenCV, LabelImg, Jupyter.
