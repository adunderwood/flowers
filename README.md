# Flowers for Tara

<img src="https://alanunderwood.com/images/flowers-thumbnail.jpg" alt="Flowers Thumbnail Preview">

This app cycles through a set of images randomly.

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
npm install</code>

### Test the API

<code>node flowers.js</code>

Navigate to http://localhost:9999 to make sure the API is working. You will need to have image in the ./images folder for the API to output.

### Install PM2 to run unattended
<code>sudo npm install pm2 --global
pm2 start flowers.js
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
