const express = require('express');
const employeeRouter = express.Router();
const timesheetRouter = require('./timesheet.js');

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


employeeRouter.param('employeeId', (req, res, next, employeeId) => {
    db.get('SELECT * FROM Employee WHERE Employee.id = $employeeId', { $employeeId: employeeId }, (err, employee) => {
        if (err) {
            next(err);
        } else if (employee) {
            req.employee = employee;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

employeeRouter.use('/:employeeId/timesheets', timesheetRouter);

employeeRouter.get('/', (req, res,next) => {
   db.all('SELECT * FROM Employee WHERE Employee.is_current_employee = 1 ' , (err, employees) => {
       if(err){
           next(err)
       } else {
        res.status(200).json({employees: employees});
       }

   })
})


employeeRouter.post('/', (req, res,next) => {
    const name = req.body.employee.name, position = req.body.employee.position,  wage = req.body.employee.wage, isCurrentlyEmployee = req.body.employee.isCurrentlyEmployee === 0 ? 0 : 1;
    if(!name || !position || !wage){
        return res.sendStatus(400);

    }

    const sql = `INSERT INTO Employee (name, position, wage, is_current_employee)`+
    ` VALUES ($name, $position, $wage, $isCurrentlyEmployee)`;
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentlyEmployee: isCurrentlyEmployee
    }
   
    db.run(sql, values, (err) => {
        if(err){
            next(err)
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`, (err, employee) => {
                res.status(201).json({employee: employee});
            })
        }
    })

})

employeeRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({employee: req.employee});
})


employeeRouter.put('/:employeeId', (req, res) => {
    const name = req.body.employee.name, position = req.body.employee.position,  wage = req.body.employee.wage, isCurrentlyEmployee = req.body.employee.isCurrentlyEmployee === 0 ? 0 : 1;
    if(!name || !position || !wage){
        return res.sendStatus(400);
    }
    const sql = `UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentlyEmployee WHERE Employee.id = $employeeId`;
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentlyEmployee: isCurrentlyEmployee,
        $employeeId: req.params.employeeId

    }
    db.run(sql, values, (err) => {
        if(err){
            next(err)
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (err, employee) => {
                res.status(200).json({employee: employee});
            })
        }

    })
})

employeeRouter.delete('/:employeeId', (req, res,next) => {
    db.run(`UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = ${req.params.employeeId}`, (err) => {
        if(err){
            next(err)
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (err, employee) => {
                res.status(200).json({employee: employee});
            })
        }
    })
})

module.exports = employeeRouter