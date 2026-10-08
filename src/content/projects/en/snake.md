---
title: 'Snake'
description: 'The Snake game in plain JavaScript: three levels described in JSON, an endless mode with three difficulty levels, and a score.'
publishDate: 2022-10-30
tags: [javascript, html-css, canvas, game]
repo: https://github.com/TobiStein/jeuSnake
heroImage:
  src: ../../../assets/projects/snake.png
  alt: 'A game in progress on level 2: the snake, two walls and food on the grid, with the score below'
---

## Overview

The Snake game, built on my own with HTML, CSS and JavaScript (October 2022) and drawn in a canvas. The snake is steered with the keyboard and grows with each piece of food; the game ends if it hits a wall, an edge or its own body.

## Features

- **3 levels** loaded from JSON files: grid size, speed, walls, starting positions of the snake and the food. A level is won once all the food has been eaten.
- **Endless mode**, with three difficulty levels (easy, medium, hard) that set the speed; food respawns at random.
- **Arrow-key controls**, with no U-turns.
- **Score**, victory and game-over screens, and a button to play again.

## Tech stack

HTML, CSS, JavaScript (Canvas 2D, `fetch`), levels in JSON format.
