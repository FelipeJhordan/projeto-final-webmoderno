const bcrypt = require('bcrypt-nodejs')

module.exports = app => {
    const {
        existOrError,
        notExistOrError,
        equalsOrError,
        stringOverflowError,
        
    } = app.api.validation

    const encryptPassword = password => {
        const salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(password, salt)
    }
    const save = async (req, res) => {
        const user = {
            ...req.body
        }
        if (req.params.id) user.id = req.params.id

        if (!req.originalUrl.startsWith('/users') ) user.admin = false
        if (!req.user || !req.user.admin) user.admin = false
        try {
            existOrError(user.name, 'Nome não informado.')
            stringOverflowError(user.name, 200, 'Limite de letras alcançado no campo nome')
            existOrError(user.email, 'E-mail não informado.')
            existOrError(user.password, 'Senha não informada.')
            existOrError(user.confirmPassword, 'Confirmação de Senha Inválida.')
            equalsOrError(user.password, user.confirmPassword, 'Senhas não conferem')

            const userFromDB = await app.db('users')
                .where({
                    email: user.email
                }).first()
            if (!user.id) {
                notExistOrError(userFromDB, 'Usuário já cadastrado.')
            }
        } catch (msg) {
            return res.status(400).send(msg) // Erro do lado do cliente
        }

        user.password = encryptPassword(req.body.password)
        delete user.confirmPassword

        if (user.id) {
            app.db('users')
                .update(user)
                .whereNull('deletedAt')
                .where({
                    id: user.id
                })
                .then(_ => res.status(204).send())
                .catch(err => res.status(500)) // Erro do lado do servidor
        } else {
            app.db('users')
                .insert(user)
                .then(_ => res.status(204).send())
                .catch(err => res.status(500).send(err))
        }
    }

    const get = (req, res) => {
        app.db('users')
            .select('id', 'name', 'email', 'admin')
            .whereNull('deletedAt')
            .orderBy('id')
            .then(users => res.json(users))
            .catch(err => res.status(500).send(err))
    }

    const getById = (req, res) => {
        try {
            app.db('users')
                .select('id', 'name', 'email', 'admin')
                .where({
                    id: req.params.id
                })
                .whereNull('deletedAt')
                .first()
                .then(users => res.json(users))
                .catch(err => res.status(404).send(err))
        } catch (err) {
            res.status(500).send(err)
        }
    }
    const remove = async (req, res) => {
        try {
            const articles = await app.db('articles')
                .where({
                    userId: req.params.id
                })
            notExistOrError(articles, 'Usuário possui artigos.')
            const userSoftOff = await app.db('users')
                .where({
                    id: req.params.id
                })
            notExistOrError(userSoftOff, 'Usuário já foi deletado do sistema')
            const rowsUpdate = await app.db('users')
                .update({
                    deletedAt: new Date()
                })
                .where({
                    id: req.params.id
                })
            existOrError(rowsUpdate, 'Usuário não foi encontrado.')

            res.status(204).send()
        } catch (msg) {
            res.status(400).send(msg)
        }
    }
    const activateUser = async (req, res) => {
        try {
            app.db('users')
                .update({
                    deletedAt: null
                })
                .where({
                    id: req.params.id
                })
                .then(_ => res.status(200).send())
        } catch (msg) {
            res.status(500).send(msg)
        }

    }
    return {
        save,
        get,
        getById,
        remove,
        activateUser
    }
}