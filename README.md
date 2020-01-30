# Mongoose Workshop - Exercise #3 - Mongoose CRUD

Now we want to be able to manage our todos. We will now setup the classical CRUD routes.

## Task: Create ToDo CRUD

* Set up a route /todos to show all todos in database
    * Show also the user of each todo using the .populate() method

* Set up routes for creating / updating / deleting todos

* Testing - Use RESTED client (or fetch in Browser console) 
    * Create at least 2 todos for each user
    * Update one todo
    * Delete one todo
    * Check in your /todos route if the changes worked


### Bonus Task - Validation

* Install express-validator
    * Import body & validationResult from the package
* Add validation for your POST /todo route (CREATE todo):
    * Assure that a title is given in the body (.notEmpty())
