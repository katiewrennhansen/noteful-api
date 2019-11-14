const express = require('express')
const xss = require('xss')
const NotesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()


notesRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        NotesService.getAllNotes(knexInstance)
            .then(notes => {
                res.json(notes)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const { title, content, folder_id } = req.body
        const newNote = { title, folder_id, content }

        for (const [key, value] of Object.entries(newNote))
            if (value == null)
            return res.status(400).json({
                error: { message: `Missing '${key}' in request body` }
            })

        NotesService.insertNote(knexInstance, newNote)
            .then(note => {
                res
                    .status(201)
                    .json(note)
            })
            .catch(next)
    })

notesRouter
    .route('/:note_id')
    .all((req, res, next) => {
        const knexInstance = req.app.get('db')
        const id = req.params.note_id
        NotesService.getNoteById(knexInstance, id)
            .then(note => {
                if(!note){
                    return res.status(404).json({
                        error: { message: `Note doesn't exist` }
                      })
                }
                res.note = note
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(res.note)
    })
    .patch(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const id = req.params.note_id
        const { title, content, folder_id } = req.body
        const updatedNote = { title, folder_id, content }

        for (const [key, num] of Object.entries(updatedNote))
        if (num == 0)
        return res.status(400).json({
            error: { message: `Body must contain a value` }
        })

        NotesService.updateNote(knexInstance, id, updatedNote)
            .then(rows => {
                res.send(204).end()
            })
            .catch(next)
    })


module.exports = notesRouter