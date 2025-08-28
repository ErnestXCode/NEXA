const express = require('express')
const { getAllSchools } = require('../controllers/school/allSchoolsController')
const router = express.Router()

router.get('/', getAllSchools)

module.exports = router