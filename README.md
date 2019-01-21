# dootfile

Dootfile is a simple NPM module to manage configuration files for your NodeJS CLI applications. It aims to be extremely simple and unobtrusive to use.

## Installation

`npm install --save dootfile`

## Usage

There are only two use cases to dootfile :

* If the config file exists, and is valid JSON, then its content will be returned
* Otherwise the user will be prompted to enter the values for the keys you requested, and their input will be persisted to the file

```javascript
const dootfile = require('dootfile')

// File exists
dootfile().then(config => {
  // config now contains all the values from your config file
})

// File does not exist and keys were provided
dootfile(['foo', 'bar']).then(config => {
  // User has been prompted for the values of foo & bar
  // The dotfile has been created and populated with the values
  // config now contains { foo: '...', bar: '...' }
})

// File does not exist and no keys were provided
dootfile().then(config => {
  // The dotfile has been created empty and the process has exited
  // You should now edit the dotfile by hand and re-run your application
})
```

## Options

`dootfile([keys], [filename], [folder])`

**keys** (array of strings)

The keys to retrieve from / write to the dotfile

**filename** (string)

The filename of the dootfile. Defaults to the name of your application (as stated in its package.json `name` field) appended by `rc.json` :

```
# for application name dootdoot
.dootdootrc.json
```

**folder** (string)

The folder containing the dootfile. Defaults to your current user's home dir.

## Doot doot

_Don't forget to thank Mister Skeltal for all the calcium_

![](dootdoot.gif)
