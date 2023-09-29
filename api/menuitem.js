const express = require("express");
const menuItemRouter = express.Router({ mergeParams: true });

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || "./database.sqlite");



menuItemRouter.param("menuItemId", (req, res, next, menuItemId) => {
    db.get("SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId", { $menuItemId: menuItemId }, (err, menuItem) => {
        if (err) {
            next(err);
        } else if (menuItem) {
            next();
        } else {
            res.sendStatus(404);
        }
    });
})


menuItemRouter.get("/", (req, res, next) => {
    db.all("SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId",{$menuId: req.params.menuId}, (err, menuItems) => {
        if (err) {
            next(err)
        } else {
            res.status(200).json({ menuItems: menuItems })
        }
    })
})

menuItemRouter.post("/", (req, res, next) => {
    const name = req.body.menuItem.name, description = req.body.menuItem.description, inventory = req.body.menuItem.inventory, price = req.body.menuItem.price, menuId = req.params.menuId;
   const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId'
   const menuValues = {
       $menuId: menuId
   }
   db.get(menuSql, menuValues, (err, menu) => {
       if(err) {
        next(err)
       } else {
        if(!name || !inventory || !price || !menu)
        {
            return res.sendStatus(400)
        }
        const sql = `INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)`;
        const values = {
            $name: name,
            $description: description,
            $inventory: inventory,
            $price: price,
            $menuId: menuId
        }
        db.run(sql, values, (err) => {
            if(err){
                next(err)
            } else {
                db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`, (err, menuItem) => {
                    res.status(201).json({ menuItem: menuItem });
                })
            }
        })
       }
   })
})




menuItemRouter.put("/:menuItemId", (req, res, next) => {
    const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price,
        menuId = req.params.menuId;
    

        db.get("SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId", { $menuItemId: req.params.menuItemId }, (err, menuItem) => {
            if (err) {
                next(err);
            } else if (menuItem) {
                const sql = `UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price , menu_id = $menuId WHERE MenuItem.id = $menuItemId`;
                const values = {
                    $name: name,
                    $description: description,
                    $inventory: inventory,
                    $price: price,
                    $menuId: menuId,
                    $menuItemId: req.params.menuItemId
                }
                db.run(sql, values, (err) => {
                    if (err) {
                        next(err)
                    } else {
                        db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`, (err, menuItem) => {
                            res.status(200).json({ menuItem: menuItem });
                        })
                    }
                })
            }
        })
  
      })

menuItemRouter.delete("/:menuItemId", (req, res, next) => {
    db.run(`DELETE FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`, (err) => {
        if (err) {
            next(err)
        } else {
            res.sendStatus(204)
        }
    })
})


module.exports= menuItemRouter;