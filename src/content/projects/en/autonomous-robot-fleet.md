---
title: 'Hungry Hungry Hippos: a fleet of ball-collecting robots'
description: 'Two autonomous Lego EV3 robots collect as many balls as possible in a camera-tracked arena: computer vision with OpenCV, Raspberry Pi and TCP/IP networking.'
publishDate: 2025-02-24
tags: [robotics, computer-vision, opencv, python, c++, raspberry-pi]
repo: https://github.com/Thomas-aub/Hungry_Hungry_Hippos_Robots
---

## Overview

Inspired by the board game _Hungry Hungry Hippos_, this project pits two autonomous robots against each other: balls are dropped at random into an arena, and each robot must collect as many as it can within a time limit. A team project.

## Architecture

- **Robots**: two Lego EV3 robots, each driven by a Raspberry Pi.
- **Vision**: overhead cameras film the arena and stream video over a private Wi-Fi network. Balls are located with OpenCV: HSV colour thresholding, morphological clean-up, then circle detection with the Hough transform.
- **Networking**: movement commands and data travel between the control system and the robots over TCP/IP.
- **Code**: Python, with C++ components.
