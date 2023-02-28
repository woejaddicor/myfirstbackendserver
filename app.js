const cors = require('cors');
const express = require('express');
const app = express();
const fruits = require('./fruits'); //calling the fruits.js file which in turn references the fruits json
const logger = require('./logger');

app.use(cors());
app.use(express.json()); //needs to be the top route so all other route requests go through it

//Routes
app.use('/fruits', (req, res, next) => {
	//used for processes with no return or response to move onto the next process
	logger(req); //calls logger function which logs out request type and origin url
	next();
});

app.get('/', (req, res) => {
	res.send('Welcome to the fruit API');
});

//request to find the list of all fruits
app.get('/fruits', (req, res) => {
	res.send(fruits);
});

const getFruit = (name) => {
	//helper function to find specific fruit
	return fruits.find((fruit) => fruit.name.toLowerCase() == name);
};

//helper function which maps out the full list of ids in order to create a new one for newly created fruits
const getMaxId = () => {
	const ids = fruits.map((fruit) => fruit.id);
	//returns the max id which will then be increased by 1 for a new fruit
	return Math.max(...ids);
};

//request to get a particular fruit by parameter
app.get('/fruits/:name', (req, res) => {
	const name = req.params.name.toLowerCase();
	const fruit = getFruit(name); //calling helper getFruit function to search for a specific fruit and setting result to fruit
	if (fruit == undefined) {
		res.status(404).send();
	} else {
		res.send(fruit);
	}
});

//request to post a new fruit into the list
app.post('/fruits', (req, res) => {
	const fruit = getFruit(req.body.name);
	//check if fruit already exists
	if (fruit != undefined) {
		res.status(409).send();
	} else {
		//use getMaxId helper function to create new id for the fruit, adding one to the previous high id
		let maxId = getMaxId() + 1;
		//setting the new fruit id to the newly created id
		req.body.id = maxId;
		//push the newly created fruit into the fruit list
		fruits.push(req.body);
		res.status(201).send(req.body);
	}
});

//request to delete an existing fruit from the list
app.delete('/fruits/:name', (req, res) => {
	const name = req.params.name.toLowerCase();
	const fruit = getFruit(name); //again calling getFruit function in order to search for fruit
	const fruitIndex = fruits.indexOf(fruit); //finding the indexof the given fruit
	if (fruitIndex == -1) {
		//if block to catch any entries that aren't in the list
		res.status(404).send();
	} else {
		fruits.splice(fruitIndex, 1); //splice deletes the given index from the array
		res.status(204).send();
	}
});

module.exports = app;
