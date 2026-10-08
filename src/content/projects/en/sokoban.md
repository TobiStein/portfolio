---
title: 'Sokoban'
description: 'The Sokoban puzzle game in Java: 8 levels described in JSON, coloured boxes, traps, ice and rails, in a Swing interface.'
publishDate: 2024-04-10
tags: [java, swing, oop, game]
repo: https://github.com/TobiStein/SOKOBAN
---

## Overview

An object-oriented programming project built with a partner (April 2024). Sokoban is a puzzle game: the player pushes boxes onto their target squares. Only one box moves at a time, boxes cannot be pulled, and a level is solved when every box is on its target.

## Features

- **Coloured boxes**: each box must reach the target of its colour; brown boxes have no target and act as obstacles.
- **Obstacles**: traps (level 4), ice (level 5) and rails (level 6).
- **8 levels** described in JSON files (size, hero position, boxes, targets, walls, traps, ice, rails): adding a level means adding a file.
- **Step counter**, compared with the minimum number of moves set for each level.
- **Menu** to pick a level.

## Tech stack

Java, Swing interface, model / view-controller separation, Jackson to read the JSON levels.
