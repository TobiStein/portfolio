---
title: 'Leg raise through reinforcement learning (SCONE)'
description: 'A PPO agent learns to activate the muscles of a leg model to perform a leg raise, in the SCONE biomechanics simulator.'
publishDate: 2025-04-21
tags: [reinforcement-learning, python, stable-baselines3, biomechanics]
repo: https://forge.univ-lyon1.fr/p1808009/recherche-image
---

## Overview

A team research project carried out from October 2024 to April 2025: simulating a leg-raise exercise with a reinforcement learning agent in SCONE, a simulator for musculoskeletal models. The repository provides a training environment, training and test scripts, and a pre-trained agent to see the result without retraining everything.

## Approach

- **Environment**: built on the sconegym library (a Gym interface for SCONE), a dedicated environment, `SingleLegGym`, drives a leg model in OpenSim format. An adaptation of sconegym makes it work with a model that has no head or torso.
- **Observations**: the state of the right leg at each simulation step.
- **Reward**: the agent is penalised by the gap between the height of the femur and a target trajectory that rises gradually to the height of the pelvis.
- **Training**: a PPO agent (Stable-Baselines3), trained over 100,000 simulation steps.
- **Reuse**: the README explains how to adapt the approach to another SCONE model (observations, reward, stopping criterion).

## Tech stack

Python, SCONE and sconegym, Gym, Stable-Baselines3 (PPO), OpenSim musculoskeletal model, SCONE Lua scripts.
