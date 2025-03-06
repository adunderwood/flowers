# Flowers for Tara

<img src="https://alanunderwood.com/images/flowers-thumbnail.jpg" alt="Flowers Thumbnail Preview">

Overload your senses with an abundance of flowers. This app cycles through a set of images randomly. The default image set is flowers, but the app supports any set of images, of any size and image quality. 

## Features

  * Dynamic image loading to reduce or eliminate load times, even on slower connections
  * Unlimited images
  * Forward and reverse image navigation with a full history
  * Download images or copy to the clipboard
  * Fully public domain

## Benefits

  * Calming effect
  * Sensory overload
  * Stress reduction

## Uses

  * Presentations
  * Videos
  * Social media
  * Backgrounds
  * Stage or set projections

## Installation

### Requirements

  * Apache2 or equivalent
  * NodeJS (v18+)
  * PHP (v8)

### To install

Clone the repository into your web root directory (usually /var/www/html).

<code>git clone git@github.com:adunderwood/flowers.git</code>

### Install NodeJS API
<code>cd flowers/api
mv example.env .env
npm install</code>

### Test the API

<code>node flowers_API.js</code>

Navigate to http://localhost:9999 to make sure the API is working. You will need to have image in the ./images folder for the API to output.

### Install PM2 to run unattended
<code>sudo npm install pm2 --global
pm2 start flowers_API.js
pm2 save</code>

### Setup PM2 to start on reboot

Copy the output of this command into your terminal and run it.

<code>pm2 startup</code>

### Navigate to the directory

<a href="http://localhost/flowers">http://localhost/flowers</a>

## Download Flower Images*

Download this .zip file, and extract it into ./images. You may need to move the file manually 

<a href="https://alanunderwood.com/download/flower-images.zip">Bulk Download</a>

* all flower images are in the public domain. 
