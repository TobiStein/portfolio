---
title: 'Sign language translator (proof of concept)'
description: 'A webcam sign-detection prototype built with TensorFlow Object Detection: collecting and labelling an image dataset, then preparing a model through transfer learning.'
publishDate: 2022-03-19
tags: [computer-vision, deep-learning, tensorflow, opencv, python]
repo: https://github.com/cegepmatane/projet-specialise-2022-TobiStein
---

## Overview

An individual specialised project carried out in 2022 at the Cégep de Matane (Quebec). The goal: recognise signs made in front of a camera and display their meaning as subtitles. The project started with a technology watch and a proof of concept, documented in _Kickoff_ and _PoC_ sheets.

## Approach

- **Getting started**: a first TensorFlow model on tabular data (churn prediction), in a Jupyter notebook, to validate the tooling.
- **Data collection**: a notebook captures webcam images with OpenCV for three signs (“hello”, “thanks”, “I love you”).
- **Labelling**: the images are annotated with LabelImg, then converted into TFRecord files for training and testing.
- **Model**: transfer learning from a pre-trained SSD MobileNet v2 FPNLite (320 × 320) model from the TensorFlow Object Detection API.

## Tech stack

Python, TensorFlow (Object Detection API), OpenCV, LabelImg, Jupyter.
