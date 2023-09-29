const express = require('express')
const menuRouter = express.Router()
const menuItemRouter = require('./menuitem.js')

const sqlite3 = require('sqlite3')
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')



menuRouter.param('menuId', (req, res, next, menuId) => {
    db.get('SELECT * FROM Menu WHERE Menu.id = $menuId', { $menuId: menuId }, (err, menu) => {
        if (err) {
            next(err);
        } else if (menu) {
            req.menu = menu;
            next();
        } else {
            res.sendStatus(404);
        }
    });
})

menuRouter.use('/:menuId/menu-items', menuItemRouter)

menuRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Menu', (err, menus) => {
        if (err) {
            next(err)
        } else {
            res.status(200).json({ menus: menus })
        }
    })
})

menuRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({ menu: req.menu })
})


menuRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title
    if (!title) {
        return res.sendStatus(400)
    }
    const sql = `INSERT INTO Menu (title) VALUES ($title)`
    const values = {
        $title: title,

    }
    db.run(sql, values, (err) => {
        if (err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, (err, menu) => {
                res.status(201).json({ menu: menu })
            })
        }
    })
})




menuRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title
    if (!title) {
        return res.sendStatus(400)
    }
    const sql = `UPDATE Menu SET title = $title WHERE Menu.id = $menuId`
    const values = {
        $title: title,
        $menuId: req.params.menuId,
    }
    db.run(sql, values, (err) => {
        if (err) {
            next(err)
        } else {
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, (err, menu) => {
                res.status(200).json({ menu: menu })
            })
        }
    })
})


menuRouter.delete('/:menuId', (req, res, next) => {
   const menuSql = `SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId`
   const menuValues = {
       $menuId: req.params.menuId
   }
   db.get(menuSql, menuValues, (err, menuSql) => {
       if(err){
           next(err)
       } else if(menuSql) {
        return res.sendStatus(400)
       } else {
           const deleteSql = `DELETE FROM Menu WHERE Menu.id = $menuId`
           const deleteValues = {
               $menuId: req.params.menuId
           }
           db.run(deleteSql, deleteValues, (err) => {
               if(err){
                next(err)
               } else {
                res.sendStatus(204)
               }
           })
       }
   })
})

module.exports= menuRouter;