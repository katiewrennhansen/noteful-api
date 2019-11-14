const express = require('express')
const xss = require('xss')
const FoldersService = require('./folders-service')

const foldersRouter = express.Router()
const jsonParser = express.json()


foldersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        FoldersService.getAllFolders(knexInstance)
            .then(folders => {
                res.json(folders)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const { title } = req.body
        const newFolder = { title }

        for (const [key, value] of Object.entries(newFolder))
        if (value == null)
        return res.status(400).json({
            error: { message: `Missing '${key}' in request body` }
        })

        FoldersService.insertFolder(knexInstance, newFolder)
            .then(folder => {
                res
                    .status(201)
                    .json(folder)
            })
            .catch(next)
    })

foldersRouter
    .route('/:folder_id')
    .all((req, res, next) => {
        const knexInstance = req.app.get('db')
        const id = req.params.folder_id
        FoldersService.getFolderById(knexInstance, id)
            .then(folder => {
                if(!folder){
                    return res.status(404).json({
                        error: { message: `Folder doesn't exist` }
                      })
                }
                res.folder = folder
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(res.folder)
    })
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db')
        const id = req.params.folder_id
        FoldersService.deleteFolder(knexInstance, id)
            .then(row => {
                res.status(204).end()
            })
            .catch(next) 
    })
    .patch(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const id = req.params.folder_id
        const { title } = req.body
        const updatedFolder = { title }

        for (const [key, num] of Object.entries(updatedFolder))
        if (num == 0)
        return res.status(400).json({
            error: { message: `Body must contain a value` }
        })

        FoldersService.updateFolder(knexInstance, id, updatedFolder)
            .then(rows => {
                res.status(204).end()
            })
            .catch(next)
    })

    


module.exports = foldersRouter