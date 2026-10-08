---
title: 'Smart Connect 4: a robot that plays Connect Four'
description: 'An autonomous robot that plays Connect Four against a human on a real board: deep reinforcement learning AI, Arduino, and parts designed in Onshape then 3D-printed.'
publishDate: 2026-02-01
tags: [robotics, iot, reinforcement-learning, pytorch, arduino, onshape]
repo: https://forge.univ-lyon1.fr/puissance/iot-connect4
heroImage:
  src: ../../../assets/projects/connect4-robot.jpg
  alt: 'The Smart Connect 4 robot mid-game, next to the web interface showing the same board'
---

## Overview

Smart Connect 4 is an autonomous robot that plays Connect Four against a human, on a real board. This Master’s project in Artificial Intelligence (Université Claude Bernard Lyon 1, 2025-2026), built in a team of 5, brings together robotics, the Internet of Things and deep reinforcement learning.

## How a game unfolds

1. On start-up, the robot calibrates its 7 light sensors (one photoresistor per column) to the ambient light.
2. When the player drops a token, the sensor of that column detects it: the game state is tracked without a camera.
3. The board is turned into a matrix and sent to the AI, which picks a column.
4. A motorised carriage moves above that column, then a servo opens a trapdoor that releases a token.

## Architecture

Three modules communicate in real time:

- **AI brain** (Python, PyTorch, Flask): a REST API receives the board state and returns the column to play. A _Dueling DQN_ trained through self-play picks the move, behind a reflex layer that plays an immediate win or blocks a direct threat.
- **Controller** (Node.js, Johnny-Five, Firmata protocol): it drives the Arduino Mega, reads the sensors, controls the stepper motor and the servo, and broadcasts the game state over WebSocket.
- **Web interface** (React, Vite, Framer Motion): it shows the game in real time and offers an “engineer mode” to calibrate the motors and sensor thresholds, with settings saved on the server.

## Mechanics

The robot relies on custom 3D-printed parts, **which I designed myself in Onshape**:

- the mount of the stepper motor (28BYJ-48) that moves the carriage above the 7 columns;
- the dispenser and its trapdoor, opened by a servo (SG90): this mechanical trigger releases the tokens one at a time;
- the tokens themselves, redesigned so they drop without jamming.

A vertical tube acts as a magazine and feeds the dispenser by gravity.

## Outcome

The modular architecture cleanly separates the AI, the hardware control and the interface, and the reflex layer makes the robot reliable on decisive moves. Known limitation: the photoresistors are sensitive to changes in lighting; a planned improvement is to detect tokens with a camera and OpenCV.
