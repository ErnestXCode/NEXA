const express = require('express')
const { getAllSchools } = require('../controllers/school/allSchoolsController')
const verifyJWT = require('../middleware/verifyJWT')
const router = express.Router()

router.get('/', verifyJWT, getAllSchools)

module.exports = router