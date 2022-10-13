# Mirador

## About Mirador Human-Machine Interface

Mirador HMI, a useful web page interface designed manage and control robots outdoor. Mirador is initially created to work with ROS and aim to make global navigation easier. It allows to use multiple robots especially

## Use

### Clone this repository

```bash
git clone https://github.com/julesberhault/mirador.git
```

### Install NodeJS

Follow this [**link**](https://nodejs.dev/en/learn/how-to-install-nodejs/) to install NodeJS on your platform

### Run Mirador with NodeJS

Simply launch server with:
```bash
node mirador
```

### ROS Side

Run [**Mirador driver**](https://github.com/julesberhault/mirador_driver) first.

This package is designed to run with a second package named [**mirador_driver**](https://github.com/julesberhault/mirador_driver). You need to install and run this driver to interface with ROS environment.

## Source details

### Mirador server executable

[**mirador.js**](mirador.js)

### Login web page

Web page to set your login informations to connect to your robot.

#### HTML /PUG
views/[**login.pug**](views/login.pug)

#### JavaScript
public/js/[**login.pug**](public/js/login.js)

### Robot web page

Main web page to mangage and control your robot.

#### HTML /PUG
views/[**robot.pug**](views/robot.pug)

#### JavaScript
public/js/[**robot.pug**](public/js/robot.js)

### Broadcaster web page

Simple and small web page to braodcast webrtc stream on the server. Useful to spread video from robot to the server.

#### HTML /PUG
views/[**login.pug**](views/broadcaster.pug)

#### JavaScript
public/js/[**login.pug**](public/js/broadcaster.js)
